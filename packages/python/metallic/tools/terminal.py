"""Terminal tool for process management."""
import asyncio
from typing import List, Dict, Any, Optional, AsyncIterator

from ..services.terminal import TerminalService
from ..generated import terminal_pb2


class ProcessInfo:
    """Process information data structure."""
    
    def __init__(self, pid: int, command: str, cwd: str, cols: int, rows: int, start_time: int):
        self.pid = pid
        self.command = command
        self.cwd = cwd
        self.cols = cols
        self.rows = rows
        self.start_time = start_time


class ProcessEvent:
    """Process event data structure."""
    
    def __init__(self, pid: int, event_type: str, data: bytes = b"", error: str = "", exit_code: int = 0):
        self.pid = pid
        self.type = event_type
        self.data = data
        self.error = error
        self.exit_code = exit_code


class ProcessHandle:
    """Handle for managing a spawned process."""
    
    def __init__(self, pid: int, terminal_service: TerminalService):
        self.pid = pid
        self._terminal_service = terminal_service
    
    async def send_input(self, input_data: bytes) -> None:
        """Send input to the process.
        
        Args:
            input_data: Input data to send
        """
        request = terminal_pb2.SendInputRequest(pid=self.pid, input=input_data)
        response = await self._terminal_service.send_input(request)
        
        if not response.success:
            raise Exception(response.error)
    
    async def update_size(self, cols: int, rows: int) -> None:
        """Update the terminal size.
        
        Args:
            cols: Number of columns
            rows: Number of rows
        """
        request = terminal_pb2.UpdateProcessRequest(pid=self.pid, cols=cols, rows=rows)
        response = await self._terminal_service.update_process(request)
        
        if not response.success:
            raise Exception(response.error)
    
    async def send_signal(self, signal: str) -> None:
        """Send a signal to the process.
        
        Args:
            signal: Signal name (e.g., "SIGTERM", "SIGKILL")
        """
        request = terminal_pb2.SendSignalRequest(pid=self.pid, signal=signal)
        response = await self._terminal_service.send_signal(request)
        
        if not response.success:
            raise Exception(response.error)


class TerminalTool:
    """Tool for terminal and process management."""
    
    def __init__(self, project_id: str, instance_id: str):
        """Initialize the Terminal tool.
        
        Args:
            project_id: Project ID
            instance_id: Instance ID
        """
        self.terminal = TerminalService(project_id, instance_id)
    
    async def close(self):
        """Close the terminal service connection."""
        await self.terminal.close()
    
    async def list_processes(self) -> List[ProcessInfo]:
        """List running processes.
        
        Returns:
            List of ProcessInfo objects
        """
        request = terminal_pb2.ListProcessesRequest()
        response = await self.terminal.list_processes(request)
        
        if not response.success:
            raise Exception(response.error)
        
        return [
            ProcessInfo(
                pid=proc.pid,
                command=proc.command,
                cwd=proc.cwd,
                cols=proc.cols,
                rows=proc.rows,
                start_time=proc.startTime
            )
            for proc in response.processes
        ]
    
    async def spawn_process(
        self,
        cmd: str,
        cwd: str = "",
        env: Optional[Dict[str, str]] = None,
        args: Optional[List[str]] = None,
        cols: int = 80,
        rows: int = 24
    ) -> AsyncIterator[ProcessEvent]:
        """Spawn a new process.
        
        Args:
            cmd: Command to run
            cwd: Working directory
            env: Environment variables
            args: Command arguments
            cols: Terminal columns
            rows: Terminal rows
            
        Yields:
            ProcessEvent objects
        """
        request = terminal_pb2.SpawnProcessRequest(
            cmd=cmd,
            cwd=cwd,
            env=env or {},
            args=args or [],
            cols=cols,
            rows=rows
        )
        
        async for event in self.terminal.spawn_process(request):
            if event.error:
                raise Exception(event.error)
            
            yield ProcessEvent(
                pid=event.pid,
                event_type=event.type,
                data=event.data,
                error=event.error,
                exit_code=event.exitCode
            )
    
    async def connect_to_process(self, pid: int) -> AsyncIterator[ProcessEvent]:
        """Connect to an existing process.
        
        Args:
            pid: Process ID to connect to
            
        Yields:
            ProcessEvent objects
        """
        request = terminal_pb2.ConnectToProcessRequest(pid=pid)
        
        async for event in self.terminal.connect_to_process(request):
            if event.error:
                raise Exception(event.error)
            
            yield ProcessEvent(
                pid=event.pid,
                event_type=event.type,
                data=event.data,
                error=event.error,
                exit_code=event.exitCode
            )
    
    async def run(
        self,
        cmd: str,
        cwd: str = "",
        env: Optional[Dict[str, str]] = None,
        args: Optional[List[str]] = None,
        cols: int = 80,
        rows: int = 24
    ) -> ProcessHandle:
        """Run a command and return a process handle.
        
        Args:
            cmd: Command to run
            cwd: Working directory
            env: Environment variables
            args: Command arguments
            cols: Terminal columns
            rows: Terminal rows
            
        Returns:
            ProcessHandle for the spawned process
        """
        pid = None
        async for event in self.spawn_process(cmd, cwd, env, args, cols, rows):
            if event.type == "spawn" and event.pid:
                pid = event.pid
                break
        
        if pid is None:
            raise Exception("Failed to spawn process")
        
        return ProcessHandle(pid, self.terminal)
