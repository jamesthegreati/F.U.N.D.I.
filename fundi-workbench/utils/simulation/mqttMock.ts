'use client';

/**
 * MQTT Mock for IoT Simulation
 * 
 * Simulates basic MQTT publish/subscribe for ESP32 IoT projects.
 * Supports topics, QoS levels, and retained messages.
 */

export type MQTTQoS = 0 | 1 | 2;

export interface MQTTMessage {
    topic: string;
    payload: string | Uint8Array;
    qos: MQTTQoS;
    retain: boolean;
    timestamp: number;
}

export interface MQTTSubscription {
    topic: string;
    qos: MQTTQoS;
    callback: (message: MQTTMessage) => void;
}

export interface MQTTMockState {
    connected: boolean;
    clientId: string;
    broker: string;
    port: number;
    subscriptions: string[];
    publishedMessages: MQTTMessage[];
    receivedMessages: MQTTMessage[];
    lastWill?: {
        topic: string;
        payload: string;
        qos: MQTTQoS;
        retain: boolean;
    };
}

export type MQTTMockListener = (state: MQTTMockState) => void;

/**
 * MQTT Mock Implementation
 */
class MQTTMock {
    private connected: boolean = false;
    private clientId: string = '';
    private broker: string = 'mqtt://mock-broker';
    private port: number = 1883;
    private subscriptions: Map<string, MQTTSubscription[]> = new Map();
    private retainedMessages: Map<string, MQTTMessage> = new Map();
    private publishedMessages: MQTTMessage[] = [];
    private receivedMessages: MQTTMessage[] = [];
    private lastWill?: MQTTMockState['lastWill'];
    private listeners: Set<MQTTMockListener> = new Set();

    /**
     * Connect to MQTT broker
     */
    connect(options: {
        broker?: string;
        port?: number;
        clientId?: string;
        username?: string;
        password?: string;
        lastWill?: MQTTMockState['lastWill'];
    } = {}): Promise<boolean> {
        return new Promise((resolve) => {
            this.broker = options.broker || 'mqtt://mock-broker';
            this.port = options.port || 1883;
            this.clientId = options.clientId || `fundi_${Date.now()}`;
            this.lastWill = options.lastWill;

            console.log(`[MQTTMock] Connecting to ${this.broker}:${this.port} as ${this.clientId}`);

            // Simulate connection delay
            setTimeout(() => {
                this.connected = true;
                console.log('[MQTTMock] Connected');
                this.notifyListeners();
                resolve(true);
            }, 500);
        });
    }

    /**
     * Disconnect from broker
     */
    disconnect(): void {
        if (!this.connected) return;

        // Trigger last will if configured
        if (this.lastWill) {
            this.publish(this.lastWill.topic, this.lastWill.payload, {
                qos: this.lastWill.qos,
                retain: this.lastWill.retain,
            });
        }

        this.connected = false;
        this.subscriptions.clear();
        console.log('[MQTTMock] Disconnected');
        this.notifyListeners();
    }

    /**
     * Subscribe to a topic
     */
    subscribe(
        topic: string,
        callback: (message: MQTTMessage) => void,
        qos: MQTTQoS = 0
    ): void {
        if (!this.connected) {
            console.warn('[MQTTMock] Cannot subscribe: not connected');
            return;
        }

        const subscription: MQTTSubscription = { topic, qos, callback };

        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, []);
        }
        this.subscriptions.get(topic)!.push(subscription);

        console.log(`[MQTTMock] Subscribed to: ${topic}`);

        // Deliver retained message if exists
        const retained = this.retainedMessages.get(topic);
        if (retained) {
            callback(retained);
        }

        this.notifyListeners();
    }

    /**
     * Unsubscribe from a topic
     */
    unsubscribe(topic: string): void {
        if (this.subscriptions.delete(topic)) {
            console.log(`[MQTTMock] Unsubscribed from: ${topic}`);
            this.notifyListeners();
        }
    }

    /**
     * Publish a message to a topic
     */
    publish(
        topic: string,
        payload: string | Uint8Array,
        options: { qos?: MQTTQoS; retain?: boolean } = {}
    ): void {
        if (!this.connected) {
            console.warn('[MQTTMock] Cannot publish: not connected');
            return;
        }

        const message: MQTTMessage = {
            topic,
            payload,
            qos: options.qos || 0,
            retain: options.retain || false,
            timestamp: Date.now(),
        };

        this.publishedMessages.push(message);
        console.log(`[MQTTMock] Published to ${topic}: ${typeof payload === 'string' ? payload : `(${payload.length} bytes)`
            }`);

        // Store retained message
        if (message.retain) {
            this.retainedMessages.set(topic, message);
        }

        // Deliver to matching subscribers
        this.deliverMessage(message);

        // Limit stored messages
        if (this.publishedMessages.length > 100) {
            this.publishedMessages.shift();
        }

        this.notifyListeners();
    }

    /**
     * Simulate receiving a message from the broker
     * (useful for testing subscription handlers)
     */
    simulateIncoming(topic: string, payload: string | Uint8Array, options: { qos?: MQTTQoS; retain?: boolean } = {}): void {
        const message: MQTTMessage = {
            topic,
            payload,
            qos: options.qos || 0,
            retain: options.retain || false,
            timestamp: Date.now(),
        };

        this.receivedMessages.push(message);
        this.deliverMessage(message);

        if (this.receivedMessages.length > 100) {
            this.receivedMessages.shift();
        }

        this.notifyListeners();
    }

    /**
     * Deliver message to matching subscribers
     */
    private deliverMessage(message: MQTTMessage): void {
        // Check each subscription for topic match
        for (const [pattern, subscribers] of this.subscriptions) {
            if (this.topicMatches(pattern, message.topic)) {
                for (const sub of subscribers) {
                    try {
                        sub.callback(message);
                    } catch (e) {
                        console.error(`[MQTTMock] Error in subscription callback for ${pattern}:`, e);
                    }
                }
            }
        }
    }

    /**
     * Check if topic matches pattern (supports + and # wildcards)
     */
    private topicMatches(pattern: string, topic: string): boolean {
        const patternParts = pattern.split('/');
        const topicParts = topic.split('/');

        for (let i = 0; i < patternParts.length; i++) {
            const p = patternParts[i];

            // Multi-level wildcard matches everything
            if (p === '#') {
                return true;
            }

            // Single-level wildcard
            if (p === '+') {
                if (i >= topicParts.length) return false;
                continue;
            }

            // Exact match required
            if (i >= topicParts.length || p !== topicParts[i]) {
                return false;
            }
        }

        // Must have same number of parts (unless # was used)
        return patternParts.length === topicParts.length;
    }

    /**
     * Get current state
     */
    getState(): MQTTMockState {
        return {
            connected: this.connected,
            clientId: this.clientId,
            broker: this.broker,
            port: this.port,
            subscriptions: Array.from(this.subscriptions.keys()),
            publishedMessages: [...this.publishedMessages],
            receivedMessages: [...this.receivedMessages],
            lastWill: this.lastWill,
        };
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connected;
    }

    /**
     * Subscribe to state changes
     */
    subscribeToState(listener: MQTTMockListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    /**
     * Reset to initial state
     */
    reset(): void {
        this.disconnect();
        this.publishedMessages = [];
        this.receivedMessages = [];
        this.retainedMessages.clear();
        this.lastWill = undefined;
        this.notifyListeners();
    }

    private notifyListeners(): void {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
}

// Singleton instance
let mqttMockInstance: MQTTMock | null = null;

/**
 * Get the MQTT mock singleton
 */
export function getMQTTMock(): MQTTMock {
    if (!mqttMockInstance) {
        mqttMockInstance = new MQTTMock();
    }
    return mqttMockInstance;
}

export type { MQTTMock };
