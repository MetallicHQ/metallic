"""Filesystem gRPC service client."""
import grpc
from typing import AsyncIterator, Optional

from ..generated import filesystem_pb2, filesystem_pb2_grpc


class FilesystemService:
    """gRPC client for Filesystem service."""
    
    def __init__(self, project_id: str, instance_id: str, host: str = "localhost", port: int = 50051):
        """Initialize the Filesystem service client.
        
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
        self.stub = filesystem_pb2_grpc.FilesystemStub(self.channel)
    
    async def close(self):
        """Close the gRPC channel."""
        await self.channel.close()
    
    async def read_file(self, request: filesystem_pb2.ReadFileRequest) -> filesystem_pb2.ReadFileResponse:
        """Read a file."""
        return await self.stub.ReadFile(request)
    
    async def read_file_stream(self, request: filesystem_pb2.ReadFileStreamRequest) -> AsyncIterator[filesystem_pb2.FileChunk]:
        """Read a file as a stream."""
        async for chunk in self.stub.ReadFileStream(request):
            yield chunk
    
    async def write_file(self, request: filesystem_pb2.WriteFileRequest) -> filesystem_pb2.WriteFileResponse:
        """Write a file."""
        return await self.stub.WriteFile(request)
    
    async def write_file_stream(self, request_iterator: AsyncIterator[filesystem_pb2.FileChunk]) -> filesystem_pb2.WriteFileResponse:
        """Write a file as a stream."""
        return await self.stub.WriteFileStream(request_iterator)
    
    async def read_directory(self, request: filesystem_pb2.ReadDirectoryRequest) -> filesystem_pb2.ReadDirectoryResponse:
        """Read directory contents."""
        return await self.stub.ReadDirectory(request)
    
    async def create_directory(self, request: filesystem_pb2.CreateDirectoryRequest) -> filesystem_pb2.CreateDirectoryResponse:
        """Create a directory."""
        return await self.stub.CreateDirectory(request)
    
    async def rename(self, request: filesystem_pb2.RenameRequest) -> filesystem_pb2.RenameResponse:
        """Rename a file or directory."""
        return await self.stub.Rename(request)
    
    async def unlink(self, request: filesystem_pb2.UnlinkRequest) -> filesystem_pb2.UnlinkResponse:
        """Delete a file or directory."""
        return await self.stub.Unlink(request)
    
    async def exists(self, request: filesystem_pb2.ExistsRequest) -> filesystem_pb2.ExistsResponse:
        """Check if a file or directory exists."""
        return await self.stub.Exists(request)
    
    async def get_stats(self, request: filesystem_pb2.GetStatsRequest) -> filesystem_pb2.GetStatsResponse:
        """Get file or directory stats."""
        return await self.stub.GetStats(request)
    
    async def watch(self, request: filesystem_pb2.WatchRequest) -> AsyncIterator[filesystem_pb2.WatchEvent]:
        """Watch for filesystem events."""
        async for event in self.stub.Watch(request):
            yield event
