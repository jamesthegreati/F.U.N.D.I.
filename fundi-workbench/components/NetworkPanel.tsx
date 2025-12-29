'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Wifi,
    WifiOff,
    RefreshCw,
    Signal,
    Lock,
    Unlock,
    Send,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { getWiFiMock, WiFiMockState, WiFiNetwork } from '@/utils/simulation/wifiMock';
import { getMQTTMock, MQTTMockState, MQTTMessage } from '@/utils/simulation/mqttMock';

interface NetworkPanelProps {
    className?: string;
    boardType?: string;
}

/**
 * Network Panel - WiFi and MQTT controls for ESP32 simulation
 */
export function NetworkPanel({ className, boardType }: NetworkPanelProps) {
    const [wifiState, setWifiState] = useState<WiFiMockState | null>(null);
    const [mqttState, setMqttState] = useState<MQTTMockState | null>(null);
    const [activeTab, setActiveTab] = useState<'wifi' | 'mqtt'>('wifi');
    const [password, setPassword] = useState('');
    const [selectedSSID, setSelectedSSID] = useState<string | null>(null);
    const [mqttTopic, setMqttTopic] = useState('');
    const [mqttMessage, setMqttMessage] = useState('');

    // Only show for ESP32 boards
    const isESP32 = boardType?.toLowerCase().includes('esp32');

    // Subscribe to WiFi state
    useEffect(() => {
        const wifi = getWiFiMock();
        const unsubscribe = wifi.subscribe(setWifiState);
        return unsubscribe;
    }, []);

    // Subscribe to MQTT state
    useEffect(() => {
        const mqtt = getMQTTMock();
        const unsubscribe = mqtt.subscribeToState(setMqttState);
        return unsubscribe;
    }, []);

    const handleScan = useCallback(async () => {
        await getWiFiMock().scanNetworks();
    }, []);

    const handleConnect = useCallback(async () => {
        if (!selectedSSID) return;
        const success = await getWiFiMock().connect(selectedSSID, password);
        if (success) {
            setPassword('');
            setSelectedSSID(null);
        }
    }, [selectedSSID, password]);

    const handleDisconnect = useCallback(() => {
        getWiFiMock().disconnect();
    }, []);

    const handleMqttConnect = useCallback(async () => {
        await getMQTTMock().connect({
            broker: 'mqtt://mock-broker',
            clientId: `fundi_${Date.now()}`,
        });
    }, []);

    const handleMqttDisconnect = useCallback(() => {
        getMQTTMock().disconnect();
    }, []);

    const handlePublish = useCallback(() => {
        if (!mqttTopic || !mqttMessage) return;
        getMQTTMock().publish(mqttTopic, mqttMessage);
        setMqttMessage('');
    }, [mqttTopic, mqttMessage]);

    const handleSubscribe = useCallback(() => {
        if (!mqttTopic) return;
        getMQTTMock().subscribe(mqttTopic, (msg) => {
            console.log('[MQTT] Received:', msg);
        });
        setMqttTopic('');
    }, [mqttTopic]);

    if (!isESP32) {
        return (
            <div className={cn('flex items-center justify-center h-full text-ide-text-muted text-sm', className)}>
                Network features available for ESP32 boards only
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col h-full bg-ide-panel', className)}>
            {/* Tabs */}
            <div className="flex border-b border-ide-border">
                <button
                    onClick={() => setActiveTab('wifi')}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors',
                        activeTab === 'wifi'
                            ? 'text-ide-accent border-b-2 border-ide-accent'
                            : 'text-ide-text-muted hover:text-ide-text'
                    )}
                >
                    <Wifi className="h-3.5 w-3.5" />
                    WiFi
                </button>
                <button
                    onClick={() => setActiveTab('mqtt')}
                    className={cn(
                        'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors',
                        activeTab === 'mqtt'
                            ? 'text-ide-accent border-b-2 border-ide-accent'
                            : 'text-ide-text-muted hover:text-ide-text'
                    )}
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    MQTT
                </button>
            </div>

            {/* WiFi Tab */}
            {activeTab === 'wifi' && wifiState && (
                <div className="flex-1 overflow-auto p-3 space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {wifiState.status === 'WL_CONNECTED' ? (
                                <Wifi className="h-4 w-4 text-ide-success" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-ide-text-muted" />
                            )}
                            <span className="text-sm text-ide-text">
                                {wifiState.status === 'WL_CONNECTED'
                                    ? `Connected to ${wifiState.ssid}`
                                    : 'Disconnected'}
                            </span>
                        </div>
                        {wifiState.status === 'WL_CONNECTED' && (
                            <button
                                onClick={handleDisconnect}
                                className="text-xs text-ide-error hover:underline"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>

                    {/* IP Info */}
                    {wifiState.status === 'WL_CONNECTED' && (
                        <div className="text-xs text-ide-text-muted space-y-1 bg-ide-bg rounded p-2">
                            <div>IP: {wifiState.localIP}</div>
                            <div>Gateway: {wifiState.gatewayIP}</div>
                            <div>RSSI: {wifiState.rssi} dBm</div>
                        </div>
                    )}

                    {/* Network List */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-ide-text">Available Networks</span>
                            <button
                                onClick={handleScan}
                                disabled={wifiState.isScanning}
                                className="p-1 text-ide-text-muted hover:text-ide-text disabled:opacity-50"
                            >
                                <RefreshCw className={cn('h-3.5 w-3.5', wifiState.isScanning && 'animate-spin')} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            {wifiState.availableNetworks.map((network) => (
                                <button
                                    key={network.ssid}
                                    onClick={() => setSelectedSSID(network.ssid)}
                                    className={cn(
                                        'w-full flex items-center justify-between p-2 rounded text-left transition-colors',
                                        selectedSSID === network.ssid
                                            ? 'bg-ide-accent/20 border border-ide-accent'
                                            : 'bg-ide-bg hover:bg-ide-panel-hover'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {network.encryption === 'OPEN' ? (
                                            <Unlock className="h-3 w-3 text-ide-text-muted" />
                                        ) : (
                                            <Lock className="h-3 w-3 text-ide-text-muted" />
                                        )}
                                        <span className="text-xs text-ide-text">{network.ssid}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Signal className="h-3 w-3 text-ide-text-muted" />
                                        <span className="text-xs text-ide-text-muted">{network.rssi} dBm</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Connect Form */}
                    {selectedSSID && (
                        <div className="space-y-2 pt-2 border-t border-ide-border">
                            <div className="text-xs text-ide-text">Connect to: {selectedSSID}</div>
                            <input
                                type="password"
                                placeholder="Password (or leave empty for open)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                            />
                            <button
                                onClick={handleConnect}
                                className="w-full py-1.5 text-xs bg-ide-accent text-white rounded hover:bg-ide-accent/80 transition-colors"
                            >
                                Connect
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MQTT Tab */}
            {activeTab === 'mqtt' && mqttState && (
                <div className="flex-1 overflow-auto p-3 space-y-3">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                'h-2 w-2 rounded-full',
                                mqttState.connected ? 'bg-ide-success' : 'bg-ide-text-muted'
                            )} />
                            <span className="text-sm text-ide-text">
                                {mqttState.connected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                        {mqttState.connected ? (
                            <button
                                onClick={handleMqttDisconnect}
                                className="text-xs text-ide-error hover:underline"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleMqttConnect}
                                className="text-xs text-ide-accent hover:underline"
                            >
                                Connect
                            </button>
                        )}
                    </div>

                    {mqttState.connected && (
                        <>
                            {/* Broker Info */}
                            <div className="text-xs text-ide-text-muted bg-ide-bg rounded p-2">
                                <div>Broker: {mqttState.broker}</div>
                                <div>Client: {mqttState.clientId}</div>
                            </div>

                            {/* Topic Input */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Topic (e.g., sensors/temp)"
                                    value={mqttTopic}
                                    onChange={(e) => setMqttTopic(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={!mqttTopic}
                                    className="w-full py-1 text-xs bg-ide-panel-hover text-ide-text rounded hover:bg-ide-border disabled:opacity-50 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </div>

                            {/* Publish */}
                            <div className="space-y-2 pt-2 border-t border-ide-border">
                                <span className="text-xs font-medium text-ide-text">Publish</span>
                                <input
                                    type="text"
                                    placeholder="Message"
                                    value={mqttMessage}
                                    onChange={(e) => setMqttMessage(e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                                />
                                <button
                                    onClick={handlePublish}
                                    disabled={!mqttTopic || !mqttMessage}
                                    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-ide-accent text-white rounded hover:bg-ide-accent/80 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-3 w-3" />
                                    Publish
                                </button>
                            </div>

                            {/* Subscriptions */}
                            {mqttState.subscriptions.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-ide-border">
                                    <span className="text-xs font-medium text-ide-text">Subscriptions</span>
                                    {mqttState.subscriptions.map((topic) => (
                                        <div key={topic} className="text-xs text-ide-text-muted bg-ide-bg rounded px-2 py-1">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent Messages */}
                            {mqttState.publishedMessages.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-ide-border">
                                    <span className="text-xs font-medium text-ide-text">Recent Messages</span>
                                    <div className="max-h-32 overflow-auto space-y-1">
                                        {mqttState.publishedMessages.slice(-5).reverse().map((msg, idx) => (
                                            <div key={idx} className="text-xs bg-ide-bg rounded px-2 py-1">
                                                <span className="text-ide-accent">{msg.topic}</span>
                                                <span className="text-ide-text-muted"> → </span>
                                                <span className="text-ide-text">
                                                    {typeof msg.payload === 'string' ? msg.payload : '[binary]'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default NetworkPanel;
