import asyncio
import os
import sys

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
from app.database.connection import Base, get_async_engine
from app.models.audit_log import SystemAuditLog
import app.models  # Loads all 9 models into Base.metadata

async def init_supabase():
    raw_db_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres.uanufmnbbeavjmbeeaso:.eZE8ALJnvN%40mi@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres"
    )
    if raw_db_url.startswith("postgresql://"):
        db_url = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        db_url = raw_db_url

    print(f" Connecting to Supabase PostgreSQL at:\n  {db_url.split('@')[-1]}")
    
    engine = get_async_engine(db_url)

    try:
        async with engine.begin() as conn:
            print(" Creating database tables for all 9 modules...")
            await conn.run_sync(Base.metadata.create_all)
            print(" All database tables successfully created in Supabase PostgreSQL!")
            print(f" Registered Tables ({len(Base.metadata.tables)} total):")
            for t_name in Base.metadata.tables.keys():
                print(f"   - {t_name}")

        # Seed initial system audit logs if empty
        async_session = async_sessionmaker(bind=engine, expire_on_commit=False)
        async with async_session() as session:
            stmt = select(SystemAuditLog)
            result = await session.execute(stmt)
            existing_logs = result.scalars().all()
            
            if not existing_logs:
                print(" Seeding initial audit vault records into Supabase PostgreSQL...")
                seed_logs = [
                    SystemAuditLog(
                        module_id="MODULE_1_SESSION",
                        action="SESSION_INITIALIZED",
                        severity="INFO",
                        operator_role="GRID_ADMIN",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"status": "ACTIVE", "protocol": "E91", "note": "E91 QKD session initialized."}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_2_QUANTUM",
                        action="E91_MEASUREMENT_RUN",
                        severity="SUCCESS",
                        operator_role="GRID_ADMIN",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"shots": 1024, "execution_backend": "AerSimulator", "bell_fidelity": 0.984}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_3_KEY",
                        action="KEY_GENERATION_COMPLETED",
                        severity="SUCCESS",
                        operator_role="CONTROL_OPERATOR",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"key_length": 256, "sifting_ratio": 0.51, "key_type": "E91_SHARED_SECRET"}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_4_SECURITY",
                        action="SECURITY_ANALYSIS_EXECUTED",
                        severity="SUCCESS",
                        operator_role="GRID_ADMIN",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"chsh_value": 2.782, "bell_test": "PASS", "qber": 0.021, "score": 98}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_5_SCADA",
                        action="SCADA_COMMAND_SENT",
                        severity="INFO",
                        operator_role="GRID_ADMIN",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"command": "TRIP_RELAY_RELAY_04", "cipher": "AES-256-GCM", "latency_ms": 18}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_6_ZERO_TRUST",
                        action="ATTACK_SIMULATED",
                        severity="WARNING",
                        operator_role="SECURITY_ENGINEER",
                        source_node="Attacker_Node",
                        destination_node="Substation_A",
                        details={"preset": "MITM", "decision": "BLOCK", "trust_score": 24.5, "failed_stage": 11}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_7_REPEATER",
                        action="BSM_SWAP_EXECUTED",
                        severity="SUCCESS",
                        operator_role="QUANTUM_ENGINEER",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"repeater": "Repeater_R1", "bsm_outcome": "|Phi+>", "fidelity": 0.965}
                    ),
                    SystemAuditLog(
                        module_id="MODULE_8_CASCADE",
                        action="PRIVACY_AMPLIFICATION_RUN",
                        severity="SUCCESS",
                        operator_role="QUANTUM_ENGINEER",
                        source_node="Control_Center",
                        destination_node="Substation_A",
                        details={"bit_errors_corrected": 2, "toeplitz_hash": "256_BIT", "anomaly_score": 0.04}
                    ),
                ]
                session.add_all(seed_logs)
                await session.commit()
                print(f" Successfully seeded {len(seed_logs)} initial audit log records into system_audit_logs!")

    except Exception as e:
        print(f" Error initializing Supabase PostgreSQL: {str(e)}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_supabase())
