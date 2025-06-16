"""Test cases for Computer class, mirroring the Node SDK vitest tests."""
import pytest
import asyncio
from metallic import Computer


@pytest.mark.asyncio
async def test_computer_lifecycle():
    """Test computer lifecycle operations."""
    computer = await Computer.create()
    
    assert computer.id is not None
    assert computer.state.value == "starting"
    
    await computer.wait_for_state("started")
    assert computer.state.value == "started"
    
    await computer.stop()
    assert computer.state.value == "stopping"
    
    await computer.wait_for_state("stopped")
    assert computer.state.value == "stopped"
    
    await computer.destroy()
    assert computer.state.value == "destroying"
    
    await computer.wait_for_state("destroyed")
    assert computer.state.value == "destroyed"
    
    await computer.close()


@pytest.mark.asyncio
async def test_computer_fork():
    """Test computer fork functionality."""
    computer = await Computer.create()
    assert computer.id is not None
    
    forked_computer = await computer.fork()
    assert forked_computer.id is not None
    assert forked_computer.state.value == "starting"
    
    await forked_computer.wait_for_state("started")
    assert forked_computer.state.value == "started"
    
    await computer.destroy()
    assert computer.state.value == "destroying"
    
    await forked_computer.destroy()
    assert forked_computer.state.value == "destroying"
    
    await computer.close()
    await forked_computer.close()


@pytest.mark.asyncio
async def test_computer_health_check():
    """Test computer health check functionality."""
    computer = await Computer.create()
    await computer.wait_for_state("started")
    
    is_healthy = await computer.health_check()
    assert isinstance(is_healthy, bool)
    
    await computer.destroy()
    await computer.close()


@pytest.mark.asyncio
async def test_computer_metrics():
    """Test computer metrics functionality."""
    computer = await Computer.create()
    await computer.wait_for_state("started")
    
    metrics = await computer.get_metrics()
    assert metrics.cpu_count > 0
    assert metrics.cpu_used_pct >= 0.0
    assert metrics.mem_total_mib > 0
    assert metrics.mem_used_mib >= 0
    assert metrics.timestamp is not None
    
    await computer.destroy()
    await computer.close()


@pytest.mark.asyncio
async def test_computer_get_host():
    """Test computer get host functionality."""
    computer = await Computer.create()
    await computer.wait_for_state("started")
    
    host = await computer.get_host(8000)
    assert isinstance(host, str)
    assert len(host) > 0
    
    await computer.destroy()
    await computer.close()
