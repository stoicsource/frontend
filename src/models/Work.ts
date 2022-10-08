import type { Author } from "@/models/Author";

export class Work {
  id = 0;
  name = "";
  urlSlug = "";

  // editions: this.hasMany(Edition, 'work_id'),
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
}
