import SelectionInfo from "@/store/models/SelectionInfo";
import Edition from "@/store/models/Edition";
import Work from "@/store/models/Work";

export default {
  getSelectionInfo(workId) {
    if (!workId) {
      return null;
    }

    let selectionInfo = SelectionInfo.find(workId);

    if (!selectionInfo) {
      let work = Work.query().whereId(workId).with(['tocEntries']).first();
      selectionInfo = new SelectionInfo();
      selectionInfo.workId = workId;

      selectionInfo.tocEntries = work.tocEntries.length > 0 ? [work.tocEntries[0].id] : [];

      let latest = Edition.query()
          .where('work_id', work.id)
          .where('language', 'eng')
          .orderBy('year', 'desc')
          .limit(1).get();
      selectionInfo.editions = latest.map(edition => edition.id);

      SelectionInfo.insert({ data: selectionInfo });
    }

    return selectionInfo;
  },

  saveToLocalStorage () {
    let allInfo = SelectionInfo.all();
    localStorage.selectionInfo = JSON.stringify(allInfo);
  },

  loadFromLocalStorage () {
    if (localStorage.selectionInfo) {
      SelectionInfo.create({data: JSON.parse(localStorage.selectionInfo)})
    }
  }
}
