(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/nodes/ArduinoNode.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wokwi$2f$elements$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wokwi/elements/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Wokwi approach: pinInfo coords are at 96 DPI
// Reference dimensions: 72.58mm x 53.34mm = 274.32px x 201.56px at 96 DPI
const REFERENCE_WIDTH = 72.58 * (96 / 25.4); // ~274.32 px
const REFERENCE_HEIGHT = 53.34 * (96 / 25.4); // ~201.56 px
function ArduinoNode({ id: nodeId, data }) {
    _s();
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const [hoveredPin, setHoveredPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pins, setPins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [svgDimensions, setSvgDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 274,
        height: 201
    });
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const elementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const calculatePins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ArduinoNode.useCallback[calculatePins]": ()=>{
            const element = elementRef.current;
            if (!element || !element.shadowRoot || !element.pinInfo) return;
            const svg = element.shadowRoot.querySelector('svg');
            if (!svg) return;
            const viewBoxAttr = svg.getAttribute('viewBox');
            if (!viewBoxAttr) return;
            // ViewBox: "-4 0 72.58 53.34" (mm)
            const [, , vbW_mm, vbH_mm] = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
            if (vbW_mm === 0 || vbH_mm === 0) return;
            // Convert mm to px (96 DPI)
            const MM_TO_PX = 96 / 25.4;
            const vbW_px = vbW_mm * MM_TO_PX;
            const vbH_px = vbH_mm * MM_TO_PX;
            setSvgDimensions({
                width: vbW_px,
                height: vbH_px
            });
            // Use pinInfo coordinates DIRECTLY - they're likely already in the right space
            const mappedPins = element.pinInfo.map({
                "ArduinoNode.useCallback[calculatePins].mappedPins": (pin)=>{
                    const isTop = pin.y < vbH_px / 2;
                    return {
                        id: pin.name,
                        x: pin.x,
                        y: pin.y,
                        row: isTop ? 'top' : 'bottom'
                    };
                }
            }["ArduinoNode.useCallback[calculatePins].mappedPins"]);
            setPins(mappedPins);
        }
    }["ArduinoNode.useCallback[calculatePins]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ArduinoNode.useEffect": ()=>{
            const initElement = {
                "ArduinoNode.useEffect.initElement": async ()=>{
                    await customElements.whenDefined('wokwi-arduino-uno');
                    const element = containerRef.current?.querySelector('wokwi-arduino-uno');
                    if (!element) return;
                    elementRef.current = element;
                    requestAnimationFrame({
                        "ArduinoNode.useEffect.initElement": ()=>{
                            calculatePins();
                            setTimeout(calculatePins, 100);
                            setTimeout(calculatePins, 300);
                        }
                    }["ArduinoNode.useEffect.initElement"]);
                }
            }["ArduinoNode.useEffect.initElement"];
            initElement();
            const observer = new ResizeObserver(calculatePins);
            if (containerRef.current) observer.observe(containerRef.current);
            window.addEventListener('resize', calculatePins);
            return ({
                "ArduinoNode.useEffect": ()=>{
                    observer.disconnect();
                    window.removeEventListener('resize', calculatePins);
                }
            })["ArduinoNode.useEffect"];
        }
    }["ArduinoNode.useEffect"], [
        calculatePins
    ]);
    const handlePinClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ArduinoNode.useCallback[handlePinClick]": (e, pin)=>{
            e.stopPropagation();
            if (!onPinClick || !elementRef.current) return;
            const element = elementRef.current;
            const elementRect = element.getBoundingClientRect();
            // Calculate scale: how much the element is scaled from reference
            // Reference: 72.58mm x 53.34mm = 274.32px x 201.56px at 96 DPI
            const REFERENCE_WIDTH = 72.58 * (96 / 25.4);
            const REFERENCE_HEIGHT = 53.34 * (96 / 25.4);
            const scaleX = elementRect.width / REFERENCE_WIDTH;
            const scaleY = elementRect.height / REFERENCE_HEIGHT;
            // Transform pin coordinates (96 DPI) to screen coordinates
            const screenX = elementRect.left + pin.x * scaleX;
            const screenY = elementRect.top + pin.y * scaleY;
            const canvasRect = getCanvasRect?.();
            const canvasRelative = canvasRect ? {
                x: screenX - canvasRect.left,
                y: screenY - canvasRect.top
            } : {
                x: screenX,
                y: screenY
            };
            onPinClick(nodeId, pin.id, canvasRelative);
        }
    }["ArduinoNode.useCallback[handlePinClick]"], [
        onPinClick,
        nodeId,
        getCanvasRect
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative",
        style: {
            display: 'inline-block',
            lineHeight: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("wokwi-arduino-uno", {
                style: {
                    display: 'block'
                }
            }, void 0, false, {
                fileName: "[project]/components/nodes/ArduinoNode.tsx",
                lineNumber: 147,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                },
                children: pins.map((pin)=>{
                    const leftPct = svgDimensions.width ? pin.x / svgDimensions.width * 100 : 0;
                    const topPct = svgDimensions.height ? pin.y / svgDimensions.height * 100 : 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "nodrag",
                        "data-fundi-pin": "true",
                        "data-node-id": nodeId,
                        "data-pin-id": pin.id,
                        style: {
                            position: 'absolute',
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: 14,
                            height: 14,
                            transform: 'translate(-50%, -50%)',
                            borderRadius: 9999,
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            background: 'transparent',
                            touchAction: 'none',
                            zIndex: 30
                        },
                        onPointerDown: (e)=>{
                            // Prevent ReactFlow node dragging from stealing the interaction
                            e.stopPropagation();
                        },
                        onMouseEnter: ()=>setHoveredPin(pin.id),
                        onMouseLeave: ()=>setHoveredPin(null),
                        onClick: (e)=>handlePinClick(e, pin),
                        "aria-label": `Pin ${pin.id}`
                    }, pin.id, false, {
                        fileName: "[project]/components/nodes/ArduinoNode.tsx",
                        lineNumber: 170,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/ArduinoNode.tsx",
                lineNumber: 150,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 10
                },
                viewBox: `0 0 ${svgDimensions.width} ${svgDimensions.height}`,
                children: pins.map((pin)=>{
                    const isHovered = hoveredPin === pin.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: pin.x,
                                cy: pin.y,
                                r: isHovered ? 3 : 2,
                                fill: isHovered ? '#22c55e' : 'rgba(34, 197, 94, 0.5)',
                                stroke: isHovered ? '#16a34a' : 'rgba(22, 163, 74, 0.7)',
                                strokeWidth: 0.5,
                                style: {
                                    transition: 'all 0.1s ease'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/nodes/ArduinoNode.tsx",
                                lineNumber: 222,
                                columnNumber: 29
                            }, this),
                            isHovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: pin.x - 15,
                                        y: pin.row === 'top' ? pin.y + 5 : pin.y - 15,
                                        width: 30,
                                        height: 10,
                                        rx: 2,
                                        fill: "rgba(15, 23, 42, 0.95)",
                                        stroke: "rgba(34, 197, 94, 0.5)",
                                        strokeWidth: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/components/nodes/ArduinoNode.tsx",
                                        lineNumber: 233,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                        x: pin.x,
                                        y: pin.row === 'top' ? pin.y + 12.5 : pin.y - 7.5,
                                        textAnchor: "middle",
                                        fill: "#4ade80",
                                        fontSize: 5,
                                        fontFamily: "monospace",
                                        children: pin.id
                                    }, void 0, false, {
                                        fileName: "[project]/components/nodes/ArduinoNode.tsx",
                                        lineNumber: 243,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/nodes/ArduinoNode.tsx",
                                lineNumber: 232,
                                columnNumber: 33
                            }, this)
                        ]
                    }, pin.id, true, {
                        fileName: "[project]/components/nodes/ArduinoNode.tsx",
                        lineNumber: 221,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/ArduinoNode.tsx",
                lineNumber: 204,
                columnNumber: 13
            }, this),
            pins.map((pin)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Handle"], {
                    id: pin.id,
                    type: "source",
                    position: pin.row === 'top' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Top : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Position"].Bottom,
                    style: {
                        opacity: 0,
                        pointerEvents: 'none'
                    }
                }, pin.id, false, {
                    fileName: "[project]/components/nodes/ArduinoNode.tsx",
                    lineNumber: 261,
                    columnNumber: 17
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/nodes/ArduinoNode.tsx",
        lineNumber: 138,
        columnNumber: 9
    }, this);
}
_s(ArduinoNode, "LFvIkvyQGGr2LRcNDKgJzqJ8/S4=");
_c = ArduinoNode;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(ArduinoNode);
var _c, _c1;
__turbopack_context__.k.register(_c, "ArduinoNode");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/wokwiParts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Registry of available Wokwi parts
 */ __turbopack_context__.s([
    "WOKWI_PARTS",
    ()=>WOKWI_PARTS
]);
const WOKWI_PARTS = {
    'arduino-uno': {
        name: 'Arduino Uno',
        element: 'wokwi-arduino-uno',
        description: 'ATmega328P-based microcontroller board',
        category: 'mcu'
    },
    'esp32-devkit-v1': {
        name: 'ESP32 DevKit V1',
        element: 'wokwi-esp32-devkit-v1',
        description: 'ESP32 development board with WiFi & Bluetooth',
        category: 'mcu'
    },
    'arduino-mega': {
        name: 'Arduino Mega',
        element: 'wokwi-arduino-mega',
        description: 'ATmega2560-based board with more pins',
        category: 'mcu'
    },
    'arduino-nano': {
        name: 'Arduino Nano',
        element: 'wokwi-arduino-nano',
        description: 'Compact ATmega328P board',
        category: 'mcu'
    },
    'nano-rp2040-connect': {
        name: 'Nano RP2040 Connect',
        element: 'wokwi-nano-rp2040-connect',
        description: 'RP2040-based Arduino Nano form factor',
        category: 'mcu'
    },
    'franzininho': {
        name: 'Franzininho',
        element: 'wokwi-franzininho',
        description: 'ATtiny85-based development board',
        category: 'mcu'
    },
    // Displays
    'oled-128x64-i2c': {
        name: 'OLED 128x64 (I2C)',
        element: 'wokwi-ssd1306',
        description: 'SSD1306 monochrome OLED display',
        category: 'displays'
    },
    'lcd1602': {
        name: 'LCD 1602',
        element: 'wokwi-lcd1602',
        description: '16x2 character LCD',
        category: 'displays'
    },
    'seven-segment': {
        name: '7-Segment Display',
        element: 'wokwi-7segment',
        description: 'Single-digit 7-segment display',
        category: 'displays'
    },
    'lcd2004': {
        name: 'LCD 2004',
        element: 'wokwi-lcd2004',
        description: '20x4 character LCD',
        category: 'displays'
    },
    'ili9341': {
        name: 'ILI9341 TFT',
        element: 'wokwi-ili9341',
        description: 'SPI TFT display (ILI9341)',
        category: 'displays'
    },
    // LEDs
    'led': {
        name: 'LED',
        element: 'wokwi-led',
        description: 'Basic single-color LED',
        category: 'leds'
    },
    'rgb-led': {
        name: 'RGB LED',
        element: 'wokwi-rgb-led',
        description: 'Common-cathode RGB LED',
        category: 'leds'
    },
    'neopixel': {
        name: 'NeoPixel (WS2812)',
        element: 'wokwi-neopixel',
        description: 'Addressable RGB LED (single)',
        category: 'leds'
    },
    'neopixel-matrix': {
        name: 'NeoPixel Matrix',
        element: 'wokwi-neopixel-matrix',
        description: 'Addressable RGB LED matrix',
        category: 'leds'
    },
    'led-bar-graph': {
        name: 'LED Bar Graph',
        element: 'wokwi-led-bar-graph',
        description: '10-segment LED bar graph',
        category: 'leds'
    },
    'led-ring': {
        name: 'LED Ring',
        element: 'wokwi-led-ring',
        description: 'Addressable LED ring',
        category: 'leds'
    },
    // Sensors
    'dht22': {
        name: 'DHT22',
        element: 'wokwi-dht22',
        description: 'Temperature & humidity sensor',
        category: 'sensors'
    },
    'hc-sr04': {
        name: 'HC-SR04',
        element: 'wokwi-hc-sr04',
        description: 'Ultrasonic distance sensor',
        category: 'sensors'
    },
    'pir-motion': {
        name: 'PIR Motion Sensor',
        element: 'wokwi-pir-motion-sensor',
        description: 'Passive infrared motion sensor',
        category: 'sensors'
    },
    'photoresistor': {
        name: 'Photoresistor (LDR)',
        element: 'wokwi-photoresistor-sensor',
        description: 'Light-dependent resistor sensor',
        category: 'sensors'
    },
    'mpu6050': {
        name: 'MPU6050',
        element: 'wokwi-mpu6050',
        description: 'Accelerometer + gyroscope (I2C)',
        category: 'sensors'
    },
    'ds1307': {
        name: 'DS1307 RTC',
        element: 'wokwi-ds1307',
        description: 'Real-time clock module (I2C)',
        category: 'sensors'
    },
    'ir-receiver': {
        name: 'IR Receiver',
        element: 'wokwi-ir-receiver',
        description: 'Infrared receiver',
        category: 'sensors'
    },
    'ir-remote': {
        name: 'IR Remote',
        element: 'wokwi-ir-remote',
        description: 'Infrared remote control',
        category: 'sensors'
    },
    'analog-joystick': {
        name: 'Analog Joystick',
        element: 'wokwi-analog-joystick',
        description: '2-axis analog joystick',
        category: 'sensors'
    },
    'rotary-encoder': {
        name: 'Rotary Encoder (KY-040)',
        element: 'wokwi-ky-040',
        description: 'Incremental rotary encoder',
        category: 'sensors'
    },
    'pushbutton': {
        name: 'Pushbutton',
        element: 'wokwi-pushbutton',
        description: 'Momentary pushbutton',
        category: 'sensors'
    },
    'pushbutton-6mm': {
        name: 'Pushbutton (6mm)',
        element: 'wokwi-pushbutton-6mm',
        description: 'Tactile 6mm pushbutton',
        category: 'sensors'
    },
    'resistor': {
        name: 'Resistor',
        element: 'wokwi-resistor',
        description: 'Generic resistor',
        category: 'sensors'
    },
    'potentiometer': {
        name: 'Potentiometer',
        element: 'wokwi-potentiometer',
        description: 'Rotary potentiometer',
        category: 'sensors'
    },
    'slide-potentiometer': {
        name: 'Slide Potentiometer',
        element: 'wokwi-slide-potentiometer',
        description: 'Linear slide potentiometer',
        category: 'sensors'
    },
    'slide-switch': {
        name: 'Slide Switch',
        element: 'wokwi-slide-switch',
        description: '2-position slide switch',
        category: 'sensors'
    },
    'dip-switch-8': {
        name: 'DIP Switch (8)',
        element: 'wokwi-dip-switch-8',
        description: '8-position DIP switch',
        category: 'sensors'
    },
    'buzzer': {
        name: 'Buzzer',
        element: 'wokwi-buzzer',
        description: 'Piezo buzzer',
        category: 'sensors'
    },
    'servo': {
        name: 'Servo',
        element: 'wokwi-servo',
        description: 'RC servo motor',
        category: 'sensors'
    },
    'membrane-keypad': {
        name: 'Membrane Keypad',
        element: 'wokwi-membrane-keypad',
        description: 'Matrix keypad',
        category: 'sensors'
    },
    'microsd-card': {
        name: 'MicroSD Card',
        element: 'wokwi-microsd-card',
        description: 'MicroSD card module',
        category: 'sensors'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/nodes/WokwiPartNode.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wokwi$2f$elements$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wokwi/elements/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wokwiParts.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function getPartTypeFromData(data) {
    const maybe = data?.partType;
    return typeof maybe === 'string' ? maybe : null;
}
/**
 * Generic Wokwi Part Node - renders any Wokwi element with pin overlays
 */ function WokwiPartNode({ id: nodeId = 'preview', data, partType: propPartType }) {
    _s();
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const partType = propPartType ?? getPartTypeFromData(data) ?? 'arduino-uno';
    const [hoveredPin, setHoveredPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pins, setPins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [svgDimensions, setSvgDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 100,
        height: 100
    });
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const elementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const partConfig = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][partType];
    const PartElement = partConfig?.element ?? null;
    const handlePinClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WokwiPartNode.useCallback[handlePinClick]": (e, pin)=>{
            e.stopPropagation();
            if (!onPinClick || !elementRef.current) return;
            const element = elementRef.current;
            const elementRect = element.getBoundingClientRect();
            // Calculate scale: how much the element is scaled from its internal coordinate space
            const scaleX = elementRect.width / svgDimensions.width;
            const scaleY = elementRect.height / svgDimensions.height;
            // Transform pin coordinates to screen coordinates
            const screenX = elementRect.left + pin.x * scaleX;
            const screenY = elementRect.top + pin.y * scaleY;
            const canvasRect = getCanvasRect?.();
            const canvasRelative = canvasRect ? {
                x: screenX - canvasRect.left,
                y: screenY - canvasRect.top
            } : {
                x: screenX,
                y: screenY
            };
            onPinClick(nodeId, pin.id, canvasRelative);
        }
    }["WokwiPartNode.useCallback[handlePinClick]"], [
        onPinClick,
        nodeId,
        getCanvasRect,
        svgDimensions
    ]);
    const calculatePins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WokwiPartNode.useCallback[calculatePins]": ()=>{
            const element = elementRef.current;
            if (!element || !element.shadowRoot || !element.pinInfo) return;
            const svg = element.shadowRoot.querySelector('svg');
            if (!svg) return;
            const viewBoxAttr = svg.getAttribute('viewBox');
            const widthAttr = svg.getAttribute('width') || '';
            const heightAttr = svg.getAttribute('height') || '';
            if (!viewBoxAttr) return;
            // Parse viewBox: "minX minY width height"
            const [, , vbW, vbH] = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
            if (!vbW || !vbH) return;
            // Parse mm dimensions if present
            const widthMM = widthAttr.includes('mm') ? parseFloat(widthAttr) : null;
            const heightMM = heightAttr.includes('mm') ? parseFloat(heightAttr) : null;
            // Detect if viewBox is in mm by checking if it matches the mm dimensions
            // Arduino: viewBox="-4 0 72.58 53.34" with width="72.58mm" height="53.34mm" -> viewBox IS in mm
            // ESP32: viewBox="0 0 107 201" with width="28.2mm" height="54.053mm" -> viewBox is NOT in mm
            const viewBoxMatchesMM = widthMM !== null && heightMM !== null && Math.abs(vbW - widthMM) < 1 && Math.abs(vbH - heightMM) < 1;
            const MM_TO_PX = 96 / 25.4;
            let overlayWidth;
            let overlayHeight;
            if (viewBoxMatchesMM) {
                // ViewBox is in mm, convert to pixels to match pinInfo coordinates
                overlayWidth = vbW * MM_TO_PX;
                overlayHeight = vbH * MM_TO_PX;
            } else {
                // ViewBox is already in the correct coordinate space (like ESP32)
                overlayWidth = vbW;
                overlayHeight = vbH;
            }
            setSvgDimensions({
                width: overlayWidth,
                height: overlayHeight
            });
            // Map pins - pinInfo coordinates work directly in the overlay's space
            const mappedPins = element.pinInfo.map({
                "WokwiPartNode.useCallback[calculatePins].mappedPins": (pin)=>{
                    // Determine which edge the pin is closest to
                    const relX = pin.x / overlayWidth;
                    const relY = pin.y / overlayHeight;
                    let row;
                    if (relX < 0.15) row = 'left';
                    else if (relX > 0.85) row = 'right';
                    else if (relY < 0.5) row = 'top';
                    else row = 'bottom';
                    return {
                        id: pin.name,
                        x: pin.x,
                        y: pin.y,
                        row
                    };
                }
            }["WokwiPartNode.useCallback[calculatePins].mappedPins"]);
            setPins(mappedPins);
        }
    }["WokwiPartNode.useCallback[calculatePins]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const initElement = {
                "WokwiPartNode.useEffect.initElement": async ()=>{
                    await customElements.whenDefined(partConfig.element);
                    const element = containerRef.current?.querySelector(partConfig.element);
                    if (!element) return;
                    elementRef.current = element;
                    requestAnimationFrame({
                        "WokwiPartNode.useEffect.initElement": ()=>{
                            calculatePins();
                            setTimeout(calculatePins, 100);
                            setTimeout(calculatePins, 300);
                        }
                    }["WokwiPartNode.useEffect.initElement"]);
                }
            }["WokwiPartNode.useEffect.initElement"];
            initElement();
            const observer = new ResizeObserver(calculatePins);
            if (containerRef.current) observer.observe(containerRef.current);
            window.addEventListener('resize', calculatePins);
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    observer.disconnect();
                    window.removeEventListener('resize', calculatePins);
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        calculatePins,
        partConfig.element
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative glass-panel border-alchemist rounded-md",
        style: {
            display: 'inline-block',
            lineHeight: 0
        },
        children: [
            PartElement ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartElement, {
                style: {
                    display: 'block'
                }
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 187,
                columnNumber: 28
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                },
                children: pins.map((pin)=>{
                    const leftPct = svgDimensions.width ? pin.x / svgDimensions.width * 100 : 0;
                    const topPct = svgDimensions.height ? pin.y / svgDimensions.height * 100 : 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "nodrag",
                        "data-fundi-pin": "true",
                        "data-node-id": nodeId,
                        "data-pin-id": pin.id,
                        style: {
                            position: 'absolute',
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: 14,
                            height: 14,
                            transform: 'translate(-50%, -50%)',
                            borderRadius: 9999,
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            background: 'transparent',
                            touchAction: 'none',
                            zIndex: 30
                        },
                        onPointerDown: (e)=>{
                            // Prevent ReactFlow node dragging from stealing the interaction
                            e.stopPropagation();
                        },
                        onMouseEnter: ()=>setHoveredPin(pin.id),
                        onMouseLeave: ()=>setHoveredPin(null),
                        onClick: (e)=>handlePinClick(e, pin),
                        "aria-label": `Pin ${pin.id}`
                    }, pin.id, false, {
                        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                        lineNumber: 210,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 190,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 10
                },
                viewBox: `0 0 ${svgDimensions.width} ${svgDimensions.height}`,
                children: pins.map((pin)=>{
                    const isHovered = hoveredPin === pin.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: pin.x,
                                cy: pin.y,
                                r: isHovered ? 3.5 : 2.5,
                                fill: isHovered ? '#D4AF37' : '#B87333',
                                stroke: isHovered ? '#00F0FF' : '#8B4513',
                                strokeWidth: isHovered ? 1 : 0.75,
                                style: {
                                    transition: 'all 0.1s ease',
                                    pointerEvents: 'none',
                                    filter: isHovered ? 'drop-shadow(0 0 3px #00F0FF)' : 'none'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                                lineNumber: 263,
                                columnNumber: 29
                            }, this),
                            isHovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: pin.x - 15,
                                        y: pin.row === 'top' || pin.row === 'left' ? pin.y + 6 : pin.y - 18,
                                        width: 30,
                                        height: 12,
                                        rx: 2,
                                        fill: "rgba(21, 27, 43, 0.95)",
                                        stroke: "rgba(212, 175, 55, 0.5)",
                                        strokeWidth: 0.5
                                    }, void 0, false, {
                                        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                                        lineNumber: 278,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                        x: pin.x,
                                        y: pin.row === 'top' || pin.row === 'left' ? pin.y + 15 : pin.y - 9,
                                        textAnchor: "middle",
                                        fill: "#D4AF37",
                                        fontSize: 6,
                                        fontFamily: "monospace",
                                        fontWeight: "bold",
                                        children: pin.id
                                    }, void 0, false, {
                                        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                                        lineNumber: 288,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                                lineNumber: 277,
                                columnNumber: 33
                            }, this)
                        ]
                    }, pin.id, true, {
                        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                        lineNumber: 261,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 244,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
        lineNumber: 178,
        columnNumber: 9
    }, this);
}
_s(WokwiPartNode, "aGHyyJ7ZAS2pKBLK1S4ESVKOFdc=");
_c = WokwiPartNode;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(WokwiPartNode);
var _c, _c1;
__turbopack_context__.k.register(_c, "WokwiPartNode");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/cn.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ComponentLibrary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FUNDI_PART_MIME",
    ()=>FUNDI_PART_MIME,
    "buildPartCatalog",
    ()=>buildPartCatalog,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.js [app-client] (ecmascript) <export default as Gauge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wokwiParts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const FUNDI_PART_MIME = 'application/x-fundi-part';
function buildPartCatalog() {
    const base = {
        mcu: [],
        displays: [],
        leds: [],
        sensors: []
    };
    for (const id of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"])){
        const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][id];
        const cat = cfg.category ?? 'mcu';
        base[cat].push({
            id,
            name: cfg.name,
            description: cfg.description
        });
    }
    return [
        {
            key: 'mcu',
            title: 'MCU',
            items: base.mcu,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"]
        },
        {
            key: 'displays',
            title: 'Display',
            items: base.displays,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__["Monitor"]
        },
        {
            key: 'leds',
            title: 'LEDs',
            items: base.leds,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"]
        },
        {
            key: 'sensors',
            title: 'Input',
            items: base.sensors,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"]
        }
    ];
}
function ComponentLibrary() {
    _s();
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ComponentLibrary.useMemo[categories]": ()=>buildPartCatalog()
    }["ComponentLibrary.useMemo[categories]"], []);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('mcu');
    const activeCategory = categories.find((c)=>c.key === active) ?? categories[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-b border-ide-border pb-3 mb-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-1",
                    children: categories.map((cat)=>{
                        const isActive = cat.key === active;
                        const Icon = cat.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>setActive(cat.key),
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all', isActive ? 'bg-ide-accent/20 text-ide-accent' : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'),
                            title: cat.title,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 76,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: cat.title
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 77,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, cat.key, true, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 64,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 overflow-auto",
                children: activeCategory.items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full items-center justify-center text-xs text-ide-text-subtle",
                    children: "No components in this category yet."
                }, void 0, false, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 87,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-2",
                    children: activeCategory.items.map((item)=>{
                        const Icon = activeCategory.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            draggable: true,
                            onDragStart: (e)=>{
                                e.dataTransfer.effectAllowed = 'copy';
                                e.dataTransfer.setData(FUNDI_PART_MIME, item.id);
                            },
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group relative flex cursor-grab flex-col items-center justify-center', 'rounded-lg border p-3 transition-all duration-200', 'bg-ide-panel-surface border-ide-border', 'hover:border-ide-accent/50 hover:bg-ide-panel-hover', 'active:cursor-grabbing active:scale-95'),
                            title: item.description ?? item.name,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "h-6 w-6 text-ide-text-muted transition-colors group-hover:text-ide-accent"
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 113,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-[10px] text-ide-text-muted group-hover:text-ide-text transition-colors leading-tight",
                                        children: item.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/ComponentLibrary.tsx",
                                        lineNumber: 117,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 116,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 96,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 91,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ComponentLibrary.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s(ComponentLibrary, "tbKsSzL8kYZ0UHviM6whfieVZ5k=");
_c = ComponentLibrary;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(ComponentLibrary);
var _c, _c1;
__turbopack_context__.k.register(_c, "ComponentLibrary");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/StatusBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
'use client';
;
;
;
function StatusBadge({ deviceName = 'Arduino Uno', isConnected = true, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('inline-flex items-center gap-2 rounded-md', 'bg-ide-panel-bg border border-ide-border', 'px-2.5 py-1', 'transition-all duration-200', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
                className: "h-3.5 w-3.5 text-ide-text-muted",
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/components/StatusBadge.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-medium text-ide-text",
                children: deviceName
            }, void 0, false, {
                fileName: "[project]/components/StatusBadge.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-3 w-px bg-ide-border"
            }, void 0, false, {
                fileName: "[project]/components/StatusBadge.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: isConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                            className: "h-3 w-3 text-ide-success",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/components/StatusBadge.tsx",
                            lineNumber: 44,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-medium text-ide-success",
                            children: "Connected"
                        }, void 0, false, {
                            fileName: "[project]/components/StatusBadge.tsx",
                            lineNumber: 45,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                            className: "h-3 w-3 text-ide-text-subtle",
                            "aria-hidden": true
                        }, void 0, false, {
                            fileName: "[project]/components/StatusBadge.tsx",
                            lineNumber: 49,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-medium text-ide-text-subtle",
                            children: "Disconnected"
                        }, void 0, false, {
                            fileName: "[project]/components/StatusBadge.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/StatusBadge.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            isConnected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative ml-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1.5 w-1.5 rounded-full bg-ide-success"
                    }, void 0, false, {
                        fileName: "[project]/components/StatusBadge.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 h-1.5 w-1.5 rounded-full bg-ide-success animate-ping opacity-75"
                    }, void 0, false, {
                        fileName: "[project]/components/StatusBadge.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StatusBadge.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/StatusBadge.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_c = StatusBadge;
var _c;
__turbopack_context__.k.register(_c, "StatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/useAppStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/nanoid/index.browser.js [app-client] (ecmascript) <locals>");
;
;
const DEFAULT_WIRE_COLOR_CYCLE = [
    '#B87333',
    '#22c55e',
    '#3b82f6',
    '#ef4444',
    '#eab308',
    '#8b5cf6',
    '#f97316',
    '#06b6d4',
    '#ec4899',
    '#000000',
    '#ffffff'
];
const defaultCode = 'void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }';
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isNotNull(value) {
    return value !== null;
}
function toCircuitParts(nodes) {
    if (!Array.isArray(nodes)) return [];
    return nodes.map((node)=>{
        if (!isRecord(node)) return null;
        const id = typeof node.id === 'string' ? node.id : '';
        const nodeType = typeof node.type === 'string' ? node.type : 'unknown';
        // Try to carry Wokwi partType from node data (for node.type === 'wokwi').
        const data = isRecord(node.data) ? node.data : null;
        const dataPartType = data && typeof data.partType === 'string' ? data.partType : null;
        const type = nodeType === 'wokwi' && dataPartType ? dataPartType : nodeType === 'arduino' ? 'arduino-uno' : nodeType;
        const position = isRecord(node.position) ? node.position : {};
        const x = typeof position.x === 'number' ? position.x : 0;
        const y = typeof position.y === 'number' ? position.y : 0;
        if (!id) return null;
        return {
            id,
            type,
            position: {
                x,
                y
            },
            rotate: 0,
            attrs: {}
        };
    }).filter(isNotNull);
}
function toCircuitConnections(edges) {
    if (!Array.isArray(edges)) return [];
    return edges.map((edge)=>{
        if (!isRecord(edge)) return null;
        const source = typeof edge.source === 'string' ? edge.source : '';
        const target = typeof edge.target === 'string' ? edge.target : '';
        // Try common React Flow / XYFlow shapes for a stroke color.
        const style = isRecord(edge.style) ? edge.style : null;
        const data = isRecord(edge.data) ? edge.data : null;
        const colorCandidate = typeof edge.color === 'string' && edge.color || style && typeof style.stroke === 'string' && style.stroke || data && typeof data.color === 'string' && data.color;
        if (!source || !target) return null;
        return {
            source,
            target,
            color: colorCandidate || 'currentColor'
        };
    }).filter(isNotNull);
}
function normalizeBoardType(partType) {
    if (partType.startsWith('wokwi-')) return partType;
    return `wokwi-${partType}`;
}
function findMicrocontroller(parts) {
    const supported = new Set([
        'wokwi-arduino-uno',
        'wokwi-arduino-nano',
        'wokwi-arduino-mega',
        'wokwi-esp32-devkit-v1',
        'wokwi-pi-pico'
    ]);
    for (const p of parts){
        const normalized = normalizeBoardType(p.type);
        if (supported.has(normalized)) return p;
    }
    return null;
}
const useAppStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        code: defaultCode,
        diagramJson: '',
        circuitParts: [],
        circuitConnections: [],
        connections: [],
        isRunning: false,
        isCompiling: false,
        compilationError: null,
        hex: null,
        compiledBoard: null,
        nextWireColorIndex: 0,
        selectedPartIds: [],
        // Terminal/AI Chat state
        terminalHistory: [],
        isAiLoading: false,
        // Teacher mode (Socratic Tutor feature)
        teacherMode: false,
        updateCode: (newCode)=>{
            set({
                code: newCode
            });
        },
        setDiagramJson: (json)=>{
            set({
                diagramJson: json
            });
        },
        updateCircuit: (nodes, edges)=>{
            const circuitParts = toCircuitParts(nodes);
            const circuitConnections = toCircuitConnections(edges);
            set({
                circuitParts,
                circuitConnections
            });
        },
        toggleSimulation: ()=>{
            set({
                isRunning: !get().isRunning
            });
        },
        compileAndRun: async ()=>{
            const mcu = findMicrocontroller(get().circuitParts);
            if (!mcu) {
                set({
                    compilationError: 'No supported microcontroller found in the circuit.',
                    hex: null,
                    compiledBoard: null
                });
                return;
            }
            const board = normalizeBoardType(mcu.type);
            set({
                isCompiling: true,
                compilationError: null
            });
            try {
                const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${baseUrl}/api/v1/compile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: get().code,
                        board
                    })
                });
                const data = await res.json().catch(()=>null);
                if (!res.ok) {
                    set({
                        compilationError: data && (data.error || (!data.success ? 'Compilation failed.' : null)) || res.statusText,
                        hex: null,
                        compiledBoard: null
                    });
                    return;
                }
                if (!data?.success || !data.hex) {
                    set({
                        compilationError: data?.error || 'Compilation failed.',
                        hex: null,
                        compiledBoard: null
                    });
                    return;
                }
                set({
                    hex: data.hex,
                    compiledBoard: board,
                    compilationError: null
                });
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                set({
                    compilationError: msg || 'Compilation request failed.',
                    hex: null,
                    compiledBoard: null
                });
            } finally{
                set({
                    isCompiling: false
                });
            }
        },
        addPart: (part)=>{
            const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])();
            const next = {
                id,
                type: part.type,
                position: {
                    x: part.position.x,
                    y: part.position.y
                },
                rotate: part.rotate ?? 0,
                attrs: part.attrs ?? {}
            };
            set({
                circuitParts: [
                    ...get().circuitParts,
                    next
                ]
            });
            return id;
        },
        updatePartsPositions: (updates)=>{
            if (!updates.length) return;
            const byId = new Map(updates.map((u)=>[
                    u.id,
                    u
                ]));
            set({
                circuitParts: get().circuitParts.map((p)=>{
                    const u = byId.get(p.id);
                    if (!u) return p;
                    return {
                        ...p,
                        position: {
                            x: u.x,
                            y: u.y
                        }
                    };
                })
            });
        },
        setSelectedPartIds: (ids)=>{
            set({
                selectedPartIds: [
                    ...new Set(ids)
                ]
            });
        },
        toggleSelectedPartId: (id)=>{
            const curr = get().selectedPartIds;
            if (curr.includes(id)) {
                set({
                    selectedPartIds: curr.filter((x)=>x !== id)
                });
            } else {
                set({
                    selectedPartIds: [
                        ...curr,
                        id
                    ]
                });
            }
        },
        clearSelectedParts: ()=>{
            set({
                selectedPartIds: []
            });
        },
        addConnection: (conn)=>{
            const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])();
            set({
                connections: [
                    ...get().connections,
                    {
                        ...conn,
                        id
                    }
                ]
            });
            return id;
        },
        allocateNextWireColor: ()=>{
            const idx = get().nextWireColorIndex;
            const color = DEFAULT_WIRE_COLOR_CYCLE[idx % DEFAULT_WIRE_COLOR_CYCLE.length];
            set({
                nextWireColorIndex: idx + 1
            });
            return color;
        },
        removeConnection: (id)=>{
            set({
                connections: get().connections.filter((c)=>c.id !== id)
            });
        },
        updateWireColor: (id, color)=>{
            set({
                connections: get().connections.map((c)=>c.id === id ? {
                        ...c,
                        color
                    } : c)
            });
        },
        updateWire: (id, points)=>{
            set({
                connections: get().connections.map((c)=>c.id === id ? {
                        ...c,
                        points
                    } : c)
            });
        },
        // Terminal/AI Chat actions
        addTerminalEntry: (entry)=>{
            const newEntry = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(),
                timestamp: Date.now(),
                ...entry
            };
            set({
                terminalHistory: [
                    ...get().terminalHistory,
                    newEntry
                ]
            });
        },
        clearTerminalHistory: ()=>{
            set({
                terminalHistory: []
            });
        },
        setTeacherMode: (enabled)=>{
            set({
                teacherMode: enabled
            });
            get().addTerminalEntry({
                type: 'log',
                content: enabled ? '🎓 Teacher Mode enabled. AI will explain concepts before providing implementations.' : '🔧 Builder Mode enabled. AI will focus on generating code and circuits.'
            });
        },
        applyGeneratedCircuit: (parts, newConnections)=>{
            // Replace current circuit with AI-generated one
            set({
                circuitParts: parts,
                connections: newConnections
            });
        },
        submitCommand: async (text, imageData)=>{
            const trimmed = text.trim();
            if (!trimmed && !imageData) return;
            // Add user command to history
            if (trimmed) {
                get().addTerminalEntry({
                    type: 'cmd',
                    content: trimmed
                });
            }
            if (imageData) {
                get().addTerminalEntry({
                    type: 'log',
                    content: '📷 Image uploaded for circuit recognition'
                });
            }
            // Handle slash commands
            if (trimmed.startsWith('/')) {
                const cmd = trimmed.toLowerCase();
                if (cmd === '/clear') {
                    set({
                        terminalHistory: []
                    });
                    return;
                }
                if (cmd === '/help') {
                    get().addTerminalEntry({
                        type: 'log',
                        content: `Available commands:
/clear - Clear terminal history
/help - Show this help message
/teacher - Toggle Teacher Mode (explains concepts)
/builder - Toggle Builder Mode (direct generation)

Or type any prompt to generate Arduino code and circuits.
You can also upload images of physical circuits for recognition.`
                    });
                    return;
                }
                if (cmd === '/teacher') {
                    get().setTeacherMode(true);
                    return;
                }
                if (cmd === '/builder') {
                    get().setTeacherMode(false);
                    return;
                }
                get().addTerminalEntry({
                    type: 'error',
                    content: `Unknown command: ${trimmed}. Type /help for available commands.`
                });
                return;
            }
            // Call AI generate endpoint
            set({
                isAiLoading: true
            });
            try {
                const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                // Get current circuit state for context (bi-directional awareness)
                const currentCircuit = JSON.stringify({
                    parts: get().circuitParts,
                    connections: get().connections
                });
                const res = await fetch(`${baseUrl}/api/v1/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: trimmed || 'Analyze this circuit image and recreate it',
                        teacher_mode: get().teacherMode,
                        image_data: imageData || null,
                        current_circuit: get().circuitParts.length > 0 ? currentCircuit : null
                    })
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(()=>null);
                    const errorMsg = errorData?.detail || res.statusText || 'Request failed';
                    get().addTerminalEntry({
                        type: 'error',
                        content: `Error: ${errorMsg}`
                    });
                    return;
                }
                const data = await res.json();
                // Format the AI response as a log entry
                let response = '';
                if (data.explanation) {
                    response += data.explanation + '\n\n';
                }
                if (data.code) {
                    response += '```cpp\n' + data.code + '\n```';
                    // Also update the code editor
                    set({
                        code: data.code
                    });
                }
                get().addTerminalEntry({
                    type: 'ai',
                    content: response || 'Generated successfully.'
                });
                // Apply generated circuit parts and connections to canvas
                if (data.circuit_parts && Array.isArray(data.circuit_parts)) {
                    const newParts = data.circuit_parts.map((p)=>({
                            id: p.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(),
                            type: p.type,
                            position: {
                                x: p.x || 0,
                                y: p.y || 0
                            },
                            rotate: 0,
                            attrs: p.attrs || {}
                        }));
                    const newConnections = (data.connections || []).map((c)=>({
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(),
                            from: {
                                partId: c.source_part,
                                pinId: c.source_pin
                            },
                            to: {
                                partId: c.target_part,
                                pinId: c.target_pin
                            },
                            color: get().allocateNextWireColor()
                        }));
                    get().applyGeneratedCircuit(newParts, newConnections);
                    get().addTerminalEntry({
                        type: 'log',
                        content: `✨ Applied ${newParts.length} components and ${newConnections.length} connections to canvas`
                    });
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                get().addTerminalEntry({
                    type: 'error',
                    content: `Error: ${msg}`
                });
            } finally{
                set({
                    isAiLoading: false
                });
            }
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SelectionOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function toFlowPoint(p, transform) {
    const [tx, ty, zoom] = transform;
    return {
        x: (p.x - tx) / zoom,
        y: (p.y - ty) / zoom
    };
}
function rectFromPoints(a, b) {
    const left = Math.min(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const right = Math.max(a.x, b.x);
    const bottom = Math.max(a.y, b.y);
    return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top
    };
}
function intersects(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}
function SelectionOverlay({ containerRef }) {
    _s();
    const setSelectedPartIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SelectionOverlay.useAppStore[setSelectedPartIds]": (s)=>s.setSelectedPartIds
    }["SelectionOverlay.useAppStore[setSelectedPartIds]"]);
    const transform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "SelectionOverlay.useStore[transform]": (s)=>s.transform
    }["SelectionOverlay.useStore[transform]"]);
    const nodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "SelectionOverlay.useStore[nodes]": (s)=>s.nodes
    }["SelectionOverlay.useStore[nodes]"]);
    const dragRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [box, setBox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const nodesForSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SelectionOverlay.useMemo[nodesForSelection]": ()=>nodes ?? []
    }["SelectionOverlay.useMemo[nodesForSelection]"], [
        nodes
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SelectionOverlay.useEffect": ()=>{
            const container = containerRef.current;
            if (!container) return;
            const isBackgroundTarget = {
                "SelectionOverlay.useEffect.isBackgroundTarget": (target)=>{
                    if (!(target instanceof HTMLElement)) return false;
                    if (target.closest('[data-fundi-pin="true"]')) return false;
                    if (target.closest('.react-flow__node')) return false;
                    // Pane/background within ReactFlow.
                    return Boolean(target.closest('.react-flow__pane'));
                }
            }["SelectionOverlay.useEffect.isBackgroundTarget"];
            const getRel = {
                "SelectionOverlay.useEffect.getRel": (e)=>{
                    const rect = container.getBoundingClientRect();
                    return {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    };
                }
            }["SelectionOverlay.useEffect.getRel"];
            const onPointerDown = {
                "SelectionOverlay.useEffect.onPointerDown": (e)=>{
                    if (e.button !== 0) return;
                    if (!isBackgroundTarget(e.target)) return;
                    e.preventDefault();
                    const start = getRel(e);
                    dragRef.current = {
                        start,
                        current: start,
                        active: true
                    };
                    setBox({
                        left: start.x,
                        top: start.y,
                        width: 0,
                        height: 0
                    });
                }
            }["SelectionOverlay.useEffect.onPointerDown"];
            const onPointerMove = {
                "SelectionOverlay.useEffect.onPointerMove": (e)=>{
                    if (!dragRef.current?.active) return;
                    const curr = getRel(e);
                    dragRef.current.current = curr;
                    const r = rectFromPoints(dragRef.current.start, curr);
                    setBox({
                        left: r.left,
                        top: r.top,
                        width: r.width,
                        height: r.height
                    });
                }
            }["SelectionOverlay.useEffect.onPointerMove"];
            const onPointerUp = {
                "SelectionOverlay.useEffect.onPointerUp": ()=>{
                    if (!dragRef.current?.active) return;
                    const start = dragRef.current.start;
                    const curr = dragRef.current.current;
                    dragRef.current = null;
                    setBox(null);
                    // Ignore tiny drags.
                    const rScreen = rectFromPoints(start, curr);
                    if (rScreen.width < 4 || rScreen.height < 4) return;
                    const aFlow = toFlowPoint({
                        x: rScreen.left,
                        y: rScreen.top
                    }, transform);
                    const bFlow = toFlowPoint({
                        x: rScreen.right,
                        y: rScreen.bottom
                    }, transform);
                    const rFlow = rectFromPoints(aFlow, bFlow);
                    const selected = [];
                    for (const n of nodesForSelection){
                        const nn = n;
                        const pos = nn.positionAbsolute ?? nn.internals?.positionAbsolute ?? nn.position;
                        const w = nn.measured?.width ?? nn.width ?? 0;
                        const h = nn.measured?.height ?? nn.height ?? 0;
                        const nr = {
                            left: pos.x,
                            top: pos.y,
                            right: pos.x + w,
                            bottom: pos.y + h
                        };
                        if (intersects(rFlow, nr)) {
                            selected.push(n.id);
                        }
                    }
                    setSelectedPartIds(selected);
                }
            }["SelectionOverlay.useEffect.onPointerUp"];
            window.addEventListener('pointerdown', onPointerDown, {
                capture: true
            });
            window.addEventListener('pointermove', onPointerMove, {
                capture: true
            });
            window.addEventListener('pointerup', onPointerUp, {
                capture: true
            });
            return ({
                "SelectionOverlay.useEffect": ()=>{
                    window.removeEventListener('pointerdown', onPointerDown, true);
                    window.removeEventListener('pointermove', onPointerMove, true);
                    window.removeEventListener('pointerup', onPointerUp, true);
                }
            })["SelectionOverlay.useEffect"];
        }
    }["SelectionOverlay.useEffect"], [
        containerRef,
        nodesForSelection,
        setSelectedPartIds,
        transform
    ]);
    if (!box) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pointer-events-none absolute inset-0 z-20",
        "aria-hidden": true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                position: 'absolute',
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height
            },
            className: "rounded border border-electric/70 bg-electric/10 ring-1 ring-electric/20"
        }, void 0, false, {
            fileName: "[project]/components/SelectionOverlay.tsx",
            lineNumber: 145,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/SelectionOverlay.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
_s(SelectionOverlay, "nKREK9bmvcw4hYbM4jjdMffwcKM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"]
    ];
});
_c = SelectionOverlay;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(SelectionOverlay);
var _c, _c1;
__turbopack_context__.k.register(_c, "SelectionOverlay");
__turbopack_context__.k.register(_c1, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/wireRouting.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Orthogonal wire routing utilities
 * 
 * Wokwi-style routing: all wire segments are strictly horizontal or vertical,
 * alternating between the two to create clean orthogonal paths.
 */ __turbopack_context__.s([
    "avoidParallelOverlaps",
    ()=>avoidParallelOverlaps,
    "calculateOrthogonalPath",
    ()=>calculateOrthogonalPath,
    "calculateOrthogonalPathD",
    ()=>calculateOrthogonalPathD,
    "calculateOrthogonalPoints",
    ()=>calculateOrthogonalPoints,
    "calculatePreviewPath",
    ()=>calculatePreviewPath,
    "findClickedHandle",
    ()=>findClickedHandle,
    "findSegmentIndex",
    ()=>findSegmentIndex,
    "isPointNearWire",
    ()=>isPointNearWire,
    "moveSegment",
    ()=>moveSegment,
    "pointsToPathD",
    ()=>pointsToPathD,
    "pointsToSvgPath",
    ()=>pointsToSvgPath,
    "snapPointToGrid",
    ()=>snapPointToGrid,
    "snapToGrid",
    ()=>snapToGrid
]);
function snapToGrid(value, gridSize) {
    if (!Number.isFinite(value)) return value;
    if (!gridSize || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
}
function snapPointToGrid(point, gridSize) {
    return {
        x: snapToGrid(point.x, gridSize),
        y: snapToGrid(point.y, gridSize)
    };
}
function dedupeColinear(points) {
    if (points.length <= 2) return points;
    const result = [
        points[0]
    ];
    for(let i = 1; i < points.length - 1; i++){
        const prev = result[result.length - 1];
        const curr = points[i];
        const next = points[i + 1];
        const sameAsPrev = prev.x === curr.x && prev.y === curr.y;
        if (sameAsPrev) continue;
        const colinearHorizontal = prev.y === curr.y && curr.y === next.y;
        const colinearVertical = prev.x === curr.x && curr.x === next.x;
        if (colinearHorizontal || colinearVertical) {
            continue;
        }
        result.push(curr);
    }
    const last = points[points.length - 1];
    const tail = result[result.length - 1];
    if (tail.x !== last.x || tail.y !== last.y) {
        result.push(last);
    }
    return result;
}
function toSegments(points) {
    const segs = [];
    for(let i = 0; i < points.length - 1; i++){
        const a = points[i];
        const b = points[i + 1];
        if (a.x === b.x && a.y === b.y) continue;
        if (a.y === b.y) {
            const min = Math.min(a.x, b.x);
            const max = Math.max(a.x, b.x);
            if (min !== max) segs.push({
                orientation: 'H',
                coord: a.y,
                min,
                max
            });
        } else if (a.x === b.x) {
            const min = Math.min(a.y, b.y);
            const max = Math.max(a.y, b.y);
            if (min !== max) segs.push({
                orientation: 'V',
                coord: a.x,
                min,
                max
            });
        }
    }
    return segs;
}
function rangesOverlapStrict(aMin, aMax, bMin, bMax) {
    // Strict overlap: touching at a single point is OK.
    return Math.min(aMax, bMax) > Math.max(aMin, bMin);
}
function hasParallelOverlap(points, occupied) {
    const segs = toSegments(points);
    for (const s of segs){
        const key = `${s.orientation}:${s.coord}`;
        const list = occupied.get(key);
        if (!list?.length) continue;
        for (const o of list){
            if (rangesOverlapStrict(s.min, s.max, o.min, o.max)) return true;
        }
    }
    return false;
}
function addOccupied(points, occupied) {
    for (const s of toSegments(points)){
        const key = `${s.orientation}:${s.coord}`;
        const list = occupied.get(key);
        if (list) list.push(s);
        else occupied.set(key, [
            s
        ]);
    }
}
function shiftSegmentKeepingEndpoints(points, segmentIndex, orientation, deltaPerp) {
    if (points.length < 2) return points;
    if (segmentIndex < 0 || segmentIndex >= points.length - 1) return points;
    if (deltaPerp === 0) return points;
    const out = points.map((p)=>({
            ...p
        }));
    const lastIdx = out.length - 1;
    if (orientation === 'H') {
        // Horizontal segment => shift Y.
        if (segmentIndex === 0) {
            const p0 = out[0];
            const p1 = out[1];
            // Insert a vertical jog at the start point.
            const jog = {
                x: p0.x,
                y: p0.y + deltaPerp
            };
            out.splice(1, 0, jog);
            // Original p1 shifts (now at index 2).
            out[2].y = jog.y;
        } else if (segmentIndex === lastIdx - 1) {
            const pN1 = out[lastIdx - 1];
            const pN = out[lastIdx];
            // Insert a vertical jog before the end point.
            const jog = {
                x: pN.x,
                y: pN.y + deltaPerp
            };
            out.splice(lastIdx, 0, jog);
            // Shift previous point to align with jog.
            out[lastIdx - 1].y = jog.y;
            // Keep endpoint anchored.
            out[lastIdx + 1].x = pN.x;
            out[lastIdx + 1].y = pN.y;
        } else {
            out[segmentIndex].y += deltaPerp;
            out[segmentIndex + 1].y += deltaPerp;
        }
    } else {
        // Vertical segment => shift X.
        if (segmentIndex === 0) {
            const p0 = out[0];
            const p1 = out[1];
            const jog = {
                x: p0.x + deltaPerp,
                y: p0.y
            };
            out.splice(1, 0, jog);
            out[2].x = jog.x;
        } else if (segmentIndex === lastIdx - 1) {
            const pN1 = out[lastIdx - 1];
            const pN = out[lastIdx];
            const jog = {
                x: pN.x + deltaPerp,
                y: pN.y
            };
            out.splice(lastIdx, 0, jog);
            out[lastIdx - 1].x = jog.x;
            out[lastIdx + 1].x = pN.x;
            out[lastIdx + 1].y = pN.y;
        } else {
            out[segmentIndex].x += deltaPerp;
            out[segmentIndex + 1].x += deltaPerp;
        }
    }
    return dedupeColinear(out);
}
function segmentOrientation(points, idx) {
    if (idx < 0 || idx >= points.length - 1) return null;
    const a = points[idx];
    const b = points[idx + 1];
    if (a.y === b.y && a.x !== b.x) return 'H';
    if (a.x === b.x && a.y !== b.y) return 'V';
    return null;
}
function avoidParallelOverlaps(wires, options = {
    gridSize: 10
}) {
    const gridSize = options.gridSize || 10;
    const maxLanes = options.maxLanes ?? 6;
    const occupied = new Map();
    const result = new Map();
    // Stable, deterministic order: as provided.
    for (const w of wires){
        let pts = dedupeColinear(w.points);
        // If there is no conflict, accept quickly.
        if (!hasParallelOverlap(pts, occupied)) {
            addOccupied(pts, occupied);
            result.set(w.id, pts);
            continue;
        }
        // Try shifting each segment into a free lane.
        let improved = true;
        let safety = 0;
        while(improved && safety++ < 8){
            improved = false;
            for(let segIdx = 0; segIdx < pts.length - 1; segIdx++){
                const ori = segmentOrientation(pts, segIdx);
                if (!ori) continue;
                // Fast skip: only attempt if THIS segment overlaps.
                const segs = toSegments([
                    pts[segIdx],
                    pts[segIdx + 1]
                ]);
                if (!segs.length) continue;
                const seg = segs[0];
                const key = `${seg.orientation}:${seg.coord}`;
                const list = occupied.get(key);
                if (!list?.length) continue;
                let overlaps = false;
                for (const o of list){
                    if (rangesOverlapStrict(seg.min, seg.max, o.min, o.max)) {
                        overlaps = true;
                        break;
                    }
                }
                if (!overlaps) continue;
                // Determine a deterministic lane preference.
                const hash = [
                    ...w.id
                ].reduce((acc, ch)=>(acc * 31 ^ ch.charCodeAt(0)) >>> 0, 7) + segIdx * 97;
                const preferPositive = (hash & 1) === 0;
                let best = null;
                for(let lane = 1; lane <= maxLanes; lane++){
                    const d = lane * gridSize;
                    const deltas = preferPositive ? [
                        d,
                        -d
                    ] : [
                        -d,
                        d
                    ];
                    for (const deltaPerp of deltas){
                        const candidate = shiftSegmentKeepingEndpoints(pts, segIdx, ori, deltaPerp);
                        if (!hasParallelOverlap(candidate, occupied)) {
                            best = candidate;
                            break;
                        }
                    }
                    if (best) break;
                }
                if (best) {
                    pts = best;
                    improved = true;
                    break; // re-scan from start with updated geometry
                }
            }
        }
        addOccupied(pts, occupied);
        result.set(w.id, pts);
    }
    return result;
}
function pointsToPathD(points) {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y}` + rest.map((p)=>` L ${p.x} ${p.y}`).join('');
}
function findSegmentIndex(points, clickPoint, threshold = 8) {
    if (points.length < 2) return null;
    let bestIdx = null;
    let bestDist = Infinity;
    for(let i = 0; i < points.length - 1; i++){
        const p1 = points[i];
        const p2 = points[i + 1];
        const dist = distanceToSegment(clickPoint, p1, p2);
        if (dist <= threshold && dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    return bestIdx;
}
function isHorizontalSegment(a, b) {
    return a.y === b.y && a.x !== b.x;
}
function isVerticalSegment(a, b) {
    return a.x === b.x && a.y !== b.y;
}
function moveSegment(points, segmentIndex, delta, options = {}) {
    if (points.length < 2) return points;
    if (segmentIndex < 0 || segmentIndex >= points.length - 1) return points;
    const out = points.map((p)=>({
            ...p
        }));
    const a = out[segmentIndex];
    const b = out[segmentIndex + 1];
    const isH = isHorizontalSegment(a, b);
    const isV = isVerticalSegment(a, b);
    if (!isH && !isV) {
        // Non-orthogonal; refuse to move.
        return points;
    }
    if (isH) {
        let nextY = a.y + delta.y;
        if (!options.disableSnap && options.snapTo) {
            nextY = snapToGrid(nextY, options.snapTo);
        }
        a.y = nextY;
        b.y = nextY;
    } else {
        let nextX = a.x + delta.x;
        if (!options.disableSnap && options.snapTo) {
            nextX = snapToGrid(nextX, options.snapTo);
        }
        a.x = nextX;
        b.x = nextX;
    }
    return dedupeColinear(out);
}
function calculateOrthogonalPoints(start, end, waypoints = [], options = {}) {
    const firstLeg = options.firstLeg ?? 'horizontal';
    const all = [
        start,
        ...waypoints,
        end
    ];
    const out = [
        start
    ];
    for(let i = 1; i < all.length; i++){
        const a = all[i - 1];
        const b = all[i];
        // Same point.
        if (a.x === b.x && a.y === b.y) continue;
        if (firstLeg === 'horizontal') {
            const mid = {
                x: b.x,
                y: a.y
            };
            if (mid.x !== a.x || mid.y !== a.y) out.push(mid);
        } else {
            const mid = {
                x: a.x,
                y: b.y
            };
            if (mid.x !== a.x || mid.y !== a.y) out.push(mid);
        }
        out.push(b);
    }
    return dedupeColinear(out);
}
function calculateOrthogonalPathD(start, end, waypoints = [], options = {}) {
    return pointsToPathD(calculateOrthogonalPoints(start, end, waypoints, options));
}
function calculateOrthogonalPath(start, end, waypoints = []) {
    const allPoints = [
        start,
        ...waypoints,
        end
    ];
    const path = [
        start
    ];
    for(let i = 1; i < allPoints.length; i++){
        const prev = allPoints[i - 1];
        const curr = allPoints[i];
        // Create orthogonal path between consecutive points
        // Strategy: horizontal first, then vertical
        const midPoint = {
            x: curr.x,
            y: prev.y
        };
        // Only add midpoint if it's different from prev and curr
        if (midPoint.x !== prev.x || midPoint.y !== prev.y) {
            if (midPoint.x !== curr.x || midPoint.y !== curr.y) {
                path.push(midPoint);
            }
        }
        path.push(curr);
    }
    return path;
}
function calculatePreviewPath(start, cursor, waypoints = []) {
    if (waypoints.length === 0) {
        // Direct from start to cursor with orthogonal routing
        const path = [
            start
        ];
        // Start vertical, then horizontal (Wokwi-style)
        const midPoint = {
            x: start.x,
            y: cursor.y
        };
        if (midPoint.y !== start.y) {
            path.push(midPoint);
        }
        path.push(cursor);
        return path;
    }
    // With waypoints: path through waypoints, then to cursor
    const lastWaypoint = waypoints[waypoints.length - 1];
    const pathToLastWaypoint = calculateOrthogonalPath(start, lastWaypoint, waypoints.slice(0, -1));
    // From last waypoint to cursor
    const midPoint = {
        x: lastWaypoint.x,
        y: cursor.y
    };
    if (midPoint.y !== lastWaypoint.y) {
        pathToLastWaypoint.push(midPoint);
    }
    pathToLastWaypoint.push(cursor);
    return pathToLastWaypoint;
}
function pointsToSvgPath(points) {
    return points.map((p)=>`${p.x},${p.y}`).join(' ');
}
function isPointNearWire(point, wirePoints, threshold = 8) {
    for(let i = 0; i < wirePoints.length - 1; i++){
        const p1 = wirePoints[i];
        const p2 = wirePoints[i + 1];
        const distance = distanceToSegment(point, p1, p2);
        if (distance <= threshold) {
            return true;
        }
    }
    return false;
}
/**
 * Calculate distance from a point to a line segment
 */ function distanceToSegment(point, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) {
        // p1 and p2 are the same point
        return Math.sqrt((point.x - p1.x) ** 2 + (point.y - p1.y) ** 2);
    }
    // Project point onto line segment
    let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}
function findClickedHandle(point, wirePoints, threshold = 10) {
    for(let i = 0; i < wirePoints.length; i++){
        const wp = wirePoints[i];
        const distance = Math.sqrt((point.x - wp.x) ** 2 + (point.y - wp.y) ** 2);
        if (distance <= threshold) {
            return i;
        }
    }
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/WiringLayer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/wireRouting.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const HIT_STROKE = 15;
// Wokwi-like keyboard palette (0-9) + Copper default.
const WOKWI_COLOR_BY_DIGIT = {
    '0': '#000000',
    '1': '#8b4513',
    '2': '#ef4444',
    '3': '#f97316',
    '4': '#eab308',
    '5': '#22c55e',
    '6': '#3b82f6',
    '7': '#8b5cf6',
    '8': '#9ca3af',
    '9': '#ffffff'
};
const WOKWI_COLOR_PALETTE = Object.entries(WOKWI_COLOR_BY_DIGIT).map(_c = ([key, color])=>({
        key,
        color
    }));
_c1 = WOKWI_COLOR_PALETTE;
function isDigitKey(key) {
    return Object.prototype.hasOwnProperty.call(WOKWI_COLOR_BY_DIGIT, key);
}
function clampToContainer(point, rect) {
    return {
        x: Math.max(0, Math.min(rect.width, point.x)),
        y: Math.max(0, Math.min(rect.height, point.y))
    };
}
function getRelativePoint(e, container) {
    const rect = container.getBoundingClientRect();
    return clampToContainer({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    }, rect);
}
function isEventInsideContainer(e, container) {
    const t = e.target;
    if (!t) return false;
    return container.contains(t);
}
function getPinElFromPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const pin = el.closest?.('[data-fundi-pin="true"]');
    return pin;
}
function getPinRefFromEl(pinEl) {
    const partId = pinEl.getAttribute('data-node-id') || pinEl.getAttribute('data-part-id');
    const pinId = pinEl.getAttribute('data-pin-id');
    if (!partId || !pinId) return null;
    return {
        partId,
        pinId
    };
}
function getPinCenterInContainer(pinEl, container) {
    const pinRect = pinEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return {
        x: pinRect.left + pinRect.width / 2 - containerRect.left,
        y: pinRect.top + pinRect.height / 2 - containerRect.top
    };
}
function samePin(a, b) {
    if (!a || !b) return false;
    return a.partId === b.partId && a.pinId === b.pinId;
}
function stripEndpoints(points) {
    if (points.length <= 2) return [];
    return points.slice(1, -1);
}
function normalizePointsForStore(points) {
    const inner = stripEndpoints(points);
    return inner.length ? inner : undefined;
}
function getGridSizeForZoom(zoom) {
    // Simple heuristic: coarser grid when zoomed out.
    return zoom < 0.75 ? 20 : 10;
}
function WiringLayer({ containerRef, wirePointOverrides }) {
    _s();
    const connections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[connections]": (s)=>s.connections
    }["WiringLayer.useAppStore[connections]"]);
    const addConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[addConnection]": (s)=>s.addConnection
    }["WiringLayer.useAppStore[addConnection]"]);
    const allocateNextWireColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[allocateNextWireColor]": (s)=>s.allocateNextWireColor
    }["WiringLayer.useAppStore[allocateNextWireColor]"]);
    const removeConnection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[removeConnection]": (s)=>s.removeConnection
    }["WiringLayer.useAppStore[removeConnection]"]);
    const updateWireColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[updateWireColor]": (s)=>s.updateWireColor
    }["WiringLayer.useAppStore[updateWireColor]"]);
    const updateWire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "WiringLayer.useAppStore[updateWire]": (s)=>s.updateWire
    }["WiringLayer.useAppStore[updateWire]"]);
    const [dimensions, setDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 0,
        height: 0
    });
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredId, setHoveredId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const zoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "WiringLayer.useStore[zoom]": (s)=>s.transform[2]
    }["WiringLayer.useStore[zoom]"]);
    // Subscribe to node changes so wire endpoints update in real-time while parts move.
    // Using the store's nodes array reference is enough to invalidate memos during drags.
    const flowNodes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "WiringLayer.useStore[flowNodes]": (s)=>s.nodes
    }["WiringLayer.useStore[flowNodes]"]);
    const gridSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[gridSize]": ()=>getGridSizeForZoom(zoom)
    }["WiringLayer.useMemo[gridSize]"], [
        zoom
    ]);
    const modeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('idle');
    const creatingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const segmentDragRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [, forceTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Track container size.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WiringLayer.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            const update = {
                "WiringLayer.useEffect.update": ()=>{
                    const rect = el.getBoundingClientRect();
                    setDimensions({
                        width: rect.width,
                        height: rect.height
                    });
                }
            }["WiringLayer.useEffect.update"];
            update();
            const ro = new ResizeObserver(update);
            ro.observe(el);
            return ({
                "WiringLayer.useEffect": ()=>ro.disconnect()
            })["WiringLayer.useEffect"];
        }
    }["WiringLayer.useEffect"], [
        containerRef
    ]);
    // Precompute all pin centers once per render to keep 60fps during drags.
    const pinCenters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[pinCenters]": ()=>{
            const container = containerRef.current;
            if (!container) return new Map();
            const containerRect = container.getBoundingClientRect();
            const els = container.querySelectorAll('[data-fundi-pin="true"][data-node-id][data-pin-id]');
            const next = new Map();
            els.forEach({
                "WiringLayer.useMemo[pinCenters]": (el)=>{
                    const partId = el.getAttribute('data-node-id');
                    const pinId = el.getAttribute('data-pin-id');
                    if (!partId || !pinId) return;
                    const r = el.getBoundingClientRect();
                    next.set(`${partId}:${pinId}`, {
                        x: r.left + r.width / 2 - containerRect.left,
                        y: r.top + r.height / 2 - containerRect.top
                    });
                }
            }["WiringLayer.useMemo[pinCenters]"]);
            return next;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["WiringLayer.useMemo[pinCenters]"], [
        containerRef,
        dimensions.width,
        dimensions.height,
        zoom,
        flowNodes
    ]);
    const getPinPoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WiringLayer.useCallback[getPinPoint]": (pin)=>{
            return pinCenters.get(`${pin.partId}:${pin.pinId}`) ?? null;
        }
    }["WiringLayer.useCallback[getPinPoint]"], [
        pinCenters
    ]);
    const wireGeometry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[wireGeometry]": ()=>{
            const base = connections.map({
                "WiringLayer.useMemo[wireGeometry].base": (c)=>{
                    const start = getPinPoint(c.from);
                    const end = getPinPoint(c.to);
                    if (!start || !end) return null;
                    const waypoints = wirePointOverrides?.has(c.id) ? wirePointOverrides.get(c.id) ?? [] : c.points ?? [];
                    const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateOrthogonalPoints"])(start, end, waypoints, {
                        firstLeg: 'horizontal'
                    });
                    return {
                        id: c.id,
                        color: c.color,
                        points
                    };
                }
            }["WiringLayer.useMemo[wireGeometry].base"]).filter({
                "WiringLayer.useMemo[wireGeometry].base": (x)=>Boolean(x)
            }["WiringLayer.useMemo[wireGeometry].base"]);
            // Prevent PARALLEL overlaps between different wires (perpendicular crossings OK).
            const adjusted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["avoidParallelOverlaps"])(base.map({
                "WiringLayer.useMemo[wireGeometry].adjusted": (w)=>({
                        id: w.id,
                        points: w.points
                    })
            }["WiringLayer.useMemo[wireGeometry].adjusted"]), {
                gridSize
            });
            return base.map({
                "WiringLayer.useMemo[wireGeometry]": (w)=>{
                    const points = adjusted.get(w.id) ?? w.points;
                    return {
                        ...w,
                        points,
                        d: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointsToPathD"])(points)
                    };
                }
            }["WiringLayer.useMemo[wireGeometry]"]);
        }
    }["WiringLayer.useMemo[wireGeometry]"], [
        connections,
        getPinPoint,
        wirePointOverrides,
        gridSize
    ]);
    const selectedWire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[selectedWire]": ()=>{
            if (!selectedId) return null;
            return wireGeometry.find({
                "WiringLayer.useMemo[selectedWire]": (w)=>w.id === selectedId
            }["WiringLayer.useMemo[selectedWire]"]) ?? null;
        }
    }["WiringLayer.useMemo[selectedWire]"], [
        selectedId,
        wireGeometry
    ]);
    const selectedMidpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[selectedMidpoint]": ()=>{
            if (!selectedWire) return null;
            const pts = selectedWire.points;
            if (pts.length < 2) return null;
            const i = Math.floor(pts.length / 2);
            return pts[i];
        }
    }["WiringLayer.useMemo[selectedMidpoint]"], [
        selectedWire
    ]);
    // Global pointer + keyboard interactions.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WiringLayer.useEffect": ()=>{
            const container = containerRef.current;
            if (!container) return;
            const onPointerMoveCapture = {
                "WiringLayer.useEffect.onPointerMoveCapture": (e)=>{
                    if (!container) return;
                    if (!isEventInsideContainer(e, container)) return;
                    if (modeRef.current === 'creating' && creatingRef.current) {
                        const cursorRaw = getRelativePoint(e, container);
                        const cursor = e.shiftKey ? cursorRaw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snapPointToGrid"])(cursorRaw, gridSize);
                        const pinEl = getPinElFromPoint(e.clientX, e.clientY);
                        const hoveredRef = pinEl ? getPinRefFromEl(pinEl) : null;
                        let hoveredPin = null;
                        let hoveredPoint = null;
                        if (hoveredRef && !samePin(hoveredRef, creatingRef.current.from)) {
                            hoveredPin = hoveredRef;
                            hoveredPoint = pinEl ? getPinCenterInContainer(pinEl, container) : null;
                        }
                        creatingRef.current = {
                            ...creatingRef.current,
                            cursor,
                            hoveredPin,
                            hoveredPoint
                        };
                        forceTick({
                            "WiringLayer.useEffect.onPointerMoveCapture": (n)=>(n + 1) % 1000000
                        }["WiringLayer.useEffect.onPointerMoveCapture"]);
                    }
                    if (modeRef.current === 'dragging-segment' && segmentDragRef.current) {
                        const curr = getRelativePoint(e, container);
                        const drag = segmentDragRef.current;
                        const delta = {
                            x: curr.x - drag.startMouse.x,
                            y: curr.y - drag.startMouse.y
                        };
                        const moved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["moveSegment"])(drag.startPoints, drag.segmentIndex, delta, {
                            snapTo: gridSize,
                            disableSnap: drag.disableSnap
                        });
                        updateWire(drag.wireId, normalizePointsForStore(moved));
                        forceTick({
                            "WiringLayer.useEffect.onPointerMoveCapture": (n)=>(n + 1) % 1000000
                        }["WiringLayer.useEffect.onPointerMoveCapture"]);
                    }
                }
            }["WiringLayer.useEffect.onPointerMoveCapture"];
            const onPointerDownCapture = {
                "WiringLayer.useEffect.onPointerDownCapture": (e)=>{
                    if (e.button !== 0) return;
                    if (!isEventInsideContainer(e, container)) return;
                    // Click-away deselect: clicking anywhere else in the canvas clears wire selection,
                    // except when interacting with the wire toolbar or wire hit targets.
                    if (selectedId) {
                        const target = e.target;
                        const insideToolbar = Boolean(target?.closest?.('[data-wire-toolbar="true"]'));
                        const onWire = Boolean(target?.closest?.('[data-wire-hit="true"]'));
                        if (!insideToolbar && !onWire) {
                            setSelectedId(null);
                        }
                    }
                    const pinEl = e.target?.closest?.('[data-fundi-pin="true"]');
                    const pinRef = pinEl ? getPinRefFromEl(pinEl) : null;
                    // If we're creating and click a pin, complete the wire.
                    if (modeRef.current === 'creating' && creatingRef.current) {
                        if (pinEl && pinRef && !samePin(pinRef, creatingRef.current.from)) {
                            e.preventDefault();
                            e.stopPropagation();
                            addConnection({
                                from: creatingRef.current.from,
                                to: pinRef,
                                color: creatingRef.current.color,
                                points: creatingRef.current.waypoints.length ? creatingRef.current.waypoints : undefined
                            });
                            creatingRef.current = null;
                            modeRef.current = 'idle';
                            forceTick({
                                "WiringLayer.useEffect.onPointerDownCapture": (n)=>n + 1
                            }["WiringLayer.useEffect.onPointerDownCapture"]);
                            return;
                        }
                        // Otherwise pin a waypoint at current cursor (empty space click).
                        if (!pinEl) {
                            e.preventDefault();
                            e.stopPropagation();
                            const pRaw = getRelativePoint(e, container);
                            const p = e.shiftKey ? pRaw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snapPointToGrid"])(pRaw, gridSize);
                            creatingRef.current = {
                                ...creatingRef.current,
                                waypoints: [
                                    ...creatingRef.current.waypoints,
                                    p
                                ],
                                cursor: p
                            };
                            forceTick({
                                "WiringLayer.useEffect.onPointerDownCapture": (n)=>n + 1
                            }["WiringLayer.useEffect.onPointerDownCapture"]);
                            return;
                        }
                    }
                    // Start creating from a pin.
                    if (pinEl && pinRef) {
                        e.preventDefault();
                        e.stopPropagation();
                        const fromPointRaw = getPinCenterInContainer(pinEl, container);
                        const fromPoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snapPointToGrid"])(fromPointRaw, gridSize);
                        const cursorRaw = getRelativePoint(e, container);
                        const cursor = e.shiftKey ? cursorRaw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["snapPointToGrid"])(cursorRaw, gridSize);
                        creatingRef.current = {
                            from: pinRef,
                            fromPoint,
                            waypoints: [],
                            cursor,
                            hoveredPin: null,
                            hoveredPoint: null,
                            color: allocateNextWireColor()
                        };
                        modeRef.current = 'creating';
                        setSelectedId(null);
                        forceTick({
                            "WiringLayer.useEffect.onPointerDownCapture": (n)=>n + 1
                        }["WiringLayer.useEffect.onPointerDownCapture"]);
                    }
                }
            }["WiringLayer.useEffect.onPointerDownCapture"];
            const onPointerUpCapture = {
                "WiringLayer.useEffect.onPointerUpCapture": ()=>{
                    if (modeRef.current === 'dragging-segment') {
                        segmentDragRef.current = null;
                        modeRef.current = 'idle';
                        forceTick({
                            "WiringLayer.useEffect.onPointerUpCapture": (n)=>n + 1
                        }["WiringLayer.useEffect.onPointerUpCapture"]);
                    }
                }
            }["WiringLayer.useEffect.onPointerUpCapture"];
            const onKeyDown = {
                "WiringLayer.useEffect.onKeyDown": (e)=>{
                    if (e.key === 'Escape') {
                        if (modeRef.current === 'creating') {
                            creatingRef.current = null;
                            modeRef.current = 'idle';
                            forceTick({
                                "WiringLayer.useEffect.onKeyDown": (n)=>n + 1
                            }["WiringLayer.useEffect.onKeyDown"]);
                        }
                        if (modeRef.current === 'dragging-segment') {
                            segmentDragRef.current = null;
                            modeRef.current = 'idle';
                            forceTick({
                                "WiringLayer.useEffect.onKeyDown": (n)=>n + 1
                            }["WiringLayer.useEffect.onKeyDown"]);
                        }
                        if (selectedId) setSelectedId(null);
                    }
                    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                        removeConnection(selectedId);
                        setSelectedId(null);
                    }
                    if (isDigitKey(e.key)) {
                        const color = WOKWI_COLOR_BY_DIGIT[e.key];
                        if (modeRef.current === 'creating' && creatingRef.current) {
                            creatingRef.current = {
                                ...creatingRef.current,
                                color
                            };
                            forceTick({
                                "WiringLayer.useEffect.onKeyDown": (n)=>n + 1
                            }["WiringLayer.useEffect.onKeyDown"]);
                        } else if (selectedId) {
                            updateWireColor(selectedId, color);
                        }
                    }
                }
            }["WiringLayer.useEffect.onKeyDown"];
            window.addEventListener('pointerdown', onPointerDownCapture, {
                capture: true
            });
            window.addEventListener('pointermove', onPointerMoveCapture, {
                capture: true
            });
            window.addEventListener('pointerup', onPointerUpCapture, {
                capture: true
            });
            window.addEventListener('keydown', onKeyDown);
            return ({
                "WiringLayer.useEffect": ()=>{
                    window.removeEventListener('pointerdown', onPointerDownCapture, true);
                    window.removeEventListener('pointermove', onPointerMoveCapture, true);
                    window.removeEventListener('pointerup', onPointerUpCapture, true);
                    window.removeEventListener('keydown', onKeyDown);
                }
            })["WiringLayer.useEffect"];
        }
    }["WiringLayer.useEffect"], [
        addConnection,
        allocateNextWireColor,
        containerRef,
        gridSize,
        removeConnection,
        selectedId,
        updateWire,
        updateWireColor
    ]);
    const creating = creatingRef.current;
    const preview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[preview]": ()=>{
            if (!creating) return null;
            const end = creating.hoveredPoint ?? creating.cursor;
            const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateOrthogonalPoints"])(creating.fromPoint, end, creating.waypoints, {
                firstLeg: 'vertical'
            });
            return {
                d: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointsToPathD"])(points),
                color: creating.color
            };
        }
    }["WiringLayer.useMemo[preview]"], [
        creating,
        forceTick
    ]);
    if (dimensions.width === 0 || dimensions.height === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "ed133a751aa94545",
                children: "@keyframes fundi-wire-dash{to{stroke-dashoffset:-24px}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 10
                },
                viewBox: `0 0 ${dimensions.width} ${dimensions.height}`,
                className: "jsx-ed133a751aa94545",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    style: {
                        pointerEvents: 'auto'
                    },
                    className: "jsx-ed133a751aa94545",
                    children: [
                        wireGeometry.map((w)=>{
                            const isSelected = selectedId === w.id;
                            const isHovered = hoveredId === w.id;
                            const strokeWidth = isSelected ? 3.5 : 2;
                            const displayColor = isSelected ? '#00F0FF' : w.color; // Electric cyan when selected
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                className: "jsx-ed133a751aa94545",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: w.d,
                                        "data-wire-hit": "true",
                                        "data-wire-id": w.id,
                                        fill: "none",
                                        stroke: "transparent",
                                        strokeWidth: HIT_STROKE,
                                        style: {
                                            cursor: isSelected ? 'grab' : 'pointer',
                                            pointerEvents: 'stroke'
                                        },
                                        onPointerEnter: ()=>setHoveredId(w.id),
                                        onPointerLeave: ()=>setHoveredId((prev)=>prev === w.id ? null : prev),
                                        onPointerDown: (e)=>{
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setSelectedId(w.id);
                                            // Segment dragging only when selected.
                                            const container = containerRef.current;
                                            if (!container) return;
                                            if (selectedId !== w.id) return;
                                            const rect = container.getBoundingClientRect();
                                            const click = {
                                                x: e.clientX - rect.left,
                                                y: e.clientY - rect.top
                                            };
                                            const segIdx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSegmentIndex"])(w.points, click, HIT_STROKE / 2);
                                            if (segIdx === null) return;
                                            segmentDragRef.current = {
                                                wireId: w.id,
                                                segmentIndex: segIdx,
                                                startMouse: click,
                                                startPoints: w.points,
                                                disableSnap: e.shiftKey
                                            };
                                            modeRef.current = 'dragging-segment';
                                        },
                                        onDoubleClick: (e)=>{
                                            e.stopPropagation();
                                            e.preventDefault();
                                            removeConnection(w.id);
                                            if (selectedId === w.id) setSelectedId(null);
                                        },
                                        className: "jsx-ed133a751aa94545"
                                    }, void 0, false, {
                                        fileName: "[project]/components/WiringLayer.tsx",
                                        lineNumber: 463,
                                        columnNumber: 17
                                    }, this),
                                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: w.d,
                                        fill: "none",
                                        stroke: "#00F0FF",
                                        strokeWidth: strokeWidth + 3,
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        style: {
                                            pointerEvents: 'none',
                                            opacity: 0.3,
                                            filter: 'blur(4px)'
                                        },
                                        className: "jsx-ed133a751aa94545"
                                    }, void 0, false, {
                                        fileName: "[project]/components/WiringLayer.tsx",
                                        lineNumber: 508,
                                        columnNumber: 19
                                    }, this),
                                    (isHovered || isSelected) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: w.d,
                                        fill: "none",
                                        stroke: isSelected ? '#00F0FF' : '#D4AF37',
                                        strokeWidth: strokeWidth + 1.25,
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        strokeDasharray: "6 6",
                                        style: {
                                            pointerEvents: 'none',
                                            opacity: 0.4,
                                            animation: 'fundi-wire-dash 1s linear infinite'
                                        },
                                        className: "jsx-ed133a751aa94545"
                                    }, void 0, false, {
                                        fileName: "[project]/components/WiringLayer.tsx",
                                        lineNumber: 525,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: w.d,
                                        fill: "none",
                                        stroke: displayColor,
                                        strokeWidth: strokeWidth,
                                        strokeLinecap: "round",
                                        strokeLinejoin: "round",
                                        style: {
                                            pointerEvents: 'none',
                                            transition: 'all 0.2s ease'
                                        },
                                        className: "jsx-ed133a751aa94545"
                                    }, void 0, false, {
                                        fileName: "[project]/components/WiringLayer.tsx",
                                        lineNumber: 542,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, w.id, true, {
                                fileName: "[project]/components/WiringLayer.tsx",
                                lineNumber: 461,
                                columnNumber: 15
                            }, this);
                        }),
                        preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: preview.d,
                            fill: "none",
                            stroke: preview.color,
                            strokeWidth: 2.5,
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeDasharray: "6 6",
                            opacity: 0.9,
                            style: {
                                pointerEvents: 'none'
                            },
                            className: "jsx-ed133a751aa94545"
                        }, void 0, false, {
                            fileName: "[project]/components/WiringLayer.tsx",
                            lineNumber: 560,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WiringLayer.tsx",
                    lineNumber: 453,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/WiringLayer.tsx",
                lineNumber: 440,
                columnNumber: 7
            }, this),
            selectedWire && selectedMidpoint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-wire-toolbar": "true",
                style: {
                    left: selectedMidpoint.x,
                    top: selectedMidpoint.y,
                    transform: 'translate(-50%, -110%)',
                    pointerEvents: 'auto'
                },
                onPointerDown: (e)=>{
                    // Prevent toolbar clicks from being treated as "click away".
                    e.stopPropagation();
                },
                className: "jsx-ed133a751aa94545" + " " + "absolute z-30 flex items-center gap-1 glass-panel rounded-lg p-2 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ed133a751aa94545" + " " + "flex items-center gap-0.5",
                        children: WOKWI_COLOR_PALETTE.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>updateWireColor(selectedWire.id, c.color),
                                style: {
                                    backgroundColor: c.color
                                },
                                title: `Color ${c.key}`,
                                className: "jsx-ed133a751aa94545" + " " + ('h-5 w-5 rounded border-2 transition-all ' + (selectedWire.color.toLowerCase() === c.color.toLowerCase() ? 'border-electric scale-110 shadow-lg shadow-electric/50' : 'border-transparent hover:border-brass hover:scale-105') || "")
                            }, c.key, false, {
                                fileName: "[project]/components/WiringLayer.tsx",
                                lineNumber: 593,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 591,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ed133a751aa94545" + " " + "mx-1 h-5 w-px bg-brass/30"
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 609,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            removeConnection(selectedWire.id);
                            setSelectedId(null);
                        },
                        title: "Delete wire (also: Delete key or double-click)",
                        className: "jsx-ed133a751aa94545" + " " + "rounded px-2 py-1 font-mono text-[11px] font-medium text-error hover:bg-error/15 transition-colors",
                        children: "Delete"
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 611,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WiringLayer.tsx",
                lineNumber: 577,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(WiringLayer, "X9ey0TckbEbC/fa6p9sjUwDHv98=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"]
    ];
});
_c2 = WiringLayer;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(WiringLayer);
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "WOKWI_COLOR_PALETTE$Object.entries(WOKWI_COLOR_BY_DIGIT).map");
__turbopack_context__.k.register(_c1, "WOKWI_COLOR_PALETTE");
__turbopack_context__.k.register(_c2, "WiringLayer");
__turbopack_context__.k.register(_c3, "%default%");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/terminal/CommandInterface.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommandInterface",
    ()=>CommandInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.js [app-client] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic-off.js [app-client] (ecmascript) <export default as MicOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/graduation-cap.js [app-client] (ecmascript) <export default as GraduationCap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image-plus.js [app-client] (ecmascript) <export default as ImagePlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function formatTimestamp(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}
function ChatMessage({ entry }) {
    const isUser = entry.type === 'cmd';
    const isAi = entry.type === 'ai';
    const isError = entry.type === 'error';
    // Simple markdown-like rendering for code blocks
    const renderContent = (content)=>{
        const parts = content.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i)=>{
            if (part.startsWith('```') && part.endsWith('```')) {
                // Extract language and code
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                const lang = match?.[1] || '';
                const code = match?.[2] ?? part.slice(3, -3);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "my-2 rounded-lg overflow-hidden border border-ide-border",
                    children: [
                        lang && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-3 py-1 bg-ide-panel-bg text-[10px] font-medium text-ide-text-muted border-b border-ide-border",
                            children: lang
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 34,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                            className: "p-3 overflow-x-auto bg-ide-panel-bg/50 text-xs text-ide-success",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: code.trim()
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 39,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                    lineNumber: 32,
                    columnNumber: 11
                }, this);
            }
            // Regular text - preserve newlines
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "whitespace-pre-wrap",
                children: part
            }, i, false, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this);
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('mb-3 animate-fade-in', isUser && 'flex justify-end'),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('max-w-[85%] rounded-lg px-3 py-2', isUser ? 'bg-ide-accent/20 text-ide-text border border-ide-accent/30' : isError ? 'bg-ide-error/10 text-ide-error border border-ide-error/30' : isAi ? 'bg-ide-panel-surface text-ide-text border border-ide-border' : 'bg-ide-panel-hover/50 text-ide-text-muted'),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 mb-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-[10px] font-medium', isUser ? 'text-ide-accent' : isAi ? 'text-ide-accent' : isError ? 'text-ide-error' : 'text-ide-text-subtle'),
                            children: isUser ? 'You' : isAi ? 'FUNDI AI' : isError ? 'Error' : 'System'
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[9px] text-ide-text-subtle",
                            children: formatTimestamp(entry.timestamp)
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm leading-relaxed",
                    children: renderContent(entry.content)
                }, void 0, false, {
                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/terminal/CommandInterface.tsx",
            lineNumber: 58,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/terminal/CommandInterface.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c = ChatMessage;
function CommandInterface() {
    _s();
    const terminalHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[terminalHistory]": (s)=>s.terminalHistory
    }["CommandInterface.useAppStore[terminalHistory]"]);
    const isAiLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[isAiLoading]": (s)=>s.isAiLoading
    }["CommandInterface.useAppStore[isAiLoading]"]);
    const submitCommand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[submitCommand]": (s)=>s.submitCommand
    }["CommandInterface.useAppStore[submitCommand]"]);
    const teacherMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[teacherMode]": (s)=>s.teacherMode
    }["CommandInterface.useAppStore[teacherMode]"]);
    const setTeacherMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[setTeacherMode]": (s)=>s.setTeacherMode
    }["CommandInterface.useAppStore[setTeacherMode]"]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom when new entries arrive
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommandInterface.useEffect": ()=>{
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }["CommandInterface.useEffect"], [
        terminalHistory
    ]);
    // Focus input on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommandInterface.useEffect": ()=>{
            inputRef.current?.focus();
        }
    }["CommandInterface.useEffect"], []);
    // Initialize speech recognition
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CommandInterface.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognitionAPI) {
                    recognitionRef.current = new SpeechRecognitionAPI();
                    recognitionRef.current.continuous = false;
                    recognitionRef.current.interimResults = false;
                    recognitionRef.current.lang = 'en-US';
                    recognitionRef.current.onresult = ({
                        "CommandInterface.useEffect": (event)=>{
                            const transcript = event.results[0][0].transcript;
                            setInput({
                                "CommandInterface.useEffect": (prev)=>prev ? prev + ' ' + transcript : transcript
                            }["CommandInterface.useEffect"]);
                            setIsListening(false);
                        }
                    })["CommandInterface.useEffect"];
                    recognitionRef.current.onerror = ({
                        "CommandInterface.useEffect": ()=>{
                            setIsListening(false);
                        }
                    })["CommandInterface.useEffect"];
                    recognitionRef.current.onend = ({
                        "CommandInterface.useEffect": ()=>{
                            setIsListening(false);
                        }
                    })["CommandInterface.useEffect"];
                }
            }
        }
    }["CommandInterface.useEffect"], []);
    const handleSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[handleSubmit]": (e)=>{
            e.preventDefault();
            if (!input.trim() || isAiLoading) return;
            void submitCommand(input);
            setInput('');
        }
    }["CommandInterface.useCallback[handleSubmit]"], [
        input,
        isAiLoading,
        submitCommand
    ]);
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[handleKeyDown]": (e)=>{
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!input.trim() || isAiLoading) return;
                void submitCommand(input);
                setInput('');
            }
        }
    }["CommandInterface.useCallback[handleKeyDown]"], [
        input,
        isAiLoading,
        submitCommand
    ]);
    const toggleVoiceInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[toggleVoiceInput]": ()=>{
            if (!recognitionRef.current) {
                alert('Speech recognition is not supported in this browser.');
                return;
            }
            if (isListening) {
                recognitionRef.current.stop();
                setIsListening(false);
            } else {
                recognitionRef.current.start();
                setIsListening(true);
            }
        }
    }["CommandInterface.useCallback[toggleVoiceInput]"], [
        isListening
    ]);
    const handleImageUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[handleImageUpload]": async (e)=>{
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const reader = new FileReader();
                reader.onload = ({
                    "CommandInterface.useCallback[handleImageUpload]": async (event)=>{
                        const base64 = event.target?.result;
                        await submitCommand(input || 'Analyze this circuit image and recreate it virtually', base64);
                        setInput('');
                    }
                })["CommandInterface.useCallback[handleImageUpload]"];
                reader.readAsDataURL(file);
            } catch (err) {
                console.error('Error reading image:', err);
            }
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }["CommandInterface.useCallback[handleImageUpload]"], [
        input,
        submitCommand
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col bg-ide-panel-bg",
        onClick: ()=>inputRef.current?.focus(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-ide-border bg-ide-panel-surface px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center rounded-lg bg-ide-panel-bg p-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setTeacherMode(false),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all', !teacherMode ? 'bg-ide-success/20 text-ide-success shadow-sm' : 'text-ide-text-muted hover:text-ide-text'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, this),
                                    "Builder"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setTeacherMode(true),
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all', teacherMode ? 'bg-ide-accent/20 text-ide-accent shadow-sm' : 'text-ide-text-muted hover:text-ide-text'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$graduation$2d$cap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GraduationCap$3e$__["GraduationCap"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 230,
                                        columnNumber: 13
                                    }, this),
                                    "Teacher"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-ide-text-subtle",
                        children: teacherMode ? 'Explains concepts' : 'Builds circuits'
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                className: "min-h-0 flex-1 overflow-y-auto px-3 py-3",
                children: [
                    terminalHistory.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-full items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center max-w-xs",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ide-accent/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                                        className: "h-6 w-6 text-ide-accent"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 248,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 247,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-medium text-ide-text mb-1",
                                    children: "FUNDI AI Assistant"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 250,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-ide-text-muted mb-3",
                                    children: "Describe the circuit you want to build, upload an image, or use voice input."
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 251,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-ide-text-subtle",
                                    children: "Type /help for commands"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 254,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 246,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this),
                    terminalHistory.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatMessage, {
                            entry: entry
                        }, entry.id, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 261,
                            columnNumber: 11
                        }, this)),
                    isAiLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 py-2 text-sm text-ide-accent animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "h-4 w-4 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Generating..."
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 266,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 264,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 240,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-t border-ide-border bg-ide-panel-surface p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-ide-border bg-ide-panel-bg overflow-hidden focus-within:border-ide-accent/50 focus-within:ring-1 focus-within:ring-ide-accent/20 transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: inputRef,
                                value: input,
                                onChange: (e)=>setInput(e.target.value),
                                onKeyDown: handleKeyDown,
                                disabled: isAiLoading,
                                placeholder: isListening ? 'Listening...' : isAiLoading ? 'Generating...' : 'Describe your circuit or ask a question...',
                                rows: 2,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full resize-none bg-transparent px-3 py-2 text-sm text-ide-text outline-none', 'placeholder:text-ide-text-subtle', 'disabled:cursor-not-allowed disabled:opacity-50'),
                                autoComplete: "off",
                                spellCheck: false
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 276,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between border-t border-ide-border px-2 py-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: fileInputRef,
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handleImageUpload,
                                                className: "hidden"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 303,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>fileInputRef.current?.click(),
                                                disabled: isAiLoading,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-7 w-7 items-center justify-center rounded-md transition-colors', 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text', 'disabled:cursor-not-allowed disabled:opacity-50'),
                                                title: "Upload circuit image",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__["ImagePlus"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 310,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: toggleVoiceInput,
                                                disabled: isAiLoading,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative flex h-7 w-7 items-center justify-center rounded-md transition-all', isListening ? 'mic-recording text-ide-error' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text', 'disabled:cursor-not-allowed disabled:opacity-50'),
                                                title: isListening ? 'Stop listening' : 'Start voice input',
                                                children: [
                                                    isListening ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 21
                                                    }, this),
                                                    isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute inset-0 rounded-md animate-pulse-ring bg-ide-error/30"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                        lineNumber: 345,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 325,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 301,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: isAiLoading || !input.trim(),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all btn-press', input.trim() && !isAiLoading ? 'bg-ide-accent text-white hover:bg-ide-accent-hover' : 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                className: "h-3.5 w-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 361,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Send"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 362,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 351,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 300,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 274,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                    lineNumber: 273,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 272,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/CommandInterface.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
_s(CommandInterface, "iRhpcipuFaH0IC0mQNiqX5yCdDQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c1 = CommandInterface;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChatMessage");
__turbopack_context__.k.register(_c1, "CommandInterface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/terminal/SerialMonitor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SerialMonitor",
    ()=>SerialMonitor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down-to-line.js [app-client] (ecmascript) <export default as ArrowDownToLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function SerialMonitor({ serialOutput, onClear, isRunning }) {
    _s();
    const [autoScroll, setAutoScroll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [baudRate, setBaudRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(9600);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto-scroll to bottom when new output arrives (if enabled)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SerialMonitor.useEffect": ()=>{
            if (autoScroll && scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }["SerialMonitor.useEffect"], [
        serialOutput,
        autoScroll
    ]);
    const handleScroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SerialMonitor.useCallback[handleScroll]": ()=>{
            if (!scrollRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Disable auto-scroll if user scrolls up
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
            if (!isAtBottom && autoScroll) {
                setAutoScroll(false);
            }
        }
    }["SerialMonitor.useCallback[handleScroll]"], [
        autoScroll
    ]);
    const scrollToBottom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SerialMonitor.useCallback[scrollToBottom]": ()=>{
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                setAutoScroll(true);
            }
        }
    }["SerialMonitor.useCallback[scrollToBottom]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col bg-ide-panel-bg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex shrink-0 items-center justify-between border-b border-ide-border px-3 py-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-2 w-2 rounded-full', isRunning ? 'bg-ide-success animate-pulse' : 'bg-ide-text-subtle')
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-medium text-ide-text-muted",
                                        children: isRunning ? 'Connected' : 'Disconnected'
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 55,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: baudRate,
                                onChange: (e)=>setBaudRate(Number(e.target.value)),
                                className: "h-6 rounded border border-ide-border bg-ide-panel-surface px-1.5 text-[10px] text-ide-text-muted outline-none hover:border-ide-border-focus focus:border-ide-accent",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 9600,
                                        children: "9600 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 66,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 19200,
                                        children: "19200 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 67,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 38400,
                                        children: "38400 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 68,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 57600,
                                        children: "57600 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 115200,
                                        children: "115200 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 70,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: scrollToBottom,
                                title: autoScroll ? 'Auto-scroll ON' : 'Scroll to bottom',
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-6 w-6 items-center justify-center rounded transition-colors', autoScroll ? 'bg-ide-success/20 text-ide-success' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__["ArrowDownToLine"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: onClear,
                                title: "Clear output",
                                className: "flex h-6 w-6 items-center justify-center rounded text-ide-text-muted transition-colors hover:bg-ide-panel-hover hover:text-ide-text",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                onScroll: handleScroll,
                className: "min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs",
                children: serialOutput.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full items-center justify-center text-ide-text-subtle",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-1",
                                children: "Serial Monitor"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 111,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-ide-text-subtle/70",
                                children: isRunning ? 'Waiting for serial output...' : 'Run simulation to see output'
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 110,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                    lineNumber: 109,
                    columnNumber: 11
                }, this) : serialOutput.map((line, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "leading-relaxed text-ide-success",
                        children: line || '\u00A0'
                    }, index, false, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 121,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/SerialMonitor.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(SerialMonitor, "uoh/G4fhi2zqcJR6VgJCWbyLBwg=");
_c = SerialMonitor;
var _c;
__turbopack_context__.k.register(_c, "SerialMonitor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/terminal/TerminalPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TerminalPanel",
    ()=>TerminalPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-client] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$CommandInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/CommandInterface.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$SerialMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/SerialMonitor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function TerminalPanel({ serialOutput, onClearSerial, isSimulationRunning }) {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('assistant');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden bg-ide-panel-bg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('serial'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors', activeTab === 'serial' ? 'border-b-2 border-ide-success text-ide-success' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Serial"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            isSimulationRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-ide-success"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 41,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('assistant'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors', activeTab === 'assistant' ? 'border-b-2 border-ide-accent text-ide-accent' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Assistant"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1",
                children: activeTab === 'serial' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$SerialMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SerialMonitor"], {
                    serialOutput: serialOutput,
                    onClear: onClearSerial,
                    isRunning: isSimulationRunning
                }, void 0, false, {
                    fileName: "[project]/components/terminal/TerminalPanel.tsx",
                    lineNumber: 62,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$CommandInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandInterface"], {}, void 0, false, {
                    fileName: "[project]/components/terminal/TerminalPanel.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/TerminalPanel.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(TerminalPanel, "v7O7JQxeageUz9Q3CXOZAwICY4E=");
_c = TerminalPanel;
var _c;
__turbopack_context__.k.register(_c, "TerminalPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/terminal/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$CommandInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/CommandInterface.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$SerialMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/SerialMonitor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$TerminalPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/TerminalPanel.tsx [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useDiagramSync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useDiagramSync",
    ()=>useDiagramSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wokwiParts.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function resolveWokwiType(type) {
    const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][type];
    if (cfg?.element) return cfg.element;
    if (type.startsWith('wokwi-')) return type;
    return type;
}
function useDiagramSync() {
    _s();
    const circuitParts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useDiagramSync.useAppStore[circuitParts]": (s)=>s.circuitParts
    }["useDiagramSync.useAppStore[circuitParts]"]);
    const connections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useDiagramSync.useAppStore[connections]": (s)=>s.connections
    }["useDiagramSync.useAppStore[connections]"]);
    const setDiagramJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useDiagramSync.useAppStore[setDiagramJson]": (s)=>s.setDiagramJson
    }["useDiagramSync.useAppStore[setDiagramJson]"]);
    const diagram = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDiagramSync.useMemo[diagram]": ()=>{
            return {
                version: 1,
                parts: circuitParts.map({
                    "useDiagramSync.useMemo[diagram]": (p)=>({
                            id: p.id,
                            type: resolveWokwiType(p.type),
                            top: Math.round(p.position.y),
                            left: Math.round(p.position.x),
                            rotate: p.rotate ?? 0,
                            attrs: p.attrs ?? {}
                        })
                }["useDiagramSync.useMemo[diagram]"]),
                connections: connections.map({
                    "useDiagramSync.useMemo[diagram]": (c)=>[
                            `${c.from.partId}:${c.from.pinId}`,
                            `${c.to.partId}:${c.to.pinId}`,
                            c.color,
                            []
                        ]
                }["useDiagramSync.useMemo[diagram]"])
            };
        }
    }["useDiagramSync.useMemo[diagram]"], [
        circuitParts,
        connections
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDiagramSync.useEffect": ()=>{
            setDiagramJson(JSON.stringify(diagram, null, 2));
        }
    }["useDiagramSync.useEffect"], [
        diagram,
        setDiagramJson
    ]);
}
_s(useDiagramSync, "dMxNtkhY4NFoHMyEiqf3V3AU7So=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useSimulation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSimulation",
    ()=>useSimulation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/gpio.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/clock.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/timer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/usart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/cpu/cpu.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$instruction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/cpu/instruction.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function decodeBase64ToString(base64) {
    const normalized = base64.trim();
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}
function parseIntelHex(hex) {
    // Minimal Intel HEX parser with support for:
    // - 00: Data records
    // - 01: End of file
    // - 04: Extended linear address
    let upper = 0;
    const mem = new Map();
    let maxAddr = 0;
    const lines = hex.split(/\r?\n/);
    for (const rawLine of lines){
        const line = rawLine.trim();
        if (!line || !line.startsWith(':')) continue;
        const byteCount = Number.parseInt(line.slice(1, 3), 16);
        const addr16 = Number.parseInt(line.slice(3, 7), 16);
        const recordType = Number.parseInt(line.slice(7, 9), 16);
        const data = line.slice(9, 9 + byteCount * 2);
        if (recordType === 0x00) {
            const base = (upper << 16) + addr16;
            for(let i = 0; i < byteCount; i++){
                const b = Number.parseInt(data.slice(i * 2, i * 2 + 2), 16);
                const addr = base + i;
                mem.set(addr, b);
                if (addr + 1 > maxAddr) maxAddr = addr + 1;
            }
        } else if (recordType === 0x01) {
            break;
        } else if (recordType === 0x04) {
            upper = Number.parseInt(data, 16);
        }
    }
    const byteLength = maxAddr % 2 === 0 ? maxAddr : maxAddr + 1;
    const progBytes = new Uint8Array(byteLength);
    for (const [addr, value] of mem.entries()){
        if (addr >= 0 && addr < progBytes.length) progBytes[addr] = value;
    }
    const words = new Uint16Array(progBytes.length / 2);
    for(let i = 0; i < words.length; i++){
        const lo = progBytes[i * 2];
        const hi = progBytes[i * 2 + 1];
        words[i] = lo | hi << 8;
    }
    return words;
}
class AVRRunner {
    cpu;
    portB;
    portD;
    clock;
    timer0;
    usart;
    constructor(hexText){
        const program = parseIntelHex(hexText);
        this.cpu = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CPU"](program);
        this.portB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRIOPort"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portBConfig"]);
        this.portD = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRIOPort"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portDConfig"]);
        // Provide basic Arduino timing (millis/delay rely on timer0 on Uno).
        this.clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRClock"](this.cpu, 16_000_000);
        this.timer0 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRTimer"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timer0Config"]);
        // USART for Serial communication
        this.usart = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRUSART"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usart0Config"], 16_000_000);
    }
}
function isAvrPart(partType) {
    return partType === 'wokwi-arduino-uno' || partType === 'wokwi-arduino-nano' || partType === 'wokwi-arduino-mega';
}
function useSimulation(hexData, partType) {
    _s();
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pinStates, setPinStates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [serialOutput, setSerialOutput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const runnerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const runningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const serialBufferRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const stepFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        "useSimulation.useRef[stepFrameRef]": ()=>{}
    }["useSimulation.useRef[stepFrameRef]"]);
    const cyclesPerFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useSimulation.useMemo[cyclesPerFrame]": ()=>Math.floor(16_000_000 / 60)
    }["useSimulation.useMemo[cyclesPerFrame]"], []);
    const clearSerialOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[clearSerialOutput]": ()=>{
            setSerialOutput([]);
            serialBufferRef.current = '';
        }
    }["useSimulation.useCallback[clearSerialOutput]"], []);
    const updatePortPins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[updatePortPins]": (port, value)=>{
            setPinStates({
                "useSimulation.useCallback[updatePortPins]": (prev)=>{
                    const next = {
                        ...prev
                    };
                    if (port === 'D') {
                        // PORTD bits 0-7 -> Digital 0-7
                        for(let bit = 0; bit < 8; bit++){
                            const pin = bit;
                            next[pin] = (value & 1 << bit) !== 0;
                        }
                    } else {
                        // PORTB bits 0-5 -> Digital 8-13
                        for(let bit = 0; bit < 6; bit++){
                            const pin = 8 + bit;
                            next[pin] = (value & 1 << bit) !== 0;
                        }
                    }
                    return next;
                }
            }["useSimulation.useCallback[updatePortPins]"]);
        }
    }["useSimulation.useCallback[updatePortPins]"], []);
    // Update the step function ref in an effect to avoid stale closure issues
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSimulation.useEffect": ()=>{
            stepFrameRef.current = ({
                "useSimulation.useEffect": ()=>{
                    if (!runningRef.current) return;
                    const runner = runnerRef.current;
                    if (!runner) return;
                    // Run ~16MHz/60fps CPU cycles each frame.
                    let remaining = cyclesPerFrame;
                    while(remaining > 0){
                        const before = runner.cpu.cycles;
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$instruction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["avrInstruction"])(runner.cpu);
                        const delta = runner.cpu.cycles - before;
                        remaining -= delta > 0 ? delta : 1;
                    }
                    rafRef.current = requestAnimationFrame(stepFrameRef.current);
                }
            })["useSimulation.useEffect"];
        }
    }["useSimulation.useEffect"], [
        cyclesPerFrame
    ]);
    const stepFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[stepFrame]": ()=>{
            stepFrameRef.current();
        }
    }["useSimulation.useCallback[stepFrame]"], []);
    const stop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[stop]": ()=>{
            runningRef.current = false;
            setIsRunning(false);
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            runnerRef.current = null;
            setPinStates({});
            setSerialOutput([]);
            serialBufferRef.current = '';
        }
    }["useSimulation.useCallback[stop]"], []);
    const pause = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[pause]": ()=>{
            runningRef.current = false;
            setIsRunning(false);
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }
    }["useSimulation.useCallback[pause]"], []);
    const run = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[run]": ()=>{
            if (!hexData) return;
            if (!isAvrPart(partType)) {
                // avr8js only simulates AVR8 cores; ESP32 is not supported here.
                return;
            }
            if (!runnerRef.current) {
                const hexText = decodeBase64ToString(hexData);
                const runner = new AVRRunner(hexText);
                const onPortB = {
                    "useSimulation.useCallback[run].onPortB": (value)=>updatePortPins('B', value)
                }["useSimulation.useCallback[run].onPortB"];
                const onPortD = {
                    "useSimulation.useCallback[run].onPortD": (value)=>updatePortPins('D', value)
                }["useSimulation.useCallback[run].onPortD"];
                runner.portB.addListener(onPortB);
                runner.portD.addListener(onPortD);
                // Listen for USART byte transmissions (Serial.print output)
                runner.usart.onByteTransmit = ({
                    "useSimulation.useCallback[run]": (byte)=>{
                        const char = String.fromCharCode(byte);
                        serialBufferRef.current += char;
                        // When we see a newline, flush the buffer as a new line
                        if (char === '\n') {
                            const line = serialBufferRef.current.trimEnd();
                            if (line) {
                                setSerialOutput({
                                    "useSimulation.useCallback[run]": (prev)=>[
                                            ...prev,
                                            line
                                        ]
                                }["useSimulation.useCallback[run]"]);
                            }
                            serialBufferRef.current = '';
                        }
                    }
                })["useSimulation.useCallback[run]"];
                // Initialize state from current registers
                updatePortPins('B', runner.cpu.data[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portBConfig"].PORT]);
                updatePortPins('D', runner.cpu.data[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portDConfig"].PORT]);
                runnerRef.current = runner;
            }
            if (runningRef.current) return;
            runningRef.current = true;
            setIsRunning(true);
            rafRef.current = requestAnimationFrame(stepFrame);
        }
    }["useSimulation.useCallback[run]"], [
        hexData,
        partType,
        stepFrame,
        updatePortPins
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSimulation.useEffect": ()=>{
            // Reset simulation when program/target changes.
            stop();
        }
    }["useSimulation.useEffect"], [
        hexData,
        partType,
        stop
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSimulation.useEffect": ()=>{
            return ({
                "useSimulation.useEffect": ()=>{
                    stop();
                }
            })["useSimulation.useEffect"];
        }
    }["useSimulation.useEffect"], [
        stop
    ]);
    return {
        run,
        stop,
        pause,
        isRunning,
        pinStates,
        serialOutput,
        clearSerialOutput
    };
}
_s(useSimulation, "uKV/qQ2tU27p6Xz5x9RtQC8iOYA=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-code.js [app-client] (ecmascript) <export default as FileCode>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-tree.js [app-client] (ecmascript) <export default as FolderTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.js [app-client] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.js [app-client] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-client] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-client] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-resizable-panels/dist/react-resizable-panels.browser.development.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/system/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@xyflow/react/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$nodes$2f$ArduinoNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/nodes/ArduinoNode.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$nodes$2f$WokwiPartNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/nodes/WokwiPartNode.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ComponentLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ComponentLibrary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/StatusBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectionOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SelectionOverlay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WiringLayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WiringLayer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/components/terminal/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$TerminalPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/TerminalPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useDiagramSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useDiagramSync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSimulation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useSimulation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const nodeTypes = {
    arduino: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$nodes$2f$ArduinoNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    wokwi: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$nodes$2f$WokwiPartNode$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
};
function translatePoints(points, delta) {
    if (!points?.length) return points;
    return points.map((p)=>({
            x: p.x + delta.x,
            y: p.y + delta.y
        }));
}
/* ============================================
   Canvas Toolbar Overlay
   ============================================ */ function CanvasToolbar({ onZoomIn, onZoomOut, onFitView, onResetView }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-4 right-4 z-40 flex items-center gap-1 glass-panel rounded-lg p-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onZoomIn,
                className: "flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                title: "Zoom In",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onZoomOut,
                className: "flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                title: "Zoom Out",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-1 h-5 w-px bg-ide-border"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onFitView,
                className: "flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                title: "Fit View",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onResetView,
                className: "flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                title: "Reset View",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                    className: "h-4 w-4"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 112,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_c = CanvasToolbar;
/* ============================================
   Unified Action Bar (Command Center)
   ============================================ */ function UnifiedActionBar({ isCompiling, compilationError, onRun, hasProgram, isRunning, onStop }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "floating-bar flex items-center gap-2 px-3 py-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: onRun,
                    disabled: isCompiling,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group relative flex items-center gap-2 rounded-lg px-4 py-2', 'text-sm font-semibold transition-all duration-200', 'btn-press', isCompiling ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed' : 'bg-ide-success text-white hover:bg-ide-success/90 shadow-lg shadow-ide-success/20'),
                    title: "Compile and run",
                    children: isCompiling ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 156,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Compiling..."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 157,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                className: "h-4 w-4 fill-current"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 161,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Run Simulation"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 162,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: onStop,
                    disabled: !hasProgram,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-9 w-9 items-center justify-center rounded-lg', 'transition-all duration-200 btn-press', !hasProgram ? 'text-ide-text-subtle cursor-not-allowed' : 'text-ide-text-muted hover:bg-ide-error/20 hover:text-ide-error'),
                    title: "Stop simulation",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 168,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-1 h-6 w-px bg-ide-border"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 184,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 rounded-lg bg-ide-panel-bg/80 px-3 py-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-2 w-2 rounded-full transition-colors duration-300', isCompiling ? 'bg-ide-warning animate-pulse' : compilationError ? 'bg-ide-error' : hasProgram ? isRunning ? 'bg-ide-success animate-pulse' : 'bg-ide-success' : 'bg-ide-text-subtle')
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 188,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-medium text-ide-text-muted",
                            children: isCompiling ? 'Compiling' : compilationError ? 'Error' : hasProgram ? isRunning ? 'Running' : 'Ready' : 'Idle'
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 202,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_c1 = UnifiedActionBar;
/* ============================================
   Simulation Canvas Inner (ReactFlow)
   ============================================ */ function SimulationCanvasInner({ canvasRef, isRunning }) {
    _s();
    const addPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[addPart]": (s)=>s.addPart
    }["SimulationCanvasInner.useAppStore[addPart]"]);
    const updatePartsPositions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[updatePartsPositions]": (s)=>s.updatePartsPositions
    }["SimulationCanvasInner.useAppStore[updatePartsPositions]"]);
    const selectedPartIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[selectedPartIds]": (s)=>s.selectedPartIds
    }["SimulationCanvasInner.useAppStore[selectedPartIds]"]);
    const setSelectedPartIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[setSelectedPartIds]": (s)=>s.setSelectedPartIds
    }["SimulationCanvasInner.useAppStore[setSelectedPartIds]"]);
    const toggleSelectedPartId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[toggleSelectedPartId]": (s)=>s.toggleSelectedPartId
    }["SimulationCanvasInner.useAppStore[toggleSelectedPartId]"]);
    const connections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[connections]": (s)=>s.connections
    }["SimulationCanvasInner.useAppStore[connections]"]);
    const updateWire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[updateWire]": (s)=>s.updateWire
    }["SimulationCanvasInner.useAppStore[updateWire]"]);
    const circuitParts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[circuitParts]": (s)=>s.circuitParts
    }["SimulationCanvasInner.useAppStore[circuitParts]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useDiagramSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiagramSync"])();
    const { zoomIn, zoomOut, fitView, setViewport } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    const getCanvasRect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[getCanvasRect]": ()=>{
            return canvasRef.current?.getBoundingClientRect() ?? null;
        }
    }["SimulationCanvasInner.useCallback[getCanvasRect]"], [
        canvasRef
    ]);
    const [selectedEdge, setSelectedEdge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])([]);
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Seed a default part once.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            if (initializedRef.current) return;
            if (nodes.length) return;
            initializedRef.current = true;
            const id = addPart({
                type: 'arduino-uno',
                position: {
                    x: 0,
                    y: 0
                }
            });
            setNodes([
                {
                    id,
                    type: 'wokwi',
                    position: {
                        x: 0,
                        y: 0
                    },
                    data: {
                        getCanvasRect,
                        partType: 'arduino-uno'
                    },
                    selected: true
                }
            ]);
            setSelectedPartIds([
                id
            ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["SimulationCanvasInner.useEffect"], []);
    // Sync ReactFlow nodes with circuitParts from store
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            if (!initializedRef.current) return;
            const newNodes = circuitParts.map({
                "SimulationCanvasInner.useEffect.newNodes": (part)=>({
                        id: part.id,
                        type: 'wokwi',
                        position: {
                            x: part.position.x,
                            y: part.position.y
                        },
                        data: {
                            getCanvasRect,
                            partType: part.type.replace('wokwi-', '')
                        },
                        selected: selectedPartIds.includes(part.id)
                    })
            }["SimulationCanvasInner.useEffect.newNodes"]);
            const currentIds = new Set(nodes.map({
                "SimulationCanvasInner.useEffect": (n)=>n.id
            }["SimulationCanvasInner.useEffect"]));
            const newIds = new Set(newNodes.map({
                "SimulationCanvasInner.useEffect": (n)=>n.id
            }["SimulationCanvasInner.useEffect"]));
            const idsChanged = newIds.size !== currentIds.size || [
                ...newIds
            ].some({
                "SimulationCanvasInner.useEffect": (id)=>!currentIds.has(id)
            }["SimulationCanvasInner.useEffect"]);
            if (newNodes.length > 0 && idsChanged) {
                setNodes(newNodes);
            }
        }
    }["SimulationCanvasInner.useEffect"], [
        circuitParts,
        getCanvasRect,
        nodes,
        selectedPartIds,
        setNodes
    ]);
    // Update node data when handlers change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            setNodes({
                "SimulationCanvasInner.useEffect": (nds)=>nds.map({
                        "SimulationCanvasInner.useEffect": (node)=>{
                            if (node.type === 'arduino' || node.type === 'wokwi') {
                                return {
                                    ...node,
                                    data: {
                                        ...node.data,
                                        getCanvasRect
                                    }
                                };
                            }
                            return node;
                        }
                    }["SimulationCanvasInner.useEffect"])
            }["SimulationCanvasInner.useEffect"]);
        }
    }["SimulationCanvasInner.useEffect"], [
        getCanvasRect,
        setNodes
    ]);
    // Keep ReactFlow selection in sync with Zustand selection.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            const selectedSet = new Set(selectedPartIds);
            setNodes({
                "SimulationCanvasInner.useEffect": (nds)=>nds.map({
                        "SimulationCanvasInner.useEffect": (n)=>({
                                ...n,
                                selected: selectedSet.has(n.id)
                            })
                    }["SimulationCanvasInner.useEffect"])
            }["SimulationCanvasInner.useEffect"]);
        }
    }["SimulationCanvasInner.useEffect"], [
        selectedPartIds,
        setNodes
    ]);
    const [edges, setEdges, onEdgesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"])([]);
    const onConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onConnect]": (params)=>setEdges({
                "SimulationCanvasInner.useCallback[onConnect]": (eds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$system$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addEdge"])({
                        ...params,
                        type: 'default',
                        animated: false,
                        style: {
                            stroke: 'var(--ide-accent)',
                            strokeWidth: 2.5
                        }
                    }, eds)
            }["SimulationCanvasInner.useCallback[onConnect]"])
    }["SimulationCanvasInner.useCallback[onConnect]"], [
        setEdges
    ]);
    const onEdgeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onEdgeClick]": (_, edge)=>{
            setSelectedEdge(edge.id);
        }
    }["SimulationCanvasInner.useCallback[onEdgeClick]"], []);
    const onPaneClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onPaneClick]": ()=>{
            setSelectedEdge(null);
        }
    }["SimulationCanvasInner.useCallback[onPaneClick]"], []);
    const onNodeClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeClick]": (e, node)=>{
            if (e.target?.closest?.('[data-fundi-pin="true"]')) return;
            if (e.shiftKey) {
                toggleSelectedPartId(node.id);
            } else {
                setSelectedPartIds([
                    node.id
                ]);
            }
        }
    }["SimulationCanvasInner.useCallback[onNodeClick]"], [
        setSelectedPartIds,
        toggleSelectedPartId
    ]);
    // Group-drag engine
    const dragStartNodesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const dragStartWirePointsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const dragWireModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const [wirePointOverrides, setWirePointOverrides] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const onNodeDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeDragStart]": (_, node)=>{
            if (!selectedPartIds.includes(node.id)) {
                setSelectedPartIds([
                    node.id
                ]);
            }
            const selectedSet = new Set(selectedPartIds.includes(node.id) ? selectedPartIds : [
                node.id
            ]);
            dragStartNodesRef.current = new Map(nodes.filter({
                "SimulationCanvasInner.useCallback[onNodeDragStart]": (n)=>selectedSet.has(n.id)
            }["SimulationCanvasInner.useCallback[onNodeDragStart]"]).map({
                "SimulationCanvasInner.useCallback[onNodeDragStart]": (n)=>[
                        n.id,
                        {
                            x: n.position.x,
                            y: n.position.y
                        }
                    ]
            }["SimulationCanvasInner.useCallback[onNodeDragStart]"]));
            dragStartWirePointsRef.current = new Map();
            dragWireModeRef.current = new Map();
            for (const c of connections){
                if (!c.points?.length) continue;
                const fromMoving = selectedSet.has(c.from.partId);
                const toMoving = selectedSet.has(c.to.partId);
                if (!fromMoving && !toMoving) continue;
                dragStartWirePointsRef.current.set(c.id, c.points);
                dragWireModeRef.current.set(c.id, fromMoving && toMoving ? 'both' : 'one');
            }
        }
    }["SimulationCanvasInner.useCallback[onNodeDragStart]"], [
        connections,
        nodes,
        selectedPartIds,
        setSelectedPartIds
    ]);
    const onNodeDrag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeDrag]": (_, node)=>{
            const start = dragStartNodesRef.current.get(node.id);
            if (!start) return;
            const delta = {
                x: node.position.x - start.x,
                y: node.position.y - start.y
            };
            setNodes({
                "SimulationCanvasInner.useCallback[onNodeDrag]": (nds)=>nds.map({
                        "SimulationCanvasInner.useCallback[onNodeDrag]": (n)=>{
                            const s = dragStartNodesRef.current.get(n.id);
                            if (!s) return n;
                            return {
                                ...n,
                                position: {
                                    x: s.x + delta.x,
                                    y: s.y + delta.y
                                }
                            };
                        }
                    }["SimulationCanvasInner.useCallback[onNodeDrag]"])
            }["SimulationCanvasInner.useCallback[onNodeDrag]"]);
            const overrides = new Map();
            for (const [wireId, basePoints] of dragStartWirePointsRef.current.entries()){
                const mode = dragWireModeRef.current.get(wireId);
                if (!mode) continue;
                if (mode === 'both') {
                    overrides.set(wireId, translatePoints(basePoints, delta));
                } else {
                    overrides.set(wireId, undefined);
                }
            }
            setWirePointOverrides(overrides.size ? overrides : null);
        }
    }["SimulationCanvasInner.useCallback[onNodeDrag]"], [
        setNodes
    ]);
    const onNodeDragStop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeDragStop]": ()=>{
            const updates = [];
            for (const [id] of dragStartNodesRef.current.entries()){
                const n = nodes.find({
                    "SimulationCanvasInner.useCallback[onNodeDragStop].n": (nn)=>nn.id === id
                }["SimulationCanvasInner.useCallback[onNodeDragStop].n"]);
                if (!n) continue;
                updates.push({
                    id,
                    x: n.position.x,
                    y: n.position.y
                });
            }
            updatePartsPositions(updates);
            if (wirePointOverrides) {
                for (const [wireId, pts] of wirePointOverrides.entries()){
                    updateWire(wireId, pts);
                }
            }
            dragStartNodesRef.current = new Map();
            dragStartWirePointsRef.current = new Map();
            dragWireModeRef.current = new Map();
            setWirePointOverrides(null);
        }
    }["SimulationCanvasInner.useCallback[onNodeDragStop]"], [
        nodes,
        updatePartsPositions,
        updateWire,
        wirePointOverrides
    ]);
    // Drag-to-add handler
    const transform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"])({
        "SimulationCanvasInner.useStore[transform]": (s)=>s.transform
    }["SimulationCanvasInner.useStore[transform]"]);
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleDrop]": (e)=>{
            const container = canvasRef.current;
            if (!container) return;
            const partType = e.dataTransfer.getData(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ComponentLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FUNDI_PART_MIME"]);
            if (!partType) return;
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const p = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            const [tx, ty, zoom] = transform;
            const flow = {
                x: (p.x - tx) / zoom,
                y: (p.y - ty) / zoom
            };
            const id = addPart({
                type: partType,
                position: {
                    x: flow.x,
                    y: flow.y
                }
            });
            setNodes({
                "SimulationCanvasInner.useCallback[handleDrop]": (nds)=>[
                        ...nds,
                        {
                            id,
                            type: 'wokwi',
                            position: flow,
                            data: {
                                getCanvasRect,
                                partType
                            },
                            selected: true
                        }
                    ]
            }["SimulationCanvasInner.useCallback[handleDrop]"]);
            setSelectedPartIds([
                id
            ]);
        }
    }["SimulationCanvasInner.useCallback[handleDrop]"], [
        addPart,
        canvasRef,
        getCanvasRect,
        setNodes,
        setSelectedPartIds,
        transform
    ]);
    const handleDragOver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleDragOver]": (e)=>{
            if (e.dataTransfer.types.includes(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ComponentLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FUNDI_PART_MIME"])) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }
        }
    }["SimulationCanvasInner.useCallback[handleDragOver]"], []);
    const handleResetView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleResetView]": ()=>{
            setViewport({
                x: 0,
                y: 0,
                zoom: 1
            }, {
                duration: 300
            });
        }
    }["SimulationCanvasInner.useCallback[handleResetView]"], [
        setViewport
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: canvasRef,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('relative h-full w-full ide-canvas', isRunning && 'simulation-active rounded-lg'),
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CanvasToolbar, {
                onZoomIn: ()=>zoomIn({
                        duration: 200
                    }),
                onZoomOut: ()=>zoomOut({
                        duration: 200
                    }),
                onFitView: ()=>fitView({
                        duration: 300,
                        padding: 0.2
                    }),
                onResetView: handleResetView
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 500,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectionOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                containerRef: canvasRef
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlow"], {
                nodes: nodes,
                edges: edges.map((edge)=>({
                        ...edge,
                        style: {
                            ...edge.style,
                            stroke: 'var(--ide-text-muted)',
                            strokeWidth: edge.id === selectedEdge ? 3 : 2
                        }
                    })),
                nodeTypes: nodeTypes,
                onNodesChange: onNodesChange,
                onEdgesChange: onEdgesChange,
                onConnect: onConnect,
                onEdgeClick: onEdgeClick,
                onPaneClick: onPaneClick,
                onNodeClick: onNodeClick,
                onNodeDragStart: onNodeDragStart,
                onNodeDrag: onNodeDrag,
                onNodeDragStop: onNodeDragStop,
                fitView: true,
                className: "h-full w-full",
                style: {
                    cursor: 'inherit',
                    background: 'transparent'
                },
                defaultEdgeOptions: {
                    type: 'default',
                    animated: false,
                    style: {
                        stroke: 'var(--ide-text-muted)',
                        strokeWidth: 2
                    }
                },
                connectionLineStyle: {
                    stroke: 'var(--ide-accent)',
                    strokeWidth: 2
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Background"], {
                        color: "#333333",
                        variant: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BackgroundVariant"].Dots,
                        gap: 20,
                        size: 1
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 539,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                        className: "!left-4 !bottom-20"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 540,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WiringLayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        containerRef: canvasRef,
                        wirePointOverrides: wirePointOverrides ?? undefined
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 542,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 509,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 491,
        columnNumber: 5
    }, this);
}
_s(SimulationCanvasInner, "xWwhp0O/2LFdHHjIvHrY+Czg9BA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useDiagramSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiagramSync"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEdgesState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useStore"]
    ];
});
_c2 = SimulationCanvasInner;
function SimulationCanvas({ isRunning }) {
    _s1();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlowProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationCanvasInner, {
            canvasRef: canvasRef,
            isRunning: isRunning
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 555,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 554,
        columnNumber: 5
    }, this);
}
_s1(SimulationCanvas, "hw7YJ5TVw+lAu0tRkzoDS8rL7/E=");
_c3 = SimulationCanvas;
function CodeEditorPanel({ code, onCodeChange, compilationError }) {
    _s2();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('main.cpp');
    const tabs = [
        {
            key: 'main.cpp',
            label: 'main.cpp',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode$3e$__["FileCode"]
        },
        {
            key: 'diagram.json',
            label: 'diagram.json',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"]
        },
        {
            key: 'README.md',
            label: 'README.md',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden bg-ide-panel-surface",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-bg",
                children: tabs.map((tab)=>{
                    const Icon = tab.icon;
                    const isActive = tab.key === activeTab;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab(tab.key),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 border-r border-ide-border px-3 text-xs font-medium transition-colors', isActive ? 'bg-ide-panel-surface text-ide-text border-b-2 border-b-ide-accent' : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 601,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tab.label
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 602,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.key, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 590,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 585,
                columnNumber: 7
            }, this),
            compilationError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-b border-ide-error/30 bg-ide-error/10 px-4 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                    className: "whitespace-pre-wrap break-words font-mono text-xs text-ide-error",
                    children: compilationError
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 611,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 610,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 p-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    value: code,
                    onChange: (e)=>onCodeChange(e.target.value),
                    spellCheck: false,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-full w-full resize-none rounded-md bg-ide-panel-bg p-4', 'font-mono text-sm leading-6 text-ide-text', 'border border-ide-border', 'focus:outline-none focus:ring-1 focus:ring-ide-accent/50 focus:border-ide-accent/50', 'placeholder:text-ide-text-subtle'),
                    placeholder: "// Write your Arduino code here..."
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 619,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 618,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 583,
        columnNumber: 5
    }, this);
}
_s2(CodeEditorPanel, "0xUkOoZhXVwxshOmUo7RTv72nXo=");
_c4 = CodeEditorPanel;
function LeftPanel() {
    _s3();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('components');
    const tabs = [
        {
            key: 'components',
            label: 'Components',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"]
        },
        {
            key: 'files',
            label: 'Files',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderTree$3e$__["FolderTree"]
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden bg-ide-panel-bg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-10 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface",
                children: tabs.map((tab)=>{
                    const Icon = tab.icon;
                    const isActive = tab.key === activeTab;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab(tab.key),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors', isActive ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 669,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tab.label
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 670,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.key, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 658,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 653,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 overflow-hidden",
                children: [
                    activeTab === 'components' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full overflow-auto p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ComponentLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 680,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 679,
                        columnNumber: 11
                    }, this),
                    activeTab === 'files' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-full items-center justify-center text-ide-text-subtle",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderTree$3e$__["FolderTree"], {
                                    className: "mx-auto h-8 w-8 mb-2 opacity-50"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 686,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs",
                                    children: "Project files"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 687,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 685,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 684,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 677,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 651,
        columnNumber: 5
    }, this);
}
_s3(LeftPanel, "xS+ob+rHSvt7VPIaW/bMTlbaAmQ=");
_c5 = LeftPanel;
/* ============================================
   Resize Handle Component
   ============================================ */ function ResizeHandle({ direction = 'horizontal', className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelResizeHandle"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('resize-handle group relative flex items-center justify-center', direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize', className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('absolute rounded-full bg-ide-border opacity-0 group-hover:opacity-100 transition-opacity', direction === 'horizontal' ? 'w-0.5 h-8' : 'h-0.5 w-8')
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 716,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 707,
        columnNumber: 5
    }, this);
}
_c6 = ResizeHandle;
function Home() {
    _s4();
    const [leftPanelCollapsed, setLeftPanelCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[code]": (s)=>s.code
    }["Home.useAppStore[code]"]);
    const updateCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[updateCode]": (s)=>s.updateCode
    }["Home.useAppStore[updateCode]"]);
    const compileAndRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[compileAndRun]": (s)=>s.compileAndRun
    }["Home.useAppStore[compileAndRun]"]);
    const isCompiling = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[isCompiling]": (s)=>s.isCompiling
    }["Home.useAppStore[isCompiling]"]);
    const compilationError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[compilationError]": (s)=>s.compilationError
    }["Home.useAppStore[compilationError]"]);
    const hex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[hex]": (s)=>s.hex
    }["Home.useAppStore[hex]"]);
    const compiledBoard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[compiledBoard]": (s)=>s.compiledBoard
    }["Home.useAppStore[compiledBoard]"]);
    const { run: simRun, stop: simStop, isRunning: simIsRunning, serialOutput, clearSerialOutput } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSimulation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSimulation"])(hex, compiledBoard ?? '');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!hex || !compiledBoard) return;
            if (isCompiling) return;
            if (compilationError) return;
            if (simIsRunning) return;
            simRun();
        }
    }["Home.useEffect"], [
        compiledBoard,
        compilationError,
        hex,
        isCompiling,
        simIsRunning,
        simRun
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-screen overflow-hidden bg-ide-panel-bg text-ide-text",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "relative z-50 flex h-10 items-center justify-between border-b border-ide-border bg-ide-panel-surface px-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setLeftPanelCollapsed(!leftPanelCollapsed),
                                className: "flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                title: leftPanelCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
                                children: leftPanelCollapsed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__["PanelLeftOpen"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 770,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 772,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 763,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-6 w-6 items-center justify-center rounded-md bg-ide-accent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-bold text-white",
                                            children: "F"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 778,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 777,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-xs font-semibold text-ide-text leading-none",
                                                children: "FUNDI"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 781,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-ide-text-muted leading-none mt-0.5",
                                                children: "IoT Workbench"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 784,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 780,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 776,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 761,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        deviceName: "Arduino Uno",
                        isConnected: true
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 792,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "flex h-7 items-center gap-1.5 rounded-md bg-ide-accent/10 px-3 text-xs font-medium text-ide-accent hover:bg-ide-accent/20 transition-colors",
                                title: "Publish to Gallery",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 801,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "Publish"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 802,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 796,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                title: "Settings",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 809,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 804,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 795,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 759,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-[calc(100vh-40px)]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelGroup"], {
                    direction: "horizontal",
                    className: "h-full",
                    children: [
                        !leftPanelCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                                    defaultSize: 20,
                                    minSize: 15,
                                    maxSize: 35,
                                    className: "bg-ide-panel-bg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LeftPanel, {}, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 826,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 820,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                                    direction: "horizontal"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 828,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                            defaultSize: leftPanelCollapsed ? 60 : 55,
                            minSize: 30,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelGroup"], {
                                direction: "vertical",
                                className: "h-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                                        defaultSize: 60,
                                        minSize: 30,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative h-full overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationCanvas, {
                                                    isRunning: simIsRunning
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 838,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UnifiedActionBar, {
                                                    isCompiling: isCompiling,
                                                    compilationError: compilationError,
                                                    onRun: ()=>void compileAndRun(),
                                                    hasProgram: Boolean(hex && compiledBoard),
                                                    isRunning: simIsRunning,
                                                    onStop: simStop
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 841,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 837,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 836,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                                        direction: "vertical"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 852,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                                        defaultSize: 40,
                                        minSize: 15,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CodeEditorPanel, {
                                            code: code,
                                            onCodeChange: updateCode,
                                            compilationError: compilationError
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 856,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 855,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 834,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 833,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                            direction: "horizontal"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 865,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                            defaultSize: leftPanelCollapsed ? 40 : 25,
                            minSize: 15,
                            maxSize: 40,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$TerminalPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TerminalPanel"], {
                                serialOutput: serialOutput,
                                onClearSerial: clearSerialOutput,
                                isSimulationRunning: simIsRunning
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 869,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 868,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 816,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 815,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 757,
        columnNumber: 5
    }, this);
}
_s4(Home, "+CKa9eKd4qo3Fz7erik8E7janKY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSimulation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSimulation"]
    ];
});
_c7 = Home;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "CanvasToolbar");
__turbopack_context__.k.register(_c1, "UnifiedActionBar");
__turbopack_context__.k.register(_c2, "SimulationCanvasInner");
__turbopack_context__.k.register(_c3, "SimulationCanvas");
__turbopack_context__.k.register(_c4, "CodeEditorPanel");
__turbopack_context__.k.register(_c5, "LeftPanel");
__turbopack_context__.k.register(_c6, "ResizeHandle");
__turbopack_context__.k.register(_c7, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_db571f33._.js.map