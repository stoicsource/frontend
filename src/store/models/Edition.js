import { Model } from '@vuex-orm/core'
import Work from './Work'
import Author from "@/store/models/Author";
import AuthorEdition from "@/store/models/AuthorEdition";

export default class Edition extends Model {
  static entity = 'editions'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      year: this.attr(''),
      work_id: this.attr(null),

      checked: this.boolean(false),

      work: this.belongsTo(Work, 'work_id'),
      authors: this.belongsToMany(Author, AuthorEdition, 'edition_id', 'author_id')
    }
  }

  get authorsFormatted () {
    return this.authors.map((author) => author.name ).join(',');
  }
}