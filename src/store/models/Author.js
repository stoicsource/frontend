import { Model } from '@vuex-orm/core'
import Work from './Work'
import Edition from "@/store/models/Edition";

export default class Author extends Model {
  static entity = 'authors'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      shortName: this.attr(''),
      year: this.attr(''),
      urlSlug: this.attr(''),
      yearsAlive: this.attr(''),
      summary: this.attr(''),
      moreInfoUrl: this.attr(''),

      works: this.hasMany(Work, 'author_id'),
      editions: this.hasMany(Edition, 'author_id')
    }
  }

  get shortestName () {
    return this.shortName > '' ? this.shortName : this.name;
  }
}