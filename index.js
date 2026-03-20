/**
 * nativescript-mqtt5
 * Copyright (c) 2025 Antonio Perri <perrianton@gmail.com>
 * Copyright (c) 2015-2019 Eduardo Speroni
 * 
 * Licensed under the Apache License, Version 2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

import { EventHandler, guid, Message } from './common';
export { EventHandler, guid, Message };
import * as MQTT from './paho-mqtt';
function isHostUriOptions(options) {
    return Object(options) === options && "hostUri" in options;
}
function isHostOptions(options) {
    return Object(options) === options && "host" in options && "port" in options;
}
export var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["CONNECTED"] = 0] = "CONNECTED";
    ConnectionState[ConnectionState["CONNECTING"] = 1] = "CONNECTING";
    ConnectionState[ConnectionState["DISCONNECTED"] = 2] = "DISCONNECTED";
})(ConnectionState || (ConnectionState = {}));
export class MQTTClient {
    constructor(options) {
        this._connectionState = ConnectionState.DISCONNECTED;
        this.connectionSuccess = new EventHandler();
        this.mqttConnected = new EventHandler();
        this.connectionFailure = new EventHandler();
        this.connectionLost = new EventHandler();
        this.subscribeSuccess = new EventHandler();
        this.subscribeFailure = new EventHandler();
        this.unsubscribeSuccess = new EventHandler();
        this.unsubscribeFailure = new EventHandler();
        this.messageArrived = new EventHandler();
        this.messageDelivered = new EventHandler();
        this._connectionState = ConnectionState.DISCONNECTED;
        if (isHostUriOptions(options)) {
            this.hostUri = options.hostUri;
        }
        else if (isHostOptions(options)) {
            this.host = options.host;
            this.port = options.port;
            this.path = options.path || '';
        }
        else {
            throw new Error("Invalid Client Options");
        }
        this.clientId = options.clientId || guid();
        if (this.hostUri !== undefined) {
            this.mqttClient = new MQTT.Client(this.hostUri, this.clientId);
        }
        else {
            this.mqttClient = new MQTT.Client(this.host, this.port, this.path, this.clientId);
        }
    }
    get connected() {
        return this.mqttClient.isConnected();
    }
    get connectionState() { return this._connectionState; }
    // events for the MQTT Client
    get onConnectionSuccess() { return this.connectionSuccess; }
    get onConnected() { return this.mqttConnected; }
    get onConnectionFailure() { return this.connectionFailure; }
    get onConnectionLost() { return this.connectionLost; }
    get onSubscribeSuccess() { return this.subscribeSuccess; }
    get onSubscribeFailure() { return this.subscribeFailure; }
    get onUnsubscribeSuccess() { return this.unsubscribeSuccess; }
    get onUnsubscribeFailure() { return this.unsubscribeFailure; }
    get onMessageArrived() { return this.messageArrived; }
    get onMessageDelivered() { return this.messageDelivered; }
    connect(connectOptions) {
        if (this._connectionState === ConnectionState.CONNECTED || this._connectionState === ConnectionState.CONNECTING) {
            return Promise.reject("Already connected");
        }
        const deferred = this.defer();
        const mqttConnectOptions = Object.assign(Object.assign({}, connectOptions), { onSuccess: () => {
                this._connectionState = ConnectionState.CONNECTED;
                deferred.resolve();
                this.connectionSuccess.trigger();
            }, onFailure: (err) => {
                this._connectionState = ConnectionState.DISCONNECTED;
                deferred.reject(err);
                this.connectionFailure.trigger(err);
            } });
        this.mqttClient.onConnectionLost = (err) => {
            this._connectionState = ConnectionState.DISCONNECTED;
            this.connectionLost.trigger(err);
        };
        this.mqttClient.onMessageArrived = (message) => {
            this.messageArrived.trigger(message);
        };
        this.mqttClient.onMessageDelivered = (message) => {
            this.messageDelivered.trigger(message);
        };
        this.mqttClient.onConnected = (reconnect, URI) => {
            this.mqttConnected.trigger({ reconnect, uri: URI });
        };
        this._connectionState = ConnectionState.CONNECTING;
        this.mqttClient.connect(mqttConnectOptions);
        return deferred.promise;
    }
    disconnect() {
        if (this.connectionState === ConnectionState.DISCONNECTED) {
            return;
        }
        return this.mqttClient.disconnect();
    }
    subscribe(topic, subscribeOpts) {
        const deferred = this.defer();
        const mqttSubscribeOpts = Object.assign(Object.assign({}, subscribeOpts), { onSuccess: (o) => {
                let grantedQos = o.grantedQos;
                if (!isNaN(Number(grantedQos))) { // for some reason it returns Uint8Array like: [0]
                    grantedQos = Number(grantedQos);
                }
                else {
                    console.log("WARNING: MQTTClient cannot determine grantedQos, received " + (typeof o.grantedQos));
                }
                deferred.resolve({ grantedQos });
                this.subscribeSuccess.trigger({ grantedQos });
            }, onFailure: (err) => {
                deferred.reject(err);
                this.subscribeFailure.trigger(err);
            } });
        this.mqttClient.subscribe(topic, mqttSubscribeOpts);
        return deferred.promise;
    }
    unsubscribe(topic, opts) {
        const deferred = this.defer();
        this.mqttClient.unsubscribe(topic, Object.assign(Object.assign({}, opts), { onSuccess: () => {
                deferred.resolve();
                this.unsubscribeSuccess.trigger();
            }, onFailure: (e) => {
                deferred.reject(e);
                this.unsubscribeFailure.trigger(e);
            } }));
        return deferred.promise;
    }
    publish(message) {
        this.mqttClient.send(message);
    }
    setTraceFunction(f) {
        this.mqttClient.trace = f;
    }
    startTrace() {
        this.mqttClient.startTrace();
    }
    stopTrace() {
        this.mqttClient.stopTrace();
    }
    defer() {
        const deferred = {
            promise: undefined,
            reject: undefined,
            resolve: undefined
        };
        deferred.promise = new Promise((resolve, reject) => {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }
}
//# sourceMappingURL=index.js.map
