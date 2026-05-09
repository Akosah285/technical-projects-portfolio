import { describe, it, expect } from "vitest";
import { SinglyLinkedHT } from "./linkedList";

describe("SinglyLinkedHT - basics", () => {
  it("starts empty", () => {
    const list = new SinglyLinkedHT<string>();
    expect(list.size()).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.toArray()).toEqual([]);
  });

  it("toString matches the Java -> [/] format", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "a");
    list.add(1, "b");
    list.add(2, "c");
    expect(list.toString()).toBe("a->b->c->[/]");
  });
});

describe("SinglyLinkedHT - add", () => {
  it("adds at head when idx == 0", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "b");
    list.add(0, "a");
    expect(list.toArray()).toEqual(["a", "b"]);
  });

  it("adds at tail when idx == size", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "a");
    list.add(1, "b");
    list.add(2, "c");
    expect(list.toArray()).toEqual(["a", "b", "c"]);
  });

  it("inserts at an interior index", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "a");
    list.add(1, "c");
    list.add(1, "b");
    expect(list.toArray()).toEqual(["a", "b", "c"]);
  });

  it("rejects out-of-range indices", () => {
    const list = new SinglyLinkedHT<string>();
    expect(() => list.add(1, "a")).toThrow();
    expect(() => list.add(-1, "a")).toThrow();
  });

  it("keeps tail pointing at the last node after appends", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "a");
    list.add(1, "b");
    list.add(2, "c");
    // Verify tail is the right one by appending another element via add(size, …)
    list.add(3, "d");
    expect(list.toArray()).toEqual(["a", "b", "c", "d"]);
  });
});

describe("SinglyLinkedHT - remove / get / set", () => {
  const seeded = () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "a");
    list.add(1, "b");
    list.add(2, "c");
    return list;
  };

  it("removes at head", () => {
    const list = seeded();
    expect(list.remove(0)).toBe("a");
    expect(list.toArray()).toEqual(["b", "c"]);
  });

  it("removes at tail and updates the tail pointer", () => {
    const list = seeded();
    expect(list.remove(2)).toBe("c");
    expect(list.toArray()).toEqual(["a", "b"]);
    // Adding another element at the new tail should still work
    list.add(2, "d");
    expect(list.toArray()).toEqual(["a", "b", "d"]);
  });

  it("removes at an interior index", () => {
    const list = seeded();
    expect(list.remove(1)).toBe("b");
    expect(list.toArray()).toEqual(["a", "c"]);
  });

  it("removing the only element clears head AND tail", () => {
    const list = new SinglyLinkedHT<string>();
    list.add(0, "x");
    list.remove(0);
    expect(list.size()).toBe(0);
    expect(list.isEmpty()).toBe(true);
    // After total clear, head/tail are reset, so add must work cleanly
    list.add(0, "y");
    expect(list.toArray()).toEqual(["y"]);
  });

  it("get / set address by index", () => {
    const list = seeded();
    expect(list.get(0)).toBe("a");
    expect(list.get(2)).toBe("c");
    list.set(1, "B");
    expect(list.toArray()).toEqual(["a", "B", "c"]);
  });
});

describe("SinglyLinkedHT - append (the head/tail point of this exercise)", () => {
  it("appending an empty list to an empty list leaves both empty", () => {
    const a = new SinglyLinkedHT<string>();
    const b = new SinglyLinkedHT<string>();
    a.append(b);
    expect(a.toArray()).toEqual([]);
    expect(b.toArray()).toEqual([]);
  });

  it("appending into an empty receiver adopts the other's nodes", () => {
    const a = new SinglyLinkedHT<string>();
    const b = new SinglyLinkedHT<string>();
    b.add(0, "x");
    b.add(1, "y");
    a.append(b);
    expect(a.toArray()).toEqual(["x", "y"]);
    expect(a.size()).toBe(2);
  });

  it("appending a non-empty list onto a non-empty list links them", () => {
    const a = new SinglyLinkedHT<string>();
    a.add(0, "a");
    a.add(1, "b");
    const c = new SinglyLinkedHT<string>();
    c.add(0, "x");
    c.add(1, "y");
    c.add(2, "z");
    a.append(c);
    expect(a.toArray()).toEqual(["a", "b", "x", "y", "z"]);
    expect(a.size()).toBe(5);
  });

  it("after append, the receiver's tail is the last donated node", () => {
    const a = new SinglyLinkedHT<string>();
    a.add(0, "a");
    const b = new SinglyLinkedHT<string>();
    b.add(0, "b");
    b.add(1, "c");
    a.append(b);
    a.add(a.size(), "d"); // exercises the tail pointer
    expect(a.toArray()).toEqual(["a", "b", "c", "d"]);
  });

  it("append empties the donor list", () => {
    const a = new SinglyLinkedHT<string>();
    const b = new SinglyLinkedHT<string>();
    b.add(0, "x");
    a.append(b);
    expect(b.size()).toBe(0);
    expect(b.isEmpty()).toBe(true);
  });
});
