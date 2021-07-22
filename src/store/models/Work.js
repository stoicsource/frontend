import { Model } from '@vuex-orm/core'

import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";
import WorkAuthor from "@/store/models/WorkAuthor";

export default class Work extends Model {
  static entity = 'works'

  static fields () {
    return {
      id: this.attr(null, id => Number(id)),
      name: this.attr(''),
      url_slug: this.attr(''),

      selected: this.boolean(false),

      editions: this.hasMany(Edition, 'work_id'),
      tocEntries: this.hasMany(TocEntry, 'work_id'),
      authors: this.belongsToMany(Author, WorkAuthor, 'work_id', 'author_id')
    }
  }

  static getSelectedWork (withRelations = null) {
    let query = Work.query().where('selected', true);
    if (withRelations) {
      query.with(withRelations);
    }
    return query.first();
  }

  select () {
    if(Work.getSelectedWork()) {
      Work.update({
        where: Work.getSelectedWork().id,
        data: {
          selected: false
        }
      })
    }

    Work.update({
      where: this.id,
      data: {
        selected: true
      }
    })
  }

  get authorsFormatted () {
    return this.authors.map((author) => author.name ).join(',');
  }

  get selectedEditions () {
    return this.editions.filter((edition) => edition.selected );
  }

  hasSelectedEditions () {
    return this.editions.some((edition) => edition.selected );
  }

  hasSelectedTocEntries () {
    return this.tocEntries.some((tocEntry) => tocEntry.selected );
  }
}