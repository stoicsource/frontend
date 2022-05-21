import Content from "@/store/models/Content";

export default {
  loadContent (tocEntries, editions) {
    let tocEntryIdstoLoad = [];
    let editionIdstoLoad = [];
    tocEntries.forEach((tocEntry) => {
      editions.forEach((edition) => {
        if ((tocEntry && edition) && !this.getContentItem(tocEntry, edition)) {
          tocEntryIdstoLoad.push(tocEntry.id);
          editionIdstoLoad.push(edition.id);
        }
      });
    });

    let uniqueEntryIds = [...new Set(tocEntryIdstoLoad)];
    let uniqueEditionIds = [...new Set(editionIdstoLoad)];

    if (uniqueEntryIds.length > 0) {
      let tocParams = uniqueEntryIds.map((tocEntryId) => 'toc_entries[]=' + tocEntryId);
      let editionParams = uniqueEditionIds.map((editionId) => 'editions[]=' + editionId);

      let paramString = editionParams.join('&') + '&' + tocParams.join('&');

      if (paramString !== window.lastRequestParamString) {
        window.lastRequestParamString = paramString;
        return Content.api().get(process.env.VUE_APP_API_URL + '/contents?' + paramString);
      } else {
        return Promise.reject();
      }
    }

    return Promise.resolve();
  },

  getContentItem (tocEntry, edition) {
    return (tocEntry && edition) ? Content.query()
      .where('toc_entry_id', tocEntry.id)
      .where('edition_id', edition.id)
      .first() : null;
  }
}
