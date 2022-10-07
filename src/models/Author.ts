export class Author {
  id = 0;
  name = "";
  shortName = "";
  year = "";
  urlSlug = "";
  yearsAlive = "";
  summary = "";
  moreInfoUrl = "";

   works = [];
  // editions: this.hasMany(Edition, 'author_id')

  // constructor(
  //   id: number,
  //   name: string,
  //   shortName: string,
  //   year: string,
  //   urlSlug: string,
  //   yearsAlive: string,
  //   summary: string,
  //   moreInfoUrl: string
  // ) {
  //   this.id = id;
  //   this.name = name;
  //   this.shortName = shortName;
  //   this.year = year;
  //   this.urlSlug = urlSlug;
  //   this.yearsAlive = yearsAlive;
  //   this.summary = summary;
  //   this.moreInfoUrl = moreInfoUrl;
  // }

  shortestName() {
    return this.shortName > "" ? this.shortName : this.name;
  }
}
