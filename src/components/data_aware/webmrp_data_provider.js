import { withQueryParams } from "../../logic/http.js";
import { rowsDiff } from "../../logic/data_provider.js";
const baseUrl = "/api/data";

function oneUrl({ host }, { key }, provider, source) {
    return `${ host }${ baseUrl }/${ provider }/${ source }/${ key }`;
}

function searchUrl({ host }, { searchValue, searchFilter }, provider, source, searchFields) {
    return withQueryParams(
        `${ host }${ baseUrl }/${ provider }/${ source }`,
        { searchValue, searchFields, ...searchFilter }
    );
}

function expandedResource(resource) {
    const [_provider, _source] = resource.split("."),
          provider = _source  ? _provider : "legacy",
          source = _source || _provider;
    return { provider, source };
}

function buildUrl({ searchDataset, searchFields, filterBy, filterWith }) {
    const { provider, source } = expandedResource(searchDataset);

    return (context, params) => {
        const { mode, key } = params;
        if ( mode === "one" ) {
            return oneUrl(context, params, provider, source);
        }
        return searchUrl(context, params, provider, source, searchFields);
    };
}

function get(connection, dataSet, params) {
    return connection
        .get(params)
        .then(resp => dataSet.loadData(resp.data))
        .then(ds => ds.rows());
}

function getOne(connection, dataSet, key) {
    return connection
        .get({ mode: "one", "key": key })
        .then(resp => dataSet.loadData(resp.data))
        .then(ds => ds.rows()[0]);
}

// preparation for composite queries
const preparedQuery = query => btoa(JSON.stringify(query));

function WebMrpDataProvider(context, params={}) {
    let self = context.BaseComponent(),
        lastSearchValue;

    const connection = context.HttpConnection({ ...context, buildUrl: buildUrl(params) }),
          dataSet = context.DataSet({ fieldsDefs: params.fieldsDefs, ...context });

    dataSet.onCommit((ds, oldRows, newRows) => console.log(rowsDiff(oldRows, newRows)));

    function search(searchValue, searchFilter) {
        return get(connection, dataSet, { mode: "search", searchValue, searchFilter });
    }

    return Object.assign(self, {
        getOne: key => getOne(connection, dataSet, key),
        search,
        fieldsDefs: params.fieldsDefs,
        dataSet,
    });
}

export default WebMrpDataProvider;
