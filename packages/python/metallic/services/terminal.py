"""Terminal gRPC service client."""
import grpc
from typing import AsyncIterator

from ..generated import terminal_pb2, terminal_pb2_grpc


class TerminalService:
    """gRPC client for Terminal service."""
    
    def __init__(self, project_id: str, instance_id: str, host: str = "localhost", port: int = 50051):
        """Initialize the Terminal service client.
        
        Args:
            project_id: Project ID
            instance_id: Instance ID
            host: gRPC server host
            port: gRPC server port
        """
        self.project_id = project_id
        self.instance_id = instance_id
        self.host = host
        self.port = port
        self.channel = grpc.aio.insecure_channel(f"{host}:{port}")
        self.stub = terminal_pb2_grpc.TerminalStub(self.channel)
    
    async def close(self):
        """Close the gRPC channel."""
        await self.channel.close()
    
    async def list_processes(self, request: terminal_pb2.ListProcessesRequest) -> terminal_pb2.ListProcessesResponse:
        """List running processes."""
        return await self.stub.ListProcesses(request)
    
    async def spawn_process(self, request: terminal_pb2.SpawnProcessRequest) -> AsyncIterator[terminal_pb2.ProcessEvent]:
        """Spawn a new process."""
        async for event in self.stub.SpawnProcess(request):
            yield event
    
    async def connect_to_process(self, request: terminal_pb2.ConnectToProcessRequest) -> AsyncIterator[terminal_pb2.ProcessEvent]:
        """Connect to an existing process."""
        async for event in self.stub.ConnectToProcess(request):
            yield event
    
    async def send_input(self, request: terminal_pb2.SendInputRequest) -> terminal_pb2.SendInputResponse:
        """Send input to a process."""
        return await self.stub.SendInput(request)
    
    async def update_process(self, request: terminal_pb2.UpdateProcessRequest) -> terminal_pb2.UpdateProcessResponse:
        """Update process settings."""
        return await self.stub.UpdateProcess(request)
    
    async def send_signal(self, request: terminal_pb2.SendSignalRequest) -> terminal_pb2.SendSignalResponse:
        """Send signal to a process."""
        return await self.stub.SendSignal(request)
