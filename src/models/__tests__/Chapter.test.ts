import { describe, expect, test, vi } from "vitest";
import { Chapter } from "../Chapter";
import { Edition } from "../Edition";
import { TocEntry } from "../TocEntry";

describe("Chapter", () => {
  test("should initialize with default values", () => {
    const chapter = new Chapter();

    expect(chapter.id).toBe(0);
    expect(chapter.content).toBe("");
    expect(chapter.notes).toBe("");
    expect(chapter.notesFormat).toBe("");
    expect(chapter.title).toBe("");
    expect(chapter.contentType).toBe("");
    expect(chapter.tocEntry).toBeNull();
    expect(chapter.edition).toBeNull();
  });

  test("should be assignable with object properties", () => {
    const chapter = Object.assign(new Chapter(), {
      id: 1,
      content: "Test content",
      title: "Test Chapter",
      contentType: "html",
    });

    expect(chapter.id).toBe(1);
    expect(chapter.content).toBe("Test content");
    expect(chapter.title).toBe("Test Chapter");
  });

  test("jsonNotes should return empty array when notesFormat is not json", () => {
    const chapter = new Chapter();
    chapter.notesFormat = "text";
    chapter.notes = "Some text notes";

    expect(chapter.jsonNotes).toEqual([]);
  });

  test("jsonNotes should parse valid JSON notes", () => {
    const chapter = new Chapter();
    chapter.notesFormat = "json";
    chapter.notes = JSON.stringify([
      { id: 1, content: "Note 1" },
      { id: 2, content: "Note 2" },
    ]);

    const result = chapter.jsonNotes;

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].content).toBe("Note 2");
  });

  test("jsonNotes should return empty array on malformed JSON", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const chapter = new Chapter();
    chapter.notesFormat = "json";
    chapter.notes = "{ invalid json }";

    const result = chapter.jsonNotes;

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to parse notes JSON:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  test("should support edition and tocEntry references", () => {
    const chapter = new Chapter();
    const edition = new Edition();
    edition.id = 5;

    const tocEntry = new TocEntry();
    tocEntry.id = 10;

    chapter.edition = edition;
    chapter.tocEntry = tocEntry;

    expect(chapter.edition?.id).toBe(5);
    expect(chapter.tocEntry?.id).toBe(10);
  });
});
