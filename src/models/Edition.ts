import type { Author } from "@/models/Author";
import type Contributor from "@/models/Contributor";
import type Source from "@/models/Source";

export class Edition {
  id = 0;
  name = "";
  year = "";
  work_id = "";
  author_id = "";
  quality = 0;
  contributor: Contributor | null = null;
  language = "";
  source = "";
  sources: Source[] = [];

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
