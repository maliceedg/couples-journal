/**
 * Quick check that image optimization works.
 * Run: npx tsx scripts/test-image-optimization.ts <path-to-image>
 * Example: npx tsx scripts/test-image-optimization.ts ../test-photo.jpg
 *
 * Prints original vs optimized size so you can see the savings.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;

const imagePath = process.argv[2];
if (!imagePath || !fs.existsSync(imagePath)) {
  console.error('Usage: npx tsx scripts/test-image-optimization.ts <path-to-image>');
  console.error('Example: npx tsx scripts/test-image-optimization.ts ./large-photo.jpg');
  process.exit(1);
}

const originalBytes = fs.statSync(imagePath).size;
const outPath = path.join(path.dirname(imagePath), `optimized-${path.basename(imagePath, path.extname(imagePath))}.jpg`);

const buffer = fs.readFileSync(imagePath);
await sharp(buffer)
  .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: JPEG_QUALITY })
  .toFile(outPath);

const optimizedBytes = fs.statSync(outPath).size;
const saved = ((1 - optimizedBytes / originalBytes) * 100).toFixed(1);

console.log('Image optimization check:');
console.log('  Original:  ', (originalBytes / 1024).toFixed(1), 'KB');
console.log('  Optimized: ', (optimizedBytes / 1024).toFixed(1), 'KB');
console.log('  Saved:     ', saved + '%');
console.log('  Output:    ', outPath);
