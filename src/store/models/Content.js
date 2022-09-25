import { Model } from '@vuex-orm/core'
import TocEntry from "@/store/models/TocEntry";
import Edition from "@/store/models/Edition";
import ModelUtils from "./ModelUtils";

export default class Content extends Model {
  static entity = 'contents'

  static fields () {
    return {
      id: this.attr(null),
      toc_entry_id: this.attr(null),
      edition_id: this.attr(null),
      content: this.attr(''),
      notes: this.attr(''),
      notesFormat: this.attr(''),
      title: this.attr(''),
      contentType: this.attr(''),

      tocEntry: this.belongsTo(TocEntry, 'toc_entry_id'),
      edition: this.belongsTo(Edition, 'edition_id')
    }
  }

  static apiConfig = {
    dataTransformer: ({ data }) => {
      data = Array.isArray(data) ? data : [data];
      data.forEach((edition) => {
        edition.tocEntry = ModelUtils.jsonUrlToIdObject(edition.tocEntry);
        edition.edition = ModelUtils.jsonUrlToIdObject(edition.edition);
      })

      return data;
    }
  }

  get jsonNotes () {
    return this.notesFormat === 'json' ? JSON.parse(this.notes) : [];
  }
}