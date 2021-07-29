import { Model } from '@vuex-orm/core'

import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";
import WorkAuthor from "@/store/models/WorkAuthor";

export default class Work extends Model {
  static entity = 'works'

  static fields () {
    return {
      id: this.attr(null, id => Number(id)),
      name: this.attr(''),
      url_slug: this.attr(''),

      editions: this.hasMany(Edition, 'work_id'),
      tocEntries: this.hasMany(TocEntry, 'work_id'),
      authors: this.belongsToMany(Author, WorkAuthor, 'work_id', 'author_id')
    }
  }

  get authorsFormatted () {
    return this.authors.map((author) => author.shortName ).join(',');
  }
}