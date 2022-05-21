import { Model } from '@vuex-orm/core'
import TocEntry from "@/store/models/TocEntry";
import Edition from "@/store/models/Edition";

export default class Content extends Model {
  static entity = 'contents'

  static fields () {
    return {
      id: this.attr(null),
      toc_entry_id: this.attr(null),
      edition_id: this.attr(null),
      content: this.attr(''),
      notes: this.attr(''),
      title: this.attr(''),
      contentType: this.attr(''),

      tocEntry: this.belongsTo(TocEntry, 'toc_entry_id'),
      edition: this.belongsTo(Edition, 'edition_id')
    }
  }

  static mutators () {
    return {
      contentType (value) {
        // console.log(value);
        // TODO: why is this being called so many times? Better todo: deliver the proper value from the backend.
        if (value === '' || value === null) {
          return 'text';
        }
        else if (value === 1) {
          return 'text';
        }
        else if (value === 2) {
          return 'html';
        }
        return value;
      }
    }
  }
}