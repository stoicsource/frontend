import type { Author } from "@/models/Author";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";

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

  _tocEntries?: TocEntry[] = undefined;
  get tocEntries(): TocEntry[] {
    if (!this._tocEntries) {
      throw "TocEntries not set";
    }
    return this._tocEntries;
  }

  set tocEntries(value: TocEntry[]) {
    this._tocEntries = value;
  }

  tocLoaded() {
    return this._tocEntries !== undefined;
  }
}
