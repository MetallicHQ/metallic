"""
A computer for your AI.

Learn more [here](https://metallic.dev/docs).
"""

from .api import ApiClient, MetallicError, RateLimitError, TimeoutError
from .computer import Computer, ComputerState
from .tools.agent import AgentTool, Metrics
from .tools.browser import BrowserTool, BrowserSessionHandle
from .tools.filesystem import FilesystemTool, FileStats, WatchEvent, WatchHandle
from .tools.terminal import TerminalTool, ProcessHandle, ProcessInfo, ProcessEvent

__all__ = [
    "ApiClient",
    "Computer",
    "ComputerState",
    "AgentTool",
    "BrowserTool",
    "FilesystemTool", 
    "TerminalTool",
    "BrowserSessionHandle",
    "ProcessHandle",
    "Metrics",
    "FileStats",
    "WatchEvent",
    "WatchHandle",
    "ProcessInfo",
    "ProcessEvent",
    "MetallicError",
    "RateLimitError",
    "TimeoutError",
]
