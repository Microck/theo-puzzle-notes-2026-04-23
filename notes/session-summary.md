# Session Summary

## Goal

Recover the verified plaintext decryption of line 1 from Theo puzzle v2.

## Hard constraints followed during the attempt

- Target was the plaintext of line 1 only.
- Search stayed inside the clue chain already established.
- No broad public-theory search was used as a substitute for verification.

## Puzzle input

Line 1:

```text
/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=
```

Base64-decoded line 1:

```text
feb46849aa6c1b499826d7ccc4a0372e281c7053b294bf992fbb2d2bcc75764fb8dd9dac8d784834bfaad41b5605209005f9c025747062404d181c59ca29ca57e233def4a97d12daea48
```

Useful lengths:

- Base64 text length: `100`
- Base64 text length without trailing `=`: `99`
- Raw decoded length: `74` bytes

## Clue chain used

The working clue chain during the session was:

1. Line 2 gives a breadcrumb to a hint source.
2. The user-provided hint phrase was `A drum break might shatter it!`
3. That points into the `Yellow Submarine` quote sequence:
   - `Break the glass.`
   - `It's Beatle-proof.`
   - `Nothing is Beatle-proof.`
   - `A drum break might shatter it!`
   - `I've got a hole in me pocket.`
4. The strongest follow-on branches were:
   - `Fixing A Hole`
   - `Glass Onion`
   - the songs referenced by `Glass Onion`
   - `Regent Sound` / `where it all began`
   - later, the Liverpool / Cavern Club / Beatlemania origin branch

## Important recovered intermediate breadcrumb

Line 2 ROT47-decodes to:

```text
Where it all begaN_0mpxB5iVQ
```

This was treated as:

- the phrase `Where it all began`
- a YouTube ID `N_0mpxB5iVQ`

Relevant saved artifacts are in:

- `artifacts/n0mpxb5ivq.html`
- `artifacts/N_0mpxB5iVQ-maxres.jpg`

## High-signal source findings

### Yellow Submarine quote page

The local quote page clearly contains the scene:

- `Break the glass.`
- `It's Beatle-proof.`
- `Nothing is Beatle-proof.`
- `A drum break might shatter it!`
- `I've got a hole in me pocket!`

It also contains earlier Liverpool-adjacent wording:

- `Can't help it, I'm a born Leever-pooler.`

And the same scene contains nearby phrases that were tested:

- `It's Sgt. Pepper's Lonely Hearts Club Band.`
- `salt and pepper according to the taste`
- `Like crystal.`
- `Hey, they're decanting.`

### Glass Onion branch

Official Beatles lyric pages confirmed the line sequence:

- `Looking through the bent backed tulips`
- `To see how the other half live`
- `Fixing a hole in the ocean`
- `Trying to make a dove-tail joint, yeah`

The song references used as structure candidates were:

- `Strawberry Fields Forever`
- `I Am the Walrus`
- `Lady Madonna`
- `The Fool on the Hill`
- `Fixing a Hole`

### Fixing A Hole / Regent Sound branch

The strongest exact session-page sentences extracted were:

- `It so happened that all the studios were in use that particular night, 9 February: there was no room for them at the inn.`
- `The one we found, Regent Sound in Tottenham Court Road, was little more than a demonstration studio, in the heart of Tin Pan Alley.`
- `A man called Adrian Ibbetson was head of Regent Sound then, so he did the recording.`
- `George Martin couldn’t get the group booked into Abbey Road on the night they wanted to record, so they moved to Regent Sound Studio in London's West End instead.`

### Liverpool / Cavern / origin branch

Later focused research around `where it all began` surfaced:

- `The Beatles at the Cavern Club | Where It All Began`
- `the city where it all began`
- `the birthplace of Beatlemania`

Local Cavern pages also yielded landmark lists and origin-language phrases such as:

- `With a full day at our disposal, we take you back to where it all began`
- `The Cavern and Mathew Street`
- `St Peter's Church Hall`
- `The Casbah Coffee Club`
- `Percy Phillip's studio`

## What was tried

### Direct crypto/container lanes on the original 74-byte payload

The following were tried repeatedly with candidate strings and their lowercased / punctuation-stripped variants:

- AES-256-GCM
- ChaCha20-Poly1305
- PBKDF2-SHA1 / SHA256 / SHA512
- scrypt
- Argon2id
- AES-CTR / CFB / OFB / CBC
- raw ChaCha20 / Salsa / XSalsa / XChaCha stream lanes
- old OpenSSL EVP-style passphrase lanes
- libsodium `secretbox`
- libsodium XChaCha / secretbox-style layouts
- repeating-key XOR / add / subtract

### Direct source-string families tried

Candidate seeds were drawn from:

- Yellow Submarine quote lines and short windows around the glass-bowl scene
- Glass Onion lyric lines and the referenced song titles
- Fixing A Hole / Regent Sound session-page sentences
- Liverpool / Cavern / Beatlemania titles, landmarks, and addresses
- hint-video metadata such as title, description text, skater names, and location strings

### AAD and mixed-material lanes

Explicit checks were done for:

- hint-text as AES-GCM AAD
- line-2-derived breadcrumb as AES-GCM AAD
- hint-text appended into key material
- `seed + hint + salt` style SHA256 derivations
- `seed + pepper + salt` style SHA256 derivations

### Transform branches

The strongest transform lanes explored were:

- `99`-character branch from line 1 without the trailing `=`
- `9x11` and `11x9` grid interpretations
- `10x10` grid interpretations
- route transforms:
  - rows
  - columns
  - boustrophedon rows
  - spiral
- post-transforms:
  - half-swap
  - dovetail
  - ends-meet
- chunk-permutation branch based on `Glass Onion` referenced-song title lengths

No authenticated hits were found from those branches.

## Files worth opening first

If resuming this work later, start with:

- `notes/session-summary.md`
- `artifacts/theo-puzzle-v2.txt`
- `artifacts/yellow-submarine-quotes.md`
- `artifacts/fixing-session.html`
- `artifacts/n0mpxb5ivq.html`
- `scripts/theo-sentence-sweep.js`
- `scripts/theo-transform-aead-small.js`
- `scripts/theo-transform-aead-10x10.js`
- `scripts/theo-kdf-sweep.js`

## Current conclusion

No verified plaintext was recovered.

Given the negative results across:

- direct cleaned quote-line sweeps
- exact session-page sentence sweeps
- slower-KDF passes on the strongest Beatles-origin strings
- transform-plus-AEAD branches

the most likely missing piece is still:

- the exact intended source string after the `Yellow Submarine` step, or
- a specific transform / container layout that was not yet matched.
