export class SelectionInfo {
  workId = -1;
  editions: number[] = [];
  tocEntries: number[] = [];

  selectTocEntry(tocEntryId: number) {
    this.tocEntries.push(tocEntryId);
  }

  deselectTocEntry(tocEntryId: number) {
    const entryIndex = this.tocEntries.indexOf(tocEntryId);
    if (entryIndex >= 0) {
      this.tocEntries.splice(entryIndex, 1);
    }
  }

  replaceTocEntry(tocEntryId: number) {
    this.tocEntries = [tocEntryId];
  }

  deselectAllTocEntries() {
    this.tocEntries = [];
  }

  selectEdition(editionId: number) {
    this.editions.push(editionId);
  }

  deselectEdition(editionId: number) {
    const entryIndex = this.editions.indexOf(editionId);
    if (entryIndex >= 0) {
      this.editions.splice(entryIndex, 1);
    }
  }

  deselectAllEditions() {
    this.editions = [];
  }
}
