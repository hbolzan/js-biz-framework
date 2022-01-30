import gridTranslations from "./translations.aggrid.js";
const translations = {
    "pt-BR": {
        grid: gridTranslations["pt-BR"],
        general: {
            inputMaskDateInputFormat: "dd/mm/yyyy",
            inputMaskDatePlaceHolder: "dd/mm/aaaa",
            inputMaskGroupSeparator: ".",
            inputMaskDecimalSeparetor: ",",
            "Submit": "Confirmar",
            "Confirm": "Confirmar",
            "Search": "Pesquisar",
            "Select": "Selecionar",
            "Dismiss": "Desistir",
            "4-digit-year": "Ano no formato AAAA",
            "Search by all available fields in any part of the text": "Pesquisar por todos os campos disponíveis em qualquer parte do texto",
            "Delete current record?": "Excluir este registro?",
            "Confirm changes to current record?": "Confirma alterações neste registro?",
            abbreviatedWeekDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            abbreviatedMonthsNames: [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez"
            ],
            fullMonthsNames: [
                "Janeiro",
                "Fevereiro",
                "Março",
                "Abril",
                "Maio",
                "Junho",
                "Julho",
                "Agosto",
                "Setembro",
                "Outubro",
                "Novembro",
                "Dezembro"
            ],
        },
    },
};

export default translations;
