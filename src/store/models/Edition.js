import { Model } from '@vuex-orm/core'
import Work from './Work'

export default class Edition extends Model {
  static entity = 'editions'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      year: this.attr(''),
      work_id: this.attr(null),

      work: this.belongsTo(Work, 'work_id')
    }
  }
}