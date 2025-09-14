"""
title: Chatbot Builder
author: SahithPoreddy
version: 1.0.0
required_open_webui_version: 0.6.0
icon_url: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMSAxNmEyIDIgMCAwIDEtMiAySDE0LjVsLTItMkg1YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ2MTB6Ii8+PGNpcmNsZSBjeD0iOSIgY3k9IjEwIiByPSIyIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxMCIgcj0iMiIvPjwvc3ZnPg==
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional, Union, Callable, Awaitable
from pydantic import BaseModel, Field
import aiohttp
import base64

# Type definitions for Open WebUI integration
EventEmitter = Callable[[Dict[str, Any]], Awaitable[None]]
EventCall = Callable[[Dict[str, Any]], Awaitable[Any]]

# TypeScript-compatible type definitions for the chatbot flow data
class NodePosition(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    """Base node data structure - matches TypeScript interface"""
    pass

class TextMessageNodeData(NodeData):
    """TypeScript: TextMessageNodeData interface"""
    channel: str = Field(default="sms", description="Message channel (sms, whatsapp, messenger, etc.)")
    message: str = Field(default="", description="Message content")

class ConditionalPathNodeData(NodeData):
    """TypeScript: ConditionalPathNodeData interface"""
    condition: str = Field(default="", description="Condition logic")

class FlowNode(BaseModel):
    """TypeScript: Node interface from @xyflow/react"""
    id: str
    type: str
    position: NodePosition
    data: Dict[str, Any]  # Union of NodeData types

class FlowEdge(BaseModel):
    """TypeScript: Edge interface from @xyflow/react"""
    id: str
    source: str
    target: str
    type: str = "default"

class ChatbotFlowData(BaseModel):
    """Complete chatbot flow data structure - matches TypeScript interface"""
    nodes: List[FlowNode]
    edges: List[FlowEdge]
    timestamp: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

logger = logging.getLogger(__name__)

class Action:
    class Valves(BaseModel):
        # Configuration parameters for the chatbot builder
        chatbot_builder_url: str = Field(
            default="http://localhost:5173",
            description="URL where the TypeScript chatbot builder application is hosted"
        )
        enable_builder: bool = Field(
            default=True,
            description="Enable/disable the chatbot builder functionality"
        )
        debug_mode: bool = Field(
            default=False,
            description="Enable debug logging for troubleshooting TypeScript/Python communication"
        )

    def __init__(self):
        self.valves = self.Valves()

    async def action(
        self,
        body: Dict[str, Any],
        __user__: Optional[Dict[str, Any]] = None,
        __event_emitter__: Optional[EventEmitter] = None,
        __event_call__: Optional[EventCall] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main action method that handles the 'Draw' button click.
        This will launch the chatbot builder interface in a modal.
        """
        try:
            if not self.valves.enable_builder:
                return {"content": "Chatbot builder is currently disabled."}

            # Debug logging
            if self.valves.debug_mode:
                logger.info(f"Chatbot builder action triggered by user: {__user__.get('name', 'Unknown') if __user__ else 'Unknown'}")

            # Send status update to user
            if __event_emitter__:
                await __event_emitter__({
                    "type": "status",
                    "data": {"description": "Launching Chatbot Builder..."}
                })

            # Create the chatbot builder interface HTML
            builder_html = self._create_builder_interface()

            # Send the HTML interface to the frontend
            if __event_emitter__:
                await __event_emitter__({
                    "type": "message",
                    "data": {
                        "content": builder_html,
                        "format": "html"
                    }
                })

            # Wait for user interaction with the builder
            if __event_call__:
                # Show the builder in a modal-like interface
                builder_result = await __event_call__({
                    "type": "input",
                    "data": {
                        "title": "Chatbot Flow Builder",
                        "message": "Design your chatbot flow using the interactive builder below:",
                        "placeholder": "Click 'Save' in the builder to save your flow...",
                        "html": builder_html
                    }
                })

                if builder_result:
                    # Process the result from the chatbot builder
                    flow_data = self._process_builder_result(builder_result)

                    if flow_data:
                        # Format the flow data for display
                        formatted_output = self._format_flow_output(flow_data)

                        return {
                            "content": formatted_output,
                            "format": "markdown"
                        }
                    else:
                        return {"content": "No flow data received from the builder."}
                else:
                    return {"content": "Chatbot builder was cancelled."}
            else:
                # Fallback if event_call is not available
                return {
                    "content": "Chatbot Builder launched. Please use a compatible Open WebUI version that supports interactive actions.",
                    "format": "markdown"
                }

        except Exception as e:
            logger.error(f"Error in chatbot builder action: {str(e)}")

            if __event_emitter__:
                await __event_emitter__({
                    "type": "notification",
                    "data": {
                        "type": "error",
                        "content": f"Chatbot builder failed: {str(e)}"
                    }
                })

            return {
                "content": f"❌ Chatbot builder encountered an error: {str(e)}",
                "format": "markdown"
            }

    def _create_builder_interface(self) -> str:
        """
        Creates the HTML interface for the chatbot builder.
        This embeds the chatbot builder as an iframe within Open WebUI.
        """
        return f"""
        <div style="width: 100%; height: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <iframe
                src="{self.valves.chatbot_builder_url}"
                width="100%"
                height="100%"
                frameborder="0"
                style="border: none;"
                id="chatbot-builder-iframe"
                allow="fullscreen"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            ></iframe>

            <script>
                // Handle messages from the chatbot builder iframe
                window.addEventListener('message', function(event) {{
                    if (event.origin !== '{self.valves.chatbot_builder_url}') {{
                        return;
                    }}

                    if (event.data.type === 'saveDrawing') {{
                        // Send the flow data back to Open WebUI
                        const flowData = event.data.payload;
                        console.log('Received flow data from builder:', flowData);

                        // Store the data in a way that Open WebUI can access it
                        window.chatbotFlowData = flowData;

                        // Trigger a custom event that Open WebUI can listen to
                        window.dispatchEvent(new CustomEvent('chatbotFlowSaved', {{
                            detail: flowData
                        }}));
                    }}

                    if (event.data.type === 'ready') {{
                        console.log('Chatbot builder is ready');
                    }}
                }});

                // Load existing data if available
                window.addEventListener('load', function() {{
                    const iframe = document.getElementById('chatbot-builder-iframe');
                    if (iframe && iframe.contentWindow) {{
                        // Send any existing flow data to the builder
                        iframe.contentWindow.postMessage({{
                            type: 'loadData',
                            payload: window.existingFlowData || null
                        }}, '{self.valves.chatbot_builder_url}');
                    }}
                }});
            </script>
        </div>

        <div style="margin-top: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 6px; font-size: 14px;">
            <strong>Instructions:</strong>
            <ul style="margin: 8px 0; padding-left: 20px;">
                <li>Use the flow builder above to design your chatbot conversation flow</li>
                <li>Add nodes by dragging from the sidebar or using the context menu</li>
                <li>Connect nodes to create conversation paths</li>
                <li>Click the "Save" button in the builder when you're done</li>
                <li>The flow data will be captured and displayed below</li>
            </ul>
        </div>
        """

    def _process_builder_result(self, result: Any) -> Optional[ChatbotFlowData]:
        """
        Processes the result returned from the TypeScript chatbot builder interface.
        Validates and parses the flow data according to TypeScript interfaces.
        """
        try:
            if isinstance(result, dict):
                # Validate the structure matches our TypeScript interfaces
                flow_data = ChatbotFlowData(**result)
                return flow_data
            elif isinstance(result, str):
                # Try to parse as JSON from TypeScript
                parsed_data = json.loads(result)
                flow_data = ChatbotFlowData(**parsed_data)
                return flow_data
            else:
                logger.warning(f"Unexpected result type from TypeScript builder: {type(result)}")
                return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse TypeScript builder result as JSON: {e}")
            return None
        except Exception as e:
            logger.error(f"Error processing TypeScript builder result: {e}")
            return None

    def _format_flow_output(self, flow_data: ChatbotFlowData) -> str:
        """
        Formats the TypeScript chatbot flow data into a readable markdown output.
        """
        try:
            nodes_count = len(flow_data.nodes)
            edges_count = len(flow_data.edges)

            output = [
                "# 🤖 Chatbot Flow Saved Successfully",
                "",
                f"**Flow Statistics:**",
                f"- **Nodes:** {nodes_count}",
                f"- **Connections:** {edges_count}",
                "",
                "## 📋 Flow Structure",
                ""
            ]

            # Add node details with TypeScript type information
            if flow_data.nodes:
                output.append("### Nodes:")
                for i, node in enumerate(flow_data.nodes, 1):
                    node_type = node.type
                    node_id = node.id
                    node_data = node.data

                    output.append(f"{i}. **{node_type}** (ID: `{node_id}`)")

                    # Add specific node data based on TypeScript interfaces
                    if node_type == 'textMessage':
                        channel = node_data.get('channel', 'Unknown')
                        message = node_data.get('message', 'No message')
                        output.append(f"   - Channel: {channel}")
                        output.append(f"   - Message: {message}")
                        output.append(f"   - TypeScript Interface: `TextMessageNodeData`")
                    elif node_type == 'conditionalPath':
                        condition = node_data.get('condition', 'No condition')
                        output.append(f"   - Condition: {condition}")
                        output.append(f"   - TypeScript Interface: `ConditionalPathNodeData`")
                    elif node_type in ['start', 'end']:
                        output.append(f"   - TypeScript Interface: `BaseNodeData`")

                    # Add position information
                    position = node.position
                    output.append(f"   - Position: ({position.x}, {position.y})")
                    output.append("")

            # Add edge details with TypeScript type information
            if flow_data.edges:
                output.append("### Connections:")
                for i, edge in enumerate(flow_data.edges, 1):
                    source = edge.source
                    target = edge.target
                    edge_type = edge.type
                    output.append(f"{i}. `{source}` → `{target}` (Type: {edge_type})")
                    output.append(f"   - TypeScript Interface: `FlowEdge`")

                output.append("")

            # Add TypeScript type information
            output.extend([
                "## 🔧 TypeScript Integration",
                "",
                "This flow data conforms to the following TypeScript interfaces:",
                "",
                "```typescript",
                "interface ChatbotFlowData {",
                "  nodes: FlowNode[];",
                "  edges: FlowEdge[];",
                "  timestamp?: number;",
                "  metadata?: Record<string, any>;",
                "}",
                "",
                "interface FlowNode {",
                "  id: string;",
                "  type: string;",
                "  position: { x: number; y: number };",
                "  data: NodeData;",
                "}",
                "",
                "interface FlowEdge {",
                "  id: string;",
                "  source: string;",
                "  target: string;",
                "  type: string;",
                "}",
                "```",
                ""
            ])

            # Add raw JSON data (collapsed)
            output.extend([
                "## 📄 Raw Flow Data",
                "",
                "<details>",
                "<summary>Click to view TypeScript-compatible JSON data</summary>",
                "",
                "```json",
                flow_data.model_dump_json(indent=2),
                "```",
                "",
                "</details>",
                "",
                "---",
                "",
                "✅ Your chatbot flow has been successfully created with full TypeScript type safety and can now be exported or integrated into your system."
            ])

            return "\n".join(output)

        except Exception as e:
            logger.error(f"Error formatting flow output: {e}")
            return f"✅ Chatbot flow saved successfully!\n\nRaw data:\n```json\n{flow_data.model_dump_json(indent=2)}\n```"

# Export the action for Open WebUI
action = Action()
