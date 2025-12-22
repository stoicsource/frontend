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

  author?: Author = undefined;

  get authorsFormatted() {
    return this.author?.name;
  }

  get authorsShortnames() {
    return this.author?.shortestName;
  }
}
