/**
 * nativescript-mqtt5
 * Copyright (c) 2025 Antonio Perri <perrianton@gmail.com>
 * Copyright (c) 2015-2019 Eduardo Speroni
 * 
 * Licensed under the Apache License, Version 2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 */

import { EventHandler, guid, Message } from './common';
import type { IEvent } from './common';
export { IEvent, EventHandler, guid, Message };
import * as MQTT from './paho-mqtt';
export declare type MQTTError = MQTT.MQTTError;
export declare type Qos = MQTT.Qos;
export declare type TraceFunction = MQTT.TraceFunction;

/**
 * MQTT 5.0 Properties for CONNECT packet
 */
export interface ConnectProperties {
    /**
     * Session Expiry Interval in seconds.
     * How long the broker keeps the session after disconnect.
     * 0 = session ends when connection closes (default)
     * 0xFFFFFFFF = session never expires
     */
    sessionExpiryInterval?: number;
    
    /**
     * User defined name-value pairs to send with the CONNECT packet.
     */
    userProperties?: { [key: string]: string };
}

/**
 * MQTT 5.0 Properties for PUBLISH messages
 */
export interface PublishProperties {
    /**
     * Message Expiry Interval in seconds.
     * How long the message is valid. After this time, the broker discards it.
     */
    messageExpiryInterval?: number;
    
    /**
     * Content Type of the payload (MIME type).
     * Examples: "application/json", "text/plain", "application/octet-stream"
     */
    contentType?: string;
    
    /**
     * User defined name-value pairs to send with the message.
     */
    userProperties?: { [key: string]: string };
}

/**
 * MQTT 5.0 Properties for SUBSCRIBE packet
 */
export interface SubscribeProperties {
    /**
     * User defined name-value pairs to send with the SUBSCRIBE packet.
     */
    userProperties?: { [key: string]: string };
}

export interface ConnectionOptions {
    /**
     * If the connect has not succeeded within this number of seconds, it is deemed to have failed.
     * @default 30 seconds
     */
    timeout?: number;
    /** Authentication username for this connection. */
    userName?: string;
    /** Authentication password for this connection. */
    password?: string;
    /** Sent by the server when the client disconnects abnormally. */
    willMessage?: Message;
    /**
     * The server disconnects this client if there is no activity for this number of seconds.
     * @default 60 seconds
     */
    keepAliveInterval?: number;
    /**
     * If true(default) the client and server persistent state is deleted on successful connect.
     * In MQTT 5.0 this is called "Clean Start".
     * @default true
     */
    cleanSession?: boolean;
    /** If present and true, use an SSL Websocket connection. */
    useSSL?: boolean;
    /** Passed to the onSuccess callback or onFailure callback. */
    invocationContext?: any;
    /**
     * Specifies the mqtt version to use when connecting
     * 3 - MQTT 3.1
     * 4 - MQTT 3.1.1 (default)
     * 5 - MQTT 5.0
     * @default 4
     */
    mqttVersion?: 3 | 4 | 5;
    /**
     * If set to true, will force the connection to use the selected MQTT Version or will fail to connect.
     */
    mqttVersionExplicit?: boolean;
    /**
     * Sets whether the client will automatically attempt to reconnect to the server if the connection is lost.
     * @default false
     */
    reconnect?: boolean;
    /**
     * If present this contains either a set of hostnames or fully qualified
     * WebSocket URIs, that are tried in order in place of the host and port parameter.
     */
    hosts?: string[];
    /**
     * If present the set of ports matching the hosts.
     */
    ports?: number[];
    
    /**
     * MQTT 5.0 only: Connection properties.
     * These are ignored if mqttVersion is not 5.
     */
    properties?: ConnectProperties;
}

export interface BaseClientOptions {
    /**
     * The Messaging client identifier, between 1 and 23 characters in length.
     * If not set, a random UID is used.
     */
    clientId?: string;
}

export interface HostUriClientOptions extends BaseClientOptions {
    /** The address of the messaging server as a fully qualified WebSocket URI */
    hostUri: string;
}

export interface HostClientOptions extends BaseClientOptions {
    /** The address of the messaging server as a DNS name or dotted decimal IP address. */
    host: string;
    /** The port number to connect to */
    port: number;
    /**
     * The path on the host to connect to - only used if host is not a URI.
     * @default '/mqtt'
     */
    path?: string;
}

export declare type ClientOptions = HostClientOptions | HostUriClientOptions;

export interface OnConnectedParams {
    reconnect: boolean;
    uri: string;
}

export interface SubscribeOptions {
    qos?: Qos;
    timeout?: number;
    
    /**
     * MQTT 5.0 only: Subscribe properties.
     * These are ignored if connected with mqttVersion other than 5.
     */
    properties?: SubscribeProperties;
}

export interface OnSubscribedParams {
    grantedQos: Qos;
}

export interface UnsubscribeOptions {
    timeout?: number;
    
    /**
     * MQTT 5.0 only: Unsubscribe properties.
     * These are ignored if connected with mqttVersion other than 5.
     */
    properties?: SubscribeProperties;
}

export declare enum ConnectionState {
    CONNECTED = 0,
    CONNECTING = 1,
    DISCONNECTED = 2
}

export declare class MQTTClient {
    private mqttClient;
    private host;
    private hostUri;
    private port;
    private path;
    clientId: string;
    get connected(): boolean;
    private _connectionState;
    get connectionState(): ConnectionState;
    constructor(options: ClientOptions);
    get onConnectionSuccess(): IEvent<void>;
    get onConnected(): IEvent<OnConnectedParams>;
    get onConnectionFailure(): IEvent<MQTTError>;
    get onConnectionLost(): IEvent<MQTTError>;
    get onSubscribeSuccess(): IEvent<OnSubscribedParams>;
    get onSubscribeFailure(): IEvent<MQTTError>;
    get onUnsubscribeSuccess(): IEvent<void>;
    get onUnsubscribeFailure(): IEvent<MQTTError>;
    get onMessageArrived(): IEvent<Message>;
    get onMessageDelivered(): IEvent<Message>;
    connect(connectOptions?: ConnectionOptions): Promise<void>;
    disconnect(): void;
    subscribe(topic: string, subscribeOpts?: SubscribeOptions): Promise<OnSubscribedParams>;
    unsubscribe(topic: string, opts?: UnsubscribeOptions): Promise<void>;
    publish(message: Message): void;
    setTraceFunction(f: TraceFunction): void;
    startTrace(): void;
    stopTrace(): void;
    private defer;
}
