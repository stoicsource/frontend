import { describe, expect, test, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useWorksStore } from "../works";
import { useGeneralStore } from "../general";
import api from "@/utils/api";
import { Work } from "@/models/Work";
import { Edition } from "@/models/Edition";
import { Author } from "@/models/Author";
import { TocEntry } from "@/models/TocEntry";

// Mock the API module
vi.mock("@/utils/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("useWorksStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test("should initialize with empty works array", async () => {
    // Mock API responses for initial load
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/works") {
        return Promise.resolve({ data: [] });
      }
      if (url === "/editions") {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    // Wait for initialization
    await vi.waitFor(() => {
      expect(store.works.length).toBe(0);
    });

    expect(store.activeWork).toBeNull();
  });

  test("should load authors, works, and editions on initialization", async () => {
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
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    // Wait for initialization to complete
    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    const work = store.works[0];
    expect(work?.id).toBe(1);
    expect(work?.name).toBe("Meditations");
    expect(work?.author?.name).toBe("Marcus Aurelius");
    expect(work?.editions?.length).toBe(1);
    expect(work?.editions?.[0]?.id).toBe(10);
  });

  test("should set globalLoading to false after initialization", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const generalStore = useGeneralStore();
    const worksStore = useWorksStore();

    expect(generalStore.globalLoading).toBe(true);

    await vi.waitFor(() => {
      expect(generalStore.globalLoading).toBe(false);
    });
  });

  test("loadFullWork should load TOC entries for a work", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Meditations",
        urlSlug: "meditations",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    const mockTocEntries = [
      { id: 100, label: "1.1", sortOrder: 1, previous: null, next: null },
      { id: 101, label: "1.2", sortOrder: 2, previous: null, next: null },
      { id: 102, label: "1.3", sortOrder: 3, previous: null, next: null },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: mockTocEntries });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    // Wait for initial load
    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    // Load TOC entries
    await store.loadFullWork(1);

    const work = store.works[0];
    expect(work?.tocEntries).toBeDefined();
    expect(work?.tocEntries?.length).toBe(3);
    expect(work?.tocEntries?.[0]?.label).toBe("1.1");
    expect(work?.tocEntries?.[1]?.label).toBe("1.2");
  });

  test("loadFullWork should set previous and next references in TOC entries", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Test Work",
        urlSlug: "test-work",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    const mockTocEntries = [
      { id: 1, label: "1.1", sortOrder: 1, previous: null, next: null },
      { id: 2, label: "1.2", sortOrder: 2, previous: null, next: null },
      { id: 3, label: "1.3", sortOrder: 3, previous: null, next: null },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: mockTocEntries });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    await store.loadFullWork(1);

    const work = store.works[0];
    const tocEntries = work?.tocEntries;

    expect(tocEntries?.[0]?.previous).toBeNull();
    expect(tocEntries?.[0]?.next?.id).toBe(2);
    expect(tocEntries?.[1]?.previous?.id).toBe(1);
    expect(tocEntries?.[1]?.next?.id).toBe(3);
    expect(tocEntries?.[2]?.previous?.id).toBe(2);
    expect(tocEntries?.[2]?.next).toBeNull();
  });

  test("loadFullWork should not reload TOC if already loaded", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Test Work",
        urlSlug: "test-work",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    // Load TOC first time
    await store.loadFullWork(1);

    const firstCallCount = vi.mocked(api.get).mock.calls.filter((call) =>
      call[0].startsWith("/toc_entries")
    ).length;

    // Load TOC second time - should not make another API call
    await store.loadFullWork(1);

    const secondCallCount = vi.mocked(api.get).mock.calls.filter((call) =>
      call[0].startsWith("/toc_entries")
    ).length;

    expect(secondCallCount).toBe(firstCallCount);
  });

  test("getWorkByEdition should find work by edition id", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Meditations",
        urlSlug: "meditations",
        author: "http://localhost/api/authors/1",
        editions: ["http://localhost/api/editions/10"],
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

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: mockEditions });
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    const foundWork = store.getWorkByEdition(10);

    expect(foundWork).toBeDefined();
    expect(foundWork?.id).toBe(1);
    expect(foundWork?.name).toBe("Meditations");
  });

  test("getWorkByEdition should return undefined for non-existent edition", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(0);
    });

    const foundWork = store.getWorkByEdition(999);

    expect(foundWork).toBeUndefined();
  });

  test("getRandomWork should return a work from the works array", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Work 1",
        urlSlug: "work-1",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
      {
        id: 2,
        name: "Work 2",
        urlSlug: "work-2",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(2);
    });

    const randomWork = store.getRandomWork();

    expect(randomWork).toBeDefined();
    expect([1, 2]).toContain(randomWork?.id);
  });

  test("getRandomChapterNavigation should return work and toc label", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Test Work",
        urlSlug: "test-work",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    const mockTocEntries = [
      { id: 1, label: "1.1", sortOrder: 1, previous: null, next: null },
      { id: 2, label: "1.2", sortOrder: 2, previous: null, next: null },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: mockTocEntries });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    const result = await store.getRandomChapterNavigation();

    expect(result).toBeDefined();
    expect(result?.work.id).toBe(1);
    expect(["1.1", "1.2"]).toContain(result?.tocLabel);
  });

  test("getRandomChapterNavigation should return null when no works exist", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(0);
    });

    const result = await store.getRandomChapterNavigation();

    expect(result).toBeNull();
  });

  test("getRandomChapterNavigation should return null when work has no TOC entries", async () => {
    const mockWorks = [
      {
        id: 1,
        name: "Test Work",
        urlSlug: "test-work",
        author: "http://localhost/api/authors/1",
        editions: [],
      },
    ];

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/authors") return Promise.resolve({ data: [] });
      if (url === "/works") return Promise.resolve({ data: mockWorks });
      if (url === "/editions") return Promise.resolve({ data: [] });
      if (url.startsWith("/toc_entries")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const store = useWorksStore();

    await vi.waitFor(() => {
      expect(store.works.length).toBe(1);
    });

    const result = await store.getRandomChapterNavigation();

    expect(result).toBeNull();
  });
});
