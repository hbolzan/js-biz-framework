if (window._ == undefined) {
    window._ = require("lodash");
}

import {
    datasetStates, recordSates, dataFields, newRow, appendRow, deleteRow
} from "../../logic/data_set.js";

const events = {
    beforeEdit: "beforeEdit",
    afterEdit: "afterEdit",
    beforeInsert: "beforeInsert",
    afterInsert: "afterInsert",
    beforePost: "beforePost",
    afterPost: "afterPost",
    beforeCommit: "beforeCommit",
    onCommit: "onCommit",
    afterCommit: "afterCommit",
    beforeDelete: "beforeDelete",
    afterDelete: "afterDelete",
    onStateChange: "onStateChange",
    onDataChange: "onDataChange",
    beforeScroll: "beforeScroll",
    afterScroll: "afterScroll",
    beforeCancel: "beforeCancel",
    afterCancel: "afterCancel",
    beforeRollback: "beforeRollback",
    afterRollback: "afterRollback",
};

const navMethods = {
    first: (data) => data.rows.length > 0 ? 0 : data.recordIndex,
    prior: (data) => data.recordIndex > 0 ? data.recordIndex - 1 : data.recordIndex,
    next: (data) => data.recordIndex < data.rows.length - 1 ? data.recordIndex + 1 : data.recordIndex,
    last: (data) => data.rows.length - 1,
    goto: (data, gotoIndex) => gotoIndex >= 0 && gotoIndex < data.rows.length ? gotoIndex : data.recordIndex,
};

function throwIfInactive(self, data) {
    if (data == datasetStates.inactive) {
        throw {
            origin: self,
            message: "cannot perform this operation on a closed dataset",
        };
    }
}

function resetData({ rows, recordIndex, state }) {
    return {
        rows: rows || [],
        recordIndex: recordIndex || -1,
        state: state || datasetStates.inactive,
        pending: false,
    };
}

function fieldChangeHandler(self) {
    dataField =>  {
        self.edit();
        data.rows[data.recordIndex][dataField.name] = dataField.value();
        self.events.run(events.onDataChange, [self]);
    };
}

function indexInsideRange(rows, index) {
    return index >= 0 && index < rows.length;
}

const copyRows = rows => _.map(rows, row => Object.assign({}, row));

function DataSet(context) {
    const { BaseComponent, fieldsDefs, eventHandlers } = context;
    let self = BaseComponent(events),
        fields = dataFields({
            ...context,
            dataSet: self,
            eventHandlers: [
                { onChange: fieldChangeHandler(self) },
            ],
        }),
        data = resetData({}),
        cancelInfo = {
            recordIndex: -1,
            row: {},
        },
        rollbackRows = [];

    function loadData(newRows) {
        let rows = _.map(newRows, rowData => newRow(fieldsDefs, rowData));
        data = resetData({
            rows,
            state: datasetStates.browse
        });
        data.recordIndex = navMethods["first"](data);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
        self.events.run(events.onStateChange, [self, data.state]);
        self.events.run(events.afterScroll, [self]);
        return self;
    }

    function setRollbackData() {
        if ( ! data.pending ) {
            rollbackRows = copyRows(data.rows);
        }
    }

    function append() {
        throwIfInactive(self, data);
        cancelInfo = { recordIndex: data.recordIndex };
        setRollbackData();
        self.events.run(events.beforeInsert, [self]);
        data = appendRow(data, fieldsDefs);
        self.events.run(events.afterInsert, [self]);
        self.events.run(events.onStateChange, [self, data.state]);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
        return data.rows[data.recordIndex];
    }

    function edit() {
        throwIfInactive(self, data);
        if (data.state == datasetStates.edit || data.state == datasetStates.insert) {
            return data.rows[data.recordIndex];
        }
        if (data.recordIndex < 0) {
            return append();
        }
        setRollbackData();
        cancelInfo = { row: Object.assign({}, data.rows[data.recordIndex]) };
        self.events.run(events.beforeEdit, [self]);
        data.state = datasetStates.edit;
        self.events.run(events.afterEdit, [self]);
        self.events.run(events.onStateChange, [self, data.state]);
        return data.rows[data.recordIndex];
    }

    function post() {
        self.events.run(events.beforePost, [self]);
        data.state = datasetStates.browse;
        data.pending = true;
        self.events.run(events.afterPost, [self]);
        self.events.run(events.onStateChange, [self, data.state]);
    }

    function cancel() {
        if ( ! [datasetStates.edit, datasetStates.insert].includes(data.state) ) {
            return;
        }
        if (data.state == datasetStates.insert) {
            data = deleteRow(data);
            data.recordIndex = cancelInfo.recordIndex;
        } else {
            data.rows[data.recordIndex] = cancelInfo.row;
        }
        data.state = datasetStates.browse;
        self.events.run(events.beforeCancel, [self]);
        self.events.run(events.afterCancel, [self]);
        self.events.run(events.onStateChange, [self, data.state]);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
    }

    function rollback() {
        throwIfInactive(self, data);
        if ( data.state != datasetStates.browse || ! data.pending ) {
            return;
        }
        self.events.run(events.beforeRollback, [self]);
        data.rows = rollbackRows;
        data.pending = false;
        self.events.run(events.afterRollback, [self]);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
    }

    function commit() {
        throwIfInactive(self, data);
        if ( data.state != datasetStates.browse ) {
            self.post();
        }
        if ( ! data.pending ) {
            return;
        }
        self.events.run(events.beforeCommit, [self]);
        self.events.run(events.onCommit, [self, rollbackRows, data.rows]);
        data.pending = false;
        self.events.run(events.afterCommit, [self]);
    }

    function _delete() {
        let recordCount = data.rows.length;
        self.events.runConfirmation(events.beforeDelete, [self, data.rows[data.recordIndex]], (args) => {
            data = deleteRow(data);
            if (recordCount != data.rows.length) {
                self.events.run(events.afterDelete, [self]);
                self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
            }
        });
    }

    function navigate(direction, gotoIndex) {
        let recordIndex = data.recordIndex;
        self.events.run(events.beforeScroll, [self]);
        data.recordIndex = navMethods[direction](data, gotoIndex);
        self.events.run(events.afterScroll, [self]);
        if (data.recordIndex != recordIndex) {
            self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
        };
    }

    function setData(fieldName, value) {
        throwIfInactive(self, data);
        self.edit();
        data.rows[data.recordIndex][fieldName] = value;
        // self.events.run(events.onDataChange, [self, { name: fieldName, value: () => value }]);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
    }

    function find(pred) {
        return _.reduce(data.rows, (matches, row, key) => pred(row) ? matches.concat(key) : matches, []);
    };

    function seek(rowIndex) {
        if ( ! indexInsideRange(data.rows, rowIndex) ) {
            return null;
        }
        self.events.run(events.beforeScroll, [self]);
        data.recordIndex = rowIndex;
        self.events.run(events.afterScroll, [self]);
        self.events.run(events.onDataChange, [self, data.rows[data.recordIndex]]);
        return data.rows[rowIndex];
    }

    function init() {
        _.each(eventHandlers, (eventHandler) => self.events.on(
            _.keys(eventHandler)[0], _.values(eventHandler)[0]
        ));
        return {};
    }

    return Object.assign(
        self,

        init(),

        _.reduce(navMethods, (nav, _, d) => Object.assign(
            {},
            nav,
            { [d]: gotoIndex => navigate(d, gotoIndex) }
        ), {}),

        {
            fields: () => fields,
            rows: () => data.rows,
            recordIndex: () => data.recordIndex,
            selectedRow: () => data.rows[data.recordIndex],
            recordCount: () => data.rows.length,
            state: () => data.state,
            eof: () => data.recordIndex == data.rows.length-1,
            bof: () => data.recordIndex <= 0,
            isEmpty: () => data.rows.length == 0,
            pending: () => data.pending,

            loadData,
            setData,
            append,
            edit,
            cancel,
            post,
            rollback,
            commit,
            delete: _delete,
            find,
            seek,
        });
}

export default DataSet;
