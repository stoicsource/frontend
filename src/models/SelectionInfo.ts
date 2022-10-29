export class SelectionInfo {
  workId = -1;
  editionIds: number[] = [];
  tocEntryIds: number[] = [];

  selectTocEntry(tocEntryId: number) {
    this.tocEntryIds.push(tocEntryId);
  }

  deselectTocEntry(tocEntryId: number) {
    const entryIndex = this.tocEntryIds.indexOf(tocEntryId);
    if (entryIndex >= 0) {
      this.tocEntryIds.splice(entryIndex, 1);
    }
  }

  replaceTocEntry(tocEntryId: number) {
    this.tocEntryIds = [tocEntryId];
  }

  deselectAllTocEntries() {
    this.tocEntryIds = [];
  }

  selectEdition(editionId: number) {
    this.editionIds = [editionId];
  }

  deselectEdition(editionId: number) {
    const entryIndex = this.editionIds.indexOf(editionId);
    if (entryIndex >= 0) {
      this.editionIds.splice(entryIndex, 1);
    }
  }

  deselectAllEditions() {
    this.editionIds = [];
  }
}
