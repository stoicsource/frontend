export class TocEntry {
  id = 0;
  work_id = "";
  label = "";
  sortOrder = "";

  // getPrevious () {
  //   return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'desc').where('sortOrder', (value) => value < this.sortOrder).first();
  // }
  //
  // getNext () {
  //   return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'asc').where('sortOrder', (value) => value > this.sortOrder).first();
  // }
  //
  // hasPrevious () {
  //   return this.getPrevious() !== null;
  // }
  //
  // hasNext () {
  //   return this.getNext() !== null;
  // }
}
