const fs = require('fs');
const { execSync } = require('child_process');

const svgPath = process.argv[2];
const pngPath = process.argv[3];
const width = process.argv[4] || '400';

// Try using sharp if available
try {
  const sharp = require('sharp');
  sharp(svgPath)
    .resize(parseInt(width))
    .png()
    .toFile(pngPath)
    .then(() => console.log(`✓ Created ${pngPath}`))
    .catch(err => {
      console.error('Sharp failed:', err.message);
      process.exit(1);
    });
} catch (e) {
  console.log('Installing sharp...');
  execSync('pnpm add -D sharp', { stdio: 'inherit' });
  console.log('Retrying...');
  const sharp = require('sharp');
  sharp(svgPath)
    .resize(parseInt(width))
    .png()
    .toFile(pngPath)
    .then(() => console.log(`✓ Created ${pngPath}`))
    .catch(err => {
      console.error('Failed:', err.message);
      process.exit(1);
    });
}