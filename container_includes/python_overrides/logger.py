
import os

# From the original crate
CRITICAL = 50
FATAL = CRITICAL
ERROR = 40
WARNING = 30
WARN = WARNING
INFO = 20
DEBUG = 10
NOTSET = 0

# From the original crate
_levelToName = {
    CRITICAL: 'CRITICAL',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    NOTSET: 'NOTSET',
}
_nameToLevel = {
    'CRITICAL': CRITICAL,
    'FATAL': FATAL,
    'ERROR': ERROR,
    'WARN': WARNING,
    'WARNING': WARNING,
    'INFO': INFO,
    'DEBUG': DEBUG,
    'NOTSET': NOTSET,
}


def _get_log_level():
    level = os.getenv("PYTHON_LOG_LEVEL")
    if not level or type(level) is not str:
        return WARN
    level = level.strip().upper()
    if level in _nameToLevel:
        return _nameToLevel[level]
    return WARN


class Logger:
    def __init__(self):
        self.level = _get_log_level()
        self.handlers = []  # We don't care about this complexity
        self.flush = True
        pass

    # noinspection PyPep8Naming
    def setLevel(self, level):
        self.level = level

    # noinspection PyPep8Naming
    def addHandler(self, *args):
        pass

    def warning(self, *args):
        print(args, flush=self.flush)

    def warn(self, *args):
        print(args, flush=self.flush)

    def info(self, *args):
        print(args, flush=self.flush)

    def debug(self, *args):
        print(args, flush=self.flush)


LOGGER = Logger()


# noinspection PyPep8Naming
def getLogger(*args):
    return LOGGER
