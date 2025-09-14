# Open WebUI Chatbot Builder Extension

This extension adds a visual chatbot flow builder to Open WebUI as an Action Function. Users can design conversation flows using a drag-and-drop interface with nodes and connections. Built with **TypeScript** for full type safety between the React frontend and Python backend.

## Features

- 🎨 **Visual Flow Builder**: Drag-and-drop interface for creating chatbot flows
- 🔗 **Node Connections**: Connect different types of nodes to create conversation paths
- 💾 **Save & Load**: Save your chatbot flows and load them for editing
- 🚀 **Open WebUI Integration**: Seamlessly integrated as an Action Function
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **TypeScript Integration**: Full type safety with Python backend validation
- 📊 **Type-Safe Communication**: Structured data exchange between frontend and backend

## TypeScript Architecture

This extension is built with full TypeScript support:

### Frontend Types (`src/types/open-webui.types.ts`)
```typescript
// Core interfaces for type-safe communication
export interface ChatbotFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'textMessage' | 'conditionalPath';
  position: { x: number; y: number };
  data: NodeData;
}

// Specific node data types
export interface TextMessageNodeData extends BaseNodeData {
  channel: 'sms' | 'whatsapp' | 'messenger' | 'email' | 'webchat';
  message: string;
}

export interface ConditionalPathNodeData extends BaseNodeData {
  condition: string;
}
```

### Backend Types (Python with Pydantic)
```python
# Matching Python models for validation
class ChatbotFlowData(BaseModel):
    nodes: List[FlowNode]
    edges: List[FlowEdge]
    timestamp: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class TextMessageNodeData(NodeData):
    channel: str = Field(default="sms")
    message: str = Field(default="")

class ConditionalPathNodeData(NodeData):
    condition: str = Field(default="")
```

### Type Safety Benefits
- ✅ **Compile-time validation** of data structures
- ✅ **IntelliSense support** in editors
- ✅ **Runtime validation** with Pydantic on the backend
- ✅ **Automatic API documentation** generation
- ✅ **Consistent data contracts** between frontend and backend

## Installation

### 1. Deploy the Web Application

First, you need to deploy the chatbot builder web application:

#### Option A: Local Development Server
```bash
# Clone this repository
git clone https://github.com/SahithPoreddy/Chatbot-builder.git
cd Chatbot-builder

# Install dependencies
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm dev
```

The web application will be available at `http://localhost:5173`

#### Option B: Production Deployment
```bash
# Build for production
npm run build
# or
pnpm build

# Serve the built files using your preferred web server
# Example with a simple HTTP server:
npx serve dist
```

### 2. Install the Action Function in Open WebUI

1. **Copy the Action Function file**: Take the file `open-webui-extension/chatbot_builder_action.py` from this repository.

2. **Access Open WebUI Admin Panel**:
   - Login to your Open WebUI instance as an administrator
   - Navigate to Admin Panel → Functions

3. **Add the Function**:
   - Click "Add Function" or the "+" button
   - Paste the contents of `chatbot_builder_action.py`
   - Click "Save"

4. **Configure the Function**:
   - Find the "Chatbot Builder" function in your functions list
   - Click on it to configure
   - Update the `chatbot_builder_url` valve to point to your deployed web application:
     - For local development: `http://localhost:5173`
     - For production: `https://your-domain.com/chatbot-builder`
   - Enable the function by toggling it on
   - Optionally, enable it globally for all models or assign it to specific models

### 3. Assign to Models (Optional)

If you didn't enable the function globally:

1. Go to **Workspace → Models**
2. Select the model(s) you want to add the chatbot builder to
3. In the model settings, find the "Functions" section
4. Add the "Chatbot Builder" function to the selected model

## Usage

1. **Start a conversation** with any model that has the Chatbot Builder function enabled
2. **Look for the "Draw" button** that appears below AI responses
3. **Click the "Draw" button** to open the chatbot flow builder interface
4. **Design your flow**:
   - Add nodes by dragging from the sidebar
   - Connect nodes by dragging from output handles to input handles
   - Configure node properties in the sidebar
   - Use different node types: Start, End, Text Message, Conditional Path
5. **Save your flow** by clicking the "Save" button in the builder
6. **View the flow data** in the chat response formatted as markdown

## Node Types

- **Start Node**: Entry point of your chatbot flow
- **Text Message Node**: Send text messages through various channels (SMS, WhatsApp, etc.)
- **Conditional Path Node**: Create branching logic based on conditions
- **End Node**: Terminal point of conversation flows

## Configuration Options

You can configure the extension through the Function's valves:

- `chatbot_builder_url`: URL where your chatbot builder web app is hosted
- `enable_builder`: Enable/disable the chatbot builder functionality
- `debug_mode`: Enable debug logging for troubleshooting

## Development

### Project Structure

```
├── src/
│   ├── types/
│   │   └── open-webui.types.ts       # TypeScript interface definitions
│   ├── modules/flow-builder/         # Flow builder components
│   ├── modules/nodes/                # Node type definitions
│   ├── modules/sidebar/              # Sidebar components
│   └── pages/                        # Page components
├── open-webui-extension/             # Open WebUI extension files
│   └── chatbot_builder_action.py     # Action Function with Pydantic models
└── build-extension.js                # Build script for extension
```

### TypeScript Development

To package the extension for distribution:

```bash
# Build the web application
npm run build

# Create extension package
node build-extension.js
```

This creates a `dist/extension/` directory with:
- The built web application
- The Python Action Function
- Installation instructions

## Troubleshooting

### Common Issues

1. **"Chatbot builder is currently disabled"**
   - Check that `enable_builder` valve is set to `true`
   - Ensure the function is enabled in Open WebUI

2. **Builder interface doesn't load**
   - Verify the `chatbot_builder_url` is correct and accessible
   - Check browser console for CORS or network errors
   - Ensure the web application is running

3. **Save functionality not working**
   - Check browser console for JavaScript errors
   - Verify the communication between iframe and parent window

4. **Function not appearing**
   - Ensure you're an admin user in Open WebUI
   - Check that the function is enabled and assigned to your model
   - Try refreshing the page

### Debug Mode

Enable debug mode in the function configuration to get detailed logs:
1. Go to Admin Panel → Functions
2. Find "Chatbot Builder" function
3. Set `debug_mode` to `true`
4. Check Open WebUI logs for detailed debugging information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Open WebUI
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look for similar issues in the GitHub repository
3. Open a new issue with detailed description and logs
4. Join the Open WebUI Discord community for help
