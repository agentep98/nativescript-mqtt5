# nativescript-mqtt5

A NativeScript MQTT client with **full MQTT 5.0 support**, built on the [Eclipse Paho](http://www.eclipse.org/paho) library.

## Features

- ✅ **MQTT 3.1.1** and **MQTT 5.0** support
- ✅ **Session Expiry Interval** — Keep sessions alive after disconnect
- ✅ **Message Expiry Interval** — Auto-expire messages
- ✅ **User Properties** — Custom key-value metadata on messages
- ✅ **Content Type** — MIME type for payloads
- ✅ WebSocket transport (ports 80/443 for SSL)
- ✅ Works on iOS and Android

## Installation

```bash
npm install nativescript-mqtt5
```

## Quick Start

### 1. Import

```typescript
import { MQTTClient, Message, ConnectionOptions, SubscribeOptions } from "nativescript-mqtt5";
```

### 2. Create Client & Connect

```typescript
// Create client
const client = new MQTTClient({
    host: "broker.emqx.io",
    port: 8083,
    path: "/mqtt"
});

// Setup handlers
client.onConnected.on((params) => {
    console.log("Connected to:", params.uri);
});

client.onConnectionLost.on((err) => {
    console.log("Connection lost:", err.errorMessage);
});

client.onMessageArrived.on((message) => {
    console.log("Topic:", message.destinationName);
    console.log("Payload:", message.payloadString);
});

// Connect with MQTT 5.0
client.connect({
    mqttVersion: 5,
    cleanSession: true,
    keepAliveInterval: 60
});
```

### 3. Subscribe

```typescript
client.subscribe("my/topic", { qos: 1 });
```

### 4. Publish

```typescript
const msg = new Message("Hello World!");
msg.destinationName = "my/topic";
msg.qos = 1;
client.publish(msg);
```

---

## MQTT 5.0 Features

### Session Expiry Interval

Keep your session alive on the broker after disconnecting. Useful for mobile apps that go to background.

```typescript
client.connect({
    mqttVersion: 5,
    properties: {
        sessionExpiryInterval: 3600  // Session lasts 1 hour after disconnect
    }
});
```

### Message Expiry Interval

Messages automatically expire after a specified time.

```typescript
const msg = new Message("Temperature: 25°C");
msg.destinationName = "sensors/temp";
msg.properties = {
    messageExpiryInterval: 300  // Message expires after 5 minutes
};
client.publish(msg);
```

### User Properties

Add custom metadata to your messages.

```typescript
const msg = new Message(JSON.stringify({ value: 25.5 }));
msg.destinationName = "sensors/data";
msg.properties = {
    userProperties: {
        "sender": "device-001",
        "location": "room-A",
        "priority": "high"
    }
};
client.publish(msg);
```

**Reading User Properties:**

```typescript
client.onMessageArrived.on((message) => {
    if (message.properties?.userProperties) {
        console.log("Sender:", message.properties.userProperties["sender"]);
    }
});
```

### Content Type

Specify the MIME type of your payload.

```typescript
// JSON payload
const jsonMsg = new Message(JSON.stringify({ temp: 25 }));
jsonMsg.destinationName = "data/json";
jsonMsg.properties = {
    contentType: "application/json"
};
client.publish(jsonMsg);

// Plain text
const textMsg = new Message("Hello!");
textMsg.destinationName = "data/text";
textMsg.properties = {
    contentType: "text/plain"
};
client.publish(textMsg);
```

**Reading Content Type:**

```typescript
client.onMessageArrived.on((message) => {
    const contentType = message.properties?.contentType;
    
    if (contentType === "application/json") {
        const data = JSON.parse(message.payloadString);
        console.log("JSON data:", data);
    } else {
        console.log("Text:", message.payloadString);
    }
});
```

### Combining Properties

You can use all properties together:

```typescript
const msg = new Message(JSON.stringify({ 
    command: "reboot",
    timestamp: Date.now()
}));
msg.destinationName = "devices/123/commands";
msg.qos = 1;
msg.properties = {
    contentType: "application/json",
    messageExpiryInterval: 60,
    userProperties: {
        "sender": "admin",
        "priority": "critical"
    }
};
client.publish(msg);
```

---

## Full Example

```typescript
import { MQTTClient, Message, ConnectionOptions } from "nativescript-mqtt5";

class MQTTService {
    private client: MQTTClient;
    
    constructor() {
        this.client = new MQTTClient({
            host: "broker.emqx.io",
            port: 8083,
            path: "/mqtt"
        });
        
        this.setupHandlers();
    }
    
    private setupHandlers(): void {
        this.client.onConnectionSuccess.on(() => {
            console.log("✅ Connected!");
            this.subscribe();
        });
        
        this.client.onConnectionFailure.on((err) => {
            console.log("❌ Connection failed:", err.errorMessage);
        });
        
        this.client.onConnectionLost.on((err) => {
            console.log("⚠️ Connection lost:", err.errorMessage);
        });
        
        this.client.onMessageArrived.on((message) => {
            console.log("📩 Message received:");
            console.log("   Topic:", message.destinationName);
            console.log("   Payload:", message.payloadString);
            
            if (message.properties) {
                if (message.properties.contentType) {
                    console.log("   Content-Type:", message.properties.contentType);
                }
                if (message.properties.userProperties) {
                    console.log("   User Properties:", message.properties.userProperties);
                }
            }
        });
    }
    
    connect(): void {
        this.client.connect({
            mqttVersion: 5,
            cleanSession: true,
            keepAliveInterval: 60,
            properties: {
                sessionExpiryInterval: 3600
            }
        });
    }
    
    disconnect(): void {
        this.client.disconnect();
    }
    
    private subscribe(): void {
        this.client.subscribe("test/topic", { qos: 1 });
    }
    
    publish(text: string): void {
        const msg = new Message(text);
        msg.destinationName = "test/topic";
        msg.qos = 1;
        msg.properties = {
            contentType: "text/plain",
            messageExpiryInterval: 120,
            userProperties: {
                "app": "nativescript-mqtt5-demo"
            }
        };
        this.client.publish(msg);
    }
}
```

---

## API Reference

### MQTTClient

**Constructor Options:**

```typescript
interface ClientOptions {
    host: string;        // Broker hostname
    port: number;        // Broker port (typically 8083 for WS, 8084 for WSS)
    path?: string;       // WebSocket path (default: "/mqtt")
    clientId?: string;   // Client ID (auto-generated if not provided)
}
```

**Connection Options:**

```typescript
interface ConnectionOptions {
    mqttVersion?: 3 | 4 | 5;      // MQTT version (default: 4)
    cleanSession?: boolean;        // Clean session (default: true)
    keepAliveInterval?: number;    // Keep alive in seconds (default: 60)
    timeout?: number;              // Connection timeout in seconds
    userName?: string;             // Username
    password?: string;             // Password
    useSSL?: boolean;              // Use SSL/TLS
    reconnect?: boolean;           // Auto-reconnect
    
    // MQTT 5.0 only
    properties?: {
        sessionExpiryInterval?: number;              // Seconds
        userProperties?: { [key: string]: string };  // Custom metadata
    };
}
```

**Events:**

| Event | Parameters | Description |
|-------|------------|-------------|
| `onConnectionSuccess` | - | Connected successfully |
| `onConnected` | `{ reconnect, uri }` | Connected (includes reconnection info) |
| `onConnectionFailure` | `{ errorCode, errorMessage }` | Connection failed |
| `onConnectionLost` | `{ errorCode, errorMessage }` | Connection lost |
| `onMessageArrived` | `Message` | Message received |
| `onMessageDelivered` | `Message` | Message delivered (QoS 1/2) |

### Message

```typescript
interface Message {
    destinationName: string;    // Topic
    payloadString: string;      // Payload as string
    payloadBytes: ArrayBuffer;  // Payload as bytes
    qos: 0 | 1 | 2;            // Quality of Service
    retained: boolean;          // Retained message
    duplicate: boolean;         // Duplicate flag (received messages)
    
    // MQTT 5.0 only
    properties?: {
        messageExpiryInterval?: number;
        contentType?: string;
        userProperties?: { [key: string]: string };
    };
}
```

---

## Tested Brokers

- ✅ EMQX
- ✅ Mosquitto
- ✅ HiveMQ

---

## License

Apache-2.0

---

## Credits

- **Antonio Perri** — MQTT 5.0 implementation
- **Eduardo Speroni** — Original nativescript-mqtt library
- **IBM Corp. / Eclipse Paho** — Paho MQTT JavaScript client

---

## Contributing

Issues and pull requests are welcome at [GitHub](https://github.com/agentep98/nativescript-mqtt5).
