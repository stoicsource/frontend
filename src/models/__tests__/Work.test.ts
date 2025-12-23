import { describe, expect, test } from "vitest";
import { Work } from "../Work";
import { Author } from "../Author";
import { Edition } from "../Edition";
import { TocEntry } from "../TocEntry";

describe("Work", () => {
  test("should initialize with default values", () => {
    const work = new Work();

    expect(work.id).toBe(0);
    expect(work.name).toBe("");
    expect(work.urlSlug).toBe("");
    expect(work.author).toBeUndefined();
    expect(work.editions).toBeUndefined();
    expect(work.tocEntries).toBeUndefined();
  });

  test("should be assignable with object properties", () => {
    const work = Object.assign(new Work(), {
      id: 1,
      name: "Meditations",
      urlSlug: "meditations",
    });

    expect(work.id).toBe(1);
    expect(work.name).toBe("Meditations");
    expect(work.urlSlug).toBe("meditations");
  });

  test("should support author reference", () => {
    const work = new Work();
    const author = new Author();
    author.id = 1;
    author.name = "Marcus Aurelius";

    work.author = author;

    expect(work.author?.id).toBe(1);
    expect(work.author?.name).toBe("Marcus Aurelius");
  });

  test("should support editions array", () => {
    const work = new Work();
    const edition1 = new Edition();
    edition1.id = 1;

    const edition2 = new Edition();
    edition2.id = 2;

    work.editions = [edition1, edition2];

    expect(work.editions).toHaveLength(2);
    expect(work.editions[0]?.id).toBe(1);
  });

  test("should support tocEntries array", () => {
    const work = new Work();
    const toc1 = new TocEntry();
    toc1.id = 1;
    toc1.label = "1.1";

    const toc2 = new TocEntry();
    toc2.id = 2;
    toc2.label = "1.2";

    work.tocEntries = [toc1, toc2];

    expect(work.tocEntries).toHaveLength(2);
    expect(work.tocEntries[1]?.label).toBe("1.2");
  });

  test("tocLoaded() should return false when tocEntries is undefined", () => {
    const work = new Work();

    expect(work.tocLoaded()).toBe(false);
  });

  test("tocLoaded() should return true when tocEntries is defined", () => {
    const work = new Work();
    work.tocEntries = [];

    expect(work.tocLoaded()).toBe(true);
  });

  test("tocLoaded() should return true even for empty array", () => {
    const work = new Work();
    work.tocEntries = [];

    expect(work.tocLoaded()).toBe(true);
  });
});
