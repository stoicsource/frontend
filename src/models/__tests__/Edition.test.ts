import { describe, expect, test } from "vitest";
import { Edition } from "../Edition";
import { Author } from "../Author";

describe("Edition", () => {
  test("should initialize with default values", () => {
    const edition = new Edition();

    expect(edition.id).toBe(0);
    expect(edition.name).toBe("");
    expect(edition.year).toBe("");
    expect(edition.work_id).toBe("");
    expect(edition.author_id).toBe("");
    expect(edition.quality).toBe(0);
    expect(edition.contributor).toBeNull();
    expect(edition.language).toBe("");
    expect(edition.source).toBe("");
    expect(edition.sources).toEqual([]);
    expect(edition.author).toBeUndefined();
  });

  test("should be assignable with object properties", () => {
    const edition = Object.assign(new Edition(), {
      id: 1,
      name: "Hays Translation",
      year: "2002",
      quality: 8,
      language: "eng",
    });

    expect(edition.id).toBe(1);
    expect(edition.name).toBe("Hays Translation");
    expect(edition.year).toBe("2002");
    expect(edition.quality).toBe(8);
  });

  test("should support author reference", () => {
    const edition = new Edition();
    const author = new Author();
    author.id = 1;
    author.name = "Gregory Hays";

    edition.author = author;

    expect(edition.author?.id).toBe(1);
    expect(edition.author?.name).toBe("Gregory Hays");
  });

  test("authorsFormatted should return author name when available", () => {
    const edition = new Edition();
    const author = new Author();
    author.name = "Gregory Hays";

    edition.author = author;

    expect(edition.authorsFormatted).toBe("Gregory Hays");
  });

  test("authorsFormatted should return undefined when author is not set", () => {
    const edition = new Edition();

    expect(edition.authorsFormatted).toBeUndefined();
  });

  test("authorsShortnames should return shortestName() method reference", () => {
    const edition = new Edition();
    const author = new Author();
    author.name = "Gregory Hays";
    author.shortName = "Hays";

    edition.author = author;

    expect(edition.authorsShortnames).toBe(author.shortestName);
    expect(typeof edition.authorsShortnames).toBe("function");
  });

  test("authorsShortnames should return undefined when author is not set", () => {
    const edition = new Edition();

    expect(edition.authorsShortnames).toBeUndefined();
  });

  test("should support contributor object", () => {
    const edition = new Edition();
    edition.contributor = {
      name: "John Doe",
      email: "john@example.com",
      website: "https://example.com",
    };

    expect(edition.contributor.name).toBe("John Doe");
    expect(edition.contributor.email).toBe("john@example.com");
  });

  test("should support sources array", () => {
    const edition = new Edition();
    edition.sources = [
      { url: "https://example.com/1", type: "web" },
      { url: "https://example.com/2", type: "pdf" },
    ];

    expect(edition.sources).toHaveLength(2);
    expect(edition.sources[0].type).toBe("web");
  });
});
