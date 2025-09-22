// scripts/generate-sitemap.js
// Simple sitemap generator — edit `routes` to match your app's public routes.
// Writes sitemap.xml to loan-calc/public/sitemap.xml so it is included in the build output.

const fs = require('fs');
const path = require('path');

const baseUrl = process.env.SITE_URL || 'https://your-domain.com';
const routes = [
  '/',
  '/calculator',
  '/about',
  '/docs'
  // Add any other public routes here
];

const urls = routes.map((r) => {
  return `\n  <url>\n    <loc>${baseUrl.replace(/\/$/, '')}${r}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

const outDir = path.join(__dirname, '..', 'loan-calc', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap.trim(), 'utf8');
console.log('sitemap.xml written to', outDir);