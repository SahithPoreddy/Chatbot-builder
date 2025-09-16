
// Minimal build script for standalone website
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${path.relative(__dirname, srcPath)} → ${path.relative(__dirname, destPath)}`);
    }
  }
}

function main() {
  console.log('🚀 Building standalone website...\n');

  // Ensure dist directory exists
  ensureDir(DIST_DIR);

  // Copy public assets to dist
  if (fs.existsSync(PUBLIC_DIR)) {
    copyDir(PUBLIC_DIR, DIST_DIR);
  }

  console.log('\n✅ Website build complete!');
  console.log(`\n📦 Built site at: ${path.relative(__dirname, DIST_DIR)}`);
}

if (require.main === module) {
  main();
}
