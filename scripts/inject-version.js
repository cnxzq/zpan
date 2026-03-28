#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Read package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

// Ensure dist/public directory exists
const distPublicDir = path.resolve(process.cwd(), 'dist/public');
if (!fs.existsSync(distPublicDir)) {
  fs.mkdirSync(distPublicDir, { recursive: true });
}

// Copy all files from public to dist/public
const publicDir = path.resolve(process.cwd(), 'public');
const files = fs.readdirSync(publicDir);
files.forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(distPublicDir, file);
  if (fs.statSync(srcPath).isDirectory()) {
    // Recursively copy directory
    if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
    const subFiles = fs.readdirSync(srcPath);
    subFiles.forEach(subFile => {
      fs.copyFileSync(path.join(srcPath, subFile), path.join(destPath, subFile));
    });
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
});

// Read index.html from source
const indexHtmlPath = path.resolve(distPublicDir, 'index.html');
let htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

// Replace version placeholder
htmlContent = htmlContent.replace(/__VERSION__/g, version);

// Write back to dist
fs.writeFileSync(indexHtmlPath, htmlContent);

console.log(`✓ Version ${version} injected into dist/public/index.html`);
