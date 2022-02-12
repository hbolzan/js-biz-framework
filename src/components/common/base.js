import { first, isPromise } from "../../logic/misc.js";
import { registerEvent, unregisterEvent } from "../../logic/components.js";

function handleEvent(event, args, handler) {
    if (_.isFunction(handler)) {
        handler(...args);
    }
}

function runEvent(event, registeredEvents, args) {
    const handlers = _.filter(registeredEvents[event], e => ! _.isUndefined(e));
    _.each(handlers, handler => handleEvent(event, args, handler));
}

function runConfirmationEvent(event, registeredEvents, args, callback) {

    function handlePromise(p, handlers) {
        p.then(() => runHandlers(handlers.slice(1)), () => null);
    }

    function handleFunctionResult(handled, handlers) {
        if ( isPromise(handled) ) {
            return handlePromise(handled, handlers);
        }
        if ( handled ) {
            return runHandlers(handlers.slice(1));
        }
        return null;
    }

    function runHandler(handler, handlers) {
        if ( _.isNil(handler) ) {
            return callback(args);
        }

        if ( _.isFunction(handler) ) {
            return handleFunctionResult(handler(...args), handlers);
        }
        return runHandlers(handlers.slice(1));
    }

    function runHandlers(handlers) {
        runHandler(first(handlers), handlers);
    }
    runHandlers(_.filter(registeredEvents[event], e => ! _.isUndefined(e)));
}

function BaseComponent(events) {
    let registeredEvents = {};

    const eventHandlers = _.reduce(events, (handlers, event) => Object.assign(
        {},
        handlers,
        { [event]: handler => self.events.on(event, handler) }
    ), {});

    function onEvent(event, handler) {
        registeredEvents = registerEvent(event, handler, registeredEvents);
        return [event, handler];
    }

    let self = {
        events: {
            on: (event, handler) => onEvent(event, handler),
            off: (eventKey) => registeredEvents = unregisterEvent(eventKey, registeredEvents),
            run: (event, args) => runEvent(event, registeredEvents, args),
            runConfirmation: (event, args, callback) => runConfirmationEvent(
                event,
                registeredEvents,
                args,
                callback
            ),
        },
    };

    return Object.assign(
        self,
        eventHandlers,
    );
};

export default BaseComponent;
