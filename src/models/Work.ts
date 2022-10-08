import type { Author } from "@/models/Author";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";

export class Work {
  id = 0;
  name = "";
  urlSlug = "";

  // tocEntries: this.hasMany(TocEntry, 'work_id'),

  _author?: Author = undefined;
  get author(): Author | undefined {
    return this._author;
  }

  set author(value: Author | undefined) {
    this._author = value;
  }

  _editions?: Edition[] = undefined;
  get editions(): Edition[] | undefined {
    return this._editions;
  }

  set editions(value: Edition[] | undefined) {
    this._editions = value;
  }

  _tocEntries?: TocEntry[] = undefined;
  get tocEntries(): TocEntry[] | undefined {
    return this._tocEntries;
  }

  set tocEntries(value: TocEntry[] | undefined) {
    this._tocEntries = value;
  }

  tocLoaded() {
    return this._tocEntries !== undefined;
  }
}
