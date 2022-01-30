if (window._ == undefined) {
    window._ = require("lodash");
}

const datasetStates = {
    inactive: "inactive",
    browse: "browse",
    edit: "edit",
    insert: "insert",
};

const recordStates = {
    new: "new",
    browse: "browse",
    edit: "edit",
};

function dataFields(context) {
    const { BaseComponent, dataSet, fieldsDefs, DataField, eventHandlers } = context;
    return _.reduce(
        fieldsDefs,
        (fields, fieldDef) => Object.assign({
            [fieldDef.name]: DataField(context, fieldDef, dataSet, eventHandlers || [])
        }, fields),
        {}
    );
}

function newRow(fieldsDefs, rowData={}) {
    return _.reduce(
        fieldsDefs,
        (row, fieldDef) => Object.assign(
            {},
            row,
            { [fieldDef.name]: rowData[fieldDef.name] || fieldDef.default || null }
        ),
        {}
    );
}

function appendRow(data, fieldsDefs, rowData) {
    return  Object.assign(
        {},
        data,
        {
            rows: data.rows.concat(newRow(fieldsDefs, rowData)),
            recordIndex: data.rows.length,
            state: datasetStates.insert,
        }
    );
};

function deleteRow(data) {
    let rows = _.slice(data.rows, 0, data.recordIndex).concat(_.slice(data.rows, data.recordIndex + 1));
    return  Object.assign(
        {},
        data,
        {
            rows: rows,
            recordIndex: rows.length <= data.recordIndex ? rows.length - 1 : data.recordIndex,
            pending: rows.length == data.rows.length ? data.pending : true,
            state: datasetStates.browse,
        }
    );
};

export { datasetStates, recordStates, dataFields, newRow, appendRow, deleteRow };
