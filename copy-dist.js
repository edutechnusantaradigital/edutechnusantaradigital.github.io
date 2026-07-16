import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

// Utility function to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied file: ${srcPath} -> ${destPath}`);
    }
  }
}

// Ensure dist directory exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
}

// 1. Copy individual files to dist/
const filesToCopy = [
  'index.html',
  'tentang.html',
  'layanan.html',
  'portofolio.html',
  'kontak.html',
  'google717f363b94dd2f25.html',
  'whatever.xml'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(__dirname, 'dist', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied root file: ${file} -> dist/${file}`);
  } else {
    console.warn(`Warning: file ${file} does not exist inside root.`);
  }
});

// 2. Copy directories
console.log('Copying assets/ directory recursively to dist/assets/ ...');
copyDirRecursive(path.join(__dirname, 'assets'), path.join(__dirname, 'dist', 'assets'));

console.log('Copying layanan/ directory recursively to dist/layanan/ ...');
copyDirRecursive(path.join(__dirname, 'layanan'), path.join(__dirname, 'dist', 'layanan'));

console.log('Static assets copy completed successfully.');
