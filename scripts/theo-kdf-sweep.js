const crypto = require('crypto');

const base64 = '/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=';
const data = Buffer.from(base64, 'base64');

const seeds = [
  'Regent Sound',
  'Regent Sound Studio',
  'Regent Sound Studio, London',
  'Regent Sound in Tottenham Court Road',
  'Tottenham Court Road',
  'Tin Pan Alley',
  'Recording Fixing A Hole',
  'The walrus was Paul!',
  'The walrus was Paul.',
  'Fixing a hole in the ocean',
  'Trying to make a dove-tail joint, yeah',
  'Looking through the bent backed tulips',
  'To see how the other half live',
  'Looking through the bent backed tulips To see how the other half live',
  'You know the place where nothing is real.',
  'Nothing is real,',
  "I'm fixing a hole where the rain gets in,",
  'And stops my mind from wandering',
];

function uniq(values) {
  return [...new Set(values)];
}

function variants(text) {
  return uniq([
    text,
    text.toLowerCase(),
    text.replace(/[-.,'"]/g, ''),
    text.toLowerCase().replace(/[-.,'"]/g, ''),
  ].map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest();
}

function pbkdf2(text, salt, iterations, digest) {
  return crypto.pbkdf2Sync(Buffer.from(text, 'utf8'), salt, iterations, 32, digest);
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
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    return null;
  }
}

const lengths = { salt: 16, iv: 12, ct: 30, tag: 16 };
const orders = permutations(['salt', 'iv', 'ct', 'tag']);

function split(order) {
  let offset = 0;
  const parts = {};
  for (const label of order) {
    const size = lengths[label];
    parts[label] = data.subarray(offset, offset + size);
    offset += size;
  }
  return parts;
}

function keysets(text, salt) {
  return [
    ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(text), Buffer.from(':'), salt]))],
    ['sha256(text:saltHex)', sha256(Buffer.from(text + ':' + salt.toString('hex'), 'utf8'))],
    ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(text), salt]))],
    ['pbkdf2-sha1-1000', pbkdf2(text, salt, 1000, 'sha1')],
    ['pbkdf2-sha256-1000', pbkdf2(text, salt, 1000, 'sha256')],
    ['pbkdf2-sha512-1000', pbkdf2(text, salt, 1000, 'sha512')],
    ['pbkdf2-sha1-10000', pbkdf2(text, salt, 10000, 'sha1')],
    ['pbkdf2-sha256-10000', pbkdf2(text, salt, 10000, 'sha256')],
    ['pbkdf2-sha512-10000', pbkdf2(text, salt, 10000, 'sha512')],
    ['pbkdf2-sha1-100000', pbkdf2(text, salt, 100000, 'sha1')],
    ['pbkdf2-sha256-100000', pbkdf2(text, salt, 100000, 'sha256')],
    ['pbkdf2-sha512-100000', pbkdf2(text, salt, 100000, 'sha512')],
  ];
}

const hits = [];
for (const seed of seeds) {
  for (const phrase of variants(seed)) {
    for (const order of orders) {
      const parts = split(order);
      const body = Buffer.concat([parts.ct, parts.tag]);
      for (const [kdfName, key] of keysets(phrase, parts.salt)) {
        for (const [alg, fn] of [
          ['aes-256-gcm', decryptAesGcm],
          ['chacha20-poly1305', decryptChaCha],
        ]) {
          const output = fn(key, parts.iv, body);
          const text = output && printable(output);
          if (text) {
            hits.push({
              seed,
              phrase,
              kdfName,
              order: order.join('-'),
              alg,
              text,
            });
          }
        }
      }
    }
  }
}

console.log(JSON.stringify({
  hits: hits.length,
  sample: hits.slice(0, 10),
}, null, 2));
