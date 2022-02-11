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

export {
    rowsDiff,
};
