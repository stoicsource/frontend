import type { Author } from "@/models/Author";
import type { Edition } from "@/models/Edition";

export class Work {
  id = 0;
  name = "";
  urlSlug = "";

  // tocEntries: this.hasMany(TocEntry, 'work_id'),

  _author?: Author = undefined;
  get author(): Author {
    if (!this._author) {
      throw "Author not set";
    }
    return this._author;
  }

  set author(value: Author) {
    this._author = value;
  }

  _editions?: Edition[] = undefined;
  get editions(): Edition[] {
    if (!this._editions) {
      throw "Editions not set";
    }
    return this._editions;
  }

  set editions(value: Edition[]) {
    this._editions = value;
  }
}
