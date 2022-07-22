export default {
    jsonUrlToIdObject (jsonUrl) {
        // author: "/api/v2/authors/218"
        let urlElements = jsonUrl ? jsonUrl.split('/') : null;
        let id = urlElements ? urlElements[urlElements.length - 1] : null;
        return { id: parseInt(id) };
    }
}