'use client';

/**
 * WiFi Mock for ESP32 Simulation
 * 
 * Simulates basic WiFi functionality for ESP32 projects.
 * Handles connection states, HTTP requests, and basic networking.
 */

export type WiFiMode = 'OFF' | 'STA' | 'AP' | 'AP_STA';
export type WiFiStatus =
    | 'WL_IDLE_STATUS'
    | 'WL_NO_SSID_AVAIL'
    | 'WL_SCAN_COMPLETED'
    | 'WL_CONNECTED'
    | 'WL_CONNECT_FAILED'
    | 'WL_CONNECTION_LOST'
    | 'WL_DISCONNECTED';

export interface WiFiNetwork {
    ssid: string;
    rssi: number;  // Signal strength (-100 to 0)
    encryption: 'OPEN' | 'WEP' | 'WPA_PSK' | 'WPA2_PSK' | 'WPA3_PSK';
    channel: number;
    bssid?: string;
}

export interface HTTPRequest {
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    body?: string;
    timestamp: number;
}

export interface HTTPResponse {
    requestId: string;
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    timestamp: number;
}

export interface WiFiMockState {
    mode: WiFiMode;
    status: WiFiStatus;
    ssid: string | null;
    localIP: string;
    gatewayIP: string;
    subnetMask: string;
    dns: string;
    macAddress: string;
    rssi: number;
    hostname: string;
    availableNetworks: WiFiNetwork[];
    isScanning: boolean;
    pendingRequests: HTTPRequest[];
    completedRequests: Array<{ request: HTTPRequest; response: HTTPResponse }>;
}

export type WiFiMockListener = (state: WiFiMockState) => void;

/**
 * Default available networks for simulation
 */
const DEFAULT_NETWORKS: WiFiNetwork[] = [
    { ssid: 'SimulatedWiFi', rssi: -45, encryption: 'WPA2_PSK', channel: 6 },
    { ssid: 'TestNetwork', rssi: -65, encryption: 'WPA2_PSK', channel: 1 },
    { ssid: 'OpenNetwork', rssi: -72, encryption: 'OPEN', channel: 11 },
    { ssid: 'FUNDI_Lab', rssi: -55, encryption: 'WPA3_PSK', channel: 6 },
];

/**
 * Mock HTTP responses for common endpoints
 */
const MOCK_RESPONSES: Record<string, { status: number; body: string; headers?: Record<string, string> }> = {
    'https://httpbin.org/get': {
        status: 200,
        body: JSON.stringify({
            args: {},
            headers: { 'User-Agent': 'ESP32/1.0' },
            origin: '192.168.1.100',
            url: 'https://httpbin.org/get'
        }),
    },
    'https://api.github.com': {
        status: 200,
        body: JSON.stringify({ message: 'GitHub API Mock' }),
    },
    'https://jsonplaceholder.typicode.com/todos/1': {
        status: 200,
        body: JSON.stringify({ userId: 1, id: 1, title: 'Mock todo item', completed: false }),
    },
};

/**
 * WiFi Mock Implementation
 */
class WiFiMock {
    private mode: WiFiMode = 'OFF';
    private status: WiFiStatus = 'WL_IDLE_STATUS';
    private ssid: string | null = null;
    private localIP: string = '0.0.0.0';
    private gatewayIP: string = '0.0.0.0';
    private subnetMask: string = '255.255.255.0';
    private dns: string = '8.8.8.8';
    private macAddress: string = 'AA:BB:CC:DD:EE:FF';
    private hostname: string = 'esp32-device';
    private rssi: number = 0;
    private availableNetworks: WiFiNetwork[] = [...DEFAULT_NETWORKS];
    private isScanning: boolean = false;
    private pendingRequests: HTTPRequest[] = [];
    private completedRequests: Array<{ request: HTTPRequest; response: HTTPResponse }> = [];
    private listeners: Set<WiFiMockListener> = new Set();
    private requestIdCounter: number = 0;

    /**
     * Set WiFi mode
     */
    setMode(mode: WiFiMode): void {
        this.mode = mode;
        console.log(`[WiFiMock] Mode set to: ${mode}`);

        if (mode === 'OFF') {
            this.disconnect();
        } else if (mode === 'AP') {
            this.localIP = '192.168.4.1';
            this.gatewayIP = '192.168.4.1';
        }

        this.notifyListeners();
    }

    /**
     * Connect to a WiFi network
     */
    connect(ssid: string, password?: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.mode === 'OFF') {
                this.mode = 'STA';
            }

            this.status = 'WL_IDLE_STATUS';
            this.notifyListeners();

            // Find the network
            const network = this.availableNetworks.find(n => n.ssid === ssid);

            // Simulate connection delay
            setTimeout(() => {
                if (network) {
                    // Check password requirement
                    if (network.encryption !== 'OPEN' && !password) {
                        this.status = 'WL_CONNECT_FAILED';
                        console.log(`[WiFiMock] Connection to '${ssid}' failed: password required`);
                        resolve(false);
                    } else {
                        // Successful connection
                        this.ssid = ssid;
                        this.rssi = network.rssi;
                        this.localIP = '192.168.1.' + Math.floor(Math.random() * 200 + 10);
                        this.gatewayIP = '192.168.1.1';
                        this.status = 'WL_CONNECTED';
                        console.log(`[WiFiMock] Connected to '${ssid}' with IP ${this.localIP}`);
                        resolve(true);
                    }
                } else {
                    this.status = 'WL_NO_SSID_AVAIL';
                    console.log(`[WiFiMock] Network '${ssid}' not found`);
                    resolve(false);
                }
                this.notifyListeners();
            }, 1500); // 1.5s connection delay
        });
    }

    /**
     * Disconnect from WiFi
     */
    disconnect(): void {
        this.ssid = null;
        this.localIP = '0.0.0.0';
        this.rssi = 0;
        this.status = 'WL_DISCONNECTED';
        console.log('[WiFiMock] Disconnected');
        this.notifyListeners();
    }

    /**
     * Scan for networks
     */
    scanNetworks(): Promise<WiFiNetwork[]> {
        return new Promise((resolve) => {
            this.isScanning = true;
            this.notifyListeners();

            // Simulate scan time
            setTimeout(() => {
                // Add some randomness to RSSI values
                this.availableNetworks = this.availableNetworks.map(n => ({
                    ...n,
                    rssi: n.rssi + Math.floor(Math.random() * 10 - 5),
                }));

                this.isScanning = false;
                this.status = 'WL_SCAN_COMPLETED';
                console.log(`[WiFiMock] Scan complete, found ${this.availableNetworks.length} networks`);
                this.notifyListeners();
                resolve([...this.availableNetworks]);
            }, 2000); // 2s scan time
        });
    }

    /**
     * Set hostname
     */
    setHostname(name: string): void {
        this.hostname = name;
        this.notifyListeners();
    }

    /**
     * Add a mock network
     */
    addMockNetwork(network: WiFiNetwork): void {
        this.availableNetworks.push(network);
        this.notifyListeners();
    }

    /**
     * Make an HTTP request
     */
    httpRequest(method: HTTPRequest['method'], url: string, options?: {
        headers?: Record<string, string>;
        body?: string;
    }): Promise<HTTPResponse> {
        return new Promise((resolve, reject) => {
            if (this.status !== 'WL_CONNECTED') {
                reject(new Error('Not connected to WiFi'));
                return;
            }

            const request: HTTPRequest = {
                id: `req_${++this.requestIdCounter}`,
                method,
                url,
                headers: options?.headers,
                body: options?.body,
                timestamp: Date.now(),
            };

            this.pendingRequests.push(request);
            console.log(`[WiFiMock] HTTP ${method} ${url}`);
            this.notifyListeners();

            // Simulate network delay
            setTimeout(() => {
                // Remove from pending
                this.pendingRequests = this.pendingRequests.filter(r => r.id !== request.id);

                // Find mock response or generate default
                const mockResponse = MOCK_RESPONSES[url];
                const response: HTTPResponse = {
                    requestId: request.id,
                    statusCode: mockResponse?.status || 200,
                    headers: mockResponse?.headers || { 'Content-Type': 'application/json' },
                    body: mockResponse?.body || JSON.stringify({ mock: true, url }),
                    timestamp: Date.now(),
                };

                this.completedRequests.push({ request, response });

                // Keep only last 50 requests
                if (this.completedRequests.length > 50) {
                    this.completedRequests.shift();
                }

                console.log(`[WiFiMock] HTTP response: ${response.statusCode}`);
                this.notifyListeners();
                resolve(response);
            }, 200 + Math.random() * 300); // 200-500ms latency
        });
    }

    /**
     * Shorthand for GET request
     */
    get(url: string): Promise<HTTPResponse> {
        return this.httpRequest('GET', url);
    }

    /**
     * Shorthand for POST request
     */
    post(url: string, body: string, contentType: string = 'application/json'): Promise<HTTPResponse> {
        return this.httpRequest('POST', url, {
            headers: { 'Content-Type': contentType },
            body,
        });
    }

    /**
     * Get current state
     */
    getState(): WiFiMockState {
        return {
            mode: this.mode,
            status: this.status,
            ssid: this.ssid,
            localIP: this.localIP,
            gatewayIP: this.gatewayIP,
            subnetMask: this.subnetMask,
            dns: this.dns,
            macAddress: this.macAddress,
            rssi: this.rssi,
            hostname: this.hostname,
            availableNetworks: [...this.availableNetworks],
            isScanning: this.isScanning,
            pendingRequests: [...this.pendingRequests],
            completedRequests: [...this.completedRequests],
        };
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.status === 'WL_CONNECTED';
    }

    /**
     * Get local IP
     */
    getLocalIP(): string {
        return this.localIP;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: WiFiMockListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    /**
     * Reset to initial state
     */
    reset(): void {
        this.mode = 'OFF';
        this.status = 'WL_IDLE_STATUS';
        this.ssid = null;
        this.localIP = '0.0.0.0';
        this.gatewayIP = '0.0.0.0';
        this.rssi = 0;
        this.isScanning = false;
        this.pendingRequests = [];
        this.completedRequests = [];
        this.availableNetworks = [...DEFAULT_NETWORKS];
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
let wifiMockInstance: WiFiMock | null = null;

/**
 * Get the WiFi mock singleton
 */
export function getWiFiMock(): WiFiMock {
    if (!wifiMockInstance) {
        wifiMockInstance = new WiFiMock();
    }
    return wifiMockInstance;
}

export type { WiFiMock };
