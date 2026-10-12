const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
function walk(folder = '.') {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(item => {
    if (['.git', 'node_modules', '.next', 'out'].includes(item.name)) return [];
    const file = path.join(folder, item.name);
    if (item.isSymbolicLink()) throw new Error(`Review linked path: ${file}`);
    return item.isDirectory() ? walk(file) : [file];
  });
}
const files = process.argv.includes('--all') ? walk() : execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgsk_[A-Za-z0-9]{20,}\b/,
  /\bsb_secret_[A-Za-z0-9_-]{20,}\b/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  /\bAIza[A-Za-z0-9_-]{30,}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,
];
const failures = [];
for (const file of files) {
  const normalized = file.replaceAll('\\', '/');
  const basename = path.basename(file);
  if ((basename.startsWith('.env') && basename !== '.env.example') || /(?:^|\/)(?:node_modules|\.next)(?:\/|$)/i.test(normalized) || /^(?:backups?|uploads?|cvs?|resumes?)\//i.test(normalized) || /^public\/(?:uploads?|cvs?|resumes?)\//i.test(normalized) || /\.(?:pem|key|p12|pfx|pdf|docx|sql|zip|log|tsbuildinfo)$/i.test(file)) {
    failures.push(`${file}: private or generated file type`); continue;
  }
  if (!/\.(?:ts|tsx|js|jsx|json|css|scss|svg|md|txt|yml|yaml|example)$/i.test(file) && !['.gitignore', '.gitattributes'].includes(basename)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (patterns.some(pattern => pattern.test(content))) failures.push(`${file}: possible credential; review required`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  console.error('No credential values are printed. Remove private data or review safe placeholders before retrying.');
  process.exitCode = 1;
} else {
  console.log(`Publication checks passed for ${files.length} files. Manual privacy review is still required.`);
}
