"""
API client for Metallic using httpx.
"""
import os
from typing import Any, Dict, Optional

import httpx


class MetallicError(Exception):
    """Base exception for Metallic SDK errors."""
    pass


class RateLimitError(MetallicError):
    """Exception raised when rate limit is exceeded."""
    pass


class TimeoutError(MetallicError):
    """Exception raised when request times out."""
    pass


class ApiClient:
    """HTTP API client for Metallic."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0,
        headers: Optional[Dict[str, str]] = None,
    ):
        """Initialize the API client.
        
        Args:
            api_key: API key for authentication. If not provided, will use METALLIC_API_KEY env var.
            base_url: Base URL for the API. If not provided, will use METALLIC_BASE_URL env var or default.
            timeout: Request timeout in seconds.
            headers: Additional headers to include in requests.
        """
        self.api_key = api_key or os.getenv("METALLIC_API_KEY")
        if not self.api_key:
            raise MetallicError("METALLIC_API_KEY is not set")
        
        self.base_url = base_url or os.getenv("METALLIC_BASE_URL", "https://api.metallic.dev/v1")
        self.timeout = timeout
        
        default_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        if headers:
            default_headers.update(headers)
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers=default_headers,
        )
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.client.aclose()
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    def _handle_error(self, response: httpx.Response) -> None:
        """Handle HTTP error responses."""
        if response.status_code == 429:
            message = "Rate limit exceeded"
            try:
                data = response.json()
                message = data.get("message", message)
            except Exception:
                pass
            raise RateLimitError(message)
        
        if not response.is_success:
            message = f"Request failed with status {response.status_code}"
            try:
                data = response.json()
                message = data.get("message", message)
            except Exception:
                pass
            raise MetallicError(message)
    
    async def get(self, path: str, **kwargs) -> httpx.Response:
        """Make a GET request."""
        try:
            response = await self.client.get(path, **kwargs)
            self._handle_error(response)
            return response
        except httpx.TimeoutException as e:
            raise TimeoutError("Request timed out") from e
    
    async def post(self, path: str, **kwargs) -> httpx.Response:
        """Make a POST request."""
        try:
            response = await self.client.post(path, **kwargs)
            self._handle_error(response)
            return response
        except httpx.TimeoutException as e:
            raise TimeoutError("Request timed out") from e
    
    async def put(self, path: str, **kwargs) -> httpx.Response:
        """Make a PUT request."""
        try:
            response = await self.client.put(path, **kwargs)
            self._handle_error(response)
            return response
        except httpx.TimeoutException as e:
            raise TimeoutError("Request timed out") from e
    
    async def delete(self, path: str, **kwargs) -> httpx.Response:
        """Make a DELETE request."""
        try:
            response = await self.client.delete(path, **kwargs)
            self._handle_error(response)
            return response
        except httpx.TimeoutException as e:
            raise TimeoutError("Request timed out") from e
