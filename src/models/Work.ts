import type { Author } from "@/models/Author";
import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";

export class Work {
  id = 0;
  name = "";
  urlSlug = "";

  author?: Author = undefined;
  editions?: Edition[] = undefined;
  tocEntries?: TocEntry[] = undefined;

  tocLoaded() {
    return this.tocEntries !== undefined;
  }
}
