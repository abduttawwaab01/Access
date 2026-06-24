const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'icons')
const SOURCE = path.join(ROOT, 'skoolar.png')

// Original is 1336x811 — extract center 811x811 square
const CROP_SIZE = 811
const LEFT = Math.round((1336 - 811) / 2)

async function main() {
  // Clear old PNG files from icons directory
  const existing = fs.readdirSync(OUT)
  for (const f of existing) {
    if (f !== 'source.svg' && f.endsWith('.png')) {
      fs.unlinkSync(path.join(OUT, f))
    }
  }

  // Build pipeline: crop to square → resize → save
  const pipeline = (size) =>
    sharp(SOURCE)
      .extract({ left: LEFT, top: 0, width: CROP_SIZE, height: CROP_SIZE })
      .resize(size, size)
      .png()

  // Generate all regular PNG sizes
  for (const size of SIZES) {
    await pipeline(size).toFile(path.join(OUT, `icon-${size}.png`))
    console.log(`  icon-${size}.png (${size}x${size})`)

    // Maskable variants at 192 & 512: add background_color fill for safe zone
    if (size === 192 || size === 512) {
      await sharp({
        create: { width: size, height: size, channels: 4, background: { r: 11, g: 17, b: 33, alpha: 1 } }
      })
        .composite([{ input: await pipeline(size).toBuffer(), top: 0, left: 0 }])
        .png()
        .toFile(path.join(OUT, `icon-${size}-maskable.png`))
      console.log(`  icon-${size}-maskable.png (${size}x${size})`)
    }
  }

  // public/skoolar.png — keep at 512x512 square
  await pipeline(512).toFile(path.join(ROOT, 'public', 'skoolar.png'))
  console.log('  public/skoolar.png (512x512)')

  // public/favicon.png at 48x48
  await pipeline(48).toFile(path.join(ROOT, 'public', 'favicon.png'))
  console.log('  public/favicon.png (48x48)')

  console.log('\nAll icons regenerated from original skoolar.png!')
}

main().catch(console.error)
