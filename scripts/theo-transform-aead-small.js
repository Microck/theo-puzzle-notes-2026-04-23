const crypto = require('crypto');

const source = '/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj'.trim();
const seedBases = [
  "I've got a hole in me pocket",
  'Brick Joke',
  'Glass Onion',
  'The Walrus Was Paul',
  'Number nine',
  'Revolution 9',
  'Eleanor Rigby',
  'I am the Walrus',
  'The walrus was Paul!',
  'Regent Sound',
  'Regent Sound Studio',
  'Tottenham Court Road',
  'Tin Pan Alley',
  'Parkes restaurant',
  'Fixing a hole in the ocean',
  'Trying to make a dove-tail joint, yeah',
  'Looking through the bent backed tulips',
  'To see how the other half live',
  'Looking through the bent backed tulips To see how the other half live',
  'You know the place where nothing is real.',
  'Nothing is real,',
  'Strawberry Fields Forever',
  'Lady Madonna',
  'The Fool On The Hill',
  'Fixing A Hole',
  'Forever Walrus Madonna Hill Hole',
  'SFF IAtW LM TFotH FaH',
];

function uniq(values) {
  return [...new Set(values)];
}
function variants(text) {
  const clean = (value) => value.replace(/\s+/g, ' ').trim();
  return uniq([
    clean(text),
    clean(text).toLowerCase(),
    clean(text).replace(/[-.,'!?"]/g, ''),
    clean(text).toLowerCase().replace(/[-.,'!?"]/g, ''),
  ].filter(Boolean));
}
function mkGrid(text, rows, cols) {
  const out = [];
  for (let r = 0; r < rows; r++) out.push(text.slice(r * cols, (r + 1) * cols).split(''));
  return out;
}
function rot90(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  return Array.from({ length: cols }, (_, r) =>
    Array.from({ length: rows }, (_, c) => grid[rows - 1 - c][r])
  );
}
function rows(grid) { return grid.map((row) => row.join('')).join(''); }
function cols(grid) {
  let out = '';
  for (let c = 0; c < grid[0].length; c++) for (let r = 0; r < grid.length; r++) out += grid[r][c];
  return out;
}
function boustroRows(grid) {
  let out = '';
  for (let r = 0; r < grid.length; r++) out += (r % 2 ? [...grid[r]].reverse() : grid[r]).join('');
  return out;
}
function spiral(grid) {
  let top = 0, bottom = grid.length - 1, left = 0, right = grid[0].length - 1, out = '';
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out += grid[top][c];
    top++;
    for (let r = top; r <= bottom; r++) out += grid[r][right];
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out += grid[bottom][c];
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out += grid[r][left];
      left++;
    }
  }
  return out;
}
function halfswap(text) {
  const half = Math.floor(text.length / 2);
  return text.slice(half) + text.slice(0, half);
}
function dovetail(text, swap) {
  const half = Math.floor(text.length / 2);
  const a = text.slice(0, half);
  const b = text.slice(half);
  let out = '';
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (swap ? i < b.length : i < a.length) out += swap ? b[i] : a[i];
    if (swap ? i < a.length : i < b.length) out += swap ? a[i] : b[i];
  }
  return out;
}
function endsMeet(text) {
  let out = '';
  let i = 0, j = text.length - 1;
  while (i <= j) {
    out += text[i++];
    if (i <= j) out += text[j--];
  }
  return out;
}
function decodeCandidate(text) {
  const padded = `${text}=`;
  try { return Buffer.from(padded, 'base64'); } catch { return null; }
}
function sha256(value) { return crypto.createHash('sha256').update(value).digest(); }
function printable(buffer) {
  try {
    const text = buffer.toString('utf8');
    if (Buffer.from(text, 'utf8').compare(buffer) !== 0) return null;
    if (!/^[\x09\x0a\x0d\x20-\x7e]+$/.test(text)) return null;
    if (!/[A-Za-z]/.test(text)) return null;
    return text;
  } catch { return null; }
}
function decryptAesGcm(key, iv, body) {
  try {
    const ciphertext = body.subarray(0, body.length - 16);
    const tag = body.subarray(body.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch { return null; }
}
function decryptChaCha(key, iv, body) {
  try {
    const ciphertext = body.subarray(0, body.length - 16);
    const tag = body.subarray(body.length - 16);
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch { return null; }
}
function permutations(items) {
  if (items.length <= 1) return [items];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const perm of permutations(rest)) out.push([items[i], ...perm]);
  }
  return out;
}
const layoutPerms = permutations(['salt', 'iv', 'ct', 'tag']);
const lengths = { salt: 16, iv: 12, ct: 30, tag: 16 };
function split(buffer, order) {
  let offset = 0;
  const parts = {};
  for (const label of order) {
    parts[label] = buffer.subarray(offset, offset + lengths[label]);
    offset += lengths[label];
  }
  return parts;
}

const transformed = [];
for (const [rowsCount, colsCount] of [[9, 11], [11, 9]]) {
  let grid = mkGrid(source, rowsCount, colsCount);
  for (let rot = 0; rot < 4; rot++) {
    for (const [routeName, routeFn] of [['cols', cols], ['boustroRows', boustroRows], ['spiral', spiral]]) {
      const routed = routeFn(grid);
      for (const [postName, postFn] of [
        ['id', (x) => x],
        ['halfswap', halfswap],
        ['dovetailAB', (x) => dovetail(x, false)],
        ['dovetailBA', (x) => dovetail(x, true)],
        ['endsMeet', endsMeet],
      ]) {
        const decoded = decodeCandidate(postFn(routed));
        if (decoded && decoded.length === 74) {
          transformed.push({
            desc: `${rowsCount}x${colsCount}:rot${rot * 90}:${routeName}:${postName}`,
            decoded,
          });
        }
      }
    }
    grid = rot90(grid);
  }
}

const seeds = uniq(seedBases.flatMap(variants));
const hits = [];
for (const candidate of transformed) {
  for (const seed of seeds) {
    const directKey = sha256(Buffer.from(seed, 'utf8'));
    for (const [layout, iv, body] of [
      ['iv12-prefix', candidate.decoded.subarray(0, 12), candidate.decoded.subarray(12)],
      ['iv12-suffix', candidate.decoded.subarray(candidate.decoded.length - 12), candidate.decoded.subarray(0, candidate.decoded.length - 12)],
    ]) {
      for (const [alg, fn] of [['aes-256-gcm', decryptAesGcm], ['chacha20-poly1305', decryptChaCha]]) {
        const out = fn(directKey, iv, body);
        const textOut = out && printable(out);
        if (textOut) hits.push({ candidate: candidate.desc, seed, layout, alg, key: 'sha256(text)', textOut });
      }
    }
    for (const order of layoutPerms) {
      const parts = split(candidate.decoded, order);
      const body = Buffer.concat([parts.ct, parts.tag]);
      for (const [keyName, key] of [
        ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(seed), Buffer.from(':'), parts.salt]))],
        ['sha256(text:saltHex)', sha256(Buffer.from(seed + ':' + parts.salt.toString('hex'), 'utf8'))],
        ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(seed), parts.salt]))],
      ]) {
        for (const [alg, fn] of [['aes-256-gcm', decryptAesGcm], ['chacha20-poly1305', decryptChaCha]]) {
          const out = fn(key, parts.iv, body);
          const textOut = out && printable(out);
          if (textOut) hits.push({ candidate: candidate.desc, seed, layout: order.join('-'), alg, key: keyName, textOut });
        }
      }
    }
  }
}
console.log(JSON.stringify({ transformed: transformed.length, seeds: seeds.length, hits: hits.length, sample: hits.slice(0, 10) }, null, 2));
