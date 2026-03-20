/**
 * nativescript-mqtt5
 * Copyright (c) 2025 Antonio Perri <perrianton@gmail.com>
 * Copyright (c) 2013 IBM Corp.
 * 
 * Eclipse Paho MQTT JavaScript client
 * Licensed under Eclipse Public License v1.0
 * http://www.eclipse.org/legal/epl-v10.html
 */

export = Paho.MQTT;
declare namespace Paho.MQTT {
    type Qos = 0 | 1 | 2;
    interface MQTTError {
        errorCode: number;
        errorMessage: string;
    }
    interface WithInvocationContext {
        invocationContext: any;
    }
    interface ErrorWithInvocationContext extends MQTTError, WithInvocationContext {}
    interface OnSubscribeSuccessParams extends WithInvocationContext {
        grantedQos: Qos;
    }
    type OnSuccessCallback = (o: WithInvocationContext) => void;
    type OnSubscribeSuccessCallback = (o: OnSubscribeSuccessParams) => void;
    type OnFailureCallback = (e: ErrorWithInvocationContext) => void;
    type OnConnectedHandler = (reconnect: boolean, URI: string) => void;
    type OnConnectionLostHandler = (error: MQTTError) => void;
    type OnMessageHandler = (message: Message) => void;
    
    /** MQTT 5.0 Properties for CONNECT */
    interface ConnectProperties {
        sessionExpiryInterval?: number;
        userProperties?: { [key: string]: string };
    }
    
    /** MQTT 5.0 Properties for PUBLISH */
    interface PublishProperties {
        messageExpiryInterval?: number;
        contentType?: string;
        userProperties?: { [key: string]: string };
    }
    
    /** MQTT 5.0 Properties for SUBSCRIBE */
    interface SubscribeProperties {
        userProperties?: { [key: string]: string };
    }
    
    interface ConnectionOptions {
        timeout?: number;
        userName?: string;
        password?: string;
        willMessage?: Message;
        keepAliveInterval?: number;
        cleanSession?: boolean;
        useSSL?: boolean;
        invocationContext?: any;
        onSuccess?: OnSuccessCallback;
        mqttVersion?: 3 | 4 | 5;
        mqttVersionExplicit?: boolean;
        onFailure?: OnFailureCallback;
        reconnect?: boolean;
        hosts?: string[];
        ports?: number[];
        uris?: string[];
        /** MQTT 5.0 only */
        properties?: ConnectProperties;
    }
    interface SubscribeOptions {
        qos?: Qos;
        invocationContext?: any;
        onSuccess?: OnSubscribeSuccessCallback;
        onFailure?: OnFailureCallback;
        timeout?: number;
        /** MQTT 5.0 only */
        properties?: SubscribeProperties;
    }
    interface UnsubscribeOptions {
        invocationContext?: any;
        onSuccess?: OnSuccessCallback;
        onFailure?: OnFailureCallback;
        timeout?: number;
        /** MQTT 5.0 only */
        properties?: SubscribeProperties;
    }
    type TraceFunction = (msg: string) => void;
    class Client {
        readonly clientId: string;
        readonly host: string;
        readonly path: string;
        readonly port: number;
        readonly uri: string;
        disconnectedPublishing: boolean;
        disconnectedBufferSize: number;
        trace: TraceFunction;
        onConnected: OnConnectedHandler;
        onConnectionLost: OnConnectionLostHandler;
        onMessageDelivered: OnMessageHandler;
        onMessageArrived: OnMessageHandler;
        constructor(host: string, port: number, path: string, clientId: string);
        constructor(host: string, port: number, clientId: string);
        constructor(hostUri: string, clientId: string);
        connect(connectionOptions?: ConnectionOptions): void;
        disconnect(): void;
        isConnected(): boolean;
        getTraceLog(): any[];
        startTrace(): void;
        stopTrace(): void;
        send(message: Message): void;
        send(topic: string, payload: string | ArrayBuffer, qos?: Qos, retained?: boolean): void;
        subscribe(filter: string, subcribeOptions?: SubscribeOptions): void;
        unsubscribe(filter: string, unsubcribeOptions?: UnsubscribeOptions): void;
    }
    type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
    class Message {
        destinationName: string;
        readonly duplicate: boolean;
        readonly payloadBytes: ArrayBuffer | TypedArray;
        readonly payloadString: string;
        qos: Qos;
        retained: boolean;
        /** MQTT 5.0 only */
        properties?: PublishProperties;
        constructor(payload: string | ArrayBuffer | TypedArray);
    }
}
