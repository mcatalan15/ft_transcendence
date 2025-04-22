// build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Compile TypeScript
console.log('Compiling TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });

// Copy HTML and CSS files
console.log('Copying static assets...');
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('style.css', 'dist/style.css');

// Copy data directory
const dataDir = path.join(__dirname, 'data');
const distDataDir = path.join(__dirname, 'dist', 'data');
if (!fs.existsSync(distDataDir)) {
  fs.mkdirSync(distDataDir, { recursive: true });
}
fs.readdirSync(dataDir).forEach(file => {
  fs.copyFileSync(path.join(dataDir, file), path.join(distDataDir, file));
});

console.log('Build complete!');