import Edition from "@/store/models/Edition";
import SelectionInfo from "@/store/models/SelectionInfo";
import TocEntry from "@/store/models/TocEntry";
import Work from "@/store/models/Work";

export default {
  workSelectDefaults (work) {
    if (!work) {
      return;
    }

    // console.log(work);
    // let selectionInfo = store.getters['app/getSelectionInfoForWork'](work.id);
    let selectionInfo = SelectionInfo.find(work.id);

    if (!selectionInfo) {
      selectionInfo = new SelectionInfo();
      selectionInfo.workId = work.id;
    }

    if (selectionInfo.editions.length === 0 || selectionInfo.tocEntries.length === 0) {
      // console.log('creating defaults for work ' + work.name);
      // let allAuthors = Author.query().with('editions').all();
      // let allSelectedAuthors = allAuthors.filter((author) => author.hasSelectedEditions);
      //
      // let allSelectedAuthorIDs = allSelectedAuthors.map(author => author.id);
      //
      let editionsBySelectedAuthors = []; // work.editions.filter((edition) => edition.authors.some((author) => allSelectedAuthorIDs.includes(author.id)));

      if (editionsBySelectedAuthors.length > 0) {
        editionsBySelectedAuthors.forEach((edition) => {
          Edition.update({
            where: edition.id,
            data: {
              selected: true
            }
          })
        })
      } else {
        let latestTwo = Edition.query().where('work_id', work.id).orderBy('year', 'desc').limit(2).get();

        selectionInfo.editions = latestTwo.map(edition => edition.id);
      }

      selectionInfo.tocEntries = work.tocEntries.length > 0 ? [work.tocEntries[0].id] : [];

      SelectionInfo.insert({ data: selectionInfo });
    }
  },

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
