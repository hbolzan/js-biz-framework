import smartFields from "../../views/forms/smart_fields.js";
import { complexForm } from "../../views/forms/complex.js";
import { actionGroups } from "../../views/button/toolbar.js";

const refresh = (provider, complexId) => build(load(provider, complexId));

function ComplexForm(context, complexId, parentNodeId) {
    let loaded, built, dataProvider, search;
    const {
        ComplexFormProvider,
        DataProvider,
        ComplexFormDom,
        DataToolbar,
        ModalSearch,
        UIkit,
    } = context,
          self = {},
          translate = context.i18n.translate,
          provider = ComplexFormProvider(context),
          formDom = ComplexFormDom(context, parentNodeId),
          refresh = () => build(load());

    function initSearch(dataProvider) {
        return ModalSearch(
            { dataProvider, ...context },
            {
                onSearch: searchValue => dataProvider.search(searchValue),
                onSelectRow: node => dataProvider.dataSet.seek(node.rowIndex),
            }
        );
    }

    function init(loaded) {
        if ( ! _.isUndefined(dataProvider) ) {
            return;
        }
        loaded.then(data => {
            dataProvider = DataProvider(
                context,
                {
                    fieldsDefs: data["fields-defs"],
                    queryId: data["dataset-name"],
                    searchDataset: data["search-dataset"] || data["dataset-name"],
                    searchFields: data["search-fields"],
                    pkFields: data["pk-fields"],
                }
            );
            setDatasetEventHandlers();
            search = initSearch(dataProvider);
        });
    }

    function load() {
        loaded = provider.getOne(complexId);
        init(loaded);
        return loaded;
    }

    function build(loaded) {
        built = loaded.then(
            data => {
                self.title = data["title"];
                return complexForm(
                    data["title"],
                    smartFields(
                        {
                            ...context,
                            fieldsDefs: data["fields-defs"],
                            dataFields: dataProvider.dataSet.fields(),
                        }
                    ),
                    null,
                    DataToolbar(
                        { ...context, dataProvider, search },
                        [actionGroups.nav, actionGroups.crud, actionGroups.additional],
                    ).hiccup(),
                );
            }
        );
        return built;
    }

    function render() {
        if ( _.isUndefined(built) ) {
            refresh();
        }
        formDom.render(built);
    }

    function setDatasetEventHandlers() {
        dataProvider.dataSet.beforeDelete((args) => {
            return UIkit.modal.confirm(
                translate("Delete current record?"),
                { labels: { cancel: translate("Dismiss"), ok: translate("Confirm") } }
            );
        });

        dataProvider.dataSet.beforeCommit((args) => {
            return UIkit.modal.confirm(
                translate("Confirm changes to current record?"),
                { labels: { cancel: translate("Dismiss"), ok: translate("Confirm") } }
            );
        });
    }

    return Object.assign(
        self,
        {
            definition: callback => loaded.then(data => callback(data)),
            refresh,
            render,
        }
    );
}

export default ComplexForm;
