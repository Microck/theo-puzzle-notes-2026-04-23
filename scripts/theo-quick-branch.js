const crypto = require('crypto');

const base64 = '/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=';
const data = Buffer.from(base64, 'base64');

const seeds = [
  'Break the glass',
  "It's Beatle-proof",
  'Nothing is Beatle-proof',
  'Have a look in your pocket',
  "I've got a hole in me pocket",
  'Parkes restaurant',
  'the other half live',
  'bent backed tulips',
  'dove-tail joint',
  'demonstration studio',
  '4 Denmark Street',
  'Denmark Street',
  '26 Tottenham Court Road',
  'Strawberry I Lady The Fixing',
  'Forever Walrus Madonna Hill Hole',
  'SFF IAtW LM TFotH FaH',
  'S I L T F',
  'Strawberry Forever I Walrus Lady Madonna The Hill Fixing Hole',
  'Fields Am Madonna Fool a',
  'Brick Joke',
  'Mind Screw',
  'The Walrus Was Paul',
  'This Index Will Be Important Later',
  'Number nine',
  'number nine',
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
  "Isn't that right, Harry?",
];

function uniq(values) {
  return [...new Set(values)];
}

function variants(text) {
  return uniq([
    text,
    text.toLowerCase(),
    text.replace(/[-.,'!?"]/g, ''),
    text.toLowerCase().replace(/[-.,'!?"]/g, ''),
  ].map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean));
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
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, {
      authTagLength: 16,
    });
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

const hits = [];
for (const seed of seeds) {
  for (const phrase of variants(seed)) {
    const directKey = sha256(Buffer.from(phrase, 'utf8'));
    for (const [layout, iv, body] of [
      ['iv12-prefix', data.subarray(0, 12), data.subarray(12)],
      ['iv12-suffix', data.subarray(data.length - 12), data.subarray(0, data.length - 12)],
    ]) {
      for (const [alg, fn] of [
        ['aes-256-gcm', decryptAesGcm],
        ['chacha20-poly1305', decryptChaCha],
      ]) {
        const output = fn(directKey, iv, body);
        const text = output && printable(output);
        if (text) hits.push({ seed, phrase, alg, layout, kdf: 'sha256(text)', text });
      }
    }

    for (const order of orders) {
      const parts = split(order);
      const body = Buffer.concat([parts.ct, parts.tag]);
      for (const [kdf, key] of [
        ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(phrase), Buffer.from(':'), parts.salt]))],
        ['sha256(text:saltHex)', sha256(Buffer.from(phrase + ':' + parts.salt.toString('hex'), 'utf8'))],
        ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(phrase), parts.salt]))],
      ]) {
        for (const [alg, fn] of [
          ['aes-256-gcm', decryptAesGcm],
          ['chacha20-poly1305', decryptChaCha],
        ]) {
          const output = fn(key, parts.iv, body);
          const text = output && printable(output);
          if (text) hits.push({ seed, phrase, alg, order: order.join('-'), kdf, text });
        }
      }
    }
  }
}

console.log(JSON.stringify({
  hits: hits.length,
  sample: hits.slice(0, 20),
}, null, 2));
