# 🤖 Chatbot Flow Builder - Open WebUI Extension

A **TypeScript-powered** visual drag-and-drop chatbot flow builder that integrates seamlessly with Open WebUI as an Action Function. Design conversation flows using nodes and connections with full type safety between the React frontend and Python backend.

## 🎯 Quick Start

**Want to get started immediately?** See [QUICK_INSTALL.md](./QUICK_INSTALL.md) for a 5-minute setup guide.

## ✨ Features

- 🎨 **Visual Flow Builder**: Intuitive drag-and-drop interface
- 🔗 **Node Connections**: Connect different conversation elements
- 💾 **Save & Load**: Persistent chatbot flow storage
- 🚀 **Open WebUI Integration**: Native Action Function integration
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔧 **Multiple Node Types**: Start, End, Text Message, Conditional paths
- 🌐 **Cross-Platform**: Deploy anywhere - local or cloud
- 🔒 **TypeScript Integration**: Full type safety and validation
- 📊 **Pydantic Backend**: Runtime validation with Python type models

## 🖼️ Screenshots

![Chatbot Builder Interface](screenshot.jpeg)

## 🚀 Installation

### Prerequisites
- Open WebUI instance (v0.6.0 or later)
- Admin access to Open WebUI
- Node.js and npm (for building the web app)

### Quick Installation

1. **Deploy the Web Application**:
   ```bash
   git clone https://github.com/SahithPoreddy/Chatbot-builder.git
   cd Chatbot-builder
   npm install && npm run build
   npx serve dist -p 8080
   ```

2. **Install the Action Function**:
   - Copy code from `open-webui-extension/chatbot_builder_action.py`
   - In Open WebUI: Admin Panel → Functions → Add Function
   - Paste the code and save

3. **Configure**:
   - Set `chatbot_builder_url` to `http://localhost:8080`
   - Enable the function globally or assign to specific models

For detailed instructions, see [open-webui-extension/README.md](./open-webui-extension/README.md)

## 🎮 Usage

1. Start a chat in Open WebUI with a model that has the Chatbot Builder enabled
2. Send any message to get an AI response
3. Click the **"Draw"** button that appears below responses
4. Design your chatbot flow using the visual builder
5. Click **"Save"** to capture your design
6. View the formatted flow data in the chat

## 🔧 Node Types

| Node Type | Description | Use Case |
|-----------|-------------|----------|
| **Start** | Entry point | Beginning of conversation flow |
| **Text Message** | Send messages | WhatsApp, SMS, Messenger responses |
| **Conditional Path** | Branching logic | If/then conversation routing |
| **End** | Terminal point | Conclusion of conversation paths |

## 🛠️ Development

### TypeScript Development
```bash
# Start development server with type checking
npm run dev

# Type check without building
npm run type-check

# Build with TypeScript compilation
npm run build

# Build extension package with types
npm run build:extension
```

### Project Structure
```
├── src/
│   ├── types/
│   │   └── open-webui.types.ts     # TypeScript interface definitions
│   ├── modules/flow-builder/       # Core flow builder logic
│   ├── modules/nodes/              # Node type definitions
│   ├── modules/sidebar/            # Sidebar components
│   └── pages/                      # Main pages
├── open-webui-extension/
│   ├── chatbot_builder_action.py   # Open WebUI Action Function (Pydantic models)
│   └── README.md                   # Extension documentation
└── dist/                           # Built application
```

## 🔒 Type Safety Architecture

### Frontend (TypeScript)
```typescript
// Type-safe flow data structure
interface ChatbotFlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  timestamp?: number;
  metadata?: Record<string, any>;
}

// Node-specific data types
interface TextMessageNodeData extends BaseNodeData {
  channel: 'sms' | 'whatsapp' | 'messenger' | 'email' | 'webchat';
  message: string;
}
```

### Backend (Python with Pydantic)
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
```

### Benefits
- ✅ **Compile-time validation** of data structures
- ✅ **Runtime validation** with Pydantic
- ✅ **IntelliSense support** in IDEs
- ✅ **Consistent API contracts** between frontend and backend
- ✅ **Automatic documentation** generation

## 🔌 Extension Architecture

The extension consists of two main components:

1. **Web Application**: React-based flow builder (this repository)
2. **Action Function**: Python function that integrates with Open WebUI

The Action Function creates an iframe that loads the web application, handles communication between Open WebUI and the builder, and processes the saved flow data.

## 🚀 Deployment Options

### Local Development
- Quick setup for testing and development
- Uses development server or simple static file server

### Production Deployment
- Deploy to any web server (Apache, Nginx, etc.)
- Use CDN for better performance
- Enable HTTPS for security

### Docker Deployment
```bash
# Build and run in Docker
docker build -t chatbot-builder .
docker run -p 8080:80 chatbot-builder
```

## 🔒 Security Considerations

- The extension uses iframe sandboxing for security
- Cross-origin communication is handled safely
- Only authorized Open WebUI instances can communicate with the builder
- No sensitive data is stored in the web application

## 📖 API Reference

### Action Function Configuration

| Valve | Type | Default | Description |
|-------|------|---------|-------------|
| `chatbot_builder_url` | string | `http://localhost:5173` | URL of the web application |
| `enable_builder` | boolean | `true` | Enable/disable the builder |
| `debug_mode` | boolean | `false` | Enable debug logging |

### Message Protocol

The extension uses a custom message protocol for communication:

```javascript
// Save flow data
{
  type: 'saveDrawing',
  payload: {
    nodes: [...],
    edges: [...],
    timestamp: 1234567890
  }
}

// Load existing data
{
  type: 'loadData',
  payload: flowData
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test with Open WebUI
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Function not appearing in Open WebUI**
- Ensure you're logged in as an admin
- Check that the function is enabled
- Verify the function is assigned to your model

**Builder interface not loading**
- Check the `chatbot_builder_url` configuration
- Ensure the web application is running and accessible
- Check browser console for CORS errors

**Save functionality not working**
- Verify iframe communication is working
- Check browser console for JavaScript errors
- Ensure Open WebUI is compatible (v0.6.0+)

### Debug Mode

Enable debug mode in the function configuration to get detailed logs:
```python
debug_mode: bool = True
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Open WebUI](https://github.com/open-webui/open-webui) for the excellent AI platform
- [React Flow](https://reactflow.dev/) for the flow builder components
- [Radix UI](https://www.radix-ui.com/) for accessible UI components

## 📞 Support

- 📖 [Full Documentation](./open-webui-extension/README.md)
- 🚀 [Quick Install Guide](./QUICK_INSTALL.md)
- 🐛 [Report Issues](https://github.com/SahithPoreddy/Chatbot-builder/issues)
- 💬 [Open WebUI Discord](https://discord.gg/5rJgQTnV4s)

---

**Made with ❤️ for the Open WebUI community**
