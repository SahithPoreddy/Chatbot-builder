const fs = require('fs');
const path = require('path');

/**
 * Build script for Open WebUI Chatbot Builder Extension
 * This script packages the extension for easy distribution and installation
 */

const EXTENSION_DIR = path.join(__dirname, 'open-webui-extension');
const DIST_DIR = path.join(__dirname, 'dist');
const EXTENSION_DIST_DIR = path.join(DIST_DIR, 'extension');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  console.log(`✓ Copied: ${path.relative(__dirname, src)} → ${path.relative(__dirname, dest)}`);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function generateInstallScript() {
  const installScript = `#!/bin/bash

# Open WebUI Chatbot Builder Extension Installer
# This script helps you install the extension components

echo "🤖 Open WebUI Chatbot Builder Extension Installer"
echo "================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "chatbot_builder_action.py" ]; then
    echo "❌ Error: chatbot_builder_action.py not found!"
    echo "Please run this script from the extension directory."
    exit 1
fi

echo "📁 Extension files found:"
echo "  ✓ chatbot_builder_action.py (Action Function)"
echo "  ✓ web/ (Web Application)"
echo "  ✓ README.md (Documentation)"
echo ""

echo "🚀 Installation Steps:"
echo ""
echo "1. Deploy the Web Application:"
echo "   - Copy the 'web/' directory to your web server"
echo "   - Or serve it locally: cd web && python -m http.server 8000"
echo "   - Note the URL where it's accessible"
echo ""
echo "2. Install the Action Function:"
echo "   - Login to Open WebUI as admin"
echo "   - Go to Admin Panel → Functions"
echo "   - Click 'Add Function'"
echo "   - Copy and paste the contents of 'chatbot_builder_action.py'"
echo "   - Save the function"
echo ""
echo "3. Configure the Function:"
echo "   - Find 'Chatbot Builder' in your functions list"
echo "   - Update 'chatbot_builder_url' to your web app URL"
echo "   - Enable the function"
echo "   - Assign to models or enable globally"
echo ""
echo "📖 For detailed instructions, see README.md"
echo ""
echo "✅ Ready to install! Follow the steps above."
`;

  const installScriptPath = path.join(EXTENSION_DIST_DIR, 'install.sh');
  fs.writeFileSync(installScriptPath, installScript);
  console.log(`✓ Generated: ${path.relative(__dirname, installScriptPath)}`);
}

function generatePackageInfo() {
  const packageInfo = {
    name: "open-webui-chatbot-builder",
    version: "1.0.0",
    description: "Visual chatbot flow builder extension for Open WebUI",
    author: "SahithPoreddy",
    type: "action-function",
    components: {
      "action_function": "chatbot_builder_action.py",
      "web_app": "web/",
      "documentation": "README.md"
    },
    installation: {
      "web_app_deployment": "Deploy the web/ directory to a web server",
      "function_installation": "Copy chatbot_builder_action.py to Open WebUI Admin Panel → Functions",
      "configuration": "Set chatbot_builder_url valve to your web app URL"
    },
    requirements: {
      "open_webui_version": ">=0.6.0",
      "python_dependencies": ["aiohttp", "pydantic"],
      "web_server": "Any HTTP server capable of serving static files"
    }
  };

  const packageInfoPath = path.join(EXTENSION_DIST_DIR, 'package.json');
  fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));
  console.log(`✓ Generated: ${path.relative(__dirname, packageInfoPath)}`);
}

function main() {
  console.log('🚀 Building Open WebUI Chatbot Builder Extension...\n');

  // Ensure directories exist
  ensureDir(EXTENSION_DIST_DIR);

  // Copy the Action Function
  const actionFunctionSrc = path.join(EXTENSION_DIR, 'chatbot_builder_action.py');
  const actionFunctionDest = path.join(EXTENSION_DIST_DIR, 'chatbot_builder_action.py');
  copyFile(actionFunctionSrc, actionFunctionDest);

  // Copy the web application (built files)
  if (fs.existsSync(DIST_DIR) && fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    const webAppDest = path.join(EXTENSION_DIST_DIR, 'web');

    // Copy all built files to web directory
    const builtFiles = fs.readdirSync(DIST_DIR);
    for (const file of builtFiles) {
      const srcPath = path.join(DIST_DIR, file);
      const destPath = path.join(webAppDest, file);

      if (file !== 'extension') { // Don't copy the extension directory itself
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          copyFile(srcPath, destPath);
        }
      }
    }
  } else {
    console.log('⚠️  Warning: Built web application not found in dist/');
    console.log('   Run "npm run build" or "pnpm build" first to build the web app');
  }

  // Copy documentation
  const readmeSrc = path.join(EXTENSION_DIR, 'README.md');
  const readmeDest = path.join(EXTENSION_DIST_DIR, 'README.md');
  copyFile(readmeSrc, readmeDest);

  // Generate additional files
  generateInstallScript();
  generatePackageInfo();

  console.log('\n✅ Extension build complete!');
  console.log(`\n📦 Extension package created at: ${path.relative(__dirname, EXTENSION_DIST_DIR)}`);
  console.log('\n📋 Contents:');
  console.log('  ├── chatbot_builder_action.py  (Action Function for Open WebUI)');
  console.log('  ├── web/                       (Built web application)');
  console.log('  ├── README.md                  (Installation & usage instructions)');
  console.log('  ├── install.sh                 (Installation helper script)');
  console.log('  └── package.json               (Extension metadata)');
  console.log('\n🚀 Ready for distribution and installation!');
}

if (require.main === module) {
  main();
}

module.exports = { main };
