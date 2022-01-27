import { assocIf } from "../../logic/misc.js";

const stdBuildUrl = ({ host }, resource) => `${ host }${ resource }`;

function _get(context, resource) {
    return context.global.fetch(context.trace(context.buildUrl(context, resource)), {
        method: "GET",
        mode: "cors",
    }).then(r => r.json());
}

function _delete(context, resource) {
    return context.global.fetch(
        context.buildUrl(context, resource), {
            method: "DELETE",
            mode: "cors",
        }
    ).then(r => r.json());
}

function _send(method, context, resource, payload) {
    return context.global.fetch(
        context.trace(context.buildUrl(context, resource)),
        assocIf(
            {
                method: method,
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                }
            },
            "body",
            payload ? context.JSON.stringify(payload) : null
        )
    ).then(r => r.json());
}

function HttpConnection(context) {
    const buildUrl = context.buildUrl || stdBuildUrl;
    return context.DataConnection(context, {
        get: (context, resource) => _get({ buildUrl, ...context }, resource),
        delete: (context, resource) => _delete({ buildUrl, ...context }, resource),
        post: (context, resource, payload) => _send("POST", { buildUrl, ...context }, resource, payload),
        put: (context, resource, payload) => _send("PUT", { buildUrl, ...context }, resource, payload),
    });
}

export default HttpConnection;
