export default class StoreUtils {
  static extractIdFromJsonUrl(jsonUrl: string) {
    // e.g.: author: "/api/v2/authors/218"
    const urlElements = jsonUrl ? jsonUrl.split("/") : null;
    const id = urlElements ? (urlElements[urlElements.length - 1] || "") : "";
    return parseInt(id);
  }
}
