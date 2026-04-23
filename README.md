# Theo Puzzle V2 Notes

This repository packages the local artifacts, notes, and solver scripts from the line-1 decryption attempt on Theo puzzle v2.

Current status: unsolved.

The line-1 payload under investigation is:

```text
/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=
```

The main handoff is in [notes/session-summary.md](notes/session-summary.md).

Repo layout:

- `artifacts/` - saved local source files, clue pages, puzzle input, raw line-1 bytes, and downloaded HTML/image artifacts
- `scripts/` - throwaway solver scripts used during the search
- `solver-env/` - minimal package metadata from the temporary Node environment used for some checks
- `notes/` - operator summary of findings, clue chain, and attempted branches

Quick operator notes:

- No verified plaintext was recovered.
- The work stayed intentionally narrow around the existing clue chain rather than widening into public discussion or unrelated repo fishing.
- Most direct passphrase lanes failed cleanly under authenticated AEAD checks, which strongly suggests the missing piece is an exact source string or an unhandled transform, not a lucky typo away.
