import Edition from "@/store/models/Edition";

export default {
  requireEdition (editionId) {
    return Edition.api().get(process.env.VUE_APP_API_URL + '/edition/' + editionId)
  }
}
