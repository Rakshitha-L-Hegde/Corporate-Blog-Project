const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '../.next/static/chunks');

// get all js files
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

if (files.length === 0) {
  console.log("No JS files found!");
  process.exit(1);
}

// pick first file (or loop all)
const filePath = path.join(dir, files[0]);

const content = fs.readFileSync(filePath);

const brotli = zlib.brotliCompressSync(content);

console.log("File:", files[0]);
console.log("Original size:", content.length);
console.log("Brotli size:", brotli.length);