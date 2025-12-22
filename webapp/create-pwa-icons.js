const fs = require('fs');
const path = require('path');

// Create a simple PNG icon using data URL
// This is a 512x512 purple icon with a checkmark
const createIcon = (size) => {
  const canvas = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#667eea" rx="${size * 0.15}"/>
      <path d="M ${size * 0.35} ${size * 0.55} L ${size * 0.45} ${size * 0.65} L ${size * 0.68} ${size * 0.38}" 
            stroke="white" stroke-width="${size * 0.08}" fill="none" 
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.28}" 
              stroke="white" stroke-width="${size * 0.04}" fill="none"/>
    </svg>
  `;
  return canvas;
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Creating PWA icons...\n');

sizes.forEach(size => {
  const svgContent = createIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svgContent);
  console.log(`✓ Created ${filename}`);
});

console.log('\n✓ All icons created!');
console.log('\nNote: These are SVG icons. For PNG, you need: npm install sharp');
console.log('Or use an online converter: https://cloudconvert.com/svg-to-png');
