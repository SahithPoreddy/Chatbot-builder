# Quick Installation Guide - TypeScript Chatbot Builder Extension

## 🚀 Quick Start (5 minutes)

This extension provides a **TypeScript-powered** visual chatbot flow builder for Open WebUI with full type safety between frontend and backend.

### Step 1: Deploy the TypeScript Web Application

**Option A: Simple Local Server**
```bash
# Clone and setup
git clone https://github.com/SahithPoreddy/Chatbot-builder.git
cd Chatbot-builder
npm install && npm run build

# Serve the built app
npx serve dist -p 8080
```
Your chatbot builder will be at: `http://localhost:8080`

**Option B: Use Development Server**
```bash
git clone https://github.com/SahithPoreddy/Chatbot-builder.git
cd Chatbot-builder
npm install && npm run dev
```
Your chatbot builder will be at: `http://localhost:5173`

### Step 2: Install Action Function in Open WebUI

1. **Copy the Function Code**:
   - Open `open-webui-extension/chatbot_builder_action.py`
   - Copy all the code (Ctrl+A, Ctrl+C)

2. **Add to Open WebUI**:
   - Login to Open WebUI as admin
   - Go to **Admin Panel** → **Functions**
   - Click **"+"** or **"Add Function"**
   - Paste the code and click **"Save"**

3. **Configure**:
   - Find "Chatbot Builder" in the functions list
   - Click on it to open settings
   - Set `chatbot_builder_url` to `http://localhost:8080` (or your URL)
   - Toggle **"Enable"** to ON
   - Toggle **"Global"** to ON (or assign to specific models)

### Step 3: Test

1. Start a new chat in Open WebUI
2. Send any message to get an AI response
3. Look for the **"Draw"** button below the response
4. Click it to open the chatbot builder!

---

## 🔧 Troubleshooting

**No "Draw" button?**
- Make sure the function is enabled
- Check that it's assigned to your model or enabled globally
- Refresh the page

**Builder doesn't load?**
- Verify your web app URL is correct and accessible
- Check browser console for errors
- Make sure the web server is running

**Can't save flows?**
- Check browser console for JavaScript errors
- Ensure communication between iframe and parent is working

---

## 📁 File Structure

```
Chatbot-builder/
├── open-webui-extension/
│   ├── chatbot_builder_action.py    # 👈 The function to install
│   └── README.md                    # Detailed documentation
├── src/                             # React app source
├── dist/                           # Built web app (after npm run build)
└── build-extension.js              # Package builder
```

---

## 🎯 What You Get

- **Visual Flow Builder**: Drag & drop nodes to create chatbot flows
- **Multiple Node Types**: Start, End, Text Message, Conditional paths
- **Real-time Editing**: Connect nodes with visual edges
- **Save/Load Flows**: Persist your chatbot designs
- **Open WebUI Integration**: Seamless integration as a native function
- **🔒 TypeScript Type Safety**: Full type checking between React frontend and Python backend
- **📊 Pydantic Validation**: Runtime validation of all data structures
- **🛠️ IntelliSense Support**: Complete IDE support with type definitions

---

## ⚡ Advanced Options

### Custom Deployment
- Deploy to any web server (Apache, Nginx, etc.)
- Use CDN for better performance
- Enable HTTPS for production

### Configuration Options
- `enable_builder`: Turn the extension on/off
- `debug_mode`: Enable detailed logging
- `chatbot_builder_url`: Your web app location

### Model-Specific Assignment
Instead of global enable:
1. Go to **Workspace** → **Models**
2. Select a model
3. In settings, add "Chatbot Builder" function

---

Need help? Check the full README.md or open an issue on GitHub!
