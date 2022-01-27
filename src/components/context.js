import Icons from "uikit/dist/js/uikit-icons";
import UIkit from "uikit";
import Dom from "./dom/dom.js";
import PageDom from "./dom/main_page.js";
import BaseComponent from "./common/base.js";
import Modal from "./common/modal.js";
import DataSet from "./data_aware/data_set.js";
import ModalSearch from "./data_aware/modal_search.js";
import ComplexFormDom from "./dom/complex_form.js";
import ComplexForm from "./data_aware/complex_form.js";
import ToolButton from "./visual/tool_button.js";
import DataToolbar from "./data_aware/data_toolbar.js";
import DataField from "./data_aware/data_field.js";
import DataGrid from "./data_aware/data_grid.js";
import DataInput from "./data_aware/data_input.js";
import I18n from "./i18n/i18n.js";
import DataConnection from "./data_aware/data_connection.js";
import HttpConnection from "./data_aware/http_connection.js";
import DSqlToRestProvider from "./data_aware/dsqltorest_provider.js";
import WebMrpFormsProvider from "./data_aware/webmrp_forms_provider.js";
import WebMrpDataProvider from "./data_aware/webmrp_data_provider.js";
import WebMrpValidationProvider from "./data_aware/webmrp_validation_provider.js";
import { Grid } from 'ag-grid-community';
import { providerTypes } from "./data_aware/dsqltorest_provider.js";
import { v4 as uuidv4 } from "uuid";
import { trace } from "../common/misc.js";
const _ = require("lodash");

UIkit.use(Icons);

// proxy configuration at webpack.config.js
const host = _.trimEnd(window.location.href, "/"),
      formsHost = host;

const ComplexFormProvider = WebMrpFormsProvider,
      ValidationProvider = WebMrpValidationProvider,
      DataProvider  = WebMrpDataProvider;

const context = {
    global: window,
    document: window.document,
    host,
    formsHost,
    i18n: I18n("pt-BR"),
    uuidGen: uuidv4,
    trace,

    UIkit,
    BaseComponent,
    Modal,
    ModalSearch,
    Dom,
    Grid,
    DataConnection,
    HttpConnection,
    DataSet,
    ToolButton,
    DataToolbar,
    DataField,
    DataInput,
    DataGrid,
    DataProvider,
    ValidationProvider,
    ComplexFormProvider,
    ComplexFormDom,
    PageDom,
    ComplexForm,
};

export default context;
