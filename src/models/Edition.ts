import type { Author } from "@/models/Author";

export class Edition {
  id = 0;
  name = "";
  year = "";
  work_id = "";
  author_id = "";
  quality = "";
  contributor = "";
  language = "";
  source = "";

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

  get authorsFormatted() {
    return this._author?.name;
  }

  get authorsShortnames() {
    return this._author?.shortestName;
  }
}
