const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'content', 'docs');
const outFile = path.join(__dirname, '..', 'src', 'data', 'docs-index.json');

function walkDir(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(full));
    } else if (entry.name.endsWith('.mdx')) {
      results.push(full);
    }
  }
  return results;
}

const files = walkDir(docsDir);
const index = [];

for (const f of files) {
  const raw = fs.readFileSync(f, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  const fm = fmMatch[1];
  const titleMatch = fm.match(/title:\s*(.+)/);
  const descMatch = fm.match(/description:\s*(.+)/);
  const sectionMatch = fm.match(/section:\s*(.+)/);

  const title = titleMatch ? titleMatch[1].trim() : '';
  const description = descMatch ? descMatch[1].trim() : '';
  const section = sectionMatch ? sectionMatch[1].trim() : '';

  const body = raw.replace(/^---[\s\S]*?---/, '').replace(/[#*`\[\]()>]/g, '').trim();
  const content = (description + ' ' + body).slice(0, 500);

  const rel = path.relative(docsDir, f).replace('.mdx', '');
  const link = '/docs/' + rel;
  const id = rel.replace(/[/\\]/g, '-');

  index.push({ id, title, section, content, link });
}

fs.writeFileSync(outFile, JSON.stringify(index, null, 2));
console.log('Generated ' + index.length + ' entries in ' + outFile);
