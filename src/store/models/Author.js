import { Model } from '@vuex-orm/core'
import Work from './Work'
import WorkAuthor from "@/store/models/WorkAuthor";

export default class Author extends Model {
  static entity = 'authors'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      shortName: this.attr(''),
      year: this.attr(''),

      works: this.belongsToMany(Work, WorkAuthor, 'author_id', 'work_id')
    }
  }

  get shortestName () {
    return this.shortName > '' ? this.shortName : this.name;
  }
}