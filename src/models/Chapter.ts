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
    if (this.notesFormat !== "json") {
      return [];
    }
    try {
      return JSON.parse(this.notes);
    } catch (error) {
      console.error("Failed to parse notes JSON:", error);
      return [];
    }
  }
}
