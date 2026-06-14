import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const SIZE = 1024;
const RADIUS = 224;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#7c4dff"/>
      <stop offset="100%" stop-color="#3f1d9e"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="14"/>
      <feOffset dx="0" dy="10"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.45"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#bg)"/>

  <g filter="url(#shadow)" fill="none" stroke="#ffffff" stroke-width="46"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M 305 760
             C 230 660 215 520 280 420
             C 360 300 520 270 620 340"/>
    <path d="M 360 740
             C 305 660 295 540 350 460
             C 425 360 555 350 625 410"/>
    <path d="M 415 720
             C 380 650 380 560 425 500
             C 480 430 575 425 615 470"/>
    <path d="M 470 700
             C 455 650 460 595 490 555
             C 530 510 595 510 615 545"/>
    <path d="M 530 680
             C 530 640 540 605 570 590"/>
  </g>

  <g font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
     font-weight="800" fill="#ffffff" text-anchor="middle">
    <text x="512" y="930" font-size="160" letter-spacing="6">MD5</text>
  </g>
</svg>
`.trim();

const buildDir = resolve('build');
mkdirSync(buildDir, { recursive: true });

const pngPath = resolve(buildDir, 'icon.png');
await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png({ compressionLevel: 9 })
  .toFile(pngPath);

console.log(`Wrote ${pngPath}`);
