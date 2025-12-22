// Simple script to generate PWA icons using Canvas
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background -->
  <rect width="512" height="512" fill="#667eea" rx="100"/>
  
  <!-- Checkmark symbol -->
  <path d="M173 350 L213 390 L350 210" 
        stroke="#ffffff" 
        stroke-width="40" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
  
  <!-- Circle around checkmark -->
  <circle cx="256" cy="256" r="150" 
          stroke="#ffffff" 
          stroke-width="20" 
          fill="none"/>
</svg>
`;

// Save SVG
const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon.trim());

console.log('✓ Created base SVG icon at:', svgPath);
console.log('\nNow run: npx pwa-asset-generator src/assets/icons/icon.svg src/assets/icons --icon-only --type png');
