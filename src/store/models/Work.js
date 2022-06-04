import { Model } from '@vuex-orm/core'

import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";

export default class Work extends Model {
  static entity = 'works'

  static fields () {
    return {
      id: this.attr(null, id => Number(id)),
      name: this.attr(''),
      url_slug: this.attr(''),
      author_id: this.attr(null),

      editions: this.hasMany(Edition, 'work_id'),
      tocEntries: this.hasMany(TocEntry, 'work_id'),
      author: this.belongsTo(Author, 'author_id')
    }
  }

  get authorsFormatted () {
    return this.author?.shortName;
  }
}