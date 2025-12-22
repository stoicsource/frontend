import { describe, expect, test } from "vitest";
import { TocEntry } from "../TocEntry";

describe("TocEntry", () => {
  test("should initialize with default values", () => {
    const entry = new TocEntry();

    expect(entry.id).toBe(0);
    expect(entry.label).toBe("");
    expect(entry.sortOrder).toBe("");
    expect(entry.previous).toBeNull();
    expect(entry.next).toBeNull();
  });

  test("should be assignable with object properties", () => {
    const entry = Object.assign(new TocEntry(), {
      id: 1,
      label: "1.1",
      sortOrder: "001.001",
    });

    expect(entry.id).toBe(1);
    expect(entry.label).toBe("1.1");
    expect(entry.sortOrder).toBe("001.001");
  });

  test("should support previous and next references", () => {
    const prev = new TocEntry();
    prev.id = 1;
    prev.label = "1.0";

    const current = new TocEntry();
    current.id = 2;
    current.label = "1.1";

    const next = new TocEntry();
    next.id = 3;
    next.label = "1.2";

    current.previous = prev;
    current.next = next;

    expect(current.previous?.id).toBe(1);
    expect(current.next?.id).toBe(3);
  });
});
