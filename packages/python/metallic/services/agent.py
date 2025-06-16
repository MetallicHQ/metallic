"""Agent gRPC service client."""
import grpc
from typing import Optional

from ..generated import agent_pb2, agent_pb2_grpc


class AgentService:
    """gRPC client for Agent service."""
    
    def __init__(self, project_id: str, instance_id: str, host: str = "localhost", port: int = 50051):
        """Initialize the Agent service client.
        
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
        self.stub = agent_pb2_grpc.AgentStub(self.channel)
    
    async def close(self):
        """Close the gRPC channel."""
        await self.channel.close()
    
    async def health_check(self) -> agent_pb2.HealthCheckResponse:
        """Check the health of the agent."""
        request = agent_pb2.HealthCheckRequest()
        return await self.stub.HealthCheck(request)
    
    async def get_metrics(self) -> agent_pb2.MetricsResponse:
        """Get metrics from the agent."""
        request = agent_pb2.MetricsRequest()
        return await self.stub.Metrics(request)
    
    async def get_host(self, port: int) -> agent_pb2.GetHostResponse:
        """Get host address for a port."""
        request = agent_pb2.GetHostRequest(
            projectId=self.project_id,
            instanceId=self.instance_id,
            port=port
        )
        return await self.stub.GetHost(request)
