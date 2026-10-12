const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const checker = path.join(__dirname, 'check-repository.js');
function check(t, file, content) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'careerorbit-check-'));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
  fs.writeFileSync(path.join(folder, file), content);
  return spawnSync(process.execPath, [checker, '--all'], { cwd: folder, encoding: 'utf8' });
}
test('allows actual CV API source paths', t => {
  const result = check(t, 'src/app/api/cv/route.ts', 'export const dynamic = "force-dynamic";');
  assert.equal(result.status, 0);
});
test('rejects private environment files without printing their contents', t => {
  const result = check(t, '.env.local', 'PRIVATE_VALUE=synthetic-test-value');
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes('synthetic-test-value'));
});
test('rejects hardcoded provider keys without printing the key', t => {
  const fake = 'gsk_' + 'A'.repeat(40);
  const result = check(t, 'src/config.ts', `export const key = '${fake}';`);
  assert.equal(result.status, 1);
  assert.ok(!result.stderr.includes(fake));
});
test('allows an empty example configuration', t => {
  assert.equal(check(t, '.env.example', 'SUPABASE_SECRET_KEY=\n').status, 0);
});
