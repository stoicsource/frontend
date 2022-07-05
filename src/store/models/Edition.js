import { Model } from '@vuex-orm/core'
import Work from './Work'
import Author from "@/store/models/Author";

export default class Edition extends Model {
  static entity = 'editions'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      year: this.attr(''),
      work_id: this.attr(null),
      author_id: this.attr(null),
      quality: this.attr(null),
      contributor: this.attr(''),

      work: this.belongsTo(Work, 'work_id'),
      author: this.belongsTo(Author, 'author_id')
    }
  }

  get authorsFormatted () {
    return this.author?.name;
  }

  get authorsShortnames () {
    return this.author?.shortestName;
  }
}