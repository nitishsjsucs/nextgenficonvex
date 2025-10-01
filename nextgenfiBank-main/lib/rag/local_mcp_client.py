"""
Local MCP client for communicating with the earthquake marketing MCP server.
This allows Streamlit to interact with the MCP server locally.
"""

import asyncio
import json
import subprocess
import threading
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import queue
import sys
import os

@dataclass
class MCPResource:
    uri: str
    name: str
    description: str
    content: Optional[str] = None

@dataclass
class MCPTool:
    name: str
    description: str
    input_schema: Dict[str, Any]

class LocalMCPClient:
    """Local MCP client that communicates with the earthquake marketing server."""
    
    def __init__(self, server_script_path: str = "earthquake_marketing_mcp.py"):
        self.server_script_path = server_script_path
        self.process = None
        self.request_id = 0
        self.response_queue = queue.Queue()
        self.is_connected = False
        
    def start_server(self) -> bool:
        """Start the MCP server process."""
        try:
            # Start the MCP server as a subprocess
            self.process = subprocess.Popen(
                [sys.executable, self.server_script_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=0
            )
            
            # Give the server a moment to start
            time.sleep(2)
            
            # Check if process is still running
            if self.process.poll() is None:
                self.is_connected = True
                return True
            else:
                stderr_output = self.process.stderr.read()
                print(f"Server failed to start: {stderr_output}")
                return False
                
        except Exception as e:
            print(f"Failed to start MCP server: {e}")
            return False
    
    def stop_server(self):
        """Stop the MCP server process."""
        if self.process:
            self.process.terminate()
            self.process.wait()
            self.is_connected = False
    
    def _send_request(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send a JSON-RPC request to the MCP server."""
        if not self.is_connected or not self.process:
            raise Exception("MCP server not connected")
        
        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method,
            "params": params or {}
        }
        
        try:
            # Send request
            request_json = json.dumps(request) + "\n"
            self.process.stdin.write(request_json)
            self.process.stdin.flush()
            
            # Read response
            response_line = self.process.stdout.readline()
            if not response_line:
                raise Exception("No response from server")
            
            response = json.loads(response_line.strip())
            
            if "error" in response:
                raise Exception(f"MCP Error: {response['error']}")
            
            return response.get("result", {})
            
        except Exception as e:
            print(f"MCP request failed: {e}")
            raise
    
    def list_resources(self) -> List[MCPResource]:
        """List all available resources."""
        try:
            result = self._send_request("resources/list")
            resources = []
            
            for resource_data in result.get("resources", []):
                resources.append(MCPResource(
                    uri=resource_data["uri"],
                    name=resource_data["name"],
                    description=resource_data["description"]
                ))
            
            return resources
        except Exception as e:
            print(f"Failed to list resources: {e}")
            return []
    
    def read_resource(self, uri: str) -> Optional[str]:
        """Read a specific resource."""
        try:
            result = self._send_request("resources/read", {"uri": uri})
            contents = result.get("contents", [])
            if contents and len(contents) > 0:
                return contents[0].get("text", "")
            return None
        except Exception as e:
            print(f"Failed to read resource {uri}: {e}")
            return None
    
    def list_tools(self) -> List[MCPTool]:
        """List all available tools."""
        try:
            result = self._send_request("tools/list")
            tools = []
            
            for tool_data in result.get("tools", []):
                tools.append(MCPTool(
                    name=tool_data["name"],
                    description=tool_data["description"],
                    input_schema=tool_data.get("inputSchema", {})
                ))
            
            return tools
        except Exception as e:
            print(f"Failed to list tools: {e}")
            return []
    
    def call_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        """Call a specific tool."""
        try:
            result = self._send_request("tools/call", {
                "name": name,
                "arguments": arguments
            })
            
            content = result.get("content", [])
            if content and len(content) > 0:
                return content[0].get("text", "")
            
            return json.dumps(result, indent=2)
            
        except Exception as e:
            print(f"Failed to call tool {name}: {e}")
            raise

# Simplified MCP client for when the full MCP protocol isn't available
class SimplifiedMCPClient:
    """Simplified client that directly uses the earthquake RAG server."""
    
    def __init__(self):
        # Import the existing server
        try:
            from earthquake_rag_server import EarthquakeRAGServer
            self.rag_server = EarthquakeRAGServer()
            self.is_connected = True
        except ImportError:
            self.is_connected = False
    
    def start_server(self) -> bool:
        return self.is_connected
    
    def stop_server(self):
        pass
    
    def list_resources(self) -> List[MCPResource]:
        """List available resources."""
        return [
            MCPResource("stats/overview", "Statistics Overview", "Earthquake and demographic statistics"),
            MCPResource("earthquakes/recent", "Recent Earthquakes", "Recent earthquake events"),
            MCPResource("targets/preview", "Target Preview", "Preview of potential campaign targets")
        ]
    
    def read_resource(self, uri: str) -> Optional[str]:
        """Read a resource using the RAG server."""
        try:
            if uri == "stats/overview":
                stats = self.rag_server.get_earthquake_statistics()
                return json.dumps(stats, indent=2)
            elif uri.startswith("earthquakes/recent"):
                earthquakes = self.rag_server.get_recent_earthquakes()
                return json.dumps(earthquakes, indent=2)
            elif uri.startswith("targets/preview"):
                # Parse parameters from URI
                params = {}
                if "?" in uri:
                    query_string = uri.split("?")[1]
                    for param in query_string.split("&"):
                        if "=" in param:
                            key, value = param.split("=", 1)
                            params[key] = value
                
                targets = self.rag_server.find_earthquake_ad_targets(
                    min_magnitude=float(params.get("min_mag", 3.5)),
                    max_distance_km=float(params.get("max_km", 100)),
                    min_house_value=float(params.get("min_value", 500000)),
                    require_uninsured=params.get("uninsured", "true").lower() == "true"
                )
                
                # Return just the targets for preview
                preview_targets = targets["targets"][:20]  # Limit to first 20
                preview_data = {
                    "preview_count": len(preview_targets),
                    "total_available": len(targets["targets"]),
                    "criteria": targets["summary"]["criteria"],
                    "targets": preview_targets
                }
                return json.dumps(preview_data, indent=2)
            
            return None
        except Exception as e:
            print(f"Error reading resource: {e}")
            return None
    
    def list_tools(self) -> List[MCPTool]:
        """List available tools."""
        return [
            MCPTool(
                name="find_targets",
                description="Find people who should be targeted for earthquake insurance ads",
                input_schema={
                    "type": "object",
                    "properties": {
                        "min_magnitude": {"type": "number", "default": 3.5},
                        "max_distance_km": {"type": "number", "default": 100},
                        "min_house_value": {"type": "number", "default": 500000},
                        "require_uninsured": {"type": "boolean", "default": True}
                    }
                }
            )
        ]
    
    def call_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        """Call a tool using the RAG server."""
        try:
            if name == "find_targets":
                result = self.rag_server.find_earthquake_ad_targets(
                    min_magnitude=arguments.get("min_magnitude", 3.5),
                    max_distance_km=arguments.get("max_distance_km", 100),
                    min_house_value=arguments.get("min_house_value", 500000),
                    require_uninsured=arguments.get("require_uninsured", True)
                )
                return json.dumps(result, indent=2)
            else:
                return json.dumps({"error": f"Unknown tool: {name}"})
        except Exception as e:
            return json.dumps({"error": str(e)})

def create_mcp_client() -> LocalMCPClient:
    """Create and return an appropriate MCP client."""
    # Try the full MCP client first
    try:
        client = LocalMCPClient()
        if client.start_server():
            return client
    except Exception as e:
        print(f"Full MCP client failed: {e}")
    
    # Fall back to simplified client
    print("Using simplified MCP client...")
    return SimplifiedMCPClient()

