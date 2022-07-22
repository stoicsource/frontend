import Edition from "@/store/models/Edition";

export default {
  requireEdition (editionId) {
    return Edition.api().get('editions/' + editionId)
  }
}
