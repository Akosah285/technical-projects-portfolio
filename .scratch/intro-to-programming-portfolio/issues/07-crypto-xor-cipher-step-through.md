---
Status: needs-triage
Type: AFK
---

# Cryptography & Text Processing — XOR cipher step-through

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A project page at `/courses/intro-to-programming/cryptography-and-text-processing/crypto/` with an animated step-through of the one-time-pad XOR cipher: visitor sees plaintext, key (pad), and ciphertext as character grids; pressing play (or stepping) animates the XOR being applied character-by-character, with each cell briefly highlighting as it's transformed. Visitor can edit the plaintext and the key (within reasonable length) and watch the ciphertext recompute.

The original `crypto.py` (Lab 4 — header explicitly says so) and the `ciphertext.txt` test input ship as downloadable sources. The visualization makes the mechanic intuitive rather than just showing input/output strings.

## Acceptance criteria

- [ ] Project page renders with the full project-card layout
- [ ] Visualization shows three grids: plaintext, key, ciphertext, with character cells aligned vertically
- [ ] Stepping or playing animates the XOR character-by-character, briefly highlighting each cell as it's computed
- [ ] Visitor can edit plaintext and key in small inputs; ciphertext recomputes
- [ ] The visualization handles non-printable XOR results gracefully (display as hex or escaped form)
- [ ] `crypto.py` and `ciphertext.txt` are downloadable from `/sources/intro-to-programming/crypto/`
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflection drafted and edited; tech sheet auto-generated
- [ ] Theme page lists this project (Text Analysis is explicitly out of scope per PRD)
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
