import BaseComponent from "../../../src/components/common/base.js";
import DataField from "../../../src/components/data_aware/data_field.js";

const mockedDataSet = {
    afterPost: jest.fn(),
    onDataChange: jest.fn(),
};

const fieldsDefs = [
    { name: "a", default: "ABC", label: "Field A" },
    { name: "b", default: 123, label: "Field B" },
    { name: "c", label: "Field C" },
];

describe("DataField", () => {
    it("self registers in dataset afterPost and onDataChange events", () => {
        DataField({ BaseComponent }, fieldsDefs[0], mockedDataSet);
        expect(mockedDataSet.afterPost).toHaveBeenCalled();
        expect(mockedDataSet.onDataChange).toHaveBeenCalled();
    });

    it("is initialized with fieldDef default value", () => {
        expect(DataField({ BaseComponent }, fieldsDefs[0], mockedDataSet).value()).toBe("ABC");
        expect(DataField({ BaseComponent }, fieldsDefs[1], mockedDataSet).value()).toBe(123);
    });

    it("is initialized with null if there is no default value", () => {
        expect(DataField({ BaseComponent }, fieldsDefs[2], mockedDataSet).value()).toBeNull();
    });

    it("has all fieldDef attributes", () => {
        let dataField = DataField({ BaseComponent }, fieldsDefs[0], mockedDataSet);
        expect(dataField.name).toBe("a");
        expect(dataField.default).toBe("ABC");
        expect(dataField.label).toBe("Field A");
    });

    it("changes valueChanged state and triggers onChange event when a new value is set ", () => {
        let onChange = jest.fn();
        let dataField = DataField({ BaseComponent }, fieldsDefs[0], mockedDataSet, [{ onChange: onChange }]);
        expect(dataField.valueChanged()).toBe(false);
        dataField.value("XYZ");
        expect(dataField.value()).toBe("XYZ");
        expect(dataField.valueChanged()).toBe(true);
        expect(onChange).toHaveBeenCalled();
    });

    it("resets valueChanged to false after dataset post", () => {
        let dataField = DataField({ BaseComponent }, fieldsDefs[0], mockedDataSetWithEvents);
        expect(dataField.valueChanged()).toBe(false);
        dataField.value("XYZ");
        expect(dataField.value()).toBe("XYZ");
        expect(dataField.valueChanged()).toBe(true);
        mockedDataSetWithEvents.post();
        expect(dataField.valueChanged()).toBe(false);
    });

});

const base = BaseComponent();
const mockedChangeHandler = jest.fn();
const mockedDataSetWithEvents = Object.assign(
    base,
    {
        afterPost: handler => base.events.on("afterPost", handler),
        onDataChange: handler => base.events.on("onDataChange", mockedChangeHandler),
        post: () => base.events.run("afterPost", []),
        change: () => base.events.run("onDataChange", [base]),
    },
);

describe("DataField and DataSet basic interaction", () => {
    it("resets valueChanged to false after dataset post", () => {
        let dataField = DataField({ BaseComponent }, fieldsDefs[0], mockedDataSetWithEvents);
        expect(dataField.valueChanged()).toBe(false);
        dataField.value("XYZ");
        expect(dataField.value()).toBe("XYZ");
        expect(dataField.valueChanged()).toBe(true);
        mockedDataSetWithEvents.post();
        expect(dataField.valueChanged()).toBe(false);
    });

    it("listens to onDataChange dataset event", () => {
        let dataField = DataField({ BaseComponent }, fieldsDefs[0], mockedDataSetWithEvents);
        expect(mockedChangeHandler).toHaveBeenCalledTimes(0);
        mockedDataSetWithEvents.change();
        expect(mockedChangeHandler).toHaveBeenCalled();
    });

});
