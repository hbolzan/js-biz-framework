function DataConnection(context, connector) {
    return {
        get: resource => connector.get(context, resource),
        delete: resource => connector.delete(context, resource),
        post: (resource, payload) => connector.post(context, resource, payload),
        put: (resource, payload) => connector.put(context, resource, payload),
    };
}

export default DataConnection;
