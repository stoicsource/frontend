import { Model } from '@vuex-orm/core'

export default class SelectionInfo extends Model {
  static entity = 'selectionInfo'

  static primaryKey = 'workId'

  static fields () {
    return {
      workId: this.attr(null),

      editions: this.attr([]),
      tocEntries: this.attr([])
    }
  }

  selectTocEntry (tocEntryId) {
    this.tocEntries.push(tocEntryId);

    SelectionInfo.update({
      where: this.workId,
      data: {
        tocEntries: this.tocEntries
      }
    })
  }

  deselectTocEntry (tocEntryId) {
    let entryIndex = this.tocEntries.indexOf(tocEntryId);
    if (entryIndex >= 0) {
      this.tocEntries.splice(entryIndex, 1);

      SelectionInfo.update({
        where: this.workId,
        data: {
          tocEntries: this.tocEntries
        }
      })
    }
  }
}