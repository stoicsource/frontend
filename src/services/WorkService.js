import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";

export default {
  loadingWorkId: null,

  loadFullWork (work) {
    if (!work) {
      return Promise.resolve();
    }

    if (work.id === this.loadingWorkId) {
      return Promise.resolve();
    }

    let hasEditions = Edition.query().where('work_id', work.id).exists();
    let hasToc = TocEntry.query().where('work_id', work.id).exists();
    let promises = [];

    if (!hasEditions) {
      this.loadingWorkId = work.id;
      promises.push(Edition.api().get('editions?work=' + work.id));
    }
    if (!hasToc) {
      this.loadingWorkId = work.id;
      promises.push(TocEntry.api().get('toc_entries?work=' + work.id));
    }
    return Promise.all(promises);
  }
}
