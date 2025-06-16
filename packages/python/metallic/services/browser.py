"""Browser gRPC service client."""
import grpc

from ..generated import browser_pb2, browser_pb2_grpc


class BrowserService:
    """gRPC client for Browser service."""
    
    def __init__(self, project_id: str, instance_id: str, host: str = "localhost", port: int = 50051):
        """Initialize the Browser service client.
        
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
        self.stub = browser_pb2_grpc.BrowserStub(self.channel)
    
    async def close(self):
        """Close the gRPC channel."""
        await self.channel.close()
    
    async def create_session(self, request: browser_pb2.CreateSessionRequest) -> browser_pb2.CreateSessionResponse:
        """Create a new browser session."""
        return await self.stub.CreateSession(request)
    
    async def terminate_session(self, request: browser_pb2.TerminateSessionRequest) -> browser_pb2.TerminateSessionResponse:
        """Terminate a browser session."""
        return await self.stub.TerminateSession(request)
