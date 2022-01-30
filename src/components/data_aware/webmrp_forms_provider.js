const baseUrl = "/api/forms";
const fieldsDefs = _.map([
    "id",
    "dataset-name",
    "search-fields",
    "search-dataset",
    "title",
    "pk-fields",
    "auto-pk",
    "order-by-fields",
    "permissions",
    "fields-defs"
], fieldName => ({ name: fieldName }));

function urlBuilder({ formsHost }, formId) {
    return `${ formsHost }${ baseUrl }/${ formId }`;
}

function isSearchField(fieldDef) {
    return fieldDef["visible"] &&
        fieldDef["search-visible"] &&
        fieldDef["field-kind"] === "data" &&
        fieldDef["size"] >= 4;
}

function withSearchFields(formData) {
    if ( ! _.isEmpty(formData["search-fields"] )) {
        return formData;
    }
    return {
        ...formData,
        "search-fields": _.map(
            _.filter(formData["fields-defs"], isSearchField),
            fieldDef => fieldDef["name"]
        )
    }.join(",");
}

function getOne(connection, dataSet, key) {
    return connection
        .get(key)
        .then(resp => dataSet.loadData(resp.form.data))
        .then(ds => withSearchFields(ds.rows()[0]));
}

function WebMrpFormsProvider(context, params={}) {
    let self = context.BaseComponent();
    const connection = context.HttpConnection({ ...context, buildUrl: urlBuilder }),
          dataSet = context.DataSet({ fieldsDefs, ...context });

    return Object.assign(self, {
        getOne: formId => getOne(connection, dataSet, formId),
        fieldsDefs,
        dataSet,
    });
}

export default WebMrpFormsProvider;
