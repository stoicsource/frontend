import { describe, expect, test, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useChaptersStore } from "../chapters";
import { useWorksStore } from "../works";
import api from "@/utils/api";
import { Work } from "@/models/Work";
import { Edition } from "@/models/Edition";
import { TocEntry } from "@/models/TocEntry";

// Mock the API module
vi.mock("@/utils/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("useChaptersStore", () => {
  let worksStore: ReturnType<typeof useWorksStore>;
  let chaptersStore: ReturnType<typeof useChaptersStore>;
  let testWork: Work;
  let testEdition: Edition;
  let testTocEntry1: TocEntry;
  let testTocEntry2: TocEntry;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Setup test data structure
    const mockAuthors = [
      {
        id: 1,
        name: "Marcus Aurelius",
        shortName: "Marcus",
        shortestName: "Marcus",
        urlSlug: "marcus-aurelius",
      },
    ];

    const mockEditions = [
      {
        id: 10,
        name: "Hays Translation",
        year: "2002",
        language: "eng",
        quality: 8,
        work_id: "1",
        author_id: "1",
        contributor: null,
        source: "",
        sources: [],
        author: "http://localhost/api/authors/1",
      },
    ];

    const mockWorks = [
      {
        id: 1,
        name: "Meditations",
        urlSlug: "meditations",
        author: "http://localhost/api/authors/1",
        editions: ["http://localhost/api/editions/10"],
      },
    ];

    const mockTocEntries = [
      { id: 100, label: "1.1", sortOrder: 1, previous: null, next: null },
      { id: 101, label: "1.2", sortOrder: 2, previous: null, next: null },
      { id: 102, label: "1.3", sortOrder: 3, previous: null, next: null },
    ];

    // Mock API calls for initial setup
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") {
        return Promise.resolve({ data: mockAuthors });
      }
      if (url === "/works") {
        return Promise.resolve({ data: mockWorks });
      }
      if (url === "/editions") {
        return Promise.resolve({ data: mockEditions });
      }
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: mockTocEntries });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    // Initialize works store
    worksStore = useWorksStore();

    // Wait for works store to initialize
    await vi.waitFor(() => {
      expect(worksStore.works.length).toBe(1);
    });

    // Load TOC entries
    await worksStore.loadFullWork(1);

    // Get references to test objects
    testWork = worksStore.works[0]!;
    testEdition = testWork.editions![0]!;
    testTocEntry1 = testWork.tocEntries![0]!;
    testTocEntry2 = testWork.tocEntries![1]!;

    // Initialize chapters store
    chaptersStore = useChaptersStore();
  });

  test("should initialize with empty chapters array", () => {
    expect(chaptersStore.chaptersLoading).toBe(false);
  });

  test("requireChapter should load a single chapter", async () => {
    const mockChapterResponse = [
      {
        id: 1000,
        content: "Test content",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.1",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/100",
        edition: "http://localhost/api/editions/10",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    await chaptersStore.requireChapter(testTocEntry1, testEdition);

    const loadedChapter = chaptersStore.getChapter(testTocEntry1, testEdition);

    expect(loadedChapter).toBeDefined();
    expect(loadedChapter?.id).toBe(1000);
    expect(loadedChapter?.content).toBe("Test content");
    expect(loadedChapter?.tocEntry?.id).toBe(100);
    expect(loadedChapter?.edition?.id).toBe(10);
  });

  test("requireChapter should load multiple chapters with padding", async () => {
    const mockChapterResponse = [
      {
        id: 1000,
        content: "Content 1.1",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.1",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/100",
        edition: "http://localhost/api/editions/10",
      },
      {
        id: 1001,
        content: "Content 1.2",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.2",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/101",
        edition: "http://localhost/api/editions/10",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    // Request middle chapter, which should also load previous and next due to padding
    await chaptersStore.requireChapter(testTocEntry2, testEdition);

    expect(chaptersStore.isChapterLoaded(testTocEntry1, testEdition)).toBe(
      true,
    );
    expect(chaptersStore.isChapterLoaded(testTocEntry2, testEdition)).toBe(
      true,
    );
  });

  test("requireChapter should not reload already loaded chapters", async () => {
    const mockChapterResponse = [
      {
        id: 1000,
        content: "Test content",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.1",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/100",
        edition: "http://localhost/api/editions/10",
      },
      {
        id: 1001,
        content: "Test content 2",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.2",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/101",
        edition: "http://localhost/api/editions/10",
      },
    ];

    let callCount = 0;
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        callCount++;
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    // Load chapter first time
    await chaptersStore.requireChapter(testTocEntry1, testEdition);

    expect(callCount).toBe(1);

    // Try to load same chapter again - should not make another API call
    await chaptersStore.requireChapter(testTocEntry1, testEdition);

    expect(callCount).toBe(1);
  });

  test("isChapterLoaded should return false for unloaded chapter", () => {
    expect(chaptersStore.isChapterLoaded(testTocEntry1, testEdition)).toBe(
      false,
    );
  });

  test("isChapterLoaded should return true for loaded chapter", async () => {
    const mockChapterResponse = [
      {
        id: 1000,
        content: "Test content",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.1",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/100",
        edition: "http://localhost/api/editions/10",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    await chaptersStore.requireChapter(testTocEntry1, testEdition);

    expect(chaptersStore.isChapterLoaded(testTocEntry1, testEdition)).toBe(
      true,
    );
  });

  test("getChapter should return undefined for unloaded chapter", () => {
    const chapter = chaptersStore.getChapter(testTocEntry1, testEdition);

    expect(chapter).toBeUndefined();
  });

  test("getChapter should return loaded chapter", async () => {
    const mockChapterResponse = [
      {
        id: 1000,
        content: "Test content",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.1",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/100",
        edition: "http://localhost/api/editions/10",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    await chaptersStore.requireChapter(testTocEntry1, testEdition);

    const chapter = chaptersStore.getChapter(testTocEntry1, testEdition);

    expect(chapter).toBeDefined();
    expect(chapter?.id).toBe(1000);
    expect(chapter?.content).toBe("Test content");
  });

  test("getRandomChapter should load and return a random chapter", async () => {
    const mockRandomChapterResponse = [
      {
        id: 2000,
        content: "Random content",
        notes: "",
        notesFormat: "",
        title: "Random Chapter",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/101",
        edition: "http://localhost/api/editions/10",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?order[random]")) {
        return Promise.resolve({ data: mockRandomChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    const chapter = await chaptersStore.getRandomChapter();

    expect(chapter).toBeDefined();
    expect(chapter.id).toBe(2000);
    expect(chapter.content).toBe("Random content");
    expect(chapter.tocEntry?.id).toBe(101);
    expect(chapter.edition?.id).toBe(10);
  });

  test("getRandomChapter should load work TOC if not loaded", async () => {
    const mockTocEntries = [
      { id: 200, label: "1.4", sortOrder: 4, previous: null, next: null },
    ];

    const mockRandomChapterResponse = [
      {
        id: 3000,
        content: "Content from chapter without TOC loaded initially",
        notes: "",
        notesFormat: "",
        title: "Chapter 1.4",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/200",
        edition: "http://localhost/api/editions/10",
      },
    ];

    // Create a work with TOC entries but reference a new TOC entry that requires loading
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?order[random]")) {
        return Promise.resolve({ data: mockRandomChapterResponse });
      }
      if (url.startsWith("/toc_entries?work=1")) {
        return Promise.resolve({ data: mockTocEntries });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    // Clear the TOC to simulate unloaded state
    testWork.tocEntries = undefined;

    const chapter = await chaptersStore.getRandomChapter();

    expect(chapter).toBeDefined();
    expect(chapter.id).toBe(3000);
    // Verify TOC was loaded
    expect(testWork.tocLoaded()).toBe(true);
  });

  test("chapterFromResponse should throw error if work not completely loaded", async () => {
    // Create a work without editions or TOC entries
    const incompleteWork = Object.assign(new Work(), {
      id: 99,
      name: "Incomplete Work",
      editions: [],
      tocEntries: [],
    });
    worksStore.works.push(incompleteWork);

    const mockChapterResponse = [
      {
        id: 9999,
        content: "Test",
        notes: "",
        notesFormat: "",
        title: "Test",
        contentType: "html",
        tocEntry: "http://localhost/api/toc_entries/999",
        edition: "http://localhost/api/editions/999",
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.startsWith("/chapters?")) {
        return Promise.resolve({ data: mockChapterResponse });
      }
      return Promise.reject(new Error("Unexpected URL: " + url));
    });

    const testEdition = Object.assign(new Edition(), { id: 999 });
    const testTocEntry = Object.assign(new TocEntry(), { id: 999 });

    // This should throw when trying to create chapter from response
    await expect(
      chaptersStore.requireChapter(testTocEntry, testEdition),
    ).rejects.toThrow("Work not completely loaded");
  });
});
