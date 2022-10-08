import type { Edition } from "@/models/Edition";
import type { TocEntry } from "@/models/TocEntry";

export class Chapter {
  id = 0;
  content = "";
  notes = "";
  notesFormat = "";
  title = "";
  contentType = "";

  tocEntry: TocEntry | null = null;
  edition: Edition | null = null;

  get jsonNotes() {
    return this.notesFormat === "json" ? JSON.parse(this.notes) : [];
  }
}
