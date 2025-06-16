"""Main Computer class for Metallic Python SDK."""
from typing import Dict, Any, Optional, Union
from enum import Enum

from .api import ApiClient
from .tools.agent import AgentTool, Metrics
from .tools.browser import BrowserTool
from .tools.filesystem import FilesystemTool
from .tools.terminal import TerminalTool


class ComputerState(str, Enum):
    """Computer state enumeration."""
    STARTING = "starting"
    STARTED = "started"
    STOPPING = "stopping"
    STOPPED = "stopped"
    DESTROYING = "destroying"
    DESTROYED = "destroyed"


class Computer(ApiClient):
    """Main Computer class for interacting with Metallic computers."""
    
    def __init__(
        self,
        id: str,
        template: str,
        region: str,
        ttl_seconds: Optional[int] = None,
        auto_destroy: bool = False,
        metadata: Optional[Dict[str, str]] = None,
        state: str = "starting",
        project_id: str = "",
        instance_id: str = "",
        **kwargs
    ):
        """Initialize a Computer instance.
        
        Args:
            id: Computer ID
            template: Computer template
            region: Computer region
            ttl_seconds: Time to live in seconds
            auto_destroy: Whether to auto-destroy
            metadata: Computer metadata
            state: Current state
            project_id: Project ID
            instance_id: Instance ID
            **kwargs: Additional arguments passed to ApiClient
        """
        super().__init__(**kwargs)
        
        self.id = id
        self.template = template
        self.region = region
        self.ttl_seconds = ttl_seconds
        self.auto_destroy = auto_destroy
        self.metadata = metadata
        self._state = ComputerState(state)
        
        self._agent = AgentTool(project_id, instance_id)
        self.fs = FilesystemTool(project_id, instance_id)
        self.terminal = TerminalTool(project_id, instance_id)
        self.browser = BrowserTool(project_id, instance_id)
    
    @property
    def state(self) -> ComputerState:
        """Get the current computer state."""
        return self._state
    
    def _set_state(self, state: str) -> None:
        """Set the computer state."""
        self._state = ComputerState(state)
    
    async def close(self):
        """Close all connections."""
        await self._agent.close()
        await self.fs.close()
        await self.terminal.close()
        await self.browser.close()
        await super().close()
    
    async def health_check(self) -> bool:
        """Check the health of the computer.
        
        Returns:
            True if the computer is healthy, False otherwise.
        """
        return await self._agent.health_check()
    
    async def get_metrics(self) -> Metrics:
        """Get the metrics of the computer.
        
        Returns:
            Metrics object containing system metrics.
        """
        return await self._agent.get_metrics()
    
    async def get_host(self, port: int) -> str:
        """Get the host address for the specified computer port.
        
        Args:
            port: Port number to get the host for.
            
        Returns:
            Host address for the port.
        """
        return await self._agent.get_host(port)
    
    @classmethod
    async def create(
        cls,
        template: Optional[str] = None,
        ttl_seconds: Optional[int] = None,
        region: Optional[str] = None,
        auto_destroy: bool = False,
        env: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> "Computer":
        """Create a new computer.
        
        Args:
            template: Computer template
            ttl_seconds: Time to live in seconds
            region: Computer region
            auto_destroy: Whether to auto-destroy
            env: Environment variables
            metadata: Computer metadata
            **kwargs: Additional arguments passed to ApiClient
            
        Returns:
            Computer instance for the new computer.
        """
        client = ApiClient(**kwargs)
        
        data = {}
        if template is not None:
            data["template"] = template
        if region is not None:
            data["region"] = region
        if ttl_seconds is not None:
            data["ttl_seconds"] = ttl_seconds
        if auto_destroy is not None:
            data["auto_destroy"] = auto_destroy
        if env is not None:
            data["env"] = env
        if metadata is not None:
            data["metadata"] = metadata
        
        response = await client.post("/computers", json=data)
        computer_data = response.json()
        
        await client.close()
        
        return cls(**computer_data, **kwargs)
    
    @classmethod
    async def start(cls, computer_id: str, **kwargs) -> "Computer":
        """Start an existing computer.
        
        Args:
            computer_id: Computer ID
            **kwargs: Additional arguments passed to ApiClient
            
        Returns:
            Computer instance.
        """
        client = ApiClient(**kwargs)
        
        response = await client.post(f"/computers/{computer_id}/start")
        computer_data = response.json()
        
        await client.close()
        
        return cls(**computer_data, **kwargs)
    
    async def stop(self) -> None:
        """Stop the computer."""
        response = await self.post(f"/computers/{self.id}/stop")
        computer_data = response.json()
        self._set_state(computer_data["state"])
    
    @classmethod
    async def connect(cls, computer_id: str, **kwargs) -> "Computer":
        """Connect to an existing computer.
        
        Args:
            computer_id: Computer ID
            **kwargs: Additional arguments passed to ApiClient
            
        Returns:
            Computer instance.
        """
        client = ApiClient(**kwargs)
        
        response = await client.post(f"/computers/{computer_id}/connect")
        computer_data = response.json()
        
        await client.close()
        
        return cls(**computer_data, **kwargs)
    
    async def fork(self, **kwargs) -> "Computer":
        """Fork the current computer.
        
        Args:
            **kwargs: Additional arguments passed to ApiClient
            
        Returns:
            Computer instance for the forked computer.
        """
        response = await self.post(f"/computers/{self.id}/fork")
        computer_data = response.json()
        
        return Computer(**computer_data, **kwargs)
    
    async def wait_for_state(self, state: str) -> None:
        """Wait for the computer to reach a specific state.
        
        Args:
            state: State to wait for ('started', 'stopped', 'destroyed')
        """
        response = await self.get(f"/computers/{self.id}/wait", params={"state": state})
        result = response.json()
        self._set_state(result["state"])
    
    async def destroy(self) -> None:
        """Destroy the computer."""
        response = await self.delete(f"/computers/{self.id}")
        computer_data = response.json()
        self._set_state(computer_data["state"])
