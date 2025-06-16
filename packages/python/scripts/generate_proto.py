#!/usr/bin/env python3
"""
Script to generate Python gRPC code from proto files.

This script generates the Python gRPC stubs from the shared proto files
in the ../../proto directory.
"""

import os
import subprocess
import sys
from pathlib import Path


def main():
    """Generate Python gRPC code from proto files."""
    script_dir = Path(__file__).parent
    python_pkg_dir = script_dir.parent
    project_root = python_pkg_dir.parent.parent
    proto_dir = project_root / "proto"
    output_dir = python_pkg_dir / "metallic" / "generated"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    proto_files = list(proto_dir.glob("*.proto"))
    if not proto_files:
        print(f"No proto files found in {proto_dir}")
        sys.exit(1)
    
    print(f"Found {len(proto_files)} proto files:")
    for proto_file in proto_files:
        print(f"  - {proto_file.name}")
    
    cmd = [
        sys.executable, "-m", "grpc_tools.protoc",
        f"-I{proto_dir}",
        f"--python_out={output_dir}",
        f"--grpc_python_out={output_dir}",
    ]
    cmd.extend(str(f) for f in proto_files)
    
    print(f"\nRunning command:")
    print(" ".join(cmd))
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("\n✅ Successfully generated Python gRPC code!")
        
        generated_files = list(output_dir.glob("*_pb2*.py"))
        print(f"\nGenerated {len(generated_files)} files:")
        for gen_file in sorted(generated_files):
            print(f"  - {gen_file.name}")
            
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error generating gRPC code:")
        print(f"Return code: {e.returncode}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print("\n❌ Error: grpc_tools not found. Please install it with:")
        print("pip install grpcio-tools")
        sys.exit(1)


if __name__ == "__main__":
    main()
