"""
MediLens AI — Structured Logger

Provides a pre-configured, named logger for the entire application.
All modules should import `logger` from here rather than calling
`logging.getLogger` directly.
"""

import logging
import sys

# ──────────────────────────────────────────────
# Formatter
# ──────────────────────────────────────────────
LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d — %(message)s"
)
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

# ──────────────────────────────────────────────
# Stream handler → stdout
# ──────────────────────────────────────────────
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(formatter)

# ──────────────────────────────────────────────
# Named logger
# ──────────────────────────────────────────────
logger = logging.getLogger("medilens")
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)
logger.propagate = False
