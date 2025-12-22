import { describe, expect, test } from "vitest";
import { SelectionInfo } from "../SelectionInfo";

describe("SelectionInfo", () => {
  test("should initialize with default values", () => {
    const selectionInfo = new SelectionInfo();

    expect(selectionInfo.workId).toBe(-1);
    expect(selectionInfo.editionIds).toEqual([]);
    expect(selectionInfo.tocEntryIds).toEqual([]);
  });

  test("selectEdition should replace edition ids", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.editionIds = [104];

    selectionInfo.selectEdition(99);

    expect(selectionInfo.editionIds).toEqual([99]);
  });

  test("selectTocEntry should add toc entry id", () => {
    const selectionInfo = new SelectionInfo();

    selectionInfo.selectTocEntry(1);
    selectionInfo.selectTocEntry(2);

    expect(selectionInfo.tocEntryIds).toEqual([1, 2]);
  });

  test("deselectTocEntry should remove specific toc entry", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.tocEntryIds = [1, 2, 3];

    selectionInfo.deselectTocEntry(2);

    expect(selectionInfo.tocEntryIds).toEqual([1, 3]);
  });

  test("deselectTocEntry should do nothing if entry not found", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.tocEntryIds = [1, 2];

    selectionInfo.deselectTocEntry(99);

    expect(selectionInfo.tocEntryIds).toEqual([1, 2]);
  });

  test("replaceTocEntry should replace all toc entries with single id", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.tocEntryIds = [1, 2, 3];

    selectionInfo.replaceTocEntry(99);

    expect(selectionInfo.tocEntryIds).toEqual([99]);
  });

  test("deselectAllTocEntries should clear all toc entries", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.tocEntryIds = [1, 2, 3];

    selectionInfo.deselectAllTocEntries();

    expect(selectionInfo.tocEntryIds).toEqual([]);
  });

  test("deselectEdition should remove specific edition", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.editionIds = [1, 2, 3];

    selectionInfo.deselectEdition(2);

    expect(selectionInfo.editionIds).toEqual([1, 3]);
  });

  test("deselectEdition should do nothing if edition not found", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.editionIds = [1, 2];

    selectionInfo.deselectEdition(99);

    expect(selectionInfo.editionIds).toEqual([1, 2]);
  });

  test("deselectAllEditions should clear all editions", () => {
    const selectionInfo = new SelectionInfo();
    selectionInfo.editionIds = [1, 2, 3];

    selectionInfo.deselectAllEditions();

    expect(selectionInfo.editionIds).toEqual([]);
  });
});
