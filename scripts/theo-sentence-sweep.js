const fs = require('fs');
const crypto = require('crypto');
const { createRequire } = require('module');

const data = Buffer.from('/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=', 'base64');
const requireTheo = createRequire('file:///tmp/theo-solve/package.json');
const sodium = requireTheo('libsodium-wrappers-sumo');

function uniq(values) {
  return [...new Set(values)];
}

function decodeHtml(text) {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&bull;/g, ' ');
}

function clean(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function variants(text) {
  return uniq([
    clean(text),
    clean(text).toLowerCase(),
    clean(text).replace(/[-.,'!?"]/g, ''),
    clean(text).toLowerCase().replace(/[-.,'!?"]/g, ''),
  ].filter(Boolean));
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

function permutations(items) {
  if (items.length <= 1) return [items];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const perm of permutations(rest)) out.push([items[i], ...perm]);
  }
  return out;
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

function decryptSecretbox(key, nonce, body) {
  try {
    return Buffer.from(sodium.crypto_secretbox_open_easy(body, nonce, key));
  } catch {
    return null;
  }
}

function decryptXChaCha(key, nonce, body) {
  try {
    return Buffer.from(sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, body, null, nonce, key));
  } catch {
    return null;
  }
}

function extractBeatlesParagraphLines(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const m = html.match(/<div class="col-md-6 middle-content border-left border-right">([\s\S]*?)<figure class="wp-block-table/s);
  if (!m) return [];
  const seg = decodeHtml(m[1]);
  const lines = [...seg.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((x) => x[1].replace(/<[^>]+>/g, ''))
    .flatMap((p) => p.split('\n'))
    .map(clean)
    .filter(Boolean);
  return lines;
}

function extractSimpleSentences(htmlPath) {
  const html = decodeHtml(fs.readFileSync(htmlPath, 'utf8')).replace(/<[^>]+>/g, ' ');
  return html
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter((x) => x.length >= 12 && x.length <= 220);
}

function extractYellowSubmarineLines(mdPath) {
  return fs.readFileSync(mdPath, 'utf8')
    .split('\n')
    .map((line) => line.replace(/\[[^\]]+\]\([^)]+\)/g, '$&').replace(/\*\*/g, ''))
    .map((line) => line.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => m.replace(/\[([^\]]+)\]\([^)]+\)/, '$1')))
    .map((line) => line.replace(/<[^>]+>/g, ' '))
    .map(clean)
    .filter((x) => x.length >= 6);
}

function pairs(lines) {
  const out = [];
  for (let i = 0; i < lines.length - 1; i++) out.push(`${lines[i]} ${lines[i + 1]}`);
  return out;
}

function triples(lines) {
  const out = [];
  for (let i = 0; i < lines.length - 2; i++) out.push(`${lines[i]} ${lines[i + 1]} ${lines[i + 2]}`);
  return out;
}

async function main() {
  await sodium.ready;

  const lyricLines = uniq([
    ...extractBeatlesParagraphLines('/tmp/glass-onion.html'),
    ...extractBeatlesParagraphLines('/tmp/fixing-hole.html'),
    ...extractBeatlesParagraphLines('/tmp/strawberry-fields-forever.html'),
    ...extractBeatlesParagraphLines('/tmp/i-am-walrus.html'),
    ...extractBeatlesParagraphLines('/tmp/lady-madonna.html'),
    ...extractBeatlesParagraphLines('/tmp/fool-hill.html'),
  ]);

  const yellowLines = extractYellowSubmarineLines('/tmp/yellow-submarine-quotes.md');
  const sessionSentences = extractSimpleSentences('/tmp/fixing-session.html').filter((x) =>
    /(Regent|Tottenham|Tin Pan Alley|Fixing A Hole|George Martin|Adrian Ibbetson|Jesus|Abbey Road|room for them at the inn)/i.test(x)
  );
  const tropeSentences = extractSimpleSentences('/tmp/n0mpxb5ivq.html').filter(() => false);

  const bases = uniq([
    ...yellowLines,
    ...lyricLines,
    ...pairs(lyricLines),
    ...triples(lyricLines),
    ...sessionSentences,
  ]);

  const filtered = bases.filter((x) => x.length >= 8 && x.length <= 220);

  const perms12 = permutations(['salt', 'iv', 'ct', 'tag']);
  const lens12 = { salt: 16, iv: 12, ct: 30, tag: 16 };
  const perms24 = permutations(['salt', 'nonce', 'ct', 'tag']);
  const lens24 = { salt: 16, nonce: 24, ct: 18, tag: 16 };

  function split(buffer, order, lens) {
    let offset = 0;
    const parts = {};
    for (const label of order) {
      parts[label] = buffer.subarray(offset, offset + lens[label]);
      offset += lens[label];
    }
    return parts;
  }

  const hits = [];
  for (const base of filtered) {
    for (const text of variants(base)) {
      const directKey = sha256(Buffer.from(text, 'utf8'));
      for (const [layout, iv, body] of [
        ['iv12-prefix', data.subarray(0, 12), data.subarray(12)],
        ['iv12-suffix', data.subarray(data.length - 12), data.subarray(0, data.length - 12)],
      ]) {
        for (const [alg, fn] of [
          ['aes-256-gcm', decryptAesGcm],
          ['chacha20-poly1305', decryptChaCha],
        ]) {
          const out = fn(directKey, iv, body);
          const textOut = out && printable(out);
          if (textOut) hits.push({ base, text, alg, layout, key: 'sha256(text)', textOut });
        }
      }

      for (const order of perms12) {
        const parts = split(data, order, lens12);
        const body = Buffer.concat([parts.ct, parts.tag]);
        for (const [keyName, key] of [
          ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(text), Buffer.from(':'), parts.salt]))],
          ['sha256(text:saltHex)', sha256(Buffer.from(text + ':' + parts.salt.toString('hex'), 'utf8'))],
          ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(text), parts.salt]))],
        ]) {
          for (const [alg, fn] of [
            ['aes-256-gcm', decryptAesGcm],
            ['chacha20-poly1305', decryptChaCha],
          ]) {
            const out = fn(key, parts.iv, body);
            const textOut = out && printable(out);
            if (textOut) hits.push({ base, text, alg, layout: order.join('-'), key: keyName, textOut });
          }
        }
      }

      for (const order of perms24) {
        const parts = split(data, order, lens24);
        const body = Buffer.concat([parts.ct, parts.tag]);
        for (const [keyName, key] of [
          ['sha256(text:saltRaw)', sha256(Buffer.concat([Buffer.from(text), Buffer.from(':'), parts.salt]))],
          ['sha256(text:saltHex)', sha256(Buffer.from(text + ':' + parts.salt.toString('hex'), 'utf8'))],
          ['sha256(text+saltRaw)', sha256(Buffer.concat([Buffer.from(text), parts.salt]))],
        ]) {
          for (const [alg, fn] of [
            ['secretbox', decryptSecretbox],
            ['xchacha20poly1305', decryptXChaCha],
          ]) {
            const out = fn(key, parts.nonce, body);
            const textOut = out && printable(out);
            if (textOut) hits.push({ base, text, alg, layout: order.join('-'), key: keyName, textOut });
          }
        }
      }
    }
  }

  console.log(JSON.stringify({
    candidates: filtered.length,
    hits: hits.length,
    sample: hits.slice(0, 10),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
