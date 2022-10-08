export class TocEntry {
  id = 0;
  work_id = "";
  label = "";
  sortOrder = "";

  // TODO: move to Work?
  getPrevious () {
    //return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'desc').where('sortOrder', (value) => value < this.sortOrder).first();
    return null;
  }

  getNext () {
    // return TocEntry.query().where('work_id', this.work.id).orderBy('sortOrder', 'asc').where('sortOrder', (value) => value > this.sortOrder).first();
    return null;
  }

  hasPrevious () {
    // return this.getPrevious() !== null;
    return true;
  }

  hasNext () {
    // return this.getNext() !== null;
    return true;
  }
}
