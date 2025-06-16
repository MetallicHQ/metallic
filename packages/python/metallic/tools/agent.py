"""Agent tool for health checks and metrics."""
from typing import Dict, Any, Optional

from ..services.agent import AgentService


class Metrics:
    """Metrics data structure."""
    
    def __init__(
        self,
        cpu_count: int,
        cpu_used_pct: float,
        mem_total_mib: int,
        mem_used_mib: int,
        gpu: Optional[str] = None,
        vram_total_mib: Optional[int] = None,
        vram_used_mib: Optional[int] = None,
        timestamp: str = "",
    ):
        self.cpu_count = cpu_count
        self.cpu_used_pct = cpu_used_pct
        self.mem_total_mib = mem_total_mib
        self.mem_used_mib = mem_used_mib
        self.gpu = gpu
        self.vram_total_mib = vram_total_mib
        self.vram_used_mib = vram_used_mib
        self.timestamp = timestamp


class AgentTool:
    """Tool for interacting with the Agent service."""
    
    def __init__(self, project_id: str, instance_id: str):
        """Initialize the Agent tool.
        
        Args:
            project_id: Project ID
            instance_id: Instance ID
        """
        self.agent_service = AgentService(project_id, instance_id)
    
    async def close(self):
        """Close the agent service connection."""
        await self.agent_service.close()
    
    async def health_check(self) -> bool:
        """Check the health of the computer.
        
        Returns:
            True if the computer is healthy, False otherwise.
        """
        response = await self.agent_service.health_check()
        return response.success
    
    async def get_metrics(self) -> Metrics:
        """Get the metrics of the computer.
        
        Returns:
            Metrics object containing system metrics.
        """
        response = await self.agent_service.get_metrics()
        return Metrics(
            cpu_count=response.cpuCount,
            cpu_used_pct=response.cpuUsedPct,
            mem_total_mib=response.memTotalMiB,
            mem_used_mib=response.memUsedMiB,
            gpu=response.gpu if response.HasField("gpu") else None,
            vram_total_mib=response.vramTotalMiB if response.HasField("vramTotalMiB") else None,
            vram_used_mib=response.vramUsedMiB if response.HasField("vramUsedMiB") else None,
            timestamp=response.timestamp,
        )
    
    async def get_host(self, port: int) -> str:
        """Get the host address for the specified computer port.
        
        Args:
            port: Port number to get the host for.
            
        Returns:
            Host address for the port.
        """
        response = await self.agent_service.get_host(port)
        return response.host
