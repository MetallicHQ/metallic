"""Browser tool for browser session management."""
from typing import Dict, Optional

from ..services.browser import BrowserService
from ..generated import browser_pb2


class BrowserSessionHandle:
    """Handle for managing a browser session."""
    
    def __init__(self, cdp_port: int, browser_service: BrowserService):
        self.cdp_port = cdp_port
        self._browser_service = browser_service
    
    async def terminate(self) -> None:
        """Terminate the browser session."""
        request = browser_pb2.TerminateSessionRequest()
        response = await self._browser_service.terminate_session(request)
        
        if not response.success:
            raise Exception(response.error)


class BrowserTool:
    """Tool for browser session management."""
    
    def __init__(self, project_id: str, instance_id: str):
        """Initialize the Browser tool.
        
        Args:
            project_id: Project ID
            instance_id: Instance ID
        """
        self.browser = BrowserService(project_id, instance_id)
    
    async def close(self):
        """Close the browser service connection."""
        await self.browser.close()
    
    async def create_session(
        self,
        proxy_url: Optional[str] = None,
        user_agent: Optional[str] = None,
        context: Optional[str] = None,
        custom_headers: Optional[Dict[str, str]] = None,
        block_ads: Optional[bool] = None,
        timezone: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        timeout: Optional[int] = None
    ) -> BrowserSessionHandle:
        """Create a new browser session.
        
        Args:
            proxy_url: Proxy URL to use
            user_agent: User agent string
            context: Browser context
            custom_headers: Custom headers to set
            block_ads: Whether to block ads
            timezone: Timezone to set
            width: Browser width
            height: Browser height
            timeout: Session timeout
            
        Returns:
            BrowserSessionHandle for the created session
        """
        dimensions = None
        if width is not None and height is not None:
            dimensions = browser_pb2.Dimensions(width=width, height=height)
        
        request = browser_pb2.CreateSessionRequest(
            proxyUrl=proxy_url,
            userAgent=user_agent,
            context=context,
            customHeaders=custom_headers or {},
            blockAds=block_ads,
            timezone=timezone,
            dimensions=dimensions,
            timeout=timeout
        )
        
        response = await self.browser.create_session(request)
        
        if not response.success:
            raise Exception(response.error)
        
        return BrowserSessionHandle(response.cdpPort, self.browser)
