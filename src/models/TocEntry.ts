export class TocEntry {
  id = 0;
  label = "";
  sortOrder = "";
  previous: TocEntry | null = null;
  next: TocEntry | null = null;
}
