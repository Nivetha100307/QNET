import time
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quantum_security_report import QuantumSecurityReport, utc_now
from app.repositories.session_repository import SessionRepository
from app.repositories.quantum_repository import QuantumMeasurementRepository
from app.key_management.key_repository import KeyRepository
from app.security.security_repository import SecurityRepository

from app.security.bell_test import compute_bell_correlations
from app.security.chsh import calculate_chsh_parameter
from app.security.qber import calculate_qber
from app.security.fidelity import estimate_quantum_fidelity
from app.security.decision_engine import evaluate_security_status

from app.common.enums import SessionStatus
from app.api.websocket import ws_manager
from app.core.logging_config import logger


class SecurityAnalysisError(ValueError):
    """Raised when Module 4 security analysis validation or execution fails."""
    pass


class SecurityReportNotFoundError(Exception):
    """Raised when security report for a session is not found."""
    pass


class SecurityService:
    """Service layer orchestrating Module 4 Quantum Security Monitor logic."""

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

    async def analyze_security(self, session_uuid: str) -> QuantumSecurityReport:
        """Executes complete Module 4 Quantum Security Analysis workflow for a session."""
        start_time = time.time()

        # 1. Validate Business Rules
        session, measurement, quantum_key = await self.validate_prerequisites(session_uuid)

        # 2. Emit WS: SECURITY_ANALYSIS_STARTED
        await ws_manager.broadcast("SECURITY_ANALYSIS_STARTED", {
            "session_id": session_uuid,
            "status": "STARTED"
        })

        # 3. Bell Correlation Analysis
        bell_correlations = compute_bell_correlations(
            measurement.alice_basis,
            measurement.bob_basis,
            measurement.alice_bits,
            measurement.bob_bits
        )
        await ws_manager.broadcast("BELL_TEST_COMPLETED", {
            "session_id": session_uuid,
            "bell_correlations": bell_correlations
        })

        # 4. CHSH Calculation
        chsh_value, bell_test_result = calculate_chsh_parameter(bell_correlations)
        await ws_manager.broadcast("CHSH_COMPLETED", {
            "session_id": session_uuid,
            "chsh_value": chsh_value,
            "bell_test_result": bell_test_result
        })

        # 5. QBER Calculation
        qber = calculate_qber(
            measurement.alice_bits,
            measurement.bob_bits,
            quantum_key.matching_indexes
        )
        await ws_manager.broadcast("QBER_COMPLETED", {
            "session_id": session_uuid,
            "qber": qber
        })

        # 6. Fidelity Estimation
        fidelity = estimate_quantum_fidelity(bell_correlations, qber)
        await ws_manager.broadcast("FIDELITY_COMPLETED", {
            "session_id": session_uuid,
            "fidelity": fidelity
        })

        # 7. Security Decision Engine Evaluation
        security_status, security_score = evaluate_security_status(chsh_value, qber, fidelity)

        analysis_time_ms = round((time.time() - start_time) * 1000.0, 2)

        # 8. Persist Security Report in Database
        existing_report = await self.security_repo.find_by_session(session_uuid)
        if existing_report:
            existing_report.bell_correlations = bell_correlations
            existing_report.chsh_value = chsh_value
            existing_report.bell_test_result = bell_test_result
            existing_report.qber = qber
            existing_report.fidelity = fidelity
            existing_report.security_status = security_status
            existing_report.security_score = security_score
            existing_report.measurement_count = len(measurement.alice_basis)
            existing_report.analysis_time_ms = analysis_time_ms
            existing_report.report_timestamp = utc_now()
            report = await self.security_repo.update(existing_report)
        else:
            new_report = QuantumSecurityReport(
                session_uuid=session_uuid,
                bell_correlations=bell_correlations,
                chsh_value=chsh_value,
                bell_test_result=bell_test_result,
                qber=qber,
                fidelity=fidelity,
                security_status=security_status,
                security_score=security_score,
                measurement_count=len(measurement.alice_basis),
                analysis_time_ms=analysis_time_ms,
                report_timestamp=utc_now()
            )
            report = await self.security_repo.create(new_report)

        # 9. Update Session Timeline & Quantum Channel Properties
        timeline_list = list(session.timeline) if session.timeline else []
        timeline_list.append({
            "timestamp": utc_now().isoformat(),
            "event": "SECURITY_ANALYSIS_COMPLETED",
            "status": session.status,
            "details": f"Status={security_status}, Score={security_score}/100, CHSH={chsh_value:.3f}, QBER={qber*100:.2f}%"
        })
        session.timeline = timeline_list

        q_chan = dict(session.quantum_channel) if session.quantum_channel else {}
        q_chan["bell_score"] = chsh_value
        q_chan["qber"] = qber
        q_chan["fidelity"] = fidelity
        session.quantum_channel = q_chan

        await self.session_repo.update(session)

        # 10. Emit WS: SECURITY_REPORT_READY
        await ws_manager.broadcast("SECURITY_REPORT_READY", {
            "session_id": session_uuid,
            "security_status": security_status,
            "security_score": security_score,
            "chsh_value": chsh_value,
            "qber": qber,
            "fidelity": fidelity
        })

        logger.info(f"Quantum security report generated and stored for session '{session_uuid}'.")
        return report

    async def get_report(self, session_uuid: str) -> QuantumSecurityReport:
        """Retrieves persisted security report by session UUID."""
        report = await self.security_repo.find_by_session(session_uuid)
        if not report:
            raise SecurityReportNotFoundError(f"Security report for session '{session_uuid}' not found.")
        return report
