const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/check.js'), 'utf8'), sandbox);
const A = sandbox.window.SilicyteCheck;
const map = { seq: 'sequence', pred: 'prediction', truth: 'measured', split: 'split' };

test('empty data cannot pass split checking', () => {
  const result = A.run([], map);

  assert.equal(result.split.ok, null);
});

test('unknown split labels cannot pass split checking', () => {
  const rows = [{ sequence: 'ACDEFGHIK', split: 'unknown' }];

  const result = A.run(rows, map);

  assert.equal(result.split.ok, null);
});

test('missing split labels among usable records make sequence checks inconclusive', () => {
  const rows = [{ sequence: 'AAAAAAAAAA', split: 'train' },
    { sequence: 'CCCCCCCCCC', split: 'test' }, { sequence: 'DDDDDDDDDD', split: '' }];

  const result = A.run(rows, map);

  assert.equal(result.split.ok, null);
  assert.equal(result.leak.ok, null);
});

test('unsupported SMILES input is rejected instead of losing chemical punctuation', () => {
  const rows = [{ smiles: 'CC(O)C', split: 'train' }, { smiles: 'CCOC', split: 'test' }];

  assert.throws(() => A.run(rows, { ...map, seq: 'smiles' }), /peptide|SMILES/i);
});

test('sample identifiers are not guessed as sequences', () => {
  const rows = [{ id: 'sample001', split: 'train' }, { id: 'sample002', split: 'test' }];

  const result = A.run(rows, A.guess(Object.keys(rows[0])));

  assert.equal(result.leak.ok, null);
});

test('a sampled negative cannot certify that no near-neighbor exists', () => {
  const training = [{ sequence: 'AAAAAAAAAA', split: 'train' }, { sequence: 'CCCCCCCCCC', split: 'train' }];

  const results = ['AAAAAAAAAG', 'CCCCCCCCCG'].map(sequence => A.run([...training, { sequence, split: 'test' }], map, { cap: 1 }));

  assert.ok(results.every(result => result.leak.ok !== true));
});

test('a known near-neighbor detected in a sample is still reported', () => {
  const rows = [{ sequence: 'AAAAAAAAAA', split: 'train' }, { sequence: 'AAAAAAAAAG', split: 'test' }];

  const result = A.run(rows, map);

  assert.equal(result.leak.ok, false);
});

test('similarity exactly at the configured threshold is detected', () => {
  const rows = [{ sequence: 'AAAAAAAAAA', split: 'train' }, { sequence: 'AAAAAAAACC', split: 'test' }];

  const result = A.run(rows, map, { identity: 0.8 });

  assert.equal(result.leak.ok, false);
});

test('prediction spread does not issue an experimental-effect visibility verdict', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ sequence: 'ACDEFGHIK', split: 'test', prediction: '0', measured: String(i * 100) }));

  const result = A.run(rows, map, { reportedEffect: 0.001 });

  assert.equal(result.floor.ok, null);
  assert.match(result.floor.note, /uncertainty|significance|resolution/i);
});

test('constant predictions make Spearman undefined rather than zero', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ sequence: 'ACDEFGHIK', split: 'test', prediction: '0', measured: String(i) }));

  const result = A.run(rows, map);

  assert.equal(result.ties.ok, null);
});

test('an exact train-test duplicate is detected', () => {
  const rows = [{ sequence: 'ACDEFGHIK', split: 'train' }, { sequence: 'ACDEFGHIK', split: 'test' }];

  const result = A.run(rows, map);

  assert.equal(result.split.ok, false);
});

test('a complete comparison of separated peptides can pass the stated checks', () => {
  const rows = [{ sequence: 'AAAAAAAAAA', split: 'train' }, { sequence: 'CCCCCCCCCC', split: 'test' }];

  const result = A.run(rows, map);

  assert.equal(result.leak.ok, true);
  assert.equal(result.split.ok, true);
});

test('tie-corrected correlation preserves perfectly reversed tied ranks', () => {
  const result = A.spearman([1, 1, 2, 2], [2, 2, 1, 1]);

  assert.equal(result, -1);
});

test('sequence ratio remains correct for peptides of different lengths', () => {
  const result = A.ratio('A', 'AAAGGGG');

  assert.equal(result, 0.25);
});

test('descriptive output preserves the sign of a reported gain', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ sequence: 'ACDEFGHIK', split: 'test', prediction: String(i) }));

  const result = A.run(rows, map, { reportedEffect: -0.2 });

  assert.equal(result.floor.reported, -0.2);
});
