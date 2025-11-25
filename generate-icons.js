import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384];
const inputIcon = join(__dirname, 'public/icons/icon-512x512.png');
const outputDir = join(__dirname, 'public/icons');

async function generateIcons() {
    if (!existsSync(inputIcon)) {
        console.error('Base icon not found at:', inputIcon);
        process.exit(1);
    }

    console.log('Generating app icons...');

    for (const size of sizes) {
        const outputPath = join(outputDir, `icon-${size}x${size}.png`);

        await sharp(inputIcon)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`✓ Generated ${size}x${size}`);
    }

    console.log('✓ Using existing 512x512 as base icon');
    // Generate apple-touch-icon (180x180)
    await sharp(inputIcon)
        .resize(180, 180, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(join(__dirname, 'public/apple-touch-icon.png'));

    console.log('✓ Generated apple-touch-icon (180x180)');

    // Generate favicon (32x32)
    await sharp(inputIcon)
        .resize(32, 32, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(join(__dirname, 'public/favicon.png'));

    console.log('✓ Generated favicon (32x32)');

    console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
