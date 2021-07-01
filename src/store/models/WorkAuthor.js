import { Model } from '@vuex-orm/core'

export default class WorkAuthor extends Model {
  static entity = 'workAuthor'

  static primaryKey = ['work_id', 'author_id']

  static fields () {
    return {
      work_id: this.attr(null),
      author_id: this.attr(null)
    }
  }
}