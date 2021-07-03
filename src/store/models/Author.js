import { Model } from '@vuex-orm/core'
import Work from './Work'
import WorkAuthor from "@/store/models/WorkAuthor";
import AuthorEdition from "@/store/models/AuthorEdition";
import Edition from "@/store/models/Edition";

export default class Author extends Model {
  static entity = 'authors'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(''),
      shortName: this.attr(''),
      year: this.attr(''),
      url_slug: this.attr(''),

      works: this.belongsToMany(Work, WorkAuthor, 'author_id', 'work_id'),
      editions: this.belongsToMany(Edition, AuthorEdition, 'author_id', 'edition_id')
    }
  }

  get shortestName () {
    return this.shortName > '' ? this.shortName : this.name;
  }

  get hasSelectedEditions () {
    return this.editions.some(edition => edition.selected);
  }
}