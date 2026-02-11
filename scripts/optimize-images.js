import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, '../src/assets');
const OUTPUT_DIR = path.join(__dirname, '../src/assets');

async function optimizeImage(inputPath, outputPath, format) {
  try {
    const image = sharp(inputPath);
    
    let outputOptions = {};
    
    if (format === 'webp') {
      outputOptions = {
        quality: 80,
        effort: 6
      };
    } else if (format === 'avif') {
      outputOptions = {
        quality: 50,
        effort: 9
      };
    }
    
    await image
      .toFormat(format, outputOptions)
      .toFile(outputPath);
    
    console.log(`✓ Optimized ${path.basename(inputPath)} to ${format}`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${path.basename(inputPath)} to ${format}:`, error.message);
  }
}

async function processDirectory(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      await processDirectory(fullPath);
    } else if (item.isFile() && /\.(jpg|jpeg|png)$/i.test(item.name)) {
      const baseName = path.basename(item.name, path.extname(item.name));
      const webpPath = path.join(dir, `${baseName}.webp`);
      const avifPath = path.join(dir, `${baseName}.avif`);
      
      await optimizeImage(fullPath, webpPath, 'webp');
      await optimizeImage(fullPath, avifPath, 'avif');
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization...');
  
  try {
    await processDirectory(INPUT_DIR);
    console.log('✅ Image optimization complete!');
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { optimizeImage, processDirectory };
