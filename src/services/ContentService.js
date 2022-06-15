import Content from "@/store/models/Content";

export default {
  entryPadding: 1,
  lastRequestParamString: null,

  requireContent(tocEntry, edition) {
    if (!tocEntry || !edition) {
      return Promise.reject();
    }

    let requiredEntries = [tocEntry];

    if (this.entryPadding === 1) {
      requiredEntries.push(tocEntry.getPrevious());
      requiredEntries.push(tocEntry.getNext());
    }

    let tocIdsToLoad = [];
    requiredEntries.forEach(function (tocEntry) {
      let alreadyLoaded = Content.query()
        .where('toc_entry_id', tocEntry.id)
        .where('edition_id', edition.id)
        .exists();

      if (!alreadyLoaded) {
        tocIdsToLoad.push(tocEntry.id);
      }
    });

    if (tocIdsToLoad.length > 0) {
      let tocParams = tocIdsToLoad.map((tocEntryId) => 'toc_entries[]=' + tocEntryId);
      let editionParams = ['editions[]=' + edition.id];

      let paramString = editionParams.join('&') + '&' + tocParams.join('&');

      if (paramString !== this.lastRequestParamString) {
        this.lastRequestParamString = paramString;
        return Content.api().get(process.env.VUE_APP_API_URL + '/contents?' + paramString);
      } else {
        return Promise.reject();
      }
    }

    return Promise.resolve();
  },

  isContentItemLoaded (tocEntry, edition) {
    return (tocEntry && edition) ? Content.query()
      .where('toc_entry_id', tocEntry.id)
      .where('edition_id', edition.id)
      .exists() : null;
  },

  getContentItem (tocEntry, edition) {
    return (tocEntry && edition) ? Content.query()
      .where('toc_entry_id', tocEntry.id)
      .where('edition_id', edition.id)
      .first() : null;
  }
}
