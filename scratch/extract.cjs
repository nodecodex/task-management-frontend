const fs = require('fs');

const scssContent = fs.readFileSync('src/assets/scss/_dashlite_variables.scss', 'utf8');

const regex = /\$([a-zA-Z0-9_-]+):\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s*(?:!default)?;/g;
let match;
const variables = {};

while ((match = regex.exec(scssContent)) !== null) {
  const name = match[1];
  const value = match[2];
  variables[name] = value;
}

let themeContent = '\n@theme {\n';
for (const [key, value] of Object.entries(variables)) {
  // Add as color if it looks like a color
  themeContent += `  --color-${key}: ${value};\n`;
}
themeContent += '}\n';

const indexCss = fs.readFileSync('src/index.css', 'utf8');
fs.writeFileSync('src/index.css', indexCss + themeContent);
console.log('Extracted ' + Object.keys(variables).length + ' variables.');
