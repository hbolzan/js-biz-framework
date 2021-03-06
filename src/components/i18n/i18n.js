import translations from "./translations.js";

function I18n(locale = "pt-BR") {
    const fallbackLocale = "pt-BR",
          fallbackTranslations = translations[fallbackLocale],
          localeTranslations = translations[locale] || fallbackTranslations;

    const formatDate = d => d.toLocaleDateString(locale);

    function translate(key, namespace="general") {
        return localeTranslations[namespace][key] || fallbackTranslations[namespace][key] || key;
    }

    return {
        locale,
        translate,
        formatDate,
    };
};

export default I18n;
