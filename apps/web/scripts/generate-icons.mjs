// Génère les icônes PWA à partir du logo vectoriel (monogramme HD or sur fond sombre)
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'icons');
mkdirSync(out, { recursive: true });

// padding : marge autour du monogramme (les icônes "maskable" exigent une
// zone de sécurité de ~20 % car Android les rogne en cercle)
function logoSvg(size, padding) {
  const s = size;
  const rw = s - padding * 2; // largeur du rectangle or
  const rh = rw * 0.62;
  const rx = padding;
  const ry = (s - rh) / 2;
  const fontSize = rh * 0.52;
  return `
<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#26262a"/>
      <stop offset="1" stop-color="#0a0a0c"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F2E2A0"/>
      <stop offset="0.5" stop-color="#D9B94C"/>
      <stop offset="1" stop-color="#B8912B"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#bg)"/>
  <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="${rh * 0.18}" fill="url(#gold)"/>
  <text x="${s / 2}" y="${ry + rh / 2}" font-family="Georgia, 'Times New Roman', serif"
        font-style="italic" font-weight="bold" font-size="${fontSize}"
        fill="#141414" text-anchor="middle" dominant-baseline="central">HD</text>
</svg>`;
}

const jobs = [
  { file: 'icon-192.png', size: 192, padding: 30 },
  { file: 'icon-512.png', size: 512, padding: 80 },
  { file: 'icon-maskable-512.png', size: 512, padding: 120 },
  { file: 'apple-icon.png', size: 180, padding: 30 },
];

for (const { file, size, padding } of jobs) {
  await sharp(Buffer.from(logoSvg(size, padding))).png().toFile(join(out, file));
  console.log('✓', file);
}
console.log('Icônes générées dans public/icons/');
