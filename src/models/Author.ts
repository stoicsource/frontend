export class Author {
  id = 0;
  name = "";
  shortName = "";
  year = "";
  urlSlug = "";
  yearsAlive = "";
  summary = "";
  moreInfoUrl = "";

  shortestName() {
    return this.shortName > "" ? this.shortName : this.name;
  }
}
