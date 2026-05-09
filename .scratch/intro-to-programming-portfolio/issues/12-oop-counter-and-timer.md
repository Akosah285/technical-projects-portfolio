---
Status: needs-triage
Type: AFK
---

# Object-Oriented Design — Counter + Timer live-running classes

## Parent

[Intro to Programming Portfolio (FA18) — Site MVP](../PRD.md)

## What to build

A project page at `/courses/intro-to-programming/object-oriented-design/counter-and-timer/` showing the OOP `Counter` and `Timer` classes from the original `counterclass.py` and `timer.py` running live. The visitor sees:

- A `Counter` instance with **increment**, **decrement**, and **reset** buttons; the count value updates live.
- A `Timer` instance with **start**, **pause**, and **reset** buttons; elapsed time updates live in milliseconds.
- A small "method calls" log alongside each demo, listing each method invocation as the visitor triggers it (so the abstraction is visibly tied to the public API).
- The Code Viewer presents `counterclass.py`, `counter_test.py`, `timer.py`, `timer_test.py` in a tabbed view.

This is bundled as a single project because Counter and Timer are conceptually a single OOP exercise — both demonstrate the same idea (encapsulating state + behavior in a class with public methods).

## Acceptance criteria

- [ ] Project page renders with the full project-card layout
- [ ] Counter demo shows live count, with increment / decrement / reset buttons working
- [ ] Timer demo shows live elapsed time in milliseconds, with start / pause / reset working accurately
- [ ] Both demos display a method-call log that updates as the visitor interacts
- [ ] Code viewer presents all four `.py` files (`counterclass.py`, `counter_test.py`, `timer.py`, `timer_test.py`) in a tabbed view
- [ ] All four source files are downloadable from `/sources/intro-to-programming/counter-and-timer/`
- [ ] Original screenshots (if present) converted and shown
- [ ] Reflection drafted and edited; tech sheet auto-generated
- [ ] Theme page lists this project as the sole entry in the OOP theme
- [ ] Live deploy verified

## Blocked by

- 02-towers-of-hanoi-tracer-bullet.md
