const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const uniqueIcons = new Set();
const regex = /<Icon[^>]*name=["']([^"']+)["'][^>]*>/g;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      uniqueIcons.add(match[1]);
    }
  }
});

console.log(Array.from(uniqueIcons).join('\n'));
console.log('Total unique icons:', uniqueIcons.size);
