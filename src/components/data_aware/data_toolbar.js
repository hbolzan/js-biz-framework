import { withPrivate } from "../../logic/hiccup.js";
import { toolbarActions, actionGroups, FormToolbar } from "../../views/button/toolbar.js";
import { datasetStates } from "../../logic/data_set.js";
import { navStates, crudStates, additionalStates } from "../../logic/data_toolbar.js";

const groupStates = {
    [actionGroups.nav]: navStates,
    [actionGroups.crud]: crudStates,
    [actionGroups.additional]: additionalStates,
};

function groupedActions({ dataProvider, search }) {
    return {
        [actionGroups.nav]: {
            [toolbarActions.first.action]: () => dataProvider.dataSet.first(),
            [toolbarActions.prior.action]: () => dataProvider.dataSet.prior(),
            [toolbarActions.next.action]: () => dataProvider.dataSet.next(),
            [toolbarActions.last.action]: () => dataProvider.dataSet.last(),
        },
        [actionGroups.crud]: {
            [toolbarActions.append.action]: () => dataProvider.dataSet.append(),
            [toolbarActions.delete.action]: () => dataProvider.dataSet.delete(),
            [toolbarActions.edit.action]: () => dataProvider.dataSet.edit(),
            [toolbarActions.confirm.action]: () => dataProvider.dataSet.commit(),
            [toolbarActions.dismiss.action]: () => dataProvider.dataSet.cancel(),
        },
        [actionGroups.additional]: {
            [toolbarActions.search.action]: () => search.show(),
            [toolbarActions.refresh.action]: () => dataProvider.refresh(),
        },
    };
}

function selectedActions(selectedGroups, allActions) {
    return _.reduce(
        selectedGroups,
        (actions, group) => Object.assign({}, actions, allActions[group]),
        {}
    );
}

function setGroupStates(buttonGroup, states) {
    _.each(buttonGroup, (button, action) => button.setEnabled ? button.setEnabled(states[action]) : null);
}

function DataToolbar(context, groups) {
    const self = context.BaseComponent(),
          actions = selectedActions(groups, groupedActions(context)),
          toolbarEventHandler = (e, action) => actions[action] ? actions[action]() : null,
          toolbars = FormToolbar(context, toolbarEventHandler, groups),
          hiccup = withPrivate(toolbars.hiccupGroups, "notifyWhenReady", () => handleDatasetEvents());

    function handleDatasetEvents(ds) {
        _.each(groupStates, (states, group) => setGroupStates(toolbars.buttonGroups[group], states(ds)));
    }

    function setListeners() {
        context.dataProvider.dataSet.onStateChange(handleDatasetEvents);
        context.dataProvider.dataSet.onDataChange(handleDatasetEvents);
    }

    function init() {
        setListeners();
    }

    init();

    return Object.assign(
        self,
        {
            hiccup: () => hiccup,
        }
    );
}

export default DataToolbar;
