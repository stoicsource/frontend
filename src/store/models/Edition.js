import { Model } from '@vuex-orm/core'
import Work from './Work'
import Author from "@/store/models/Author";
import ModelUtils from "./ModelUtils";

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
      language: this.attr(''),
      source: this.attr(''),

      work: this.belongsTo(Work, 'work_id'),
      author: this.belongsTo(Author, 'author_id')
    }
  }

  static apiConfig = {
    dataTransformer: ({ data }) => {
      data = Array.isArray(data) ? data : [data];
      data.forEach((edition) => {
        edition.author = ModelUtils.jsonUrlToIdObject(edition.author);
        edition.work = ModelUtils.jsonUrlToIdObject(edition.work);
      })

      return data;
    }
  }

  get authorsFormatted () {
    return this.author?.name;
  }

  get authorsShortnames () {
    return this.author?.shortestName;
  }
}