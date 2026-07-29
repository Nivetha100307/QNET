import logging
import sys

def setup_logging() -> logging.Logger:
    """Configures lightweight logging for QNetSecure session events.
    
    Returns:
        logging.Logger: Configured logger instance.
    """
    logger = logging.getLogger("qnetsecure")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [QNetSecure] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger

logger = setup_logging()

def log_session_event(
    session_id: str,
    source: str,
    destination: str,
    state: str,
    message: str = ""
) -> None:
    """Logs session event with session metadata.

    Args:
        session_id (str): Session UUID string.
        source (str): Source node name.
        destination (str): Destination node name.
        state (str): Current session state.
        message (str): Additional event details.
    """
    logger.info(
        f"SessionID={session_id} | Source={source} | Dest={destination} | State={state} | {message}".strip(" |")
    )
