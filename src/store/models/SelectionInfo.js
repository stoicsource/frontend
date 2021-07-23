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
}