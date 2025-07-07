const fs = require('fs');
const path = require('path');

// This script generates placeholder icons
// In production, replace with actual ProductAdoption brand icons

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#007bff" rx="${size * 0.15}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold">
    PA
  </text>
</svg>
`;

// Generate placeholder PNG files
console.log('Generating placeholder icons...');
console.log('Note: Replace these with actual ProductAdoption brand icons before publishing');

sizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = path.join(iconsDir, `icon-${size}.png`);
  
  // In a real implementation, you would convert SVG to PNG
  // For now, we'll create a placeholder file
  fs.writeFileSync(filename + '.svg', svgContent);
  console.log(`Created placeholder: icon-${size}.png.svg`);
});

// Create a README for the icons
const readme = `# ProductAdoption Extension Icons

These are placeholder icons. Before publishing the extension, replace them with actual ProductAdoption brand icons.

Required icons:
- icon-16.png (16x16px) - For browser toolbar
- icon-32.png (32x32px) - For browser toolbar (2x)
- icon-48.png (48x48px) - For extension management page
- icon-128.png (128x128px) - For Chrome Web Store

Icon guidelines:
- Use PNG format with transparency
- Follow ProductAdoption brand guidelines
- Ensure icons are clear and recognizable at all sizes
- Test icons in both light and dark browser themes
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readme);
console.log('✅ Icon placeholders created. Remember to replace with actual icons!');