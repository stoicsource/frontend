import { describe, expect, test } from "vitest";
import { Author } from "../Author";

describe("Author", () => {
  test("should initialize with default values", () => {
    const author = new Author();

    expect(author.id).toBe(0);
    expect(author.name).toBe("");
    expect(author.shortName).toBe("");
    expect(author.urlSlug).toBe("");
  });

  test("shortestName() should return shortName when available", () => {
    const author = new Author();
    author.shortName = "Marcus";
    author.name = "Marcus Aurelius";

    expect(author.shortestName()).toBe("Marcus");
  });

  test("shortestName() should return name when shortName is empty", () => {
    const author = new Author();
    author.name = "Marcus Aurelius";
    author.shortName = "";

    expect(author.shortestName()).toBe("Marcus Aurelius");
  });

  test("shortestName() should return empty string when both are empty", () => {
    const author = new Author();

    expect(author.shortestName()).toBe("");
  });

  test("should be assignable with object properties", () => {
    const author = Object.assign(new Author(), {
      id: 1,
      name: "Epictetus",
      shortName: "Epictetus",
      urlSlug: "epictetus",
    });

    expect(author.id).toBe(1);
    expect(author.name).toBe("Epictetus");
    expect(author.shortestName()).toBe("Epictetus");
  });
});
