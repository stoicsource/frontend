import { Model } from '@vuex-orm/core'

import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";
import ModelUtils from "./ModelUtils";

export default class Work extends Model {
  static entity = 'works'

  static fields () {
    return {
      id: this.attr(null, id => Number(id)),
      name: this.attr(''),
      urlSlug: this.attr(''),
      author_id: this.attr(null),

      editions: this.hasMany(Edition, 'work_id'),
      tocEntries: this.hasMany(TocEntry, 'work_id'),
      author: this.belongsTo(Author, 'author_id')
    }
  }

  static apiConfig = {
    dataTransformer: ({ data }) => {
      data = Array.isArray(data) ? data : [data];
      data.forEach((work) => {
        work.author = ModelUtils.jsonUrlToIdObject(work.author);
      })

      return data;
    }
  }

  get authorsFormatted () {
    return this.author?.shortName;
  }

  get firstTocEntry () {
    return this.tocEntries.length > 0 ? this.tocEntries[0] : null;
  }
}