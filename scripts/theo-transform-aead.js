const crypto = require('crypto');

const source100 = '/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=';
const source99 = source100.slice(0, -1);

const seedBases = [
  'Break the glass',
  "It's Beatle-proof",
  'Nothing is Beatle-proof',
  'Have a look in your pocket',
  "I've got a hole in me pocket",
  'Brick Joke',
  'Mind Screw',
  'The Walrus Was Paul',
  'This Index Will Be Important Later',
  'Number nine',
  'Revolution 9',
  'Revolution Nine',
  'Eleanor Rigby',
  'Ah, look at all the lonely people',
  'All the lonely people',
  'Where do they all come from?',
  'Where do they all belong?',
  'I am the Walrus',
  'The walrus was Paul!',
  "Let's see the fuckers figure that one out",
  "I was the walrus, but now, I'm John.",
  'Isn’t that right, Harry?',
  "Isn't that right, Harry?",
  'Regent Sound',
  'Regent Sound Studio',
  'Regent Sound Studio, London',
  'Regent Sound in Tottenham Court Road',
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
  "I'm fixing a hole where the rain gets in,",
  'And stops my mind from wandering',
  'Strawberry Fields Forever',
  'I Am The Walrus',
  'Lady Madonna',
  'The Fool On The Hill',
  'Fixing A Hole',
  'Strawberry I Lady The Fixing',
  'Forever Walrus Madonna Hill Hole',
  'SFF IAtW LM TFotH FaH',
  'S I L T F',
  'Strawberry Forever I Walrus Lady Madonna The Hill Fixing Hole',
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

function flipH(grid) {
  return grid.map((row) => [...row].reverse());
}

function flipV(grid) {
  return [...grid].reverse().map((row) => [...row]);
}

function rows(grid) {
  return grid.map((row) => row.join('')).join('');
}

function cols(grid) {
  let out = '';
  for (let c = 0; c < grid[0].length; c++) {
    for (let r = 0; r < grid.length; r++) out += grid[r][c];
  }
  return out;
}

function boustroRows(grid) {
  let out = '';
  for (let r = 0; r < grid.length; r++) out += (r % 2 ? [...grid[r]].reverse() : grid[r]).join('');
  return out;
}

function boustroCols(grid) {
  let out = '';
  for (let c = 0; c < grid[0].length; c++) {
    const col = [];
    for (let r = 0; r < grid.length; r++) col.push(grid[r][c]);
    out += (c % 2 ? col.reverse() : col).join('');
  }
  return out;
}

function spiral(grid) {
  const g = grid.map((row) => [...row]);
  let top = 0;
  let bottom = g.length - 1;
  let left = 0;
  let right = g[0].length - 1;
  let out = '';
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out += g[top][c];
    top++;
    for (let r = top; r <= bottom; r++) out += g[r][right];
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out += g[bottom][c];
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out += g[r][left];
      left++;
    }
  }
  return out;
}

function halfswap(text) {
  const half = Math.floor(text.length / 2);
  return text.slice(half) + text.slice(0, half);
}

function dovetailAB(text) {
  const half = Math.floor(text.length / 2);
  const a = text.slice(0, half);
  const b = text.slice(half);
  let out = '';
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out += a[i];
    if (i < b.length) out += b[i];
  }
  return out;
}

function dovetailBA(text) {
  const half = Math.floor(text.length / 2);
  const a = text.slice(0, half);
  const b = text.slice(half);
  let out = '';
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < b.length) out += b[i];
    if (i < a.length) out += a[i];
  }
  return out;
}

function endsMeet(text) {
  let out = '';
  let i = 0;
  let j = text.length - 1;
  while (i <= j) {
    out += text[i++];
    if (i <= j) out += text[j--];
  }
  return out;
}

function decodeCandidate(text) {
  const padded = text.length % 4 === 0 ? text : `${text}=`;
  if (!/^[A-Za-z0-9+/=]+$/.test(padded) || padded.length % 4 !== 0) return null;
  try {
    return Buffer.from(padded, 'base64');
  } catch {
    return null;
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest();
}

function printable(buffer) {
  try {
    const text = buffer.toString('utf8');
    if (Buffer.from(text, 'utf8').compare(buffer) !== 0) return null;
    if (!/^[\x09\x0a\x0d\x20-\x7e]+$/.test(text)) return null;
    if (!/[A-Za-z]/.test(text)) return null;
    return text;
  } catch {
    return null;
  }
}

function decryptAesGcm(key, iv, body) {
  try {
    const ciphertext = body.subarray(0, body.length - 16);
    const tag = body.subarray(body.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    return null;
  }
}

function decryptChaCha(key, iv, body) {
  try {
    const ciphertext = body.subarray(0, body.length - 16);
    const tag = body.subarray(body.length - 16);
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    return null;
  }
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

function transformCandidates() {
  const routeFns = {
    rows,
    cols,
    boustroRows,
    boustroCols,
    spiral,
  };
  const postFns = {
    id: (x) => x,
    halfswap,
    dovetailAB,
    dovetailBA,
    endsMeet,
  };

  const out = [];
  for (const [label, text, dims] of [
    ['10x10', source100, [[10, 10]]],
    ['9x11', source99, [[9, 11], [11, 9]]],
  ]) {
    for (const [rowsCount, colsCount] of dims) {
      const baseGrid = mkGrid(text, rowsCount, colsCount);
      const grids = [];
      let rotated = baseGrid;
      for (let i = 0; i < 4; i++) {
        grids.push([`rot${i * 90}`, rotated]);
        grids.push([`rot${i * 90}_flipH`, flipH(rotated)]);
        grids.push([`rot${i * 90}_flipV`, flipV(rotated)]);
        rotated = rot90(rotated);
      }
      const seen = new Set();
      for (const [gName, grid] of grids) {
        const key = rows(grid);
        if (seen.has(key)) continue;
        seen.add(key);
        for (const [rName, routeFn] of Object.entries(routeFns)) {
          const routed = routeFn(grid);
          for (const [pName, postFn] of Object.entries(postFns)) {
            const transformed = postFn(routed);
            const decoded = decodeCandidate(transformed);
            if (!decoded || decoded.length !== 74) continue;
            out.push({
              desc: `${label}:${rowsCount}x${colsCount}:${gName}:${rName}:${pName}`,
              decoded,
            });
          }
        }
      }
    }
  }
  return uniq(out.map((x) => x.desc)).map((desc) => out.find((x) => x.desc === desc));
}

const seeds = uniq(seedBases.flatMap(variants));
const transformed = transformCandidates();
const hits = [];

for (const candidate of transformed) {
  const buffer = candidate.decoded;
  for (const seed of seeds) {
    const directKey = sha256(Buffer.from(seed, 'utf8'));
    for (const [layout, iv, body] of [
      ['iv12-prefix', buffer.subarray(0, 12), buffer.subarray(12)],
      ['iv12-suffix', buffer.subarray(buffer.length - 12), buffer.subarray(0, buffer.length - 12)],
    ]) {
      for (const [alg, fn] of [
        ['aes-256-gcm', decryptAesGcm],
        ['chacha20-poly1305', decryptChaCha],
      ]) {
        const output = fn(directKey, iv, body);
        const textOut = output && printable(output);
        if (textOut) hits.push({ candidate: candidate.desc, seed, layout, alg, key: 'sha256(text)', textOut });
      }
    }

    for (const order of layoutPerms) {
      const parts = split(buffer, order);
      const body = Buffer.concat([parts.ct, parts.tag]);
      for (const [keyName, key] of [
        ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(seed), Buffer.from(':'), parts.salt]))],
        ['sha256(text:saltHex)', sha256(Buffer.from(seed + ':' + parts.salt.toString('hex'), 'utf8'))],
        ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(seed), parts.salt]))],
      ]) {
        for (const [alg, fn] of [
          ['aes-256-gcm', decryptAesGcm],
          ['chacha20-poly1305', decryptChaCha],
        ]) {
          const output = fn(key, parts.iv, body);
          const textOut = output && printable(output);
          if (textOut) hits.push({ candidate: candidate.desc, seed, layout: order.join('-'), alg, key: keyName, textOut });
        }
      }
    }
  }
}

console.log(JSON.stringify({
  transformed: transformed.length,
  seeds: seeds.length,
  hits: hits.length,
  sample: hits.slice(0, 10),
}, null, 2));
