import BaseComponent from "../../../src/components/common/base.js";
import DataSet from "../../../src/components/data_aware/data_set.js";

describe("DataSet constructor", () => {
    const DataField = jest.fn(x => Object.assign({ initValidation: x => null })),
          fieldsDefs = [{ name: "a" }, { name: "b" }],
          dataSet = DataSet({ BaseComponent, DataField, fieldsDefs });

    it("initializes data fields", () => {
        expect(DataField).toHaveBeenCalledTimes(2);
    });

    it("starts inactive with no data", () => {
        expect(dataSet.state()).toBe("inactive");
        expect(dataSet.isEmpty()).toBeTruthy();
        expect(dataSet.eof()).toBeTruthy();
        expect(dataSet.bof()).toBeTruthy();
        expect(dataSet.recordIndex()).toBe(-1);
    });
});

describe("DataSet load data", () => {
    const DataField = jest.fn(x => Object.assign({ initValidation: x => null })),
          fieldsDefs = [{ name: "a" }, { name: "b" }],
          initialData = [{ a: 1, b: 2 }, { a: 10, b: 20 }],
          dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
          onDataChange = jest.fn(),
          onDataChangeB = jest.fn(),
          onStateChange = jest.fn(),
          onStateChangeB = jest.fn(),
          onStateChangeC = jest.fn(),
          afterScroll = jest.fn(),
          afterEdit = jest.fn(),
          beforePost = jest.fn();

    dataSet.onDataChange(onDataChange);
    dataSet.onDataChange(onDataChangeB);
    dataSet.onStateChange(onStateChange);
    dataSet.onStateChange(onStateChangeB);
    dataSet.onStateChange(onStateChangeC);
    dataSet.afterScroll(afterScroll);
    dataSet.afterEdit(afterEdit);
    dataSet.beforePost(beforePost);

    dataSet.loadData(initialData);

    it("sets rows with loaded data and changes state to browse", () => {
        expect(dataSet.recordCount()).toBe(2);
        expect(dataSet.state()).toBe("browse");
    });

    it("sets record index to first record", () => {
        expect(dataSet.recordIndex()).toBe(0);
    });

    it("returns bof and eof correct states", () => {
        expect(dataSet.bof()).toBeTruthy();
        expect(dataSet.eof()).toBeFalsy();
    });

    it("calls all listeners for onDataChange, onStateChange and afterScroll events", () => {
        expect(onDataChange).toHaveBeenCalledTimes(1);
        expect(onDataChangeB).toHaveBeenCalledTimes(1);
        expect(onStateChange).toHaveBeenCalledTimes(1);
        expect(onStateChangeB).toHaveBeenCalledTimes(1);
        expect(onStateChangeC).toHaveBeenCalledTimes(1);
        expect(afterScroll).toHaveBeenCalledTimes(1);
    });

    it("does not call listeners for other events", () => {
        expect(afterEdit).toHaveBeenCalledTimes(0);
        expect(beforePost).toHaveBeenCalledTimes(0);
    });

});

describe("DataSet actions", () => {
    const DataField = jest.fn(x => Object.assign({ initValidation: x => null })),
          fieldsDefs = [{ name: "a" }, { name: "b" }],
          initialData = [{ a: 1, b: 2 }, { a: 10, b: 20 }, { a: 100, b: 200 }];

    describe("navigation", () => {
        it("doesn't trigger onDataChange if record index doesn't change", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn();
            dataSet.loadData(initialData);

            dataSet.onDataChange(onDataChange);
            expect(dataSet.recordIndex()).toBe(0);
            dataSet.prior();
            expect(dataSet.recordIndex()).toBe(0);
            expect(onDataChange).toHaveBeenCalledTimes(0);
        });

        it("moves to next row on next", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn(),
                beforeScroll = jest.fn(),
                afterScroll = jest.fn();
            dataSet.loadData(initialData);

            dataSet.onDataChange(onDataChange);
            dataSet.beforeScroll(beforeScroll);
            dataSet.afterScroll(afterScroll);

            dataSet.next();
            expect(dataSet.recordIndex()).toBe(1);
            expect(dataSet.bof()).toBeFalsy();
            expect(dataSet.eof()).toBeFalsy();

            dataSet.next();
            expect(dataSet.recordIndex()).toBe(2);
            expect(dataSet.bof()).toBeFalsy();
            expect(dataSet.eof()).toBeTruthy();

            expect(onDataChange).toHaveBeenCalledTimes(2);
            expect(beforeScroll).toHaveBeenCalledTimes(2);
            expect(afterScroll).toHaveBeenCalledTimes(2);
        });

        it("moves to last row on last", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn(),
                beforeScroll = jest.fn(),
                afterScroll = jest.fn();
            dataSet.loadData(initialData);

            dataSet.onDataChange(onDataChange);
            dataSet.beforeScroll(beforeScroll);
            dataSet.afterScroll(afterScroll);

            expect(dataSet.recordIndex()).toBe(0);
            dataSet.last();
            expect(dataSet.recordIndex()).toBe(2);
            expect(dataSet.bof()).toBeFalsy();
            expect(dataSet.eof()).toBeTruthy();

            expect(onDataChange).toHaveBeenCalledTimes(1);
            expect(beforeScroll).toHaveBeenCalledTimes(1);
            expect(afterScroll).toHaveBeenCalledTimes(1);
        });

        it("moves to prior row on prior", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn(),
                beforeScroll = jest.fn(),
                afterScroll = jest.fn();
            dataSet.loadData(initialData);
            dataSet.last();

            dataSet.onDataChange(onDataChange);
            dataSet.beforeScroll(beforeScroll);
            dataSet.afterScroll(afterScroll);

            expect(dataSet.recordIndex()).toBe(2);
            dataSet.prior();
            expect(dataSet.recordIndex()).toBe(1);
            expect(dataSet.bof()).toBeFalsy();
            expect(dataSet.eof()).toBeFalsy();

            dataSet.prior();
            expect(dataSet.recordIndex()).toBe(0);
            expect(dataSet.bof()).toBeTruthy();
            expect(dataSet.eof()).toBeFalsy();

            expect(onDataChange).toHaveBeenCalledTimes(2);
            expect(beforeScroll).toHaveBeenCalledTimes(2);
            expect(afterScroll).toHaveBeenCalledTimes(2);
        });

        it("moves to first row on first", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn(),
                beforeScroll = jest.fn(),
                afterScroll = jest.fn();
            dataSet.loadData(initialData);
            dataSet.last();

            dataSet.onDataChange(onDataChange);
            dataSet.beforeScroll(beforeScroll);
            dataSet.afterScroll(afterScroll);

            expect(dataSet.recordIndex()).toBe(2);
            dataSet.first();
            expect(dataSet.recordIndex()).toBe(0);
            expect(dataSet.bof()).toBeTruthy();
            expect(dataSet.eof()).toBeFalsy();

            expect(onDataChange).toHaveBeenCalledTimes(1);
            expect(beforeScroll).toHaveBeenCalledTimes(1);
            expect(afterScroll).toHaveBeenCalledTimes(1);
        });

        it("sets recordIndex to specified value", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onDataChange = jest.fn(),
                beforeScroll = jest.fn(),
                afterScroll = jest.fn();
            dataSet.loadData(initialData);
            dataSet.onDataChange(onDataChange);
            dataSet.beforeScroll(beforeScroll);
            dataSet.afterScroll(afterScroll);
            dataSet.goto(2);
            expect(dataSet.recordIndex()).toBe(2);
            expect(onDataChange).toHaveBeenCalledTimes(1);
            expect(beforeScroll).toHaveBeenCalledTimes(1);
            expect(afterScroll).toHaveBeenCalledTimes(1);
        });
    });

    describe("edition", () => {
        it("appends an empty row and moves ton new row on append", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
            dataSet.loadData(initialData);
            dataSet.append();
            expect(dataSet.recordIndex()).toBe(3);
            expect(dataSet.rows()[dataSet.recordIndex()]).toEqual({ a: null, b: null });
        });

        it("changes dataset state and triggers all expected events on append", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeInsert = jest.fn(),
                afterInsert = jest.fn(),
                onDataChange = jest.fn(),
                onStateChange = jest.fn();

            dataSet.loadData(initialData);
            dataSet.beforeInsert(beforeInsert);
            dataSet.afterInsert(afterInsert);
            dataSet.onDataChange(onDataChange);
            dataSet.onStateChange(onStateChange);

            expect(dataSet.state()).toBe("browse");
            dataSet.append();
            expect(dataSet.state()).toBe("insert");
            expect(beforeInsert).toHaveBeenCalledTimes(1);
            expect(afterInsert).toHaveBeenCalledTimes(1);
            expect(onStateChange).toHaveBeenCalledTimes(1);
            expect(onDataChange).toHaveBeenCalledTimes(1);
        });

        it("changes dataset state and triggers events on edit existing record", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeEdit = jest.fn(),
                afterEdit = jest.fn(),
                onStateChange = jest.fn();
            dataSet.loadData(initialData);
            dataSet.beforeEdit(beforeEdit);
            dataSet.afterEdit(afterEdit);
            dataSet.onStateChange(onStateChange);

            dataSet.edit();
            expect(dataSet.state()).toBe("edit");
            expect(beforeEdit).toHaveBeenCalledTimes(1);
            expect(afterEdit).toHaveBeenCalledTimes(1);
            expect(onStateChange).toHaveBeenCalledTimes(1);
        });

        it("appends a new record on edit if dataset is empty", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeEdit = jest.fn(),
                afterEdit = jest.fn(),
                beforeInsert = jest.fn(),
                afterInsert = jest.fn(),
                onDataChange = jest.fn(),
                onStateChange = jest.fn();

            dataSet.loadData([]);
            dataSet.beforeEdit(beforeEdit);
            dataSet.afterEdit(afterEdit);
            dataSet.beforeInsert(beforeInsert);
            dataSet.afterInsert(afterInsert);
            dataSet.onStateChange(onStateChange);

            expect(dataSet.isEmpty()).toBeTruthy();
            dataSet.edit();
            expect(dataSet.state()).toBe("insert");
            expect(beforeEdit).toHaveBeenCalledTimes(0);
            expect(afterEdit).toHaveBeenCalledTimes(0);
            expect(beforeInsert).toHaveBeenCalledTimes(1);
            expect(afterInsert).toHaveBeenCalledTimes(1);
            expect(onStateChange).toHaveBeenCalledTimes(1);
        });

        it("changes state to browse and triggers events on post", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforePost = jest.fn(),
                afterPost = jest.fn(),
                onStateChange = jest.fn();
            dataSet.loadData(initialData);
            dataSet.beforePost(beforePost);
            dataSet.afterPost(afterPost);
            dataSet.onStateChange(onStateChange);

            dataSet.edit();
            expect(dataSet.state()).toBe("edit");
            dataSet.post();
            expect(dataSet.state()).toBe("browse");
            expect(beforePost).toHaveBeenCalledTimes(1);
            expect(afterPost).toHaveBeenCalledTimes(1);
            expect(onStateChange).toHaveBeenCalledTimes(2);
        });

        it("sets data pending flag on post", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
            dataSet.loadData(initialData);
            dataSet.edit();
            expect(dataSet.state()).toBe("edit");
            expect(dataSet.pending()).toBeFalsy();
            dataSet.post();
            expect(dataSet.pending()).toBeTruthy();
        });

        it("resets data pending flag on commit and triggers commit events", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeCommit = jest.fn(),
                afterCommit = jest.fn();
            dataSet.loadData(initialData);
            dataSet.beforeCommit(beforeCommit);
            dataSet.afterCommit(afterCommit);

            dataSet.edit();
            expect(dataSet.state()).toBe("edit");
            expect(dataSet.pending()).toBeFalsy();

            dataSet.post();
            expect(dataSet.pending()).toBeTruthy();

            beforeCommit.mockReturnValue(true);
            dataSet.commit();
            expect(dataSet.pending()).toBeFalsy();

            expect(beforeCommit).toHaveBeenCalledTimes(1);
            expect(afterCommit).toHaveBeenCalledTimes(1);
        });

        it("does nothing if there is no pending data", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeCommit = jest.fn(),
                afterCommit = jest.fn();

            dataSet.loadData(initialData);
            dataSet.beforeCommit(beforeCommit);
            dataSet.afterCommit(afterCommit);

            expect(dataSet.pending()).toBeFalsy();
            dataSet.commit();
            expect(dataSet.pending()).toBeFalsy();

            expect(beforeCommit).toHaveBeenCalledTimes(0);
            expect(afterCommit).toHaveBeenCalledTimes(0);
        });

        it("posts before commit if state is not browse", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                onStateChange = jest.fn(),
                onDataChange = jest.fn(),
                beforePost = jest.fn(),
                afterPost = jest.fn(),
                beforeCommit = jest.fn(),
                afterCommit = jest.fn();

            dataSet.loadData(initialData);
            dataSet.onStateChange(onStateChange);
            dataSet.beforePost(beforePost);
            dataSet.afterPost(afterPost);
            dataSet.beforeCommit(beforeCommit);
            dataSet.afterCommit(afterCommit);
            dataSet.onDataChange(onDataChange);

            // if beforeCommit event is set, it should return true to confirm commit
            beforeCommit.mockReturnValue(true);

            expect(dataSet.pending()).toBeFalsy();
            dataSet.first();
            dataSet.edit();
            dataSet.setData("a", 1001);
            dataSet.commit();
            expect(dataSet.pending()).toBeFalsy();

            expect(onDataChange).toHaveBeenCalledTimes(1);
            expect(onStateChange).toHaveBeenCalledTimes(2);
            expect(beforePost).toHaveBeenCalledTimes(1);
            expect(afterPost).toHaveBeenCalledTimes(1);
            expect(beforeCommit).toHaveBeenCalledTimes(1);
            expect(afterCommit).toHaveBeenCalledTimes(1);
        });

        it("deletes current record and triggers events on delete", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeDelete = jest.fn(),
                afterDelete = jest.fn(),
                onDataChange = jest.fn();

            // if beforeDelete event is set, it should return true to confirm delete
            beforeDelete.mockReturnValue(true);

            dataSet.loadData(initialData);
            dataSet.beforeDelete(beforeDelete);
            dataSet.afterDelete(afterDelete);
            dataSet.onDataChange(onDataChange);

            expect(dataSet.recordCount()).toBe(3);
            dataSet.delete();
            expect(dataSet.recordCount()).toBe(2);
            expect(beforeDelete).toHaveBeenCalledTimes(1);
            expect(afterDelete).toHaveBeenCalledTimes(1);
            expect(onDataChange).toHaveBeenCalledTimes(1);
        });

        it("does not delete current record if beforeDelete confirmation is false", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeDelete = jest.fn(),
                afterDelete = jest.fn(),
                onDataChange = jest.fn();

            // if beforeDelete event is set, it should return true to confirm delete
            beforeDelete.mockReturnValue(false);

            dataSet.loadData(initialData);
            dataSet.beforeDelete(beforeDelete);
            dataSet.afterDelete(afterDelete);
            dataSet.onDataChange(onDataChange);

            expect(dataSet.recordCount()).toBe(3);
            dataSet.delete();
            expect(dataSet.recordCount()).toBe(3);
            expect(beforeDelete).toHaveBeenCalledTimes(1);
            expect(afterDelete).toHaveBeenCalledTimes(0);
            expect(onDataChange).toHaveBeenCalledTimes(0);
        });

        it("does nothing if dataset was already empty", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeDelete = jest.fn(),
                afterDelete = jest.fn(),
                onDataChange = jest.fn();

            dataSet.loadData([]);
            dataSet.beforeDelete(beforeDelete);
            dataSet.afterDelete(afterDelete);
            dataSet.onDataChange(onDataChange);

            expect(dataSet.recordCount()).toBe(0);
            dataSet.delete();
            expect(dataSet.recordCount()).toBe(0);
            expect(beforeDelete).toHaveBeenCalledTimes(1);
            expect(afterDelete).toHaveBeenCalledTimes(0);
            expect(onDataChange).toHaveBeenCalledTimes(0);
        });

        it("cancels insertion on cancel", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs }),
                beforeCancel = jest.fn(),
                afterCancel = jest.fn();

            dataSet.beforeCancel(beforeCancel);
            dataSet.afterCancel(afterCancel);
            dataSet.loadData([]);
            dataSet.setData("a", 1000);
            expect(dataSet.state()).toBe("insert");
            dataSet.cancel();
            expect(dataSet.isEmpty()).toBeTruthy();
            expect(dataSet.state()).toBe("browse");
            expect(beforeCancel).toHaveBeenCalledTimes(1);
            expect(afterCancel).toHaveBeenCalledTimes(1);
            expect(dataSet.isEmpty()).toBeTruthy();
        });

        it("cancels insertion restores original record index on cancel", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
            dataSet.loadData(initialData);
            dataSet.next();
            expect(dataSet.recordIndex()).toEqual(1);
            dataSet.append();
            expect(dataSet.recordIndex()).toEqual(3);
            expect(dataSet.recordCount()).toEqual(4);
            dataSet.setData("a", 1000);
            dataSet.setData("b", 2000);
            dataSet.cancel();
            expect(dataSet.state()).toBe("browse");
            expect(dataSet.recordIndex()).toEqual(1);
            expect(dataSet.recordCount()).toEqual(3);
        });

        it("restores only editing row original values on cancel", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
            dataSet.loadData(initialData);
            dataSet.setData("a", 30);
            dataSet.setData("b", 60);
            dataSet.post();
            expect(dataSet.rows()[0]).toEqual({ a: 30, b: 60 });
            dataSet.next();
            expect(dataSet.rows()[dataSet.recordIndex()]).toEqual({ a: 10, b: 20 });
            dataSet.setData("a", 1000);
            dataSet.setData("b", 2000);
            expect(dataSet.state()).toBe("edit");
            expect(dataSet.rows()[dataSet.recordIndex()]).toEqual({ a: 1000, b: 2000 });
            dataSet.cancel();
            expect(dataSet.state()).toBe("browse");
            expect(dataSet.rows()[dataSet.recordIndex()]).toEqual({ a: 10, b: 20 });
            expect(dataSet.rows()[0]).toEqual({ a: 30, b: 60 });
        });

        it("rolls back all changed data on rollback", () => {
            let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
            dataSet.loadData(initialData);
            dataSet.setData("a", 30);
            dataSet.setData("b", 60);
            dataSet.post();
            dataSet.next();
            dataSet.setData("a", 1000);
            dataSet.setData("b", 2000);
            dataSet.post();
            dataSet.rollback();
            expect(dataSet.rows()[0]).toEqual({ a: 1, b: 2 });
            expect(dataSet.rows()[1]).toEqual({ a: 10, b: 20 });
        });

    });
});

describe("DataSet search", () => {
    const DataField = jest.fn(x => Object.assign({ initValidation: x => null })),
          fieldsDefs = [{ name: "a" }, { name: "b" }],
          initialData = [{ a: 1, b: 2 }, { a: 10, b: 20 }, { a: 100, b: 200 }, { a: 1000, b: 2000 }, ];

    it("returns record indexes of matching records", () => {
        let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
        dataSet.loadData(initialData);
        expect(dataSet.find(row => row.a >= 100))
            .toEqual([2, 3]);
    });
});

describe("DataSet seek", () => {
    const DataField = jest.fn(x => Object.assign({ initValidation: x => null })),
          fieldsDefs = [{ name: "a" }, { name: "b" }],
          initialData = [{ a: 1, b: 2 }, { a: 10, b: 20 }, { a: 100, b: 200 }, { a: 1000, b: 2000 }, ];

    it("changes dataset record index", () => {
        let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
        dataSet.loadData(initialData);
        expect(dataSet.recordIndex()).toBe(0);
        expect(dataSet.seek(2)).toEqual({ a: 100, b: 200 });
        expect(dataSet.recordIndex()).toBe(2);
    });

    it("triggers scroll events", () => {
        const beforeScroll = jest.fn(),
              afterScroll = jest.fn();
        let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
        dataSet.loadData(initialData);
        dataSet.beforeScroll(beforeScroll);
        dataSet.afterScroll(afterScroll);
        expect(dataSet.seek(2)).toEqual({ a: 100, b: 200 });
        expect(beforeScroll).toHaveBeenCalledTimes(1);
        expect(afterScroll).toHaveBeenCalledTimes(1);
    });

    it("ignores invalid row index requests", () => {
        const beforeScroll = jest.fn(),
              afterScroll = jest.fn();
        let dataSet =  DataSet({ BaseComponent, DataField, fieldsDefs });
        dataSet.loadData(initialData);
        dataSet.beforeScroll(beforeScroll);
        dataSet.afterScroll(afterScroll);
        expect(dataSet.recordIndex()).toBe(0);
        expect(dataSet.seek(5)).toBe(null);
        expect(dataSet.recordIndex()).toBe(0);
        expect(beforeScroll).toHaveBeenCalledTimes(0);
        expect(afterScroll).toHaveBeenCalledTimes(0);

        expect(dataSet.seek(-1)).toBe(null);
        expect(dataSet.recordIndex()).toBe(0);
        expect(beforeScroll).toHaveBeenCalledTimes(0);
        expect(afterScroll).toHaveBeenCalledTimes(0);
    });
});
