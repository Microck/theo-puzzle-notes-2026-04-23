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
