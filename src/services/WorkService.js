import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Work from "@/store/models/Work";

export default {
  loadFullWork (work) {
    if (!work) {
      return;
    }

    let hasEditions = Edition.query().where('work_id', work.id).exists();
    let hasToc = TocEntry.query().where('work_id', work.id).exists();

    if (!hasEditions || !hasToc) {
      Work.api().get(process.env.VUE_APP_API_URL + '/work/' + work.id)
    }
  }
}
