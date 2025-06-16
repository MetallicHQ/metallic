"""Filesystem tool for file operations."""
import asyncio
from typing import List, Dict, Any, Optional, AsyncIterator, Union
from pathlib import Path

from ..services.filesystem import FilesystemService
from ..generated import filesystem_pb2


class FileStats:
    """File statistics data structure."""
    
    def __init__(self, is_directory: bool, is_file: bool, size: int, modified_time: str):
        self.is_directory = is_directory
        self.is_file = is_file
        self.size = size
        self.modified_time = modified_time


class WatchEvent:
    """Filesystem watch event."""
    
    def __init__(self, path: str, event_type: str, old_path: str = "", is_directory: bool = False):
        self.path = path
        self.type = event_type
        self.old_path = old_path
        self.is_directory = is_directory


class WatchHandle:
    """Handle for stopping filesystem watching."""
    
    def __init__(self, stop_callback):
        self._stop_callback = stop_callback
    
    def stop(self):
        """Stop watching the filesystem."""
        self._stop_callback()


class FilesystemTool:
    """Tool for filesystem operations."""
    
    def __init__(self, project_id: str, instance_id: str):
        """Initialize the Filesystem tool.
        
        Args:
            project_id: Project ID
            instance_id: Instance ID
        """
        self.fs = FilesystemService(project_id, instance_id)
    
    async def close(self):
        """Close the filesystem service connection."""
        await self.fs.close()
    
    async def read_file(self, path: str, format: str = "text") -> Union[str, bytes]:
        """Read a file.
        
        Args:
            path: Path to the file
            format: Format to read the file as ('text' or 'bytes')
            
        Returns:
            File content as string or bytes
        """
        request = filesystem_pb2.ReadFileRequest(path=path, format=format)
        response = await self.fs.read_file(request)
        
        if not response.success:
            raise Exception(response.error)
        
        if format == "text":
            return response.content
        elif format == "bytes":
            return response.binary
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    async def read_file_stream(self, path: str) -> AsyncIterator[bytes]:
        """Read a file as a stream.
        
        Args:
            path: Path to the file
            
        Yields:
            File chunks as bytes
        """
        request = filesystem_pb2.ReadFileStreamRequest(path=path)
        async for chunk in self.fs.read_file_stream(request):
            if chunk.error:
                raise Exception(chunk.error)
            
            if len(chunk.content) > 0:
                yield chunk.content
            
            if chunk.end:
                break
    
    async def write_file(self, path: str, content: Union[str, bytes]) -> None:
        """Write content to a file.
        
        Args:
            path: Path to the file
            content: Content to write (string or bytes)
        """
        if isinstance(content, str):
            request = filesystem_pb2.WriteFileRequest(
                path=path,
                format="text",
                content=content,
                binary=b""
            )
        else:
            request = filesystem_pb2.WriteFileRequest(
                path=path,
                format="bytes",
                content="",
                binary=content
            )
        
        response = await self.fs.write_file(request)
        if not response.success:
            raise Exception(response.error)
    
    async def list_directory(self, path: str) -> List[str]:
        """List files and directories in a directory.
        
        Args:
            path: Path to the directory
            
        Returns:
            List of file and directory names
        """
        request = filesystem_pb2.ReadDirectoryRequest(path=path)
        response = await self.fs.read_directory(request)
        
        if not response.success:
            raise Exception(response.error)
        
        return list(response.files)
    
    async def create_directory(self, path: str) -> None:
        """Create a directory.
        
        Args:
            path: Path to create
        """
        request = filesystem_pb2.CreateDirectoryRequest(path=path)
        response = await self.fs.create_directory(request)
        
        if not response.success:
            raise Exception(response.error)
    
    async def rename(self, old_path: str, new_path: str) -> None:
        """Rename a file or directory.
        
        Args:
            old_path: Current path
            new_path: New path
        """
        request = filesystem_pb2.RenameRequest(oldPath=old_path, newPath=new_path)
        response = await self.fs.rename(request)
        
        if not response.success:
            raise Exception(response.error)
    
    async def delete(self, path: str) -> None:
        """Delete a file or directory.
        
        Args:
            path: Path to delete
        """
        request = filesystem_pb2.UnlinkRequest(path=path)
        response = await self.fs.unlink(request)
        
        if not response.success:
            raise Exception(response.error)
    
    async def exists(self, path: str) -> bool:
        """Check if a file or directory exists.
        
        Args:
            path: Path to check
            
        Returns:
            True if the path exists, False otherwise
        """
        request = filesystem_pb2.ExistsRequest(path=path)
        response = await self.fs.exists(request)
        
        if not response.success:
            raise Exception(response.error)
        
        return response.exists
    
    async def get_stats(self, path: str) -> FileStats:
        """Get file or directory stats.
        
        Args:
            path: Path to get stats for
            
        Returns:
            FileStats object
        """
        request = filesystem_pb2.GetStatsRequest(path=path)
        response = await self.fs.get_stats(request)
        
        if not response.success:
            raise Exception(response.error)
        
        return FileStats(
            is_directory=response.isDirectory,
            is_file=response.isFile,
            size=response.size,
            modified_time=response.modifiedTime
        )
    
    async def watch(
        self,
        path: str,
        recursive: bool = False,
        events: Optional[int] = None
    ) -> AsyncIterator[WatchEvent]:
        """Watch for filesystem events.
        
        Args:
            path: Directory to watch
            recursive: Whether to watch recursively
            events: Event flags to watch for
            
        Yields:
            WatchEvent objects
        """
        request = filesystem_pb2.WatchRequest(
            path=path,
            recursive=recursive,
            events=events or 0xffffffff
        )
        
        async for event in self.fs.watch(request):
            if event.error:
                raise Exception(event.error)
            
            yield WatchEvent(
                path=event.path,
                event_type=event.type,
                old_path=event.oldPath,
                is_directory=event.isDirectory
            )
