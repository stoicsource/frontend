import { Model } from '@vuex-orm/core'
import Work from './Work'

export default class TocEntry extends Model {
  static entity = 'toc_entries'

  static fields () {
    return {
      id: this.attr(null),
      work_id: this.attr(null),
      label: this.attr(''),
      sort_order: this.number(0),

      selected: this.boolean(false),

      work: this.belongsTo(Work, 'work_id')
    }
  }

  getPrevious () {
    let targetSortOrder = this.sort_order - 1;
    return this.work.tocEntries.find(entry => entry.sort_order === targetSortOrder);
  }

  getNext () {
    let targetSortOrder = this.sort_order + 1;
    return this.work.tocEntries.find(entry => entry.sort_order === targetSortOrder);
  }

  setSelected (selected) {
    TocEntry.update({
      where: this.id,
      data: {
        selected: selected
      }
    })
  }
}