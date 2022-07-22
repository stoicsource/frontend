import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";

export default {
  loadFullWork (work) {
    if (!work) {
      return;
    }

    let hasEditions = Edition.query().where('work_id', work.id).exists();
    let hasToc = TocEntry.query().where('work_id', work.id).exists();
    let promises = [];

    if (!hasEditions) {
      promises.push(Edition.api().get('editions?work=' + work.id));
    }
    if (!hasToc) {
      promises.push(TocEntry.api().get('toc_entries?work=' + work.id));
    }
    return Promise.all(promises);
  }
}
