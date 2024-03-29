if (window._ == undefined) {
    window._ = require("lodash");
}

import { first } from "./misc.js";

function modifiedAttrs(oldRow, newRow) {
    return _.keys(newRow).reduce((m, attr) => {
        if ( newRow[attr] !== oldRow[attr] ) {
            return { ...m, [attr]: newRow[attr] };
        }
        return m;
    }, {});
}

function rowsDiff(pkFields, _oldRows, _newRows) {
    const pkField = first(pkFields),
          modifiedRows = _newRows.reduce((newRows, row, i) => {
              if ( JSON.stringify(row) !== JSON.stringify(_oldRows[i]) ) {
                  return newRows.concat({
                      ...modifiedAttrs(_oldRows[i], row),
                      [pkField]: row[pkField],
                      __pk__: pkField,
                  });
              }
              return newRows;
          }, []);

    return modifiedRows;
}

function appendedRows(pkFields, newRows) {
    const pkField = first(pkFields);
    return newRows.filter(row => _.isNull(row[pkField]));
}

function responseIsOk(resp) {
    return resp.status === "OK";
}

function indexByPk(ds, diff) {
    const pk = first(diff).__pk__,
          id = first(diff)[pk];
    return first(ds.find(row => row[pk] === id));
}

function withAppendedRowIndex(resp, ds, pkFields) {
    console.log(resp);
    if ( ! responseIsOk(resp) ) {
        return null;
    }
    const pkField = first(pkFields);
    return { resp, index: first(ds.find(row => _.isNull(row[pkField]))) };
}

function withModifiedRowIndex(resp, ds, diff) {
    if ( ! responseIsOk(resp) ) {
        return null;
    }
    return { resp, index: indexByPk(ds, diff) };
}

export {
    rowsDiff,
    withModifiedRowIndex,
    appendedRows,
    withAppendedRowIndex,
};
