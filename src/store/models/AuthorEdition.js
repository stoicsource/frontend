import { Model } from '@vuex-orm/core'

export default class AuthorEdition extends Model {
  static entity = 'authorEdition'

  static primaryKey = ['author_id', 'edition_id']

  static fields () {
    return {
      author_id: this.attr(null),
      edition_id: this.attr(null)
    }
  }
}