function rowsDiff(oldRows, newRows) {
    return newRows.filter((row, i) => JSON.stringify(row) !== JSON.stringify(oldRows[i]));
}

module.exports = {
    rowsDiff,
};
