# Theo Puzzle V2 Notes

This repository packages the local artifacts, notes, and solver scripts from the line-1 decryption attempt on [Theo crypto puzzle v2](https://gist.github.com/t3dotgg/6c2771dbf31033a506b632a067cfaf33). 

Sadly, I fell towards the wrong path and went to sleep before the 1st hint was published ;P I did have the backwards idea pretty early on but discarded it after a few attempts, so there's that!

| Time (CEST) | Time (UTC) | Event |
|---|---|---|
| 19:20 | 17:20 | Puzzle published |
| 23:55 | 21:55 | Gave up (archived investigation notes to repo) |
| 06:31 | 04:31 | Solved by @avikam03 |

That's about **11 hours 12 minutes** from publish to solve.

---

The line-1 payload under investigation was:

```text
/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=
```


Repo layout:

- `artifacts/` - saved local source files, clue pages, puzzle input, raw line-1 bytes, and downloaded HTML/image artifacts
- `scripts/` - throwaway solver scripts used during the search
- `solver-env/` - minimal package metadata from the temporary Node environment used for some checks
- `notes/` - operator summary of findings, clue chain, and attempted branches

## Investigation timeline

Exact timestamps were only preserved for the outer milestones above. The table below is chronological by phase and only includes branches that were actually attempted.

| Order | Branch / trigger | What was tried | Outcome / why it mattered |
| --- | --- | --- | --- |
| 1 | Initial payload triage | Treated line 1 as Base64, decoded it, and locked in the working sizes: `100` chars of Base64 text, `99` without the trailing `=`, and `74` raw bytes. | This fixed the problem shape early and ruled out treating line 1 as plain text or a simple substitution puzzle. |
| 2 | Hint discipline | Kept line 2 as an internal breadcrumb rather than the answer target. | This avoided solving the wrong line and stayed inside the user’s constraints. |
| 3 | Internal breadcrumb recovery | Internally recovered the clue as `Where it all begaN_0mpxB5iVQ`, then split it into a phrase plus a YouTube-style ID. | This created the first real follow-up path and led to saved artifacts like `artifacts/n0mpxb5ivq.html` and `artifacts/N_0mpxB5iVQ-maxres.jpg`. |
| 4 | Description hint branch | Used the user-provided hint `A drum break might shatter it!` as the main directional clue. | This kept the search narrow and grounded instead of widening into unrelated Beatles material. |
| 5 | `Yellow Submarine` quote chain | Followed the quote sequence `Break the glass.` -> `It's Beatle-proof.` -> `Nothing is Beatle-proof.` -> `A drum break might shatter it!` -> `I've got a hole in me pocket.` | This established the strongest semantic trail and produced the main downstream branches: glass, Beatle-proof, and hole. |
| 6 | Direct AEAD passes on the raw `74` bytes | Repeatedly tested AES-256-GCM and ChaCha20-Poly1305 with candidate strings and cleaned variants. | No authenticated hit. This ruled out a large class of "the obvious quote is just the password" interpretations. |
| 7 | KDF expansion passes | Tried PBKDF2-SHA1, PBKDF2-SHA256, PBKDF2-SHA512, scrypt, and Argon2id over the strongest candidate seed families. | No verified decrypt. This reduced the chance that the missing piece was only a slower derivation over the same text candidates. |
| 8 | Non-AEAD and legacy lanes | Checked AES-CTR, CFB, OFB, CBC, raw ChaCha/Salsa-family stream lanes, OpenSSL EVP-style passphrase behavior, libsodium `secretbox`, XChaCha-style layouts, and repeating-key XOR/add/subtract. | No clean plaintext or structural hit. This suggested the payload was not a trivial legacy container using the same candidate strings. |
| 9 | `Yellow Submarine` text sweeps | Used quote lines, nearby windows, punctuation-stripped forms, and short n-grams from the glass-bowl scene as seed material. | No hit. The obvious quote text was not sufficient on its own. |
| 10 | `Glass Onion` branch | Followed the Beatles self-reference lane and tested the linked songs and lyric fragments: `Strawberry Fields Forever`, `I Am the Walrus`, `Lady Madonna`, `The Fool on the Hill`, `Fixing a Hole`, plus lines like `Looking through the bent backed tulips` and `Trying to make a dove-tail joint, yeah`. | No authenticated decrypt, but this branch directly inspired later dovetail and chunk-permutation transform attempts. |
| 11 | `Fixing A Hole` / `Regent Sound` branch | Tested exact session-page strings including `there was no room for them at the inn`, `Regent Sound in Tottenham Court Road`, `in the heart of Tin Pan Alley`, and Adrian Ibbetson / George Martin phrasing. | No hit. This exhausted the strongest "hole" continuation using documented studio-session language. |
| 12 | Liverpool / Cavern / origin branch | Pivoted from `Where it all began` into Beatles-origin phrases such as `The Beatles at the Cavern Club | Where It All Began`, `the city where it all began`, `the birthplace of Beatlemania`, `Leever-pooler`, plus Cavern / Casbah / St Peter's / Percy Phillips strings. | No hit. This covered the strongest origin-story interpretation without widening into generic Beatles trivia. |
| 13 | AAD / mixed-material branch | Tried the hint phrase as AES-GCM AAD, the recovered breadcrumb as AAD, hint text appended into key material, and derivations like `seed + hint + salt` and `seed + pepper + salt`. | No authenticated decrypt. This ruled out the common "the phrase participates but is not the whole key" interpretation. |
| 14 | Base64-shape / transform branch | Explored the `99`-character no-padding branch and multiple grid interpretations including `9x11`, `11x9`, and `10x10`, then tested row, column, boustrophedon, and spiral reads. | No hit. This was the main attempt to treat line 1 as a rearranged or disguised container rather than a direct ciphertext blob. |
| 15 | Post-transform structural passes | Applied half-swap, dovetail, ends-meet, and chunk-length permutation ideas derived from the `Glass Onion` references and song-title lengths. | No authenticated decrypt. This exhausted the strongest structure-first experiments built from the clue chain. |
| 16 | Scripted sweep phase | Wrote and ran helper scripts such as `scripts/theo-quick-branch.js`, `scripts/theo-kdf-sweep.js`, `scripts/theo-sentence-sweep.js`, `scripts/theo-transform-aead.js`, `scripts/theo-transform-aead-small.js`, `scripts/theo-transform-aead-10x10.js`, and `scripts/theo-steg-try.go`. | These preserved the exact tested lanes and show the search was systematic rather than anecdotal. |
| 17 | Stop condition | After repeated authenticated failures across quote, lyric, session, origin, AAD, and transform branches, the work was archived instead of widening blindly. | The final working conclusion at the time was that the missing piece was either the exact post-`Yellow Submarine` source string or an unhandled container / transform layout. |

For the denser clue-chain narrative and source excerpts, see [notes/session-summary.md](notes/session-summary.md).
