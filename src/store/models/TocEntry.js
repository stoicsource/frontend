import { Model } from '@vuex-orm/core'
import Work from './Work'
import ModelUtils from "./ModelUtils";

export default class TocEntry extends Model {
  static entity = 'toc_entries'

  static fields () {
    return {
      id: this.attr(null),
      work_id: this.attr(null),
      label: this.attr(''),
      sortOrder: this.number(0),

      work: this.belongsTo(Work, 'work_id')
    }
  }

  static apiConfig = {
    dataTransformer: ({ data }) => {
      data = Array.isArray(data) ? data : [data];
      data.forEach((tocEntry) => {
        tocEntry.work = ModelUtils.jsonUrlToIdObject(tocEntry.work);
      })

      return data;
    }
  }

  getPrevious () {
    return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'desc').where('sortOrder', (value) => value < this.sortOrder).first();
  }

  getNext () {
    return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'asc').where('sortOrder', (value) => value > this.sortOrder).first();
  }

  hasPrevious () {
    return this.getPrevious() !== null;
  }

  hasNext () {
    return this.getNext() !== null;
  }
}