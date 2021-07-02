import Edition from "@/store/models/Edition";
import TocEntry from "@/store/models/TocEntry";
import Author from "@/store/models/Author";

export default {
  workSelectDefaults (work) {
    if (!work.hasSelectedEditions()) {
      //let allSelectedAuthors = Author.query().has('editions', (query) => { return query.where('selected', true).count() > 0 }).all();
      //let allSelectedAuthors = Author.query().where('hasSelectedEditions', true).all();
      let allAuthors = Author.query().with('editions').all();
      let allSelectedAuthors = allAuthors.filter((author) => author.hasSelectedEditions );

      let allSelectedAuthorIDs = allSelectedAuthors.map(author => author.id);

      //let editionsOfSelectedAuthors = Edition.query().where('authors')

      let editionsBySelectedAuthors = work.editions.filter((edition) => edition.authors.some((author) => allSelectedAuthorIDs.includes(author.id)));

      editionsBySelectedAuthors.forEach((edition) => {
        Edition.update({
          where: edition.id,
          data: {
            selected: true
          }
        })
      })
    }

    if (!work.hasSelectedTocEntries()) {
      TocEntry.update({
        where: work.tocEntries[0].id,
        data: {
          selected: true
        }
      })
    }
  }
}
