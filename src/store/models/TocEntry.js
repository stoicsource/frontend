import { Model } from '@vuex-orm/core'
import Work from './Work'

export default class TocEntry extends Model {
  static entity = 'toc_entries'

  static fields () {
    return {
      id: this.attr(null),
      work_id: this.attr(null),
      label: this.attr(''),

      work: this.belongsTo(Work, 'work_id')
    }
  }
}