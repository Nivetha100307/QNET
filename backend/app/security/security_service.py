import time
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quantum_security_report import QuantumSecurityReport, utc_now
from app.repositories.session_repository import SessionRepository
from app.repositories.quantum_repository import QuantumMeasurementRepository
from app.key_management.key_repository import KeyRepository
from app.security.security_repository import SecurityRepository

from app.security.utils import compute_channel_gamma
from app.security.bell_test import generate_e91_coincidences, compute_bell_correlations
from app.security.chsh import calculate_chsh_parameter
from app.security.qber import derive_qber_from_gamma, calculate_qber
from app.security.fidelity import derive_fidelity_from_gamma
from app.security.decision_engine import evaluate_security_status

from app.common.enums import SessionStatus
from app.api.websocket import ws_manager
from app.core.logging_config import logger
from app.pqc.event_bus import event_bus


class SecurityAnalysisError(ValueError):
    """Raised when Module 4 security analysis validation or execution fails."""
    pass


class SecurityReportNotFoundError(Exception):
    """Raised when security report for a session is not found."""
    pass


class SecurityService:
    """Service layer orchestrating Module 4 Quantum Security Monitor & Physical Engine."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.session_repo = SessionRepository(db)
        self.measurement_repo = QuantumMeasurementRepository(db)
        self.key_repo = KeyRepository(db)
        self.security_repo = SecurityRepository(db)

    async def validate_prerequisites(self, session_uuid: str) -> Tuple:
        """Validates that session is ACTIVE, measurements exist, and quantum key has been generated."""
        session = await self.session_repo.find_by_session_id(session_uuid)
        if not session:
            raise SecurityAnalysisError(f"Session '{session_uuid}' not found.")

        if session.status != SessionStatus.ACTIVE.value:
            raise SecurityAnalysisError(
                f"Cannot run security analysis for session '{session_uuid}' in state '{session.status}'. "
                f"Session must be in '{SessionStatus.ACTIVE.value}' state."
            )

        measurement = await self.measurement_repo.find_by_session_id(session_uuid)
        if not measurement or not measurement.alice_basis or not measurement.bob_basis:
            raise SecurityAnalysisError(
                f"Quantum measurements do not exist for session '{session_uuid}'. "
                "Execute Module 2 E91 quantum simulation engine first."
            )

        quantum_key = await self.key_repo.find_by_session(session_uuid)
        if not quantum_key or quantum_key.generation_status != "GENERATED":
            raise SecurityAnalysisError(
                f"Quantum key generation has not completed for session '{session_uuid}'. "
                "Execute Module 3 key sifting first before running security analysis."
            )

        return session, measurement, quantum_key

    async def analyze_security(
        self,
        session_uuid: str,
        distance_km: Optional[float] = None,
        fiber_loss_db_per_km: float = 0.20,
        detector_efficiency: float = 0.95,
        phase_noise: float = 0.02,
        dark_count: float = 0.01,
        eavesdrop_strength: float = 0.0,
        repeater_enabled: bool = False
    ) -> QuantumSecurityReport:
        """Executes complete Module 4 GHZ Quantum Network Security Analysis workflow evaluating each
        Control Center -> Substation optical channel independently.
        """
        start_time = time.time()

        # 1. Validate Business Rules
        session, measurement, quantum_key = await self.validate_prerequisites(session_uuid)

        # Determine target nodes for this session
        dest_str = session.destination_node or "Substation_A"
        target_nodes = [s.strip() for s in dest_str.split(",") if s.strip()]
        if not target_nodes:
            target_nodes = ["Substation_A"]

        # Check if quantum_channel has repeater flag enabled
        q_channel = session.quantum_channel or {}
        if q_channel.get("repeater_enabled"):
            repeater_enabled = True

        from app.services.telemetry_simulator import get_node_distance

        security_results = []
        chsh_list = []
        qber_list = []
        fidelity_list = []
        score_list = []

        await ws_manager.broadcast("SECURITY_ANALYSIS_STARTED", {
            "session_id": session_uuid,
            "status": "STARTED",
            "target_nodes": target_nodes
        })

        # Loop through every destination node independently
        for node_id in target_nodes:
            node_dist = get_node_distance(session.source_node, node_id)

            # Compute channel visibility gamma for this node's optical link
            gamma = compute_channel_gamma(
                distance_km=node_dist,
                fiber_loss_db_per_km=fiber_loss_db_per_km,
                detector_efficiency=detector_efficiency,
                phase_noise=phase_noise,
                dark_count=dark_count,
                eavesdrop_strength=eavesdrop_strength,
                repeater_enabled=repeater_enabled
            )

            # Generate Bell coincidences & expectation values for this link
            coincidences_data = generate_e91_coincidences(gamma=gamma, total_shots_per_basis=1024)
            correlations = {k: v["expectation"] for k, v in coincidences_data.items()}

            chsh_val, bell_res = calculate_chsh_parameter(correlations)
            qber_val = derive_qber_from_gamma(gamma)
            fidelity_val = derive_fidelity_from_gamma(gamma)

            status_label, sec_score, decision_meta = evaluate_security_status(chsh_val, qber_val, fidelity_val)

            qber_pct = round(qber_val * 100, 2)
            fid_pct = round(fidelity_val * 100, 2)

            # Map link health status & recommended action
            if chsh_val >= 2.70 and qber_pct <= 3.0:
                status_clean = "Excellent"
                recommendation = "Continue Communication"
            elif chsh_val >= 2.50 and qber_pct <= 5.0:
                status_clean = "Healthy"
                recommendation = "Monitor Channel"
            elif chsh_val >= 2.00 and qber_pct <= 11.0:
                status_clean = "Warning"
                recommendation = "Reduce Fiber Distance / Optimize"
            else:
                status_clean = "Failed"
                recommendation = "Execute Repeater (Module 7)"

            if status_clean in ["Failed", "Warning"] or chsh_val < 2.0 or qber_pct >= 11.0:
                event_bus.publish("SecurityEvent", {
                    "event_type": "HIGH_QBER" if qber_pct >= 11.0 else "BELL_TEST_FAILED",
                    "qber": qber_pct,
                    "chsh": round(chsh_val, 3),
                    "fidelity": fid_pct,
                    "destination": node_id,
                    "reason": f"Module 4 Security Event on {node_id}: CHSH {chsh_val:.2f}, QBER {qber_pct:.1f}%"
                })

            link_result = {
                "destination": node_id,
                "distance": node_dist,
                "attenuation_db": round(fiber_loss_db_per_km * node_dist, 2),
                "visibility": round(gamma, 4),
                "dark_count_prob": dark_count,
                "detector_efficiency": detector_efficiency,
                "chsh": round(chsh_val, 3),
                "bell_test_result": bell_res,
                "coincidences": coincidences_data,
                "expectation_values": correlations,
                "qber": qber_pct,
                "fidelity": fid_pct,
                "security_score": sec_score,
                "status": status_clean,
                "recommendation": recommendation,
                "decision": decision_meta
            }

            security_results.append(link_result)

            chsh_list.append(chsh_val)
            qber_list.append(qber_pct)
            fidelity_list.append(fid_pct)
            score_list.append(sec_score)

        # 2. Compute GHZ Session Summary
        total_nodes = len(target_nodes)
        healthy_links = sum(1 for r in security_results if r["status"] in ["Excellent", "Healthy"])
        warning_links = sum(1 for r in security_results if r["status"] == "Warning")
        failed_links = sum(1 for r in security_results if r["status"] == "Failed")

        avg_chsh = round(sum(chsh_list) / total_nodes, 3)
        avg_qber = round(sum(qber_list) / total_nodes, 2)
        avg_fidelity = round(sum(fidelity_list) / total_nodes, 2)
        avg_score = round(sum(score_list) / total_nodes)

        broadcast_success_rate = round((healthy_links / total_nodes) * 100, 1)

        if failed_links == 0 and warning_links == 0:
            overall_status = "OPERATIONAL"
        elif failed_links < total_nodes:
            overall_status = "PARTIALLY OPERATIONAL"
        else:
            overall_status = "CRITICAL FAILED"

        summary = {
            "total_nodes": total_nodes,
            "healthy_links": healthy_links,
            "warning_links": warning_links,
            "failed_links": failed_links,
            "average_chsh": avg_chsh,
            "average_qber": avg_qber,
            "average_fidelity": avg_fidelity,
            "average_score": avg_score,
            "broadcast_success_rate": broadcast_success_rate,
            "overall_status": overall_status
        }

        report_details = {
            "security_results": security_results,
            "summary": summary,
            "environmental": {
                "fiber_loss_db_per_km": fiber_loss_db_per_km,
                "detector_efficiency": detector_efficiency,
                "phase_noise": phase_noise,
                "dark_count": dark_count,
                "eavesdrop_strength": eavesdrop_strength
            }
        }

        analysis_time_ms = round((time.time() - start_time) * 1000.0, 2)
        overall_bell_result = "PASS" if avg_chsh >= 2.0 and avg_qber <= 11.0 else "FAIL"

        # 3. Persist Security Report in Database
        existing_report = await self.security_repo.find_by_session(session_uuid)
        if existing_report:
            existing_report.bell_correlations = report_details
            existing_report.chsh_value = avg_chsh
            existing_report.bell_test_result = overall_bell_result
            existing_report.qber = round(avg_qber / 100.0, 4)
            existing_report.fidelity = round(avg_fidelity / 100.0, 4)
            existing_report.security_status = overall_status
            existing_report.security_score = avg_score
            existing_report.measurement_count = 4 * 1024 * total_nodes
            existing_report.analysis_time_ms = analysis_time_ms
            existing_report.report_timestamp = utc_now()
            report = await self.security_repo.update(existing_report)
        else:
            new_report = QuantumSecurityReport(
                session_uuid=session_uuid,
                bell_correlations=report_details,
                chsh_value=avg_chsh,
                bell_test_result=overall_bell_result,
                qber=round(avg_qber / 100.0, 4),
                fidelity=round(avg_fidelity / 100.0, 4),
                security_status=overall_status,
                security_score=avg_score,
                measurement_count=4 * 1024 * total_nodes,
                analysis_time_ms=analysis_time_ms,
                report_timestamp=utc_now()
            )
            report = await self.security_repo.create(new_report)

        # 4. Update Session Timeline & Quantum Channel Properties
        timeline_list = list(session.timeline) if session.timeline else []
        timeline_list.append({
            "timestamp": utc_now().isoformat(),
            "event": "SECURITY_ANALYSIS_COMPLETED",
            "status": session.status,
            "details": f"Overall={overall_status}, Score={avg_score}/100, Healthy={healthy_links}/{total_nodes}, Avg CHSH={avg_chsh:.3f}"
        })
        session.timeline = timeline_list

        q_chan = dict(session.quantum_channel) if session.quantum_channel else {}
        q_chan["bell_score"] = avg_chsh
        q_chan["qber"] = round(avg_qber / 100.0, 4)
        q_chan["fidelity"] = round(avg_fidelity / 100.0, 4)
        q_chan["security_results"] = security_results
        q_chan["summary"] = summary
        session.quantum_channel = q_chan

        await self.session_repo.update(session)

        # 5. Emit WS: SECURITY_REPORT_READY
        await ws_manager.broadcast("SECURITY_REPORT_READY", {
            "session_id": session_uuid,
            "security_results": security_results,
            "summary": summary,
            "security_status": overall_status,
            "security_score": avg_score,
            "average_chsh": avg_chsh,
            "average_qber": avg_qber,
            "average_fidelity": avg_fidelity
        })

        logger.info(f"GHZ Quantum security report generated for session '{session_uuid}' across {total_nodes} nodes.")
        return report

    async def get_report(self, session_uuid: str) -> QuantumSecurityReport:
        """Retrieves persisted security report by session UUID."""
        report = await self.security_repo.find_by_session(session_uuid)
        if not report:
            raise SecurityReportNotFoundError(f"Security report for session '{session_uuid}' not found.")
        return report
