const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '../assets');
const FONT_PATH = path.join(ASSETS_DIR, 'fonts/Geist-SemiBold.ttf');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. App Icon SVG (1024x1024, Solid #F8F6EF background, Deep forest green #173D30 symbol, Scale 1.70, No text)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Outta App Icon</title>
  <desc>Deep forest green circular route symbol on warm ivory background.</desc>
  <rect width="1024" height="1024" fill="#F8F6EF"/>
  <g transform="translate(512, 512) scale(1.70) translate(-520.5, -419.76)" fill="#173D30">
    <!-- Open circular arc: a horizon or gateway -->
    <path d="M374 457 A154 154 0 1 1 667 457 L604 457 A91 91 0 1 0 427 503 Z"/>
    <!-- Sweeping route / landscape form -->
    <path d="M395 584 L505 492 C551 455 608 444 667 451 L667 472 C667 534 617 584 555 584 Z"/>
  </g>
</svg>`;

// 2. Android Adaptive Icon SVG (1024x1024, Transparent background, Scale 1.25, Inside 66% safe zone, No text)
const adaptiveIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Outta Android Adaptive Icon</title>
  <desc>Android adaptive foreground symbol layer inside the 66% safe zone.</desc>
  <g transform="translate(512, 512) scale(1.25) translate(-520.5, -419.76)" fill="#173D30">
    <path d="M374 457 A154 154 0 1 1 667 457 L604 457 A91 91 0 1 0 427 503 Z"/>
    <path d="M395 584 L505 492 C551 455 608 444 667 451 L667 472 C667 534 617 584 555 584 Z"/>
  </g>
</svg>`;

// 3. Splash Screen SVG (1024x1024, Primary #263F35 background, Warm ivory #F8F6EF route symbol, No text)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Outta Splash Screen</title>
  <desc>Deep forest green primary background with clean warm ivory circular route symbol.</desc>
  <rect width="1024" height="1024" fill="#263F35"/>
  <g transform="translate(512, 512) scale(1.42) translate(-520.5, -419.76)" fill="#F8F6EF">
    <!-- Open circular arc: a horizon or gateway -->
    <path d="M374 457 A154 154 0 1 1 667 457 L604 457 A91 91 0 1 0 427 503 Z"/>
    <!-- Sweeping route / landscape form -->
    <path d="M395 584 L505 492 C551 455 608 444 667 451 L667 472 C667 534 617 584 555 584 Z"/>
  </g>
</svg>`;

// 4. Favicon SVG (192x192, Solid #F8F6EF with squircle rounding, Centered symbol)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <title>Outta Favicon</title>
  <rect width="192" height="192" rx="36" fill="#F8F6EF"/>
  <g transform="translate(96, 96) scale(0.318) translate(-520.5, -419.76)" fill="#173D30">
    <path d="M374 457 A154 154 0 1 1 667 457 L604 457 A91 91 0 1 0 427 503 Z"/>
    <path d="M395 584 L505 492 C551 455 608 444 667 451 L667 472 C667 534 617 584 555 584 Z"/>
  </g>
</svg>`;

// 5. Notification Icon SVG (96x96, Transparent background, Pure White #FFFFFF silhouette)
const notificationIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <title>Outta Notification Icon</title>
  <desc>White monochrome silhouette for Android status bar notifications.</desc>
  <g transform="translate(48, 48) scale(0.165) translate(-520.5, -419.76)" fill="#FFFFFF">
    <path d="M374 457 A154 154 0 1 1 667 457 L604 457 A91 91 0 1 0 427 503 Z"/>
    <path d="M395 584 L505 492 C551 455 608 444 667 451 L667 472 C667 534 617 584 555 584 Z"/>
  </g>
</svg>`;

// Helper function to render SVG to PNG buffer
function renderSvgToPng(svg, fontFile) {
  const opts = fontFile
    ? {
        font: {
          fontFiles: [fontFile],
          loadSystemFonts: false,
          defaultFontFamily: 'Geist',
        },
      }
    : undefined;
  const resvg = new Resvg(svg, opts);
  return resvg.render().asPng();
}

async function buildAll() {
  console.log('Writing vector SVGs...');
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.svg'), iconSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.svg'), adaptiveIconSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.svg'), splashSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.svg'), faviconSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'notification-icon.svg'), notificationIconSvg);

  console.log('Rendering raster PNGs...');
  // icon.png - must be RGB (no alpha) for App Store compatibility
  const iconPngBuffer = renderSvgToPng(iconSvg);
  const flattenedIcon = await sharp(iconPngBuffer).removeAlpha().toBuffer();
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), flattenedIcon);

  // adaptive-icon.png - RGBA (transparent)
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), renderSvgToPng(adaptiveIconSvg));

  // splash.png - Primary #263F35 background with clean ivory route symbol
  const splashPngBuffer = renderSvgToPng(splashSvg);
  const flattenedSplash = await sharp(splashPngBuffer).removeAlpha().toBuffer();
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), flattenedSplash);

  // favicon.png - RGBA
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), renderSvgToPng(faviconSvg));

  // notification-icon.png - RGBA (white silhouette on transparent)
  fs.writeFileSync(path.join(ASSETS_DIR, 'notification-icon.png'), renderSvgToPng(notificationIconSvg));

  console.log('All Expo-ready assets generated successfully in', ASSETS_DIR);
}

buildAll().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
