#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'public-release');

const textFileExts = new Set([
  '.js','.jsx','.ts','.tsx','.json','.md','.css','.scss','.sass','.html','.mjs','.cjs'
]);

const excludeGlobs = [
  'node_modules', '.git', '.next', '.turbo', '.cache', 'out',
  '.env', '.env.local', '.env.*', '*.secret', '*.key', '.vercel',
  'public-release'
];

function shouldExclude(relPath) {
  const parts = relPath.split(path.sep);
  return parts.some(p => excludeGlobs.some(g => {
    if (g.includes('*')) {
      const regex = new RegExp('^' + g.replace(/[.+^${}()|\[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      return regex.test(p);
    }
    return p === g;
  }));
}

function stripComments(content, ext) {
  try {
    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx' || ext === '.mjs' || ext === '.cjs') {
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      content = content.replace(/(^|\s)\/\/.*$/gm, '');
    } else if (ext === '.css' || ext === '.scss' || ext === '.sass') {
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (ext === '.html') {
      content = content.replace(/<!--([\s\S]*?)-->/g, '');
    }
  } catch {}
  return content;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const rel = path.relative(repoRoot, srcPath);
    if (shouldExclude(rel)) continue;
    const destPath = path.join(dest, entry);
    const stat = fs.lstatSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (stat.isFile()) {
      const ext = path.extname(entry);
      if (textFileExts.has(ext)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = stripComments(content, ext);
        fs.writeFileSync(destPath, content, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
copyDir(repoRoot, outDir);

fs.writeFileSync(path.join(outDir, '.env.example'), `PORT=3002\nNODE_ENV=development\nMONGODB_URI=\nJWT_SECRET=\nJWT_EXPIRES_IN=7d\nCORS_ORIGIN=http://localhost:3001\nRATE_LIMIT_WINDOW_MS=900000\nRATE_LIMIT_MAX_REQUESTS=100\n`, 'utf8');
fs.mkdirSync(path.join(outDir, 'frontend'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'frontend', '.env.example'), `NEXT_PUBLIC_API_URL=\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\nGITHUB_CLIENT_ID=\nGITHUB_CLIENT_SECRET=\n`, 'utf8');

console.log('Public release prepared at', outDir);
