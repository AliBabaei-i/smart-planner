import { Resvg } from '@resvg/resvg-js'
import fs from 'fs'
import path from 'path'

const PUBLIC_DIR = './public'
const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  console.log('🎨 Starting icon generation...\n')

  const iconSvgContent = fs.readFileSync(path.join(PUBLIC_DIR, 'icon.svg'), 'utf-8')
  const maskableSvgContent = fs.readFileSync(path.join(PUBLIC_DIR, 'icon-maskable.svg'), 'utf-8')
  const ogSvgContent = fs.readFileSync(path.join(PUBLIC_DIR, 'og-image.svg'), 'utf-8')

  // ✅ تولید icon ها
  for (const size of sizes) {
    const resvg = new Resvg(iconSvgContent, {
      fitTo: { mode: 'width', value: size }
    })
    const pngData = resvg.render().asPng()
    fs.writeFileSync(path.join(PUBLIC_DIR, `icon-${size}x${size}.png`), pngData)
    console.log(`✅ icon-${size}x${size}.png`)
  }

  // ✅ Maskable
  for (const size of [192, 512]) {
    const resvg = new Resvg(maskableSvgContent, {
      fitTo: { mode: 'width', value: size }
    })
    const pngData = resvg.render().asPng()
    fs.writeFileSync(path.join(PUBLIC_DIR, `icon-maskable-${size}x${size}.png`), pngData)
    console.log(`✅ icon-maskable-${size}x${size}.png`)
  }

  // ✅ Apple Touch Icon
  {
    const resvg = new Resvg(iconSvgContent, { fitTo: { mode: 'width', value: 180 } })
    fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), resvg.render().asPng())
    console.log('✅ apple-touch-icon.png')
  }

  // ✅ OG Image
  {
    const resvg = new Resvg(ogSvgContent, { fitTo: { mode: 'width', value: 1200 } })
    fs.writeFileSync(path.join(PUBLIC_DIR, 'og-image.png'), resvg.render().asPng())
    console.log('✅ og-image.png')
  }

  // ✅ Favicons
  {
    const resvg = new Resvg(iconSvgContent, { fitTo: { mode: 'width', value: 32 } })
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), resvg.render().asPng())
    console.log('✅ favicon-32x32.png')
  }
  {
    const resvg = new Resvg(iconSvgContent, { fitTo: { mode: 'width', value: 16 } })
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), resvg.render().asPng())
    console.log('✅ favicon-16x16.png')
  }

  console.log('\n🎉 Done!')
}

generateIcons().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})