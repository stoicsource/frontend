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

      work: this.belongsTo(Work, 'work_id')
    }
  }


  getPrevious () {
    return TocEntry.query().where('work_id', this.work.id).orderBy('sort_order', 'desc').where('sort_order', (value) => value < this.sort_order).first();
  }

  getNext () {
    return TocEntry.query().where('work_id', this.work.id).orderBy('sort_order', 'asc').where('sort_order', (value) => value > this.sort_order).first();
  }

  hasPrevious () {
    return this.getPrevious() !== null;
  }

  hasNext () {
    return this.getNext() !== null;
  }
}