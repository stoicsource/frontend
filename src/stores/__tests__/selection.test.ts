import { describe, expect, test, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useSelectionStore } from "../selection";
import { useWorksStore } from "../works";
import { Work } from "@/models/Work";
import { Edition } from "@/models/Edition";
import { TocEntry } from "@/models/TocEntry";
import { Author } from "@/models/Author";

// Mock localStorage with proxy to handle direct property access
let localStorageData: Record<string, string> = {};
const localStorageMock = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === "getItem")
        return (key: string) => localStorageData[key] || null;
      if (prop === "setItem")
        return (key: string, value: string) => {
          localStorageData[key] = value;
        };
      if (prop === "removeItem")
        return (key: string) => {
          delete localStorageData[key];
        };
      if (prop === "clear")
        return () => {
          localStorageData = {};
        };
      return localStorageData[prop as string];
    },
    set: (target, prop, value) => {
      localStorageData[prop as string] = value;
      return true;
    },
  },
);

vi.stubGlobal("localStorage", localStorageMock);

describe("useSelectionStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageData = {};
  });

  test("should initialize with empty selectionInfos", () => {
    const store = useSelectionStore();

    expect(store.getSelectionInfo(1).workId).toBe(-1);
  });

  test("getSelectionInfo should create new SelectionInfo for work", () => {
    const worksStore = useWorksStore();
    const selectionStore = useSelectionStore();

    // Setup work with editions and toc entries
    const work = new Work();
    work.id = 1;

    const author = new Author();
    author.id = 1;

    const edition = new Edition();
    edition.id = 10;
    edition.language = "eng";
    edition.year = "2002";
    edition.author = author;

    const tocEntry = new TocEntry();
    tocEntry.id = 100;

    work.editions = [edition];
    work.tocEntries = [tocEntry];
    work.author = author;
    worksStore.works.push(work);

    const selectionInfo = selectionStore.getSelectionInfo(1);

    // Should create a selection info with the work id set
    expect(selectionInfo.workId).toBe(1);
    expect(selectionInfo).toBeDefined();
  });

  test("saveToLocalStorage should persist selectionInfos", () => {
    const selectionStore = useSelectionStore();

    selectionStore.saveToLocalStorage();

    expect(localStorageData.selectionInfo).toBeTruthy();
  });

  test("loadFromLocalStorage should handle valid data", () => {
    const selectionStore = useSelectionStore();

    const testData = [
      {
        workId: 1,
        editionIds: [99],
        tocEntryIds: [100],
      },
    ];

    localStorageData.selectionInfo = JSON.stringify(testData);

    selectionStore.loadFromLocalStorage();

    // Should not throw
    expect(true).toBe(true);
  });

  test("loadFromLocalStorage should handle missing localStorage data", () => {
    const selectionStore = useSelectionStore();

    selectionStore.loadFromLocalStorage();

    // Should not throw error
    expect(true).toBe(true);
  });

  test("loadFromLocalStorage should throw on invalid JSON", () => {
    const selectionStore = useSelectionStore();

    localStorageData.selectionInfo = "invalid json";

    expect(() => selectionStore.loadFromLocalStorage()).toThrow();
  });
});
