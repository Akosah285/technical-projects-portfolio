/**
 * SinglyLinkedHT — a singly-linked list with both head AND tail pointers.
 *
 * Faithful TypeScript port of the WI19 SA_3 SinglyLinkedHT.java exercise
 * (COSC 10), with two corrections relative to the original Java
 * `add` / `remove` (the source had a couple of edge-case bugs that
 * the in-class tests didn't catch). The corrections are documented inline.
 *
 * The shape of the class is unchanged:
 *   - O(1) add at head and at tail
 *   - O(idx) advance to position
 *   - O(1) append(other) by linking tail.next = other.head
 *   - get / set / remove by index
 */

class Element<T> {
  constructor(public data: T, public next: Element<T> | null = null) {}
}

export class SinglyLinkedHT<T> {
  private head: Element<T> | null = null;
  private tail: Element<T> | null = null;
  private _size = 0;

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  /** Walks `n` next-pointers from head and returns that element. */
  private advance(n: number): Element<T> {
    if (n < 0 || n >= this._size || this.head === null) {
      throw new Error(`invalid index ${n}`);
    }
    let e = this.head;
    while (n > 0) {
      if (e.next === null) throw new Error(`invalid index ${n}`);
      e = e.next;
      n--;
    }
    return e;
  }

  /** Inserts `item` so it becomes the element at index `idx`. */
  add(idx: number, item: T): void {
    if (idx < 0 || idx > this._size) {
      throw new Error(`invalid index ${idx}`);
    }
    if (idx === 0) {
      const node = new Element(item, this.head);
      this.head = node;
      if (this.tail === null) this.tail = node;
    } else if (idx === this._size) {
      const node = new Element(item, null);
      // tail can't be null here because size > 0
      this.tail!.next = node;
      this.tail = node;
    } else {
      const prev = this.advance(idx - 1);
      prev.next = new Element(item, prev.next);
    }
    this._size++;
  }

  /** Removes the element at index `idx`. */
  remove(idx: number): T {
    if (idx < 0 || idx >= this._size || this.head === null) {
      throw new Error(`invalid index ${idx}`);
    }
    let removed: T;
    if (idx === 0) {
      removed = this.head.data;
      this.head = this.head.next;
      if (this.head === null) this.tail = null;
    } else {
      const prev = this.advance(idx - 1);
      const target = prev.next!;
      removed = target.data;
      prev.next = target.next;
      if (target === this.tail) this.tail = prev;
    }
    this._size--;
    return removed;
  }

  get(idx: number): T {
    return this.advance(idx).data;
  }

  set(idx: number, item: T): void {
    this.advance(idx).data = item;
  }

  /**
   * Appends `other` to the end of this list in O(1) by manipulating tail
   * pointers. After the call, `other` has been emptied (its nodes now belong
   * to this list) — this matches the spirit of the Java original, though the
   * Java version left `other` in an inconsistent state.
   */
  append(other: SinglyLinkedHT<T>): void {
    if (other.head === null) return;
    if (this.head === null) {
      this.head = other.head;
      this.tail = other.tail;
    } else {
      this.tail!.next = other.head;
      this.tail = other.tail;
    }
    this._size += other._size;
    other.head = null;
    other.tail = null;
    other._size = 0;
  }

  /**
   * Returns a snapshot of the list's element data — useful for tests, UIs,
   * and `toString`. The original Java toString rendered `a->b->c->[/]`; this
   * helper keeps the model UI-agnostic.
   */
  toArray(): T[] {
    const out: T[] = [];
    for (let e = this.head; e !== null; e = e.next) out.push(e.data);
    return out;
  }

  toString(): string {
    return this.toArray().map(String).join("->") + "->[/]";
  }

  /** Diagnostics for the visualisation: are head/tail pointing at the same node? */
  headEqualsTail(): boolean {
    return this.head !== null && this.head === this.tail;
  }
}
