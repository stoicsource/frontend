import { Model } from '@vuex-orm/core'

import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";

export default class Work extends Model {
  static entity = 'works'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),

      editions: this.hasMany(Edition, 'work_id'),
      tocEntries: this.hasMany(TocEntry, 'work_id')
    }
  }
}