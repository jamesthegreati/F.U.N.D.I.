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
        category: 'input'
    },
    'hc-sr04': {
        name: 'HC-SR04',
        element: 'wokwi-hc-sr04',
        description: 'Ultrasonic distance sensor',
        category: 'input'
    },
    'pir-motion': {
        name: 'PIR Motion Sensor',
        element: 'wokwi-pir-motion-sensor',
        description: 'Passive infrared motion sensor',
        category: 'input'
    },
    'photoresistor': {
        name: 'Photoresistor (LDR)',
        element: 'wokwi-photoresistor-sensor',
        description: 'Light-dependent resistor sensor',
        category: 'input'
    },
    'mpu6050': {
        name: 'MPU6050',
        element: 'wokwi-mpu6050',
        description: 'Accelerometer + gyroscope (I2C)',
        category: 'input'
    },
    'ds1307': {
        name: 'DS1307 RTC',
        element: 'wokwi-ds1307',
        description: 'Real-time clock module (I2C)',
        category: 'input'
    },
    'ir-receiver': {
        name: 'IR Receiver',
        element: 'wokwi-ir-receiver',
        description: 'Infrared receiver',
        category: 'input'
    },
    'ir-remote': {
        name: 'IR Remote',
        element: 'wokwi-ir-remote',
        description: 'Infrared remote control',
        category: 'input'
    },
    'analog-joystick': {
        name: 'Analog Joystick',
        element: 'wokwi-analog-joystick',
        description: '2-axis analog joystick',
        category: 'input'
    },
    'rotary-encoder': {
        name: 'Rotary Encoder (KY-040)',
        element: 'wokwi-ky-040',
        description: 'Incremental rotary encoder',
        category: 'input'
    },
    'pushbutton': {
        name: 'Pushbutton',
        element: 'wokwi-pushbutton',
        description: 'Momentary pushbutton',
        category: 'input'
    },
    'pushbutton-6mm': {
        name: 'Pushbutton (6mm)',
        element: 'wokwi-pushbutton-6mm',
        description: 'Tactile 6mm pushbutton',
        category: 'input'
    },
    'resistor': {
        name: 'Resistor',
        element: 'wokwi-resistor',
        description: 'Generic resistor',
        category: 'passive'
    },
    'potentiometer': {
        name: 'Potentiometer',
        element: 'wokwi-potentiometer',
        description: 'Rotary potentiometer',
        category: 'input'
    },
    'slide-potentiometer': {
        name: 'Slide Potentiometer',
        element: 'wokwi-slide-potentiometer',
        description: 'Linear slide potentiometer',
        category: 'input'
    },
    'slide-switch': {
        name: 'Slide Switch',
        element: 'wokwi-slide-switch',
        description: '2-position slide switch',
        category: 'input'
    },
    'dip-switch-8': {
        name: 'DIP Switch (8)',
        element: 'wokwi-dip-switch-8',
        description: '8-position DIP switch',
        category: 'input'
    },
    'buzzer': {
        name: 'Buzzer',
        element: 'wokwi-buzzer',
        description: 'Piezo buzzer',
        category: 'output'
    },
    'servo': {
        name: 'Servo',
        element: 'wokwi-servo',
        description: 'RC servo motor',
        category: 'motors'
    },
    'membrane-keypad': {
        name: 'Membrane Keypad',
        element: 'wokwi-membrane-keypad',
        description: 'Matrix keypad',
        category: 'input'
    },
    'microsd-card': {
        name: 'MicroSD Card',
        element: 'wokwi-microsd-card',
        description: 'MicroSD card module',
        category: 'passive'
    },
    // ==========================================
    // BREADBOARDS (Critical - was missing!)
    // ==========================================
    'breadboard': {
        name: 'Breadboard',
        element: 'wokwi-breadboard',
        description: 'Full-size breadboard (830 tie points)',
        category: 'passive'
    },
    'breadboard-mini': {
        name: 'Mini Breadboard',
        element: 'wokwi-breadboard-mini',
        description: 'Mini breadboard (170 tie points)',
        category: 'passive'
    },
    // ==========================================
    // LOGIC ICs
    // ==========================================
    '74hc595': {
        name: '74HC595 Shift Register',
        element: 'wokwi-74hc595',
        description: '8-bit serial-in, parallel-out shift register',
        category: 'logic'
    },
    '74hc165': {
        name: '74HC165 Shift Register',
        element: 'wokwi-74hc165',
        description: '8-bit parallel-in, serial-out shift register',
        category: 'logic'
    },
    // ==========================================
    // MOTORS & DRIVERS
    // ==========================================
    'stepper-motor': {
        name: 'Stepper Motor',
        element: 'wokwi-stepper-motor',
        description: 'Bipolar stepper motor',
        category: 'motors'
    },
    'a4988': {
        name: 'A4988 Driver',
        element: 'wokwi-a4988',
        description: 'Stepper motor driver',
        category: 'motors'
    },
    'biaxial-stepper': {
        name: 'Biaxial Stepper',
        element: 'wokwi-biaxial-stepper',
        description: 'Biaxial stepper motor',
        category: 'motors'
    },
    // ==========================================
    // ADDITIONAL SENSORS
    // ==========================================
    'hx711': {
        name: 'HX711 Load Cell',
        element: 'wokwi-hx711',
        description: 'Load cell amplifier',
        category: 'input'
    },
    'ds18b20': {
        name: 'DS18B20',
        element: 'wokwi-ds18b20',
        description: 'Digital temperature sensor (1-Wire)',
        category: 'input'
    },
    'ntc-temperature-sensor': {
        name: 'NTC Thermistor',
        element: 'wokwi-ntc-temperature-sensor',
        description: 'Analog temperature sensor',
        category: 'input'
    },
    // ==========================================
    // ADDITIONAL DISPLAYS
    // ==========================================
    'max7219-matrix': {
        name: 'MAX7219 Matrix',
        element: 'wokwi-max7219-matrix',
        description: '8x8 LED dot matrix display',
        category: 'displays'
    },
    'tm1637-7segment': {
        name: 'TM1637 Display',
        element: 'wokwi-tm1637-7segment',
        description: '4-digit 7-segment display with driver',
        category: 'displays'
    },
    // ==========================================
    // OUTPUT DEVICES
    // ==========================================
    'relay-module': {
        name: 'Relay Module',
        element: 'wokwi-relay-module',
        description: 'Single channel relay module',
        category: 'output'
    },
    'nlsf595': {
        name: 'NLSF595 LED Driver',
        element: 'wokwi-nlsf595',
        description: 'LED driver with shift register',
        category: 'leds'
    },
    // ==========================================
    // ADDITIONAL MICROCONTROLLERS
    // ==========================================
    'attiny85': {
        name: 'ATtiny85',
        element: 'wokwi-attiny85',
        description: 'Small 8-pin microcontroller',
        category: 'mcu'
    },
    'pi-pico': {
        name: 'Raspberry Pi Pico',
        element: 'wokwi-pi-pico',
        description: 'RP2040-based microcontroller',
        category: 'mcu'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/audio.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAudioSimulation",
    ()=>getAudioSimulation,
    "pwmToFrequency",
    ()=>pwmToFrequency
]);
'use client';
/**
 * Audio simulation utilities for FUNDI Workbench
 * Uses Web Audio API to generate tones for buzzer/speaker simulation
 */ class AudioSimulation {
    audioContext = null;
    oscillators = new Map();
    gainNodes = new Map();
    masterGain = null;
    muted = false;
    volume = 0.3;
    /**
     * Initialize the audio context (must be called after user interaction)
     */ initialize() {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            console.log('[AudioSimulation] Initialized');
        } catch (e) {
            console.warn('[AudioSimulation] Web Audio API not supported:', e);
        }
    }
    /**
     * Resume audio context if suspended (required by browser autoplay policies)
     */ async resume() {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    /**
     * Play a tone at a specific frequency
     * @param id Unique identifier for this tone source
     * @param frequency Frequency in Hz (e.g., 440 for A4)
     * @param waveform Oscillator waveform type
     */ playTone(id, frequency, waveform = 'square') {
        if (!this.audioContext || !this.masterGain || this.muted) return;
        // Stop existing tone with this ID
        this.stopTone(id);
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            // Soft start to avoid clicks
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            oscillator.start();
            this.oscillators.set(id, oscillator);
            this.gainNodes.set(id, gainNode);
            console.log(`[AudioSimulation] Playing tone: ${frequency}Hz on ${id}`);
        } catch (e) {
            console.warn('[AudioSimulation] Failed to play tone:', e);
        }
    }
    /**
     * Stop a specific tone
     * @param id Unique identifier for the tone to stop
     */ stopTone(id) {
        const oscillator = this.oscillators.get(id);
        const gainNode = this.gainNodes.get(id);
        if (oscillator && gainNode && this.audioContext) {
            try {
                // Soft stop to avoid clicks
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.01);
                setTimeout(()=>{
                    try {
                        oscillator.stop();
                        oscillator.disconnect();
                        gainNode.disconnect();
                    } catch  {
                    // Already stopped
                    }
                }, 20);
            } catch  {
            // Already stopped
            }
        }
        this.oscillators.delete(id);
        this.gainNodes.delete(id);
    }
    /**
     * Stop all playing tones
     */ stopAll() {
        for (const id of this.oscillators.keys()){
            this.stopTone(id);
        }
    }
    /**
     * Set master volume
     * @param volume Volume level (0-1)
     */ setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }
    /**
     * Get current volume
     */ getVolume() {
        return this.volume;
    }
    /**
     * Mute/unmute all audio
     */ setMuted(muted) {
        this.muted = muted;
        if (muted) {
            this.stopAll();
        }
    }
    /**
     * Check if audio is muted
     */ isMuted() {
        return this.muted;
    }
    /**
     * Play a beep (short tone)
     * @param frequency Frequency in Hz
     * @param duration Duration in milliseconds
     */ beep(frequency = 1000, duration = 100) {
        const id = `beep-${Date.now()}`;
        this.playTone(id, frequency);
        setTimeout(()=>this.stopTone(id), duration);
    }
    /**
     * Clean up resources
     */ dispose() {
        this.stopAll();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.masterGain = null;
        }
    }
}
// Singleton instance
let audioSimulationInstance = null;
function getAudioSimulation() {
    if (!audioSimulationInstance) {
        audioSimulationInstance = new AudioSimulation();
    }
    return audioSimulationInstance;
}
function pwmToFrequency(pwm, minFreq = 100, maxFreq = 4000) {
    // PWM 0-255 maps to frequency range
    const normalized = pwm / 255;
    return minFreq + normalized * (maxFreq - minFreq);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/i2c.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getI2CBus",
    ()=>getI2CBus
]);
'use client';
/**
 * I2C Bus Manager - manages I2C peripherals and transactions
 */ class I2CBus {
    devices = new Map();
    currentAddress = null;
    currentBuffer = [];
    transactionLog = [];
    isReading = false;
    listeners = new Set();
    /**
     * Register an I2C device at a specific address
     */ registerDevice(device) {
        if (this.devices.has(device.address)) {
            console.warn(`[I2C] Overwriting device at address 0x${device.address.toString(16)}`);
        }
        this.devices.set(device.address, device);
        console.log(`[I2C] Registered device '${device.name}' at 0x${device.address.toString(16)}`);
    }
    /**
     * Unregister a device
     */ unregisterDevice(address) {
        this.devices.delete(address);
    }
    /**
     * Get a registered device by address
     */ getDevice(address) {
        return this.devices.get(address);
    }
    /**
     * Get all registered devices
     */ getAllDevices() {
        return Array.from(this.devices.values());
    }
    /**
     * Start condition - begin a new transaction
     */ start() {
        const tx = {
            type: 'start',
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);
        this.currentBuffer = [];
        this.currentAddress = null;
        this.isReading = false;
    }
    /**
     * Stop condition - end current transaction
     */ stop() {
        // If we were writing, flush buffer to device
        if (this.currentAddress !== null && !this.isReading && this.currentBuffer.length > 0) {
            const device = this.devices.get(this.currentAddress);
            if (device?.write) {
                device.write([
                    ...this.currentBuffer
                ]);
            }
        }
        const tx = {
            type: 'stop',
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);
        this.currentAddress = null;
        this.currentBuffer = [];
        this.isReading = false;
    }
    /**
     * Write a byte to the bus (address or data)
     * Returns true for ACK, false for NACK
     */ writeByte(byte) {
        // First byte after start is address + R/W bit
        if (this.currentAddress === null) {
            const address = byte >> 1; // 7-bit address
            this.isReading = (byte & 1) === 1; // R/W bit
            this.currentAddress = address;
            const tx = {
                type: 'write',
                address,
                data: [
                    byte
                ],
                timestamp: Date.now()
            };
            this.transactionLog.push(tx);
            this.notifyListeners(tx);
            // ACK if device exists at this address
            return this.devices.has(address);
        }
        // Subsequent bytes are data
        const device = this.devices.get(this.currentAddress);
        // For devices that need streaming writes (like LCD1602), forward byte immediately
        if (device?.streamingWrite && device.write && !this.isReading) {
            device.write([
                byte
            ]);
        } else {
            // Otherwise buffer for batch write on STOP
            this.currentBuffer.push(byte);
        }
        const tx = {
            type: 'write',
            address: this.currentAddress,
            data: [
                byte
            ],
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);
        // ACK data
        return true;
    }
    /**
     * Read a byte from the bus
     */ readByte(ack = true) {
        if (this.currentAddress === null) {
            return 0xFF; // No device addressed
        }
        const device = this.devices.get(this.currentAddress);
        if (!device?.read) {
            return 0xFF; // Device doesn't support reading
        }
        // Get data from device
        const data = device.read();
        const byte = data.length > 0 ? data[0] : 0xFF;
        const tx = {
            type: 'read',
            address: this.currentAddress,
            data: [
                byte
            ],
            timestamp: Date.now()
        };
        this.transactionLog.push(tx);
        this.notifyListeners(tx);
        return byte;
    }
    /**
     * Get transaction log (for debugging/logic analyzer)
     */ getTransactionLog(limit = 100) {
        return this.transactionLog.slice(-limit);
    }
    /**
     * Clear transaction log
     */ clearLog() {
        this.transactionLog = [];
    }
    /**
     * Reset all devices
     */ resetAll() {
        for (const device of this.devices.values()){
            device.reset?.();
        }
        this.currentAddress = null;
        this.currentBuffer = [];
        this.isReading = false;
    }
    /**
     * Subscribe to transactions
     */ subscribe(listener) {
        this.listeners.add(listener);
        return ()=>this.listeners.delete(listener);
    }
    notifyListeners(tx) {
        for (const listener of this.listeners){
            listener(tx);
        }
    }
}
// Singleton I2C bus instance
let i2cBusInstance = null;
function getI2CBus() {
    if (!i2cBusInstance) {
        i2cBusInstance = new I2CBus();
    }
    return i2cBusInstance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/lcd1602.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLCD1602",
    ()=>getLCD1602
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/i2c.ts [app-client] (ecmascript)");
'use client';
;
/**
 * LCD 1602 HD44780 Emulator (I2C mode via PCF8574 backpack)
 * 
 * Emulates a 16x2 character LCD with I2C interface.
 * Common I2C addresses: 0x27 (PCF8574) or 0x3F (PCF8574A)
 */ // LCD command definitions
const LCD_CLEARDISPLAY = 0x01;
const LCD_RETURNHOME = 0x02;
const LCD_ENTRYMODESET = 0x04;
const LCD_DISPLAYCONTROL = 0x08;
const LCD_CURSORSHIFT = 0x10;
const LCD_FUNCTIONSET = 0x20;
const LCD_SETCGRAMADDR = 0x40;
const LCD_SETDDRAMADDR = 0x80;
// Display control flags
const LCD_DISPLAYON = 0x04;
const LCD_CURSORON = 0x02;
const LCD_BLINKON = 0x01;
// PCF8574 bit mapping to LCD pins (typical wiring)
const PCF8574_RS = 0x01; // Register Select
const PCF8574_RW = 0x02; // Read/Write (usually tied low)
const PCF8574_EN = 0x04; // Enable
const PCF8574_BL = 0x08; // Backlight
/**
 * LCD 1602 I2C Device Implementation
 */ class LCD1602Device {
    address;
    name = 'LCD1602';
    /** Enable streaming writes so each I2C byte is processed immediately */ streamingWrite = true;
    // Internal state
    rows = 2;
    cols = 16;
    ddram = [];
    cursorRow = 0;
    cursorCol = 0;
    displayOn = false;
    cursorOn = false;
    blinkOn = false;
    backlightOn = true;
    cgram = [];
    cgramAddr = 0;
    writingCgram = false;
    // I2C/nibble mode handling
    lastByte = 0;
    nibbleBuffer = null;
    regSelect = false;
    // State listeners
    listeners = new Set();
    constructor(address = 0x27){
        this.address = address;
        this.reset();
    }
    reset() {
        // Initialize DDRAM with spaces
        this.ddram = [];
        for(let r = 0; r < this.rows; r++){
            this.ddram.push(new Array(this.cols).fill(0x20)); // Space character
        }
        // Initialize CGRAM (8 custom chars, 8 bytes each)
        this.cgram = [];
        for(let i = 0; i < 8; i++){
            this.cgram.push(new Array(8).fill(0));
        }
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.displayOn = false;
        this.cursorOn = false;
        this.blinkOn = false;
        this.backlightOn = true;
        this.nibbleBuffer = null;
        this.writingCgram = false;
        this.cgramAddr = 0;
        this.notifyListeners();
    }
    write(data) {
        for (const byte of data){
            this.processByte(byte);
        }
    }
    read() {
        // LCD busy flag and address counter (not typically used in write-only implementations)
        return [
            0x00
        ];
    }
    processByte(byte) {
        // Extract control signals from PCF8574 byte
        const rs = (byte & PCF8574_RS) !== 0;
        const en = (byte & PCF8574_EN) !== 0;
        const bl = (byte & PCF8574_BL) !== 0;
        const nibble = byte >> 4 & 0x0F;
        // Update backlight
        if (this.backlightOn !== bl) {
            this.backlightOn = bl;
        }
        // Only process on falling edge of Enable (EN low after being high)
        if (this.lastByte & PCF8574_EN && !en) {
            if (this.nibbleBuffer === null) {
                // First nibble (high nibble)
                this.nibbleBuffer = nibble << 4;
                this.regSelect = rs;
            } else {
                // Second nibble (low nibble) - complete the byte
                const fullByte = this.nibbleBuffer | nibble;
                this.nibbleBuffer = null;
                if (this.regSelect) {
                    this.writeData(fullByte);
                } else {
                    this.writeCommand(fullByte);
                }
            }
        }
        this.lastByte = byte;
    }
    writeCommand(cmd) {
        if (cmd & LCD_SETDDRAMADDR) {
            // Set DDRAM address (cursor position)
            this.writingCgram = false;
            const addr = cmd & 0x7F;
            if (addr >= 0x40) {
                this.cursorRow = 1;
                this.cursorCol = Math.min(addr - 0x40, this.cols - 1);
            } else {
                this.cursorRow = 0;
                this.cursorCol = Math.min(addr, this.cols - 1);
            }
        } else if (cmd & LCD_SETCGRAMADDR) {
            // Set CGRAM address (custom character)
            this.writingCgram = true;
            this.cgramAddr = cmd & 0x3F;
        } else if (cmd & LCD_DISPLAYCONTROL) {
            // Display control
            this.displayOn = (cmd & LCD_DISPLAYON) !== 0;
            this.cursorOn = (cmd & LCD_CURSORON) !== 0;
            this.blinkOn = (cmd & LCD_BLINKON) !== 0;
        } else if (cmd === LCD_CLEARDISPLAY) {
            // Clear display
            for(let r = 0; r < this.rows; r++){
                for(let c = 0; c < this.cols; c++){
                    this.ddram[r][c] = 0x20; // Space
                }
            }
            this.cursorRow = 0;
            this.cursorCol = 0;
        } else if (cmd === LCD_RETURNHOME) {
            // Return home
            this.cursorRow = 0;
            this.cursorCol = 0;
        }
        // Other commands (entry mode, function set, etc.) we mostly ignore for display purposes
        this.notifyListeners();
    }
    writeData(data) {
        if (this.writingCgram) {
            // Writing to CGRAM
            const charIndex = Math.floor(this.cgramAddr / 8);
            const lineIndex = this.cgramAddr % 8;
            if (charIndex < 8 && lineIndex < 8) {
                this.cgram[charIndex][lineIndex] = data & 0x1F; // 5 bits per line
            }
            this.cgramAddr = this.cgramAddr + 1 & 0x3F;
        } else {
            // Writing to DDRAM (display)
            if (this.cursorRow < this.rows && this.cursorCol < this.cols) {
                this.ddram[this.cursorRow][this.cursorCol] = data;
                this.cursorCol++;
                if (this.cursorCol >= this.cols) {
                    // Wrap to next line or stay at end
                    if (this.cursorRow < this.rows - 1) {
                        this.cursorRow++;
                        this.cursorCol = 0;
                    } else {
                        this.cursorCol = this.cols - 1;
                    }
                }
            }
        }
        this.notifyListeners();
    }
    /**
     * Get current display state
     */ getState() {
        // Convert character codes to strings
        const display = this.ddram.map((row)=>row.map((code)=>{
                if (code < 8) {
                    // Custom character - return placeholder
                    return String.fromCharCode(0x2588); // Block character
                } else if (code >= 0x20 && code <= 0x7E) {
                    // Standard ASCII
                    return String.fromCharCode(code);
                } else {
                    // Non-printable or extended
                    return '?';
                }
            }));
        return {
            display,
            cursorRow: this.cursorRow,
            cursorCol: this.cursorCol,
            displayOn: this.displayOn,
            cursorOn: this.cursorOn,
            blinkOn: this.blinkOn,
            backlightOn: this.backlightOn,
            cgram: this.cgram.map((char)=>[
                    ...char
                ])
        };
    }
    /**
     * Subscribe to state changes
     */ subscribe(listener) {
        this.listeners.add(listener);
        // Immediately notify with current state
        listener(this.getState());
        return ()=>this.listeners.delete(listener);
    }
    notifyListeners() {
        const state = this.getState();
        for (const listener of this.listeners){
            listener(state);
        }
    }
}
// LCD device instance cache
const lcdDevices = new Map();
function getLCD1602(address = 0x27) {
    let device = lcdDevices.get(address);
    if (!device) {
        device = new LCD1602Device(address);
        lcdDevices.set(address, device);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().registerDevice(device);
    }
    return device;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/ssd1306.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSSD1306",
    ()=>getSSD1306
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/i2c.ts [app-client] (ecmascript)");
'use client';
;
/**
 * SSD1306 OLED Display Emulator (128x64 or 128x32)
 * 
 * Emulates an SSD1306 OLED display over I2C.
 * Common I2C address: 0x3C or 0x3D
 */ // SSD1306 Commands
const SSD1306_DISPLAYOFF = 0xAE;
const SSD1306_DISPLAYON = 0xAF;
const SSD1306_SETCONTRAST = 0x81;
const SSD1306_DISPLAYALLON_RESUME = 0xA4;
const SSD1306_DISPLAYALLON = 0xA5;
const SSD1306_NORMALDISPLAY = 0xA6;
const SSD1306_INVERTDISPLAY = 0xA7;
const SSD1306_SETMULTIPLEX = 0xA8;
const SSD1306_SETLOWCOLUMN = 0x00;
const SSD1306_SETHIGHCOLUMN = 0x10;
const SSD1306_MEMORYMODE = 0x20;
const SSD1306_COLUMNADDR = 0x21;
const SSD1306_PAGEADDR = 0x22;
const SSD1306_SETSTARTLINE = 0x40;
const SSD1306_SETDISPLAYOFFSET = 0xD3;
const SSD1306_SETCOMPINS = 0xDA;
const SSD1306_SETVCOMDETECT = 0xDB;
const SSD1306_SETDISPLAYCLOCKDIV = 0xD5;
const SSD1306_SETPRECHARGE = 0xD9;
const SSD1306_SEGREMAP = 0xA0;
const SSD1306_COMSCANINC = 0xC0;
const SSD1306_COMSCANDEC = 0xC8;
const SSD1306_CHARGEPUMP = 0x8D;
const SSD1306_DEACTIVATE_SCROLL = 0x2E;
// Data/Command control byte
const CONTROL_COMMAND = 0x00;
const CONTROL_DATA = 0x40;
const CONTROL_CONTINUE = 0x80;
/**
 * SSD1306 OLED I2C Device Implementation
 */ class SSD1306Device {
    address;
    name = 'SSD1306';
    width;
    height;
    // Display RAM - organized as pages (8 vertical pixels per page)
    gddram = [];
    displayOn = false;
    inverted = false;
    contrast = 0x7F;
    // Column/Page addressing
    colStart = 0;
    colEnd = 127;
    pageStart = 0;
    pageEnd = 7;
    currentCol = 0;
    currentPage = 0;
    memoryMode = 0;
    // Command parsing state
    pendingCommand = null;
    pendingArgs = [];
    expectedArgs = 0;
    controlByte = 0;
    // State listeners
    listeners = new Set();
    updateTimer = null;
    constructor(address = 0x3C, width = 128, height = 64){
        this.address = address;
        this.width = width;
        this.height = height;
        this.reset();
    }
    reset() {
        const pages = this.height / 8;
        this.gddram = [];
        for(let p = 0; p < pages; p++){
            this.gddram.push(new Array(this.width).fill(0));
        }
        this.displayOn = false;
        this.inverted = false;
        this.contrast = 0x7F;
        this.colStart = 0;
        this.colEnd = this.width - 1;
        this.pageStart = 0;
        this.pageEnd = pages - 1;
        this.currentCol = 0;
        this.currentPage = 0;
        this.memoryMode = 0;
        this.pendingCommand = null;
        this.pendingArgs = [];
        this.expectedArgs = 0;
        this.scheduleUpdate();
    }
    write(data) {
        if (data.length === 0) return;
        let i = 0;
        while(i < data.length){
            // First byte is control byte
            const control = data[i++];
            this.controlByte = control;
            // Is this a data stream or command stream?
            const isData = (control & CONTROL_DATA) !== 0;
            const isContinue = (control & CONTROL_CONTINUE) !== 0;
            if (isData) {
                // All remaining bytes in this chunk are data
                while(i < data.length && (data[i] & CONTROL_CONTINUE) === 0){
                    this.writeDataByte(data[i++]);
                }
            } else {
                // Command byte follows
                if (i < data.length) {
                    this.processCommand(data[i++]);
                }
            }
        }
        this.scheduleUpdate();
    }
    read() {
        // SSD1306 read returns status byte
        return [
            this.displayOn ? 0x00 : 0x40
        ];
    }
    processCommand(cmd) {
        // If we're expecting command arguments
        if (this.expectedArgs > 0) {
            this.pendingArgs.push(cmd);
            this.expectedArgs--;
            if (this.expectedArgs === 0) {
                this.executeCommand(this.pendingCommand, this.pendingArgs);
                this.pendingCommand = null;
                this.pendingArgs = [];
            }
            return;
        }
        // Parse command
        if (cmd === SSD1306_DISPLAYOFF) {
            this.displayOn = false;
        } else if (cmd === SSD1306_DISPLAYON) {
            this.displayOn = true;
        } else if (cmd === SSD1306_NORMALDISPLAY) {
            this.inverted = false;
        } else if (cmd === SSD1306_INVERTDISPLAY) {
            this.inverted = true;
        } else if (cmd === SSD1306_DEACTIVATE_SCROLL) {
        // Scrolling not implemented
        } else if ((cmd & 0xF0) === SSD1306_SETLOWCOLUMN) {
            this.currentCol = this.currentCol & 0xF0 | cmd & 0x0F;
        } else if ((cmd & 0xF0) === SSD1306_SETHIGHCOLUMN) {
            this.currentCol = this.currentCol & 0x0F | (cmd & 0x0F) << 4;
        } else if ((cmd & 0xF8) === 0xB0) {
            // Set page start address for page addressing mode
            this.currentPage = cmd & 0x07;
        } else if ((cmd & 0xC0) === SSD1306_SETSTARTLINE) {
        // Set display start line - ignored for simple emulation
        } else if (cmd === SSD1306_SETCONTRAST) {
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        } else if (cmd === SSD1306_MEMORYMODE) {
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        } else if (cmd === SSD1306_COLUMNADDR) {
            this.pendingCommand = cmd;
            this.expectedArgs = 2;
        } else if (cmd === SSD1306_PAGEADDR) {
            this.pendingCommand = cmd;
            this.expectedArgs = 2;
        } else if (cmd === SSD1306_SETMULTIPLEX || cmd === SSD1306_SETDISPLAYOFFSET || cmd === SSD1306_SETCOMPINS || cmd === SSD1306_SETVCOMDETECT || cmd === SSD1306_SETDISPLAYCLOCKDIV || cmd === SSD1306_SETPRECHARGE || cmd === SSD1306_CHARGEPUMP) {
            // Commands with 1 arg
            this.pendingCommand = cmd;
            this.expectedArgs = 1;
        }
    // SEGREMAP, COMSCANINC, COMSCANDEC are single-byte commands - ignored
    }
    executeCommand(cmd, args) {
        if (cmd === SSD1306_SETCONTRAST) {
            this.contrast = args[0];
        } else if (cmd === SSD1306_MEMORYMODE) {
            this.memoryMode = args[0] & 0x03;
        } else if (cmd === SSD1306_COLUMNADDR) {
            this.colStart = args[0];
            this.colEnd = args[1];
            this.currentCol = this.colStart;
        } else if (cmd === SSD1306_PAGEADDR) {
            this.pageStart = args[0];
            this.pageEnd = args[1];
            this.currentPage = this.pageStart;
        }
    // Other commands are configuration - mostly ignored
    }
    writeDataByte(data) {
        // Write a byte to GDDRAM at current position
        if (this.currentPage < this.gddram.length && this.currentCol < this.width) {
            this.gddram[this.currentPage][this.currentCol] = data;
        }
        // Advance position based on memory mode
        if (this.memoryMode === 0) {
            // Horizontal addressing mode
            this.currentCol++;
            if (this.currentCol > this.colEnd) {
                this.currentCol = this.colStart;
                this.currentPage++;
                if (this.currentPage > this.pageEnd) {
                    this.currentPage = this.pageStart;
                }
            }
        } else if (this.memoryMode === 1) {
            // Vertical addressing mode
            this.currentPage++;
            if (this.currentPage > this.pageEnd) {
                this.currentPage = this.pageStart;
                this.currentCol++;
                if (this.currentCol > this.colEnd) {
                    this.currentCol = this.colStart;
                }
            }
        } else {
            // Page addressing mode
            this.currentCol++;
            if (this.currentCol >= this.width) {
                this.currentCol = 0;
            }
        }
    }
    /**
     * Get current display state as pixel array
     */ getState() {
        // Convert page-based GDDRAM to pixel array
        const pixels = [];
        for(let y = 0; y < this.height; y++){
            const row = [];
            const page = Math.floor(y / 8);
            const bit = y % 8;
            for(let x = 0; x < this.width; x++){
                const pixelOn = (this.gddram[page][x] & 1 << bit) !== 0;
                row.push(this.inverted ? !pixelOn : pixelOn);
            }
            pixels.push(row);
        }
        return {
            pixels,
            width: this.width,
            height: this.height,
            displayOn: this.displayOn,
            inverted: this.inverted,
            contrast: this.contrast
        };
    }
    /**
     * Subscribe to state changes
     */ subscribe(listener) {
        this.listeners.add(listener);
        listener(this.getState());
        return ()=>this.listeners.delete(listener);
    }
    scheduleUpdate() {
        // Debounce updates to avoid excessive renders
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        this.updateTimer = setTimeout(()=>{
            this.notifyListeners();
            this.updateTimer = null;
        }, 16); // ~60fps max
    }
    notifyListeners() {
        const state = this.getState();
        for (const listener of this.listeners){
            listener(state);
        }
    }
}
// Device instance cache
const oledDevices = new Map();
function getSSD1306(address = 0x3C, width = 128, height = 64) {
    let device = oledDevices.get(address);
    if (!device) {
        device = new SSD1306Device(address, width, height);
        oledDevices.set(address, device);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().registerDevice(device);
    }
    return device;
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wokwiParts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/audio.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$lcd1602$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/lcd1602.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$ssd1306$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/ssd1306.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function getPartTypeFromData(data) {
    const maybe = data?.partType;
    return typeof maybe === 'string' ? maybe : null;
}
function parseI2CAddress(attr, fallback) {
    if (typeof attr === 'number' && Number.isFinite(attr)) return attr;
    if (typeof attr !== 'string') return fallback;
    const t = attr.trim();
    const parsed = t.startsWith('0x') ? Number.parseInt(t.slice(2), 16) : Number.parseInt(t, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}
/**
 * Generic Wokwi Part Node - renders any Wokwi element with pin overlays
 */ function WokwiPartNode({ id: nodeId = 'preview', data, partType: propPartType }) {
    _s();
    const onPinClick = data?.onPinClick;
    const getCanvasRect = data?.getCanvasRect;
    const onDeletePart = data?.onDeletePart;
    const simulationPinStates = data?.simulationPinStates;
    const pwmValue = data?.pwmValue;
    const partType = propPartType ?? getPartTypeFromData(data) ?? 'arduino-uno';
    const [hoveredPin, setHoveredPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pins, setPins] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [svgDimensions, setSvgDimensions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: 100,
        height: 100
    });
    const [isSelected, setIsSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const elementRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const partConfig = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][partType];
    const partElementTag = partConfig?.element;
    const PartElement = partElementTag ?? null;
    const isUnknownPart = !partConfig || !partElementTag || !PartElement;
    const applyStaticAttrs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WokwiPartNode.useCallback[applyStaticAttrs]": ()=>{
            const element = elementRef.current;
            if (!element) return;
            const attrs = data?.attrs;
            if (!attrs) return;
            for (const [key, value] of Object.entries(attrs)){
                // Avoid clobbering simulation-driven runtime properties.
                if ((partType === 'led' || partType === 'wokwi-led') && (key === 'value' || key === 'brightness')) {
                    continue;
                }
                try {
                    element.setAttribute(key, String(value));
                } catch  {
                // Ignore invalid attributes
                }
            }
            const maybeLit = element;
            if (typeof maybeLit.requestUpdate === 'function') {
                maybeLit.requestUpdate();
            }
        }
    }["WokwiPartNode.useCallback[applyStaticAttrs]"], [
        data?.attrs,
        partType
    ]);
    // Handle click to select/deselect component
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WokwiPartNode.useCallback[handleClick]": (e)=>{
            // Don't select if clicking on a pin
            const target = e.target;
            if (target.hasAttribute('data-fundi-pin')) return;
            e.stopPropagation();
            if (nodeId === 'preview') return;
            setIsSelected({
                "WokwiPartNode.useCallback[handleClick]": (prev)=>!prev
            }["WokwiPartNode.useCallback[handleClick]"]);
        }
    }["WokwiPartNode.useCallback[handleClick]"], [
        nodeId
    ]);
    // Handle delete button click
    const handleDelete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WokwiPartNode.useCallback[handleDelete]": (e)=>{
            e.stopPropagation();
            if (!onDeletePart || nodeId === 'preview') return;
            onDeletePart(nodeId);
        }
    }["WokwiPartNode.useCallback[handleDelete]"], [
        onDeletePart,
        nodeId
    ]);
    // Click outside to deselect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            if (!isSelected) return;
            const handleClickOutside = {
                "WokwiPartNode.useEffect.handleClickOutside": (e)=>{
                    if (containerRef.current && !containerRef.current.contains(e.target)) {
                        setIsSelected(false);
                    }
                }
            }["WokwiPartNode.useEffect.handleClickOutside"];
            // Delay adding listener to avoid immediate deselection
            const timer = setTimeout({
                "WokwiPartNode.useEffect.timer": ()=>{
                    document.addEventListener('click', handleClickOutside);
                }
            }["WokwiPartNode.useEffect.timer"], 0);
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    clearTimeout(timer);
                    document.removeEventListener('click', handleClickOutside);
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        isSelected
    ]);
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
                    if (!partElementTag) return;
                    await customElements.whenDefined(partElementTag);
                    const element = containerRef.current?.querySelector(partElementTag);
                    if (!element) return;
                    elementRef.current = element;
                    applyStaticAttrs();
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
        applyStaticAttrs,
        calculatePins,
        partElementTag
    ]);
    // Apply static Wokwi element attributes from circuit state (colors, values, labels, etc.)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            applyStaticAttrs();
        }
    }["WokwiPartNode.useEffect"], [
        applyStaticAttrs
    ]);
    // Update element properties based on simulation pin states and PWM values
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) return;
            // Debug log when simulation states or PWM values are received
            const hasSimStates = simulationPinStates && Object.keys(simulationPinStates).length > 0;
            const hasPwm = typeof pwmValue === 'number' && pwmValue > 0;
            if (hasSimStates || hasPwm) {
                console.log('[WokwiPartNode] Applying states:', {
                    partType,
                    nodeId,
                    simulationPinStates,
                    pwmValue
                });
            }
            // For LED elements: if anode (A) is HIGH and cathode (C) is LOW or ground, turn ON
            // LED element has a 'value' property (boolean) to control on/off state
            // For PWM: use 'brightness' property (0-1) with gamma correction
            // Wokwi LED: value=boolean (on/off), brightness=0-1 (intensity)
            if (partType === 'led' || partType === 'wokwi-led') {
                const anodeState = simulationPinStates?.['A'];
                const ledEl = element;
                // Apply gamma correction for realistic LED brightness
                // Wokwi uses gamma=2.8 by default
                const GAMMA = 2.8;
                console.log('[LED] Processing LED update:', {
                    nodeId,
                    pwmValue,
                    anodeState,
                    currentValue: ledEl.value,
                    currentBrightness: ledEl.brightness
                });
                // Check for PWM value first (from componentPwmStates), then fall back to pin state
                if (typeof pwmValue === 'number' && pwmValue > 0) {
                    // PWM mode from componentPwmStates
                    const normalized = pwmValue / 255;
                    const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                    console.log('[LED] Setting PWM brightness:', pwmValue, '-> normalized:', normalized.toFixed(3), '-> gamma:', gammaCorrected.toFixed(3));
                    ledEl.value = true;
                    ledEl.brightness = gammaCorrected; // Use native Wokwi brightness property
                } else if (typeof anodeState === 'number') {
                    // PWM mode: anodeState is 0-255
                    const normalized = anodeState / 255;
                    const gammaCorrected = Math.pow(normalized, 1 / GAMMA);
                    console.log('[LED] PWM brightness from pin:', anodeState, '-> gamma:', gammaCorrected.toFixed(2));
                    ledEl.value = anodeState > 0;
                    ledEl.brightness = gammaCorrected; // Use native Wokwi brightness property
                } else {
                    // Boolean mode: simple on/off
                    const anodeHigh = anodeState === true;
                    console.log('[LED] Setting value:', anodeHigh, 'current:', ledEl.value);
                    ledEl.value = anodeHigh;
                    ledEl.brightness = anodeHigh ? 1.0 : 0; // Full brightness when on
                }
                // Force Lit element to re-render
                if (typeof ledEl.requestUpdate === 'function') {
                    ledEl.requestUpdate();
                }
            }
            // For RGB LED elements
            if (partType === 'rgb-led' || partType === 'wokwi-rgb-led') {
                // RGB LED has pins: R.A, R.C, G.A, G.C, B.A, B.C (common anode/cathode)
                // For common cathode: individual anodes HIGH = that color on
                // Supports both boolean and PWM values
                const GAMMA = 2.8;
                const element_rgb = element;
                // Handle each color channel
                for (const [pin, prop] of [
                    [
                        'R.A',
                        'redValue'
                    ],
                    [
                        'G.A',
                        'greenValue'
                    ],
                    [
                        'B.A',
                        'blueValue'
                    ]
                ]){
                    const state = simulationPinStates?.[pin];
                    if (state !== undefined) {
                        if (typeof state === 'number') {
                            // PWM mode
                            const normalized = state / 255;
                            element_rgb[prop] = normalized > 0.5;
                        } else {
                            // Boolean mode
                            element_rgb[prop] = state;
                        }
                    }
                }
                if (typeof element_rgb.requestUpdate === 'function') {
                    element_rgb.requestUpdate();
                }
            }
            // For 7-segment display elements
            if (partType === '7segment' || partType === 'wokwi-7segment') {
                const segmentEl = element;
                // Map pin states to segments (a-g and dp)
                const segmentPins = [
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                    'f',
                    'g',
                    'dp'
                ];
                for (const seg of segmentPins){
                    const pinState = simulationPinStates?.[seg.toUpperCase()] ?? simulationPinStates?.[seg];
                    if (pinState !== undefined) {
                        segmentEl[seg] = typeof pinState === 'boolean' ? pinState : pinState > 0;
                    }
                }
                if (typeof segmentEl.requestUpdate === 'function') {
                    segmentEl.requestUpdate();
                }
            }
            // For servo elements - convert PWM value to angle (0-180°)
            if (partType === 'servo' || partType === 'wokwi-servo') {
                const pwmValue = simulationPinStates?.['PWM'];
                const servoEl = element;
                if (typeof pwmValue === 'number') {
                    // PWM value (0-255) maps to servo angle (0-180°)
                    // In real servos, pulse width 1000-2000µs = 0-180°
                    // For simulation, we use direct mapping from PWM duty cycle
                    const angle = pwmValue / 255 * 180;
                    console.log('[Servo] PWM value:', pwmValue, '-> angle:', angle.toFixed(1));
                    servoEl.angle = angle;
                } else if (pwmValue === true) {
                    // Digital HIGH might mean 90° (center position)
                    servoEl.angle = 90;
                }
                if (typeof servoEl.requestUpdate === 'function') {
                    servoEl.requestUpdate();
                }
            }
            // For buzzer elements - both visual and audio feedback
            if (partType === 'buzzer' || partType === 'wokwi-buzzer') {
                const signalState = simulationPinStates?.['1'];
                const buzzerEl = element;
                const audioSimulation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAudioSimulation"])();
                const buzzerId = `buzzer-${nodeId}`;
                if (typeof signalState === 'boolean') {
                    buzzerEl.hasSignal = signalState;
                    // Play/stop audio based on boolean state
                    if (signalState) {
                        audioSimulation.initialize();
                        audioSimulation.resume().then({
                            "WokwiPartNode.useEffect": ()=>{
                                audioSimulation.playTone(buzzerId, 1000, 'square'); // 1kHz square wave
                            }
                        }["WokwiPartNode.useEffect"]);
                    } else {
                        audioSimulation.stopTone(buzzerId);
                    }
                } else if (typeof signalState === 'number') {
                    // PWM on buzzer - indicates tone is playing with variable frequency
                    const isActive = signalState > 0;
                    buzzerEl.hasSignal = isActive;
                    if (isActive) {
                        audioSimulation.initialize();
                        audioSimulation.resume().then({
                            "WokwiPartNode.useEffect": ()=>{
                                // Map PWM value to frequency (100Hz - 4000Hz range)
                                const frequency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pwmToFrequency"])(signalState, 100, 4000);
                                audioSimulation.playTone(buzzerId, frequency, 'square');
                            }
                        }["WokwiPartNode.useEffect"]);
                    } else {
                        audioSimulation.stopTone(buzzerId);
                    }
                } else {
                    // No signal - stop audio
                    audioSimulation.stopTone(buzzerId);
                }
                if (typeof buzzerEl.requestUpdate === 'function') {
                    buzzerEl.requestUpdate();
                }
            }
        }
    }["WokwiPartNode.useEffect"], [
        simulationPinStates,
        pwmValue,
        partType,
        nodeId
    ]);
    // Bind simulated LCD devices to their Wokwi visual elements (text/cursor/backlight).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) return;
            // Match both 'lcd1602' and 'wokwi-lcd1602' variants
            const partTypeLower = partType.toLowerCase();
            if (!partTypeLower.includes('lcd1602') && !partTypeLower.includes('lcd2004')) return;
            const attrs = data?.attrs ?? {};
            const addr = parseI2CAddress(attrs.i2cAddress ?? attrs.address, 0x27);
            const lcdDevice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$lcd1602$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLCD1602"])(addr);
            const lcdEl = element;
            const unsubscribe = lcdDevice.subscribe({
                "WokwiPartNode.useEffect.unsubscribe": (state)=>{
                    try {
                        // Wokwi lcd1602 element supports a simple text setter.
                        const text = state.display.map({
                            "WokwiPartNode.useEffect.unsubscribe.text": (row)=>row.join('')
                        }["WokwiPartNode.useEffect.unsubscribe.text"]).join('\n');
                        lcdEl.text = text;
                        lcdEl.backlight = state.backlightOn;
                        lcdEl.cursor = state.cursorOn;
                        lcdEl.blink = state.blinkOn;
                        lcdEl.cursorX = state.cursorCol;
                        lcdEl.cursorY = state.cursorRow;
                        if (typeof lcdEl.requestUpdate === 'function') {
                            lcdEl.requestUpdate();
                        }
                    } catch  {
                    // Ignore UI binding errors
                    }
                }
            }["WokwiPartNode.useEffect.unsubscribe"]);
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    unsubscribe?.();
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        data?.attrs,
        partType
    ]);
    // Bind simulated SSD1306 OLED displays to their Wokwi visual elements
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) return;
            // Match SSD1306 / OLED variants
            const partTypeLower = partType.toLowerCase();
            if (!partTypeLower.includes('ssd1306') && !partTypeLower.includes('oled')) return;
            const attrs = data?.attrs ?? {};
            const addr = parseI2CAddress(attrs.i2cAddress ?? attrs.address, 0x3c);
            const oledDevice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$ssd1306$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSSD1306"])(addr);
            // SSD1306 Wokwi element expects pixel data
            const unsubscribe = oledDevice.subscribe({
                "WokwiPartNode.useEffect.unsubscribe": (state)=>{
                    try {
                        // The Wokwi ssd1306 element uses a Uint8Array buffer for pixels
                        // Format: each byte represents 8 vertical pixels in a column (page-based)
                        const oledEl = element;
                        // Convert boolean pixel array to page-based format
                        const pages = Math.ceil(state.height / 8);
                        const buffer = new Uint8Array(state.width * pages);
                        for(let page = 0; page < pages; page++){
                            for(let x = 0; x < state.width; x++){
                                let byte = 0;
                                for(let bit = 0; bit < 8; bit++){
                                    const y = page * 8 + bit;
                                    if (y < state.height && state.pixels[y]?.[x]) {
                                        byte |= 1 << bit;
                                    }
                                }
                                buffer[page * state.width + x] = byte;
                            }
                        }
                        oledEl.imageData = buffer;
                        if (typeof oledEl.requestUpdate === 'function') {
                            oledEl.requestUpdate();
                        }
                    } catch  {
                    // Ignore UI binding errors
                    }
                }
            }["WokwiPartNode.useEffect.unsubscribe"]);
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    unsubscribe?.();
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        data?.attrs,
        partType
    ]);
    // Listen for button press/release events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) return;
            const onButtonPress = data?.onButtonPress;
            const onButtonRelease = data?.onButtonRelease;
            if (!onButtonPress || !onButtonRelease) return;
            // Only attach listeners if this is a button component
            if (partType.toLowerCase().includes('pushbutton') || partType.toLowerCase().includes('button')) {
                const handlePress = {
                    "WokwiPartNode.useEffect.handlePress": ()=>{
                        console.log('[WokwiPartNode] Button press detected:', nodeId);
                        onButtonPress(nodeId);
                    }
                }["WokwiPartNode.useEffect.handlePress"];
                const handleRelease = {
                    "WokwiPartNode.useEffect.handleRelease": ()=>{
                        console.log('[WokwiPartNode] Button release detected:', nodeId);
                        onButtonRelease(nodeId);
                    }
                }["WokwiPartNode.useEffect.handleRelease"];
                element.addEventListener('button-press', handlePress);
                element.addEventListener('button-release', handleRelease);
                return ({
                    "WokwiPartNode.useEffect": ()=>{
                        element.removeEventListener('button-press', handlePress);
                        element.removeEventListener('button-release', handleRelease);
                    }
                })["WokwiPartNode.useEffect"];
            }
        }
    }["WokwiPartNode.useEffect"], [
        data,
        nodeId,
        partType
    ]);
    // Handle potentiometer/slider value changes via native Wokwi element events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) {
                console.log('[WokwiPartNode] No element ref for potentiometer check:', nodeId);
                return;
            }
            const onValueChange = data?.onValueChange;
            if (!onValueChange) {
                console.log('[WokwiPartNode] No onValueChange handler for:', nodeId, partType);
                return;
            }
            const isPotentiometer = partType.toLowerCase().includes('potentiometer') || partType.toLowerCase().includes('slide-potentiometer');
            if (!isPotentiometer) {
                return;
            }
            console.log('[WokwiPartNode] Setting up potentiometer listener for:', nodeId, 'element:', element.tagName);
            // Listen for the native 'input' event from Wokwi potentiometer element
            // Wokwi potentiometer default: min=0, max=1023, value=0
            // The element dispatches InputEvent with detail containing the value
            const handleInput = {
                "WokwiPartNode.useEffect.handleInput": (e)=>{
                    const potElement = element;
                    // Wokwi potentiometer defaults: min=0, max=1023
                    const min = potElement.min ?? 0;
                    const max = potElement.max ?? 1023;
                    const rawValue = potElement.value ?? 0;
                    // Clamp value to valid range
                    const clampedValue = Math.max(min, Math.min(max, rawValue));
                    // If the range is already 0-1023 (default), use directly
                    // Otherwise normalize to 0-1023 for Arduino ADC
                    let adcValue;
                    if (min === 0 && max === 1023) {
                        adcValue = Math.round(clampedValue);
                    } else {
                        // Normalize to 0-1, then scale to 0-1023
                        const normalized = (clampedValue - min) / (max - min);
                        adcValue = Math.round(normalized * 1023);
                    }
                    console.log('[WokwiPartNode] Potentiometer input:', {
                        nodeId,
                        rawValue,
                        min,
                        max,
                        adcValue
                    });
                    onValueChange(nodeId, adcValue);
                }
            }["WokwiPartNode.useEffect.handleInput"];
            // Use capture phase to ensure we get the event even if it doesn't bubble
            element.addEventListener('input', handleInput, {
                capture: true
            });
            // Also try listening on the shadow root if present
            const shadowRoot = element.shadowRoot;
            if (shadowRoot) {
                console.log('[WokwiPartNode] Also adding listener to shadow root');
                shadowRoot.addEventListener('input', handleInput, {
                    capture: true
                });
            }
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    element.removeEventListener('input', handleInput, {
                        capture: true
                    });
                    if (shadowRoot) {
                        shadowRoot.removeEventListener('input', handleInput, {
                            capture: true
                        });
                    }
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        data?.onValueChange,
        nodeId,
        partType
    ]);
    // Handle slide switch click-to-toggle
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiPartNode.useEffect": ()=>{
            const element = elementRef.current;
            if (!element) return;
            const onSwitchToggle = data?.onSwitchToggle;
            if (!onSwitchToggle) return;
            const isSwitch = partType.toLowerCase().includes('slide-switch') || partType.toLowerCase().includes('switch') && !partType.toLowerCase().includes('push');
            if (!isSwitch) return;
            const handleClick = {
                "WokwiPartNode.useEffect.handleClick": ()=>{
                    const currentState = data?.switchState ?? false;
                    const newState = !currentState;
                    console.log('[WokwiPartNode] Switch toggle:', nodeId, '-> ', newState);
                    onSwitchToggle(nodeId, newState);
                }
            }["WokwiPartNode.useEffect.handleClick"];
            element.addEventListener('click', handleClick);
            return ({
                "WokwiPartNode.useEffect": ()=>{
                    element.removeEventListener('click', handleClick);
                }
            })["WokwiPartNode.useEffect"];
        }
    }["WokwiPartNode.useEffect"], [
        data,
        nodeId,
        partType
    ]);
    if (isUnknownPart) {
        console.warn(`[WokwiPartNode] Unknown part type: ${partType}`);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative glass-panel border-alchemist rounded-md p-4 text-amber-500 text-sm",
            children: [
                "Unknown component: ",
                partType
            ]
        }, void 0, true, {
            fileName: "[project]/components/nodes/WokwiPartNode.tsx",
            lineNumber: 732,
            columnNumber: 13
        }, this);
    }
    // Determine if this is an interactive component that needs higher z-index
    const isInteractiveComponent = partType.toLowerCase().includes('pushbutton') || partType.toLowerCase().includes('button') || partType.toLowerCase().includes('potentiometer') || partType.toLowerCase().includes('switch') || partType.toLowerCase().includes('keypad') || partType.toLowerCase().includes('encoder');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `relative rounded-md transition-all duration-200 ${isSelected ? 'ring-2 ring-cyan-500/70 ring-offset-2 ring-offset-transparent shadow-lg shadow-cyan-500/20' : 'glass-panel border-alchemist hover:ring-1 hover:ring-amber-500/30'}`,
        style: {
            display: 'inline-block',
            lineHeight: 0,
            // Interactive components get higher z-index to be above wires
            zIndex: isInteractiveComponent ? 10 : undefined,
            position: 'relative'
        },
        onClick: handleClick,
        children: [
            isSelected && nodeId !== 'preview' && onDeletePart && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleDelete,
                className: "absolute -top-3 -right-3 z-50 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-150 hover:scale-110",
                title: "Delete component",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                    lineNumber: 770,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 765,
                columnNumber: 17
            }, this),
            isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -top-6 left-0 right-0 flex justify-center pointer-events-none z-40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "px-2 py-0.5 text-[10px] font-medium bg-cyan-500/90 text-white rounded shadow-sm",
                    children: partConfig?.name || partType
                }, void 0, false, {
                    fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                    lineNumber: 777,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 776,
                columnNumber: 17
            }, this),
            PartElement ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartElement, {
                style: {
                    display: 'block',
                    // Interactive components need pointer-events to receive input
                    pointerEvents: isInteractiveComponent ? 'auto' : undefined
                }
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 785,
                columnNumber: 17
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
                        lineNumber: 815,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 795,
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
                                lineNumber: 868,
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
                                        lineNumber: 883,
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
                                        lineNumber: 893,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                                lineNumber: 882,
                                columnNumber: 33
                            }, this)
                        ]
                    }, pin.id, true, {
                        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                        lineNumber: 866,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/nodes/WokwiPartNode.tsx",
                lineNumber: 849,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/nodes/WokwiPartNode.tsx",
        lineNumber: 748,
        columnNumber: 9
    }, this);
}
_s(WokwiPartNode, "rLkP20zLRnJ090742jlOmOr99qs=");
_c = WokwiPartNode;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(WokwiPartNode, (prevProps, nextProps)=>{
    const prevStates = prevProps.data?.simulationPinStates;
    const nextStates = nextProps.data?.simulationPinStates;
    const prevPwm = prevProps.data?.pwmValue;
    const nextPwm = nextProps.data?.pwmValue;
    // Always re-render if simulationPinStates changed
    if (JSON.stringify(prevStates) !== JSON.stringify(nextStates)) {
        return false; // Should re-render
    }
    // Always re-render if pwmValue changed
    if (prevPwm !== nextPwm) {
        return false; // Should re-render
    }
    // Default comparison for other props
    const prevPartType = prevProps.partType ?? prevProps.data?.partType;
    const nextPartType = nextProps.partType ?? nextProps.data?.partType;
    return prevProps.id === nextProps.id && prevPartType === nextPartType;
});
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wokwi$2f$elements$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wokwi/elements/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.js [app-client] (ecmascript) <export default as Gauge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$monitor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Monitor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/monitor.js [app-client] (ecmascript) <export default as Monitor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circuit$2d$board$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircuitBoard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circuit-board.js [app-client] (ecmascript) <export default as CircuitBoard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cog$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cog.js [app-client] (ecmascript) <export default as Cog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wokwiParts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const FUNDI_PART_MIME = 'application/x-fundi-part';
/**
 * Cache for extracted SVG content from Wokwi elements
 */ const svgCache = new Map();
/**
 * Extract SVG content from a Wokwi custom element's shadow DOM
 */ function extractSvgFromElement(element) {
    // Try to get SVG from shadow root
    const shadowRoot = element.shadowRoot;
    if (shadowRoot) {
        const svg = shadowRoot.querySelector('svg');
        if (svg) {
            return svg.outerHTML;
        }
    }
    // Try direct child SVG
    const directSvg = element.querySelector('svg');
    if (directSvg) {
        return directSvg.outerHTML;
    }
    return null;
}
/**
 * Renders an actual Wokwi element as a preview icon with SVG extraction
 */ function WokwiElementPreview({ elementTag, partId, fallbackIcon: FallbackIcon }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [svgContent, setSvgContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [usesFallback, setUsesFallback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WokwiElementPreview.useEffect": ()=>{
            // Check cache first
            if (svgCache.has(partId)) {
                const cached = svgCache.get(partId);
                if (cached) {
                    setSvgContent(cached);
                } else {
                    setUsesFallback(true);
                }
                return;
            }
            const container = containerRef.current;
            if (!container) return;
            // Clear any existing content
            container.innerHTML = '';
            try {
                // Create the wokwi element
                const element = document.createElement(elementTag);
                // Set common attributes for better preview appearance
                if (elementTag === 'wokwi-led') {
                    element.setAttribute('color', 'red');
                    element.setAttribute('value', '1'); // Show lit state
                } else if (elementTag === 'wokwi-pushbutton') {
                    element.setAttribute('color', 'red');
                } else if (elementTag === 'wokwi-rgb-led') {
                    element.setAttribute('r', '1');
                    element.setAttribute('g', '0');
                    element.setAttribute('b', '0');
                } else if (elementTag === 'wokwi-neopixel') {
                    element.setAttribute('r', '255');
                    element.setAttribute('g', '100');
                    element.setAttribute('b', '0');
                }
                container.appendChild(element);
                // Wait for custom element to be defined and render
                const tryExtractSvg = {
                    "WokwiElementPreview.useEffect.tryExtractSvg": ()=>{
                        const svg = extractSvgFromElement(element);
                        if (svg) {
                            svgCache.set(partId, svg);
                            setSvgContent(svg);
                        } else {
                            // Mark as fallback needed if no SVG after delay
                            svgCache.set(partId, null);
                            setUsesFallback(true);
                        }
                    }
                }["WokwiElementPreview.useEffect.tryExtractSvg"];
                // Try immediately, then with delays for custom elements that render async
                requestAnimationFrame({
                    "WokwiElementPreview.useEffect": ()=>{
                        if (!extractSvgFromElement(element)) {
                            setTimeout(tryExtractSvg, 100);
                        } else {
                            tryExtractSvg();
                        }
                    }
                }["WokwiElementPreview.useEffect"]);
            } catch (error) {
                console.error(`Failed to create wokwi element: ${elementTag}`, error);
                svgCache.set(partId, null);
                setUsesFallback(true);
            }
        }
    }["WokwiElementPreview.useEffect"], [
        elementTag,
        partId
    ]);
    // If we have extracted SVG, render it directly
    if (svgContent) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative h-10 w-10 flex items-center justify-center overflow-hidden [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto",
            dangerouslySetInnerHTML: {
                __html: svgContent
            },
            style: {
                transform: 'scale(0.6)',
                transformOrigin: 'center'
            }
        }, void 0, false, {
            fileName: "[project]/components/ComponentLibrary.tsx",
            lineNumber: 137,
            columnNumber: 7
        }, this);
    }
    // Render the actual element (for elements that don't expose SVG or while loading)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-10 w-10 flex items-center justify-center overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "transition-all group-hover:scale-110",
                style: {
                    transform: 'scale(0.5)',
                    transformOrigin: 'center'
                }
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            usesFallback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FallbackIcon, {
                className: "absolute h-8 w-8 text-ide-text-muted transition-colors group-hover:text-ide-accent"
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ComponentLibrary.tsx",
        lineNumber: 150,
        columnNumber: 5
    }, this);
}
_s(WokwiElementPreview, "+BKC/qcy86zdcM93emfwCneoifY=");
_c = WokwiElementPreview;
function buildPartCatalog() {
    const base = {
        mcu: [],
        displays: [],
        leds: [],
        input: [],
        output: [],
        passive: [],
        logic: [],
        motors: []
    };
    for (const id of Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"])){
        const cfg = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][id];
        const cat = cfg.category ?? 'mcu';
        if (base[cat]) {
            base[cat].push({
                id,
                name: cfg.name,
                description: cfg.description
            });
        }
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
            key: 'input',
            title: 'Input',
            items: base.input,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"]
        },
        {
            key: 'output',
            title: 'Output',
            items: base.output,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"]
        },
        {
            key: 'passive',
            title: 'Wiring',
            items: base.passive,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circuit$2d$board$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CircuitBoard$3e$__["CircuitBoard"]
        },
        {
            key: 'logic',
            title: 'Logic',
            items: base.logic,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"]
        },
        {
            key: 'motors',
            title: 'Motors',
            items: base.motors,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cog$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cog$3e$__["Cog"]
        }
    ];
}
function ComponentLibrary() {
    _s1();
    const categories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ComponentLibrary.useMemo[categories]": ()=>buildPartCatalog()
    }["ComponentLibrary.useMemo[categories]"], []);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('mcu');
    const scrollContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [canScrollLeft, setCanScrollLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [canScrollRight, setCanScrollRight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const activeCategory = categories.find((c)=>c.key === active) ?? categories[0];
    // Check scroll state
    const updateScrollButtons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComponentLibrary.useCallback[updateScrollButtons]": ()=>{
            const container = scrollContainerRef.current;
            if (!container) return;
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }["ComponentLibrary.useCallback[updateScrollButtons]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ComponentLibrary.useEffect": ()=>{
            updateScrollButtons();
            const container = scrollContainerRef.current;
            if (!container) return;
            container.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);
            return ({
                "ComponentLibrary.useEffect": ()=>{
                    container.removeEventListener('scroll', updateScrollButtons);
                    window.removeEventListener('resize', updateScrollButtons);
                }
            })["ComponentLibrary.useEffect"];
        }
    }["ComponentLibrary.useEffect"], [
        updateScrollButtons
    ]);
    const scroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ComponentLibrary.useCallback[scroll]": (direction)=>{
            const container = scrollContainerRef.current;
            if (!container) return;
            const scrollAmount = 120;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }["ComponentLibrary.useCallback[scroll]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-b border-ide-border pb-3 mb-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex items-center",
                    children: [
                        canScrollLeft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>scroll('left'),
                            className: "absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-ide-panel-bg via-ide-panel-bg to-transparent",
                            "aria-label": "Scroll left",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                className: "h-4 w-4 text-ide-text-muted hover:text-ide-accent transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/components/ComponentLibrary.tsx",
                                lineNumber: 257,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 251,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: scrollContainerRef,
                            className: "flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1",
                            style: {
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            },
                            children: categories.map((cat)=>{
                                const isActive = cat.key === active;
                                const Icon = cat.icon;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setActive(cat.key),
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('snap-start shrink-0 min-w-[60px] flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all', isActive ? 'bg-ide-accent/20 text-ide-accent border-b-2 border-ide-accent' : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'),
                                    title: cat.title,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ComponentLibrary.tsx",
                                            lineNumber: 284,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] leading-tight",
                                            children: cat.title
                                        }, void 0, false, {
                                            fileName: "[project]/components/ComponentLibrary.tsx",
                                            lineNumber: 285,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, cat.key, true, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 272,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 262,
                            columnNumber: 11
                        }, this),
                        canScrollRight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>scroll('right'),
                            className: "absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-ide-panel-bg via-ide-panel-bg to-transparent",
                            "aria-label": "Scroll right",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "h-4 w-4 text-ide-text-muted hover:text-ide-accent transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/components/ComponentLibrary.tsx",
                                lineNumber: 299,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 293,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 248,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 247,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 overflow-auto",
                children: activeCategory.items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full items-center justify-center text-xs text-ide-text-subtle",
                    children: "No components in this category yet."
                }, void 0, false, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 308,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-3 gap-1.5",
                    children: activeCategory.items.map((item)=>{
                        const wokwiConfig = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wokwiParts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WOKWI_PARTS"][item.id];
                        const Icon = activeCategory.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            role: "button",
                            tabIndex: 0,
                            "aria-label": `Add ${item.name} component`,
                            draggable: true,
                            onDragStart: (e)=>{
                                e.dataTransfer.effectAllowed = 'copy';
                                e.dataTransfer.setData(FUNDI_PART_MIME, item.id);
                            },
                            onKeyDown: (e)=>{
                                // Allow keyboard users to trigger component addition
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    // Show component info on keyboard activation
                                    alert(`Drag '${item.name}' to the canvas to add it.\n\n${item.description || 'No description available.'}`);
                                }
                            },
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group relative flex cursor-grab flex-col items-center justify-center', 'rounded-lg border p-2 transition-all duration-200', 'bg-ide-panel-surface border-ide-border', 'hover:border-ide-accent/50 hover:bg-ide-panel-hover', 'focus:outline-none focus:ring-2 focus:ring-ide-accent focus:ring-offset-2 focus:ring-offset-ide-panel-bg', 'active:cursor-grabbing active:scale-95'),
                            title: item.description ?? item.name,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WokwiElementPreview, {
                                    elementTag: wokwiConfig.element,
                                    partId: item.id,
                                    fallbackIcon: Icon
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 347,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-1.5 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-[9px] text-ide-text-muted group-hover:text-ide-text transition-colors leading-tight",
                                        children: item.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/ComponentLibrary.tsx",
                                        lineNumber: 351,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/ComponentLibrary.tsx",
                                    lineNumber: 350,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "[project]/components/ComponentLibrary.tsx",
                            lineNumber: 318,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/ComponentLibrary.tsx",
                    lineNumber: 312,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ComponentLibrary.tsx",
                lineNumber: 306,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ComponentLibrary.tsx",
        lineNumber: 245,
        columnNumber: 5
    }, this);
}
_s1(ComponentLibrary, "cKNsuNXQyov8RritcdRc1AipDg8=");
_c1 = ComponentLibrary;
const __TURBOPACK__default__export__ = /*#__PURE__*/ _c2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(ComponentLibrary);
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "WokwiElementPreview");
__turbopack_context__.k.register(_c1, "ComponentLibrary");
__turbopack_context__.k.register(_c2, "%default%");
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
"[project]/utils/circuitLayout.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateCircuitLayout",
    ()=>calculateCircuitLayout,
    "getCircuitBounds",
    ()=>getCircuitBounds
]);
'use client';
// Layout configuration constants
const GRID_SIZE = 20; // Match ReactFlow snap grid
const MCU_POSITION = {
    x: 0,
    y: 0
};
const COLUMN_WIDTH = 160; // Horizontal spacing between columns
const VERTICAL_SPACING = 100; // Vertical spacing between components
const MIN_VERTICAL_SPACING = 80; // Minimum spacing for densely packed columns
const MAX_COMPONENTS_PER_COLUMN = 5;
// Microcontroller part types
const MCU_TYPES = new Set([
    'arduino-uno',
    'wokwi-arduino-uno',
    'arduino-nano',
    'wokwi-arduino-nano',
    'arduino-mega',
    'wokwi-arduino-mega',
    'esp32-devkit-v1',
    'wokwi-esp32-devkit-v1',
    'pi-pico',
    'wokwi-pi-pico',
    'attiny85',
    'wokwi-attiny85',
    'franzininho',
    'wokwi-franzininho',
    'nano-rp2040-connect',
    'wokwi-nano-rp2040-connect'
]);
const CATEGORY_PATTERNS = {
    mcu: /arduino|esp32|pi-pico|attiny|franzininho|rp2040/i,
    power: /resistor|capacitor|vcc|gnd|power|breadboard/i,
    output: /led|buzzer|relay|speaker|rgb|neopixel|servo|motor|stepper/i,
    input: /button|pushbutton|switch|potentiometer|sensor|dht|hc-sr|pir|ldr|joystick|encoder|keypad|ir-receiver|ir-remote/i,
    display: /lcd|oled|ssd1306|segment|ili9341|max7219|tm1637|matrix/i,
    other: /.*/
};
// Column X positions for each category (relative to MCU)
const CATEGORY_COLUMNS = {
    mcu: 0,
    power: 1,
    output: 2,
    input: 3,
    display: 4,
    other: 5
};
/**
 * Snap a coordinate to the grid
 */ function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
/**
 * Check if a part is a microcontroller
 */ function isMicrocontroller(partType) {
    const normalized = partType.toLowerCase().replace('wokwi-', '');
    return MCU_TYPES.has(partType) || MCU_TYPES.has(`wokwi-${normalized}`) || MCU_TYPES.has(normalized);
}
/**
 * Categorize a component based on its type
 */ function categorizeComponent(partType) {
    const normalized = partType.toLowerCase();
    if (CATEGORY_PATTERNS.mcu.test(normalized)) return 'mcu';
    if (CATEGORY_PATTERNS.display.test(normalized)) return 'display';
    if (CATEGORY_PATTERNS.input.test(normalized)) return 'input';
    if (CATEGORY_PATTERNS.output.test(normalized)) return 'output';
    if (CATEGORY_PATTERNS.power.test(normalized)) return 'power';
    return 'other';
}
/**
 * Calculate connection count for each part to determine layout priority
 */ function getConnectionCounts(parts, connections) {
    const counts = new Map();
    for (const part of parts){
        counts.set(part.id, 0);
    }
    for (const conn of connections){
        counts.set(conn.from.partId, (counts.get(conn.from.partId) || 0) + 1);
        counts.set(conn.to.partId, (counts.get(conn.to.partId) || 0) + 1);
    }
    return counts;
}
/**
 * Group parts by their layout category
 */ function groupPartsByCategory(parts) {
    const groups = new Map();
    for (const category of Object.keys(CATEGORY_COLUMNS)){
        groups.set(category, []);
    }
    for (const part of parts){
        const category = categorizeComponent(part.type);
        const group = groups.get(category) || [];
        group.push(part);
        groups.set(category, group);
    }
    return groups;
}
function calculateCircuitLayout(parts, connections) {
    if (parts.length === 0) return parts;
    // Get connection counts for sorting within categories
    const connectionCounts = getConnectionCounts(parts, connections);
    // Group parts by category
    const categoryGroups = groupPartsByCategory(parts);
    // Calculate positions
    const positioned = [];
    // Position MCUs first at center-left
    const mcus = categoryGroups.get('mcu') || [];
    let mcuYOffset = 0;
    for (const mcu of mcus){
        positioned.push({
            ...mcu,
            position: {
                x: snapToGrid(MCU_POSITION.x),
                y: snapToGrid(MCU_POSITION.y + mcuYOffset)
            }
        });
        mcuYOffset += VERTICAL_SPACING * 2; // MCUs are taller
    }
    // Position other categories in their designated columns
    const categories = [
        'power',
        'output',
        'input',
        'display',
        'other'
    ];
    for (const category of categories){
        const partsInCategory = categoryGroups.get(category) || [];
        if (partsInCategory.length === 0) continue;
        // Sort by connection count (most connected first)
        partsInCategory.sort((a, b)=>(connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0));
        const columnIndex = CATEGORY_COLUMNS[category];
        const baseX = MCU_POSITION.x + COLUMN_WIDTH * columnIndex;
        // Center the column vertically around MCU
        const totalHeight = (partsInCategory.length - 1) * VERTICAL_SPACING;
        const startY = MCU_POSITION.y - totalHeight / 2;
        let columnCount = 0;
        let subColumnIndex = 0;
        for(let i = 0; i < partsInCategory.length; i++){
            const part = partsInCategory[i];
            const rowInColumn = columnCount % MAX_COMPONENTS_PER_COLUMN;
            const x = snapToGrid(baseX + subColumnIndex * COLUMN_WIDTH);
            const y = snapToGrid(startY + rowInColumn * VERTICAL_SPACING);
            positioned.push({
                ...part,
                position: {
                    x,
                    y
                }
            });
            columnCount++;
            if (columnCount % MAX_COMPONENTS_PER_COLUMN === 0) {
                subColumnIndex++;
            }
        }
    }
    return positioned;
}
function getCircuitBounds(parts) {
    if (parts.length === 0) {
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0
        };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const part of parts){
        minX = Math.min(minX, part.position.x);
        minY = Math.min(minY, part.position.y);
        // Estimate component size (varies by type, using reasonable defaults)
        maxX = Math.max(maxX, part.position.x + 150);
        maxY = Math.max(maxY, part.position.y + 100);
    }
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/useAppStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canRedo",
    ()=>canRedo,
    "canUndo",
    ()=>canUndo,
    "clearHistory",
    ()=>clearHistory,
    "redo",
    ()=>redo,
    "undo",
    ()=>undo,
    "useAppStore",
    ()=>useAppStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/nanoid/index.browser.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$circuitLayout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/circuitLayout.ts [app-client] (ecmascript)");
;
;
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
const defaultSettings = {
    editorFontSize: 14,
    editorTheme: 'dark',
    editorTabSize: 2,
    defaultBoardTarget: 'wokwi-arduino-uno',
    geminiApiKeyOverride: null
};
function createDefaultProject(name = 'Untitled Project') {
    return {
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(),
        name,
        lastModified: Date.now(),
        files: [
            {
                path: 'main.cpp',
                content: defaultCode,
                isMain: true,
                includeInSimulation: true
            }
        ],
        circuitParts: [],
        connections: []
    };
}
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
        // Preserve per-part attributes (e.g., LED color, resistor value)
        const dataAttrsRaw = data && isRecord(data.attrs) ? data.attrs : null;
        const attrs = dataAttrsRaw ? Object.fromEntries(Object.entries(dataAttrsRaw).filter(([k, v])=>typeof k === 'string' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')).map(([k, v])=>[
                k,
                String(v)
            ])) : {};
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
            attrs
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
const useAppStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        // Multi-project state
        projects: [],
        currentProjectId: null,
        // Legacy compatibility
        code: defaultCode,
        diagramJson: '',
        circuitParts: [],
        circuitConnections: [],
        connections: [],
        isRunning: false,
        // Multi-file support
        files: [
            {
                path: 'main.cpp',
                content: defaultCode,
                isMain: true,
                includeInSimulation: true
            }
        ],
        activeFilePath: 'main.cpp',
        openFilePaths: [
            'main.cpp'
        ],
        isCompiling: false,
        compilationError: null,
        hex: null,
        compiledBoard: null,
        nextWireColorIndex: 0,
        selectedPartIds: [],
        // Counter to trigger auto-fit after AI generates a circuit
        circuitGeneratedVersion: 0,
        // Terminal/AI Chat state
        terminalHistory: [],
        isAiLoading: false,
        // Teacher mode (Socratic Tutor feature)
        teacherMode: false,
        // Image staging
        stagedImageData: null,
        // Settings
        settings: defaultSettings,
        // Project management
        createProject: (name)=>{
            const newProject = createDefaultProject(name);
            set((state)=>({
                    projects: [
                        ...state.projects,
                        newProject
                    ],
                    currentProjectId: newProject.id,
                    files: newProject.files,
                    circuitParts: newProject.circuitParts,
                    connections: newProject.connections,
                    code: newProject.files.find((f)=>f.isMain)?.content || defaultCode,
                    activeFilePath: 'main.cpp',
                    openFilePaths: [
                        'main.cpp'
                    ]
                }));
            return newProject.id;
        },
        deleteProject: (id)=>{
            set((state)=>{
                const filtered = state.projects.filter((p)=>p.id !== id);
                const wasCurrentProject = state.currentProjectId === id;
                return {
                    projects: filtered,
                    currentProjectId: wasCurrentProject ? filtered[0]?.id || null : state.currentProjectId
                };
            });
            // If deleted current project, load another or reset
            if (get().currentProjectId === null && get().projects.length > 0) {
                get().loadProject(get().projects[0].id);
            }
        },
        loadProject: (id)=>{
            const project = get().projects.find((p)=>p.id === id);
            if (!project) return;
            set({
                currentProjectId: id,
                files: project.files,
                circuitParts: project.circuitParts,
                connections: project.connections,
                code: project.files.find((f)=>f.isMain)?.content || defaultCode,
                activeFilePath: project.files.find((f)=>f.isMain)?.path || project.files[0]?.path || null,
                openFilePaths: [
                    project.files.find((f)=>f.isMain)?.path || project.files[0]?.path
                ].filter(Boolean)
            });
        },
        saveCurrentProject: ()=>{
            const { currentProjectId, files, circuitParts, connections, projects } = get();
            if (!currentProjectId) return;
            set({
                projects: projects.map((p)=>p.id === currentProjectId ? {
                        ...p,
                        files,
                        circuitParts,
                        connections,
                        lastModified: Date.now()
                    } : p)
            });
        },
        getCurrentProject: ()=>{
            const { currentProjectId, projects } = get();
            return projects.find((p)=>p.id === currentProjectId) || null;
        },
        // File management
        addFile: (path, content = '', isMain = false)=>{
            const newFile = {
                path,
                content,
                isMain,
                includeInSimulation: true
            };
            set((state)=>({
                    files: [
                        ...state.files,
                        newFile
                    ],
                    openFilePaths: [
                        ...state.openFilePaths,
                        path
                    ],
                    activeFilePath: path
                }));
        },
        deleteFile: (path)=>{
            set((state)=>{
                const filtered = state.files.filter((f)=>f.path !== path);
                const newActivePath = state.activeFilePath === path ? filtered.find((f)=>f.isMain)?.path || filtered[0]?.path || null : state.activeFilePath;
                return {
                    files: filtered,
                    openFilePaths: state.openFilePaths.filter((p)=>p !== path),
                    activeFilePath: newActivePath
                };
            });
        },
        renameFile: (oldPath, newPath)=>{
            set((state)=>({
                    files: state.files.map((f)=>f.path === oldPath ? {
                            ...f,
                            path: newPath
                        } : f),
                    openFilePaths: state.openFilePaths.map((p)=>p === oldPath ? newPath : p),
                    activeFilePath: state.activeFilePath === oldPath ? newPath : state.activeFilePath
                }));
        },
        updateFileContent: (path, content)=>{
            set((state)=>({
                    files: state.files.map((f)=>f.path === path ? {
                            ...f,
                            content
                        } : f),
                    // Also update legacy code if it's the main file
                    code: state.files.find((f)=>f.path === path && f.isMain) ? content : state.code
                }));
        },
        setActiveFile: (path)=>{
            set({
                activeFilePath: path
            });
        },
        openFile: (path)=>{
            set((state)=>({
                    openFilePaths: state.openFilePaths.includes(path) ? state.openFilePaths : [
                        ...state.openFilePaths,
                        path
                    ],
                    activeFilePath: path
                }));
        },
        closeFile: (path)=>{
            set((state)=>{
                const filtered = state.openFilePaths.filter((p)=>p !== path);
                return {
                    openFilePaths: filtered,
                    activeFilePath: state.activeFilePath === path ? filtered[filtered.length - 1] || null : state.activeFilePath
                };
            });
        },
        toggleFileSimulation: (path)=>{
            set((state)=>({
                    files: state.files.map((f)=>f.path === path ? {
                            ...f,
                            includeInSimulation: !f.includeInSimulation
                        } : f)
                }));
        },
        updateCode: (newCode)=>{
            set({
                code: newCode
            });
            // Also update the active file if it's the main file
            const activeFile = get().files.find((f)=>f.path === get().activeFilePath);
            if (activeFile?.isMain) {
                get().updateFileContent(activeFile.path, newCode);
            }
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
                // Build files object for multi-file compilation
                const filesForCompilation = get().files.filter((f)=>f.includeInSimulation).reduce((acc, f)=>{
                    acc[f.path] = f.content;
                    return acc;
                }, {});
                const res = await fetch(`${baseUrl}/api/v1/compile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: get().code,
                        board,
                        files: filesForCompilation
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
        removePart: (id)=>{
            set((state)=>({
                    circuitParts: state.circuitParts.filter((p)=>p.id !== id),
                    // Also remove any connections involving this part
                    connections: state.connections.filter((c)=>c.from.partId !== id && c.to.partId !== id),
                    selectedPartIds: state.selectedPartIds.filter((pid)=>pid !== id)
                }));
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
        // Image staging
        stageImage: (imageData)=>{
            set({
                stagedImageData: imageData
            });
        },
        clearStagedImage: ()=>{
            set({
                stagedImageData: null
            });
        },
        // Settings
        updateSettings: (newSettings)=>{
            set((state)=>({
                    settings: {
                        ...state.settings,
                        ...newSettings
                    }
                }));
        },
        applyGeneratedCircuit: (parts, newConnections)=>{
            // Sensor default attrs - ensure sensors work in simulation
            const sensorDefaults = {
                'wokwi-dht22': {
                    temperature: '25',
                    humidity: '50'
                },
                'wokwi-dht11': {
                    temperature: '25',
                    humidity: '50'
                },
                'wokwi-hc-sr04': {
                    distance: '100'
                },
                'wokwi-potentiometer': {
                    value: '50'
                },
                'wokwi-slide-potentiometer': {
                    value: '50'
                },
                'wokwi-ntc-temperature-sensor': {
                    temperature: '25'
                },
                'wokwi-pir-motion-sensor': {
                    motion: '0'
                },
                'wokwi-photoresistor-sensor': {
                    lux: '500'
                },
                'wokwi-ds18b20': {
                    temperature: '25'
                },
                'wokwi-gas-sensor': {
                    gasLevel: '200'
                },
                'wokwi-tilt-sensor': {
                    tilted: '0'
                }
            };
            // Output device default attrs - ensure visual feedback in simulation
            const outputDefaults = {
                'wokwi-led': {
                    color: 'red'
                },
                'wokwi-rgb-led': {
                    common: 'cathode'
                },
                'wokwi-servo': {
                    horn: 'single'
                },
                // LCD pin mode is inferred from connections (i2c vs full)
                'wokwi-7segment': {
                    color: 'red',
                    common: 'cathode'
                },
                'wokwi-neopixel': {
                    pixels: '8'
                },
                'wokwi-neopixel-ring': {
                    pixels: '16'
                },
                'wokwi-buzzer': {
                    volume: '1'
                },
                'wokwi-ssd1306': {
                    i2cAddress: '0x3C'
                }
            };
            const inferLcdPinsMode = (partId)=>{
                const pins = new Set();
                for (const c of newConnections){
                    if (c.from.partId === partId) pins.add(String(c.from.pinId));
                    if (c.to.partId === partId) pins.add(String(c.to.pinId));
                }
                // Parallel/"full" pins
                const fullPins = new Set([
                    'RS',
                    'E',
                    'RW',
                    'V0',
                    'VSS',
                    'VDD',
                    'A',
                    'K',
                    'D0',
                    'D1',
                    'D2',
                    'D3',
                    'D4',
                    'D5',
                    'D6',
                    'D7'
                ]);
                for (const p of pins){
                    if (fullPins.has(p)) return 'full';
                }
                // I2C pins
                if (pins.has('SDA') || pins.has('SCL')) return 'i2c';
                return null;
            };
            // Merge all component defaults
            const allDefaults = {
                ...sensorDefaults,
                ...outputDefaults
            };
            // Apply defaults to parts that may be missing attrs
            const partsWithDefaults = parts.map((part)=>{
                const typeLower = String(part.type).toLowerCase();
                const defaults = allDefaults[typeLower] || allDefaults[part.type] || {};
                let attrs = {
                    ...defaults,
                    ...part.attrs || {}
                };
                // Ensure LCD1602/LCD2004 pin mode matches the generated wiring.
                // If we force the wrong mode (e.g. i2c) the canvas can't attach wires to RS/E/D4..D7, etc.
                if ((typeLower === 'wokwi-lcd1602' || typeLower === 'wokwi-lcd2004' || typeLower === 'lcd1602' || typeLower === 'lcd2004') && (part.attrs == null || part.attrs.pins == null)) {
                    const inferred = inferLcdPinsMode(part.id);
                    // Default to I2C only when we have no signal either way.
                    attrs = {
                        ...attrs,
                        pins: inferred ?? 'i2c'
                    };
                }
                // Return part with merged attrs, or original if no defaults or changes
                if (Object.keys(attrs).length > 0) {
                    return {
                        ...part,
                        attrs
                    };
                }
                return part;
            });
            // Check if AI provided meaningful positions (non-zero coordinates)
            const hasAiPositions = partsWithDefaults.some((p)=>p.position && (p.position.x !== 0 || p.position.y !== 0));
            // Only apply layout algorithm if AI didn't provide positions
            // This preserves AI's intended layout when coordinates exist
            const finalParts = hasAiPositions ? partsWithDefaults : (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$circuitLayout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateCircuitLayout"])(partsWithDefaults, newConnections);
            // Replace current circuit with AI-generated one
            // Increment version to trigger auto-fit in canvas
            // Clear hex to stop any running simulation
            set((state)=>({
                    circuitParts: finalParts,
                    connections: newConnections,
                    circuitGeneratedVersion: state.circuitGeneratedVersion + 1,
                    hex: null,
                    compiledBoard: null,
                    compilationError: null
                }));
        },
        submitCommand: async (text, imageData)=>{
            const trimmed = text.trim();
            const finalImageData = imageData ?? get().stagedImageData;
            if (!trimmed && !finalImageData) return;
            // Clear staged image after use
            if (finalImageData) {
                set({
                    stagedImageData: null
                });
            }
            // Add user command to history
            if (trimmed) {
                get().addTerminalEntry({
                    type: 'cmd',
                    content: trimmed
                });
            }
            if (finalImageData) {
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
/files - List all project files
/components - List current circuit components
/code - Show current code

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
                if (cmd === '/files') {
                    const files = get().files;
                    const fileList = files.map((f)=>`  ${f.isMain ? '📄' : '📁'} ${f.path}${f.isMain ? ' (main)' : ''}`).join('\n');
                    get().addTerminalEntry({
                        type: 'log',
                        content: `📂 Project Files:\n${fileList || '  (no files)'}`
                    });
                    return;
                }
                if (cmd === '/components') {
                    const parts = get().circuitParts;
                    const partList = parts.map((p)=>`  🔌 ${p.id}: ${p.type} at (${p.position.x}, ${p.position.y})`).join('\n');
                    get().addTerminalEntry({
                        type: 'log',
                        content: `🔧 Circuit Components (${parts.length}):\n${partList || '  (no components)'}`
                    });
                    return;
                }
                if (cmd === '/code') {
                    const code = get().code;
                    get().addTerminalEntry({
                        type: 'log',
                        content: `📝 Current Code:\n\`\`\`cpp\n${code}\n\`\`\``
                    });
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
                // Sync state with backend for AI context
                await fetch(`${baseUrl}/api/v1/ai-tools/sync-state`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: get().files,
                        components: get().circuitParts,
                        connections: get().connections,
                        compilation: {
                            is_compiling: get().isCompiling,
                            error: get().compilationError,
                            hex: get().hex,
                            board: get().compiledBoard
                        }
                    })
                }).catch(()=>{}); // Ignore sync errors
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
                        image_data: finalImageData || null,
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
                    // Update the main file content
                    const mainFile = get().files.find((f)=>f.isMain);
                    if (mainFile) {
                        get().updateFileContent(mainFile.path, data.code);
                    }
                }
                get().addTerminalEntry({
                    type: 'ai',
                    content: response || 'Generated successfully.'
                });
                // Process file changes from AI (GitHub Copilot-like codebase modifications)
                if (data.file_changes && Array.isArray(data.file_changes)) {
                    const fileActions = [];
                    for (const change of data.file_changes){
                        const { action, path, content, description } = change;
                        if (action === 'create' && path && content) {
                            // Check if file already exists
                            const existing = get().files.find((f)=>f.path === path);
                            if (!existing) {
                                get().addFile(path, content, false);
                                fileActions.push(`📄 Created: ${path}${description ? ` (${description})` : ''}`);
                            } else {
                                // Update existing file
                                get().updateFileContent(path, content);
                                fileActions.push(`✏️ Updated: ${path}${description ? ` (${description})` : ''}`);
                            }
                        } else if (action === 'update' && path && content) {
                            get().updateFileContent(path, content);
                            fileActions.push(`✏️ Updated: ${path}${description ? ` (${description})` : ''}`);
                        } else if (action === 'delete' && path) {
                            get().deleteFile(path);
                            fileActions.push(`🗑️ Deleted: ${path}`);
                        }
                    }
                    if (fileActions.length > 0) {
                        get().addTerminalEntry({
                            type: 'log',
                            content: `📂 File changes applied:\n${fileActions.join('\n')}`
                        });
                    }
                }
                // Apply generated circuit parts and connections to canvas
                if (data.circuit_parts && Array.isArray(data.circuit_parts)) {
                    // Debug: Log raw AI response
                    console.log('[AI Circuit Debug] Raw parts:', data.circuit_parts);
                    console.log('[AI Circuit Debug] Raw connections:', data.connections);
                    // Create a mapping from AI-generated IDs to actual generated IDs
                    // This is critical for connections to work properly!
                    const idMap = new Map();
                    const newParts = data.circuit_parts.map((p)=>{
                        const newId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])();
                        // Map the AI's ID (e.g., "arduino1") to our generated ID
                        if (p.id) {
                            idMap.set(p.id, newId);
                        }
                        return {
                            id: newId,
                            type: p.type,
                            position: {
                                x: p.x || 0,
                                y: p.y || 0
                            },
                            rotate: 0,
                            attrs: p.attrs || {}
                        };
                    });
                    // Helper function to get wire color based on signal type or pin name
                    const getWireColor = (conn)=>{
                        // Use AI-provided color if available
                        if (conn.color) return conn.color;
                        // Signal type color map
                        const signalColors = {
                            power: '#ef4444',
                            ground: '#000000',
                            digital: '#3b82f6',
                            analog: '#22c55e',
                            pwm: '#eab308',
                            i2c: '#8b5cf6',
                            spi: '#f97316',
                            uart: '#06b6d4'
                        };
                        if (conn.signal_type && signalColors[conn.signal_type.toLowerCase()]) {
                            return signalColors[conn.signal_type.toLowerCase()];
                        }
                        // Infer from pin names
                        const pins = [
                            conn.source_pin,
                            conn.target_pin
                        ].map((p)=>p.toUpperCase());
                        for (const pin of pins){
                            if ([
                                'VCC',
                                '5V',
                                '3V3',
                                '3.3V',
                                'VIN'
                            ].includes(pin)) return signalColors.power;
                            if ([
                                'GND',
                                'GROUND'
                            ].includes(pin)) return signalColors.ground;
                            if (pin.startsWith('A')) return signalColors.analog;
                            if (pin.includes('SDA') || pin.includes('SCL')) return signalColors.i2c;
                            if ([
                                'MOSI',
                                'MISO',
                                'SCK',
                                'SS'
                            ].some((s)=>pin.includes(s))) return signalColors.spi;
                            if (pin.includes('TX') || pin.includes('RX')) return signalColors.uart;
                        }
                        // Fallback to allocated color
                        return get().allocateNextWireColor();
                    };
                    // Helper function to normalize pin names from AI output to exact wokwi-elements format
                    const normalizePinName = (pin, partType)=>{
                        const p = pin.toString().trim();
                        const pUpper = p.toUpperCase();
                        const partLower = partType.toLowerCase();
                        // ========================
                        // ESP32 GPIO pins
                        // ========================
                        if (partLower.includes('esp32')) {
                            // GPIO13 → 13, IO13 → 13, D13 → 13
                            const gpioMatch = p.match(/^(?:gpio|io|d)?(\d+)$/i);
                            if (gpioMatch) return gpioMatch[1];
                            // I2C defaults for ESP32: SDA → 21, SCL → 22
                            if (/^sda$/i.test(p)) return '21';
                            if (/^scl$/i.test(p)) return '22';
                            // Power pins
                            if (/^(3v3?|3\.3v)$/i.test(p)) return '3V3';
                            if (/^(5v|vin)$/i.test(p)) return 'VIN';
                            if (/^gnd$/i.test(p)) return 'GND.1';
                        }
                        // ========================
                        // LED pins: normalize anode/cathode variations
                        // ========================
                        if (partLower.includes('led') && !partLower.includes('neopixel') && !partLower.includes('bar') && !partLower.includes('ring') && !partLower.includes('matrix')) {
                            if (/^(a|anode|\+|positive|vcc|an)$/i.test(p)) return 'A';
                            if (/^(c|k|cathode|-|negative|gnd|cat)$/i.test(p)) return 'C';
                        }
                        // ========================
                        // NeoPixel / WS2812 / Addressable LEDs
                        // ========================
                        if (partLower.includes('neopixel') || partLower.includes('ws2812')) {
                            if (/^(din|data|in|signal)$/i.test(p)) return 'DIN';
                            if (/^(dout|do|out)$/i.test(p)) return 'DOUT';
                            if (/^(vcc|5v|\+|vdd)$/i.test(p)) return 'VCC';
                            if (/^(gnd|vss|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Arduino digital/analog pins
                        // ========================
                        if (partLower.includes('arduino') || partLower.includes('uno') || partLower.includes('nano') || partLower.includes('mega')) {
                            // Digital: D13 → 13, PIN13 → 13, also handles mega pins 22-53
                            const digitalMatch = p.match(/^(?:d|pin)?(\d{1,2})$/i);
                            if (digitalMatch) return digitalMatch[1];
                            // Analog: A0, A1, etc. - keep as-is but uppercase
                            const analogMatch = p.match(/^a(\d)$/i);
                            if (analogMatch) return `A${analogMatch[1]}`;
                            // Power pins
                            if (/^(5v|vcc)$/i.test(p)) return '5V';
                            if (/^(3v3?|3\.3v)$/i.test(p)) return '3.3V';
                            if (/^vin$/i.test(p)) return 'VIN';
                            // GND pins - normalize to GND.1
                            if (/^gnd$/i.test(p)) return 'GND.1';
                            if (/^gnd\.?[123]$/i.test(p)) return p.toUpperCase().replace('.', '.');
                        }
                        // ========================
                        // LCD1602 / LCD2004 displays
                        // ========================
                        if (partLower.includes('lcd1602') || partLower.includes('lcd2004') || partLower.includes('lcd')) {
                            // I2C mode pins
                            if (/^sda$/i.test(p)) return 'SDA';
                            if (/^scl$/i.test(p)) return 'SCL';
                            // Parallel mode pins
                            if (/^(rs|register.?select)$/i.test(p)) return 'RS';
                            if (/^(e|en|enable)$/i.test(p)) return 'E';
                            if (/^(rw|read.?write)$/i.test(p)) return 'RW';
                            if (/^(v0|contrast|vo)$/i.test(p)) return 'V0';
                            if (/^(vss|gnd)$/i.test(p)) return 'VSS';
                            if (/^(vdd|vcc|5v)$/i.test(p)) return 'VDD';
                            if (/^(led\+|a|backlight\+)$/i.test(p)) return 'A';
                            if (/^(led-|k|backlight-)$/i.test(p)) return 'K';
                            // Data pins D0-D7
                            const dataMatch = p.match(/^d?([0-7])$/i);
                            if (dataMatch) return `D${dataMatch[1]}`;
                        }
                        // ========================
                        // SSD1306 / OLED displays (I2C)
                        // ========================
                        if (partLower.includes('ssd1306') || partLower.includes('oled')) {
                            if (/^sda$/i.test(p)) return 'SDA';
                            if (/^scl$/i.test(p)) return 'SCL';
                            if (/^(vcc|vdd|3v3?|5v|\+)$/i.test(p)) return 'VCC';
                            if (/^(gnd|ground|vss|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // DHT22 / DHT11 temperature sensors
                        // ========================
                        if (partLower.includes('dht')) {
                            if (/^(data|sda|out|signal|dat)$/i.test(p)) return 'SDA';
                            if (/^(vcc|vdd|\+|5v|3v3?)$/i.test(p)) return 'VCC';
                            if (/^(gnd|ground|-)$/i.test(p)) return 'GND';
                            if (/^nc$/i.test(p)) return 'NC';
                        }
                        // ========================
                        // HC-SR04 Ultrasonic sensor
                        // ========================
                        if (partLower.includes('hc-sr04') || partLower.includes('sr04') || partLower.includes('ultrasonic')) {
                            if (/^(trig|trigger)$/i.test(p)) return 'TRIG';
                            if (/^echo$/i.test(p)) return 'ECHO';
                            if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Potentiometer
                        // ========================
                        if (partLower.includes('potentiometer')) {
                            if (/^(sig|signal|wiper|out|w)$/i.test(p)) return 'SIG';
                            if (/^(vcc|\+|5v|cw)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-|ccw)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Slide potentiometer
                        // ========================
                        if (partLower.includes('slide') && partLower.includes('potentiometer')) {
                            if (/^(sig|signal|wiper|out)$/i.test(p)) return 'SIG';
                            if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Pushbutton
                        // ========================
                        if (partLower.includes('pushbutton') || partLower.includes('button')) {
                            // Wokwi uses 1.l, 1.r, 2.l, 2.r for 4-pin buttons
                            if (/^(1|left|l|in|a)$/i.test(p)) return '1.l';
                            if (/^(2|right|r|out|b)$/i.test(p)) return '2.l';
                            // Already correct formats - normalize case
                            if (/^[12]\.[lr]$/i.test(p)) return p.toLowerCase();
                        }
                        // ========================
                        // Resistor pins
                        // ========================
                        if (partLower.includes('resistor')) {
                            if (/^(1|one|left|l|a)$/i.test(p)) return '1';
                            if (/^(2|two|right|r|b)$/i.test(p)) return '2';
                        }
                        // ========================
                        // Buzzer pins
                        // ========================
                        if (partLower.includes('buzzer')) {
                            if (/^(1|signal|sig|s|\+|positive|vcc)$/i.test(p)) return '1';
                            if (/^(2|gnd|ground|-|negative)$/i.test(p)) return '2';
                        }
                        // ========================
                        // Servo pins
                        // ========================
                        if (partLower.includes('servo')) {
                            if (/^(pwm|signal|sig|s|pulse|ctrl|control)$/i.test(p)) return 'PWM';
                            if (/^(v\+|vcc|5v|power|\+)$/i.test(p)) return 'V+';
                            if (/^(gnd|ground|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // PIR Motion sensor
                        // ========================
                        if (partLower.includes('pir') || partLower.includes('motion')) {
                            if (/^(out|signal|sig|data)$/i.test(p)) return 'OUT';
                            if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Photoresistor / LDR
                        // ========================
                        if (partLower.includes('photoresistor') || partLower.includes('ldr')) {
                            if (/^(ao|out|signal|a0)$/i.test(p)) return 'AO';
                            if (/^(do|digital)$/i.test(p)) return 'DO';
                            if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // IR Receiver
                        // ========================
                        if (partLower.includes('ir') && partLower.includes('receiver')) {
                            if (/^(out|signal|data)$/i.test(p)) return 'OUT';
                            if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // Membrane Keypad
                        // ========================
                        if (partLower.includes('keypad') || partLower.includes('membrane')) {
                            // Row pins R1-R4
                            const rowMatch = p.match(/^r(\d)$/i);
                            if (rowMatch) return `R${rowMatch[1]}`;
                            // Column pins C1-C4
                            const colMatch = p.match(/^c(\d)$/i);
                            if (colMatch) return `C${colMatch[1]}`;
                        }
                        // ========================
                        // Rotary Encoder (KY-040)
                        // ========================
                        if (partLower.includes('rotary') || partLower.includes('encoder') || partLower.includes('ky-040')) {
                            if (/^(clk|clock|a)$/i.test(p)) return 'CLK';
                            if (/^(dt|data|b)$/i.test(p)) return 'DT';
                            if (/^(sw|switch|button)$/i.test(p)) return 'SW';
                            if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC';
                            if (/^(gnd|-)$/i.test(p)) return 'GND';
                        }
                        // ========================
                        // MPU6050 accelerometer/gyroscope
                        // ========================
                        if (partLower.includes('mpu6050') || partLower.includes('accelerometer') || partLower.includes('gyro')) {
                            if (/^sda$/i.test(p)) return 'SDA';
                            if (/^scl$/i.test(p)) return 'SCL';
                            if (/^(vcc|3v3?)$/i.test(p)) return 'VCC';
                            if (/^gnd$/i.test(p)) return 'GND';
                            if (/^int$/i.test(p)) return 'INT';
                        }
                        // ========================
                        // Generic I2C devices fallback
                        // ========================
                        if (/^sda$/i.test(p)) return 'SDA';
                        if (/^scl$/i.test(p)) return 'SCL';
                        // ========================
                        // Generic power pins fallback
                        // ========================
                        if (/^(vcc|5v|3v3?|vin|\+)$/i.test(p)) return pUpper.replace('3V3', '3.3V');
                        if (/^(gnd|ground|vss|-)$/i.test(p)) return 'GND';
                        return p // Return as-is if no normalization needed
                        ;
                    };
                    // Get part type from AI parts for normalization
                    const getPartTypeFromAIParts = (aiPartId)=>{
                        const part = data.circuit_parts.find((p)=>p.id === aiPartId);
                        return part?.type || '';
                    };
                    const newConnections = (data.connections || []).map((c)=>{
                        // Translate AI-generated part IDs to our actual generated IDs
                        const fromPartId = idMap.get(c.source_part) || c.source_part;
                        const toPartId = idMap.get(c.target_part) || c.target_part;
                        // Normalize pin names based on part types
                        const sourcePartType = getPartTypeFromAIParts(c.source_part);
                        const targetPartType = getPartTypeFromAIParts(c.target_part);
                        const normalizedSourcePin = normalizePinName(c.source_pin, sourcePartType);
                        const normalizedTargetPin = normalizePinName(c.target_pin, targetPartType);
                        console.log('[AI Circuit] Creating connection:', {
                            aiSource: c.source_part,
                            aiSourcePin: c.source_pin,
                            normalizedSourcePin,
                            aiTarget: c.target_part,
                            aiTargetPin: c.target_pin,
                            normalizedTargetPin
                        });
                        return {
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(),
                            from: {
                                partId: fromPartId,
                                pinId: normalizedSourcePin
                            },
                            to: {
                                partId: toPartId,
                                pinId: normalizedTargetPin
                            },
                            color: getWireColor(c)
                        };
                    });
                    // Debug: Log ID mapping and final connections
                    console.log('[AI Circuit Debug] ID mapping:', Object.fromEntries(idMap));
                    console.log('[AI Circuit Debug] Final connections:', newConnections.map((c)=>({
                            from: `${c.from.partId}:${c.from.pinId}`,
                            to: `${c.to.partId}:${c.to.pinId}`
                        })));
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
    }), {
    name: 'fundi-app-storage',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    partialize: (state)=>({
            projects: state.projects,
            settings: state.settings
        })
}));
// Create a separate temporal store that wraps the main store's state
const temporalHistory = {
    past: [],
    future: []
};
const MAX_HISTORY = 50;
// Helper to get trackable state
const getTrackableState = ()=>{
    const state = useAppStore.getState();
    return {
        circuitParts: [
            ...state.circuitParts
        ],
        connections: [
            ...state.connections
        ],
        code: state.code
    };
};
// Helper to check if state changed
const statesEqual = (a, b)=>{
    return JSON.stringify(a.circuitParts) === JSON.stringify(b.circuitParts) && JSON.stringify(a.connections) === JSON.stringify(b.connections) && a.code === b.code;
};
// Subscribe to store changes and track history
let lastTrackedState = getTrackableState();
useAppStore.subscribe((state)=>{
    const currentTrackable = {
        circuitParts: state.circuitParts,
        connections: state.connections,
        code: state.code
    };
    if (!statesEqual(lastTrackedState, currentTrackable)) {
        temporalHistory.past.push(lastTrackedState);
        if (temporalHistory.past.length > MAX_HISTORY) {
            temporalHistory.past.shift();
        }
        temporalHistory.future = []; // Clear redo stack on new change
        lastTrackedState = {
            ...currentTrackable
        };
    }
});
const undo = ()=>{
    if (temporalHistory.past.length === 0) return;
    const previousState = temporalHistory.past.pop();
    temporalHistory.future.push(getTrackableState());
    useAppStore.setState({
        circuitParts: previousState.circuitParts || [],
        connections: previousState.connections || [],
        code: previousState.code || ''
    });
    lastTrackedState = {
        ...previousState
    };
};
const redo = ()=>{
    if (temporalHistory.future.length === 0) return;
    const nextState = temporalHistory.future.pop();
    temporalHistory.past.push(getTrackableState());
    useAppStore.setState({
        circuitParts: nextState.circuitParts || [],
        connections: nextState.connections || [],
        code: nextState.code || ''
    });
    lastTrackedState = {
        ...nextState
    };
};
const canUndo = ()=>temporalHistory.past.length > 0;
const canRedo = ()=>temporalHistory.future.length > 0;
const clearHistory = ()=>{
    temporalHistory.past = [];
    temporalHistory.future = [];
    lastTrackedState = getTrackableState();
};
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
 *
 * Enhanced with component avoidance: wires wrap around components instead of
 * crossing through them, keeping pins and connections visible.
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
/**
 * Check if a line segment (horizontal or vertical) intersects a bounding box
 * Returns true if the segment goes through or touches the box
 */ function segmentIntersectsBounds(start, end, bounds, margin = 15) {
    const expanded = {
        left: bounds.x - margin,
        right: bounds.x + bounds.width + margin,
        top: bounds.y - margin,
        bottom: bounds.y + bounds.height + margin
    };
    // Horizontal segment
    if (start.y === end.y) {
        const y = start.y;
        if (y < expanded.top || y > expanded.bottom) return false;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        // Check if horizontal line crosses the expanded box
        return maxX >= expanded.left && minX <= expanded.right;
    }
    // Vertical segment
    if (start.x === end.x) {
        const x = start.x;
        if (x < expanded.left || x > expanded.right) return false;
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);
        // Check if vertical line crosses the expanded box
        return maxY >= expanded.top && minY <= expanded.bottom;
    }
    // Diagonal segment - shouldn't happen in our orthogonal routing, but handle it
    return false;
}
/**
 * Find all bounding boxes that a path segment intersects
 */ function findIntersectingBounds(start, end, obstacles) {
    return obstacles.filter((obs)=>segmentIntersectsBounds(start, end, obs));
}
/**
 * Calculate the shortest detour around an obstacle for a given segment
 * Returns a new path that goes around the obstacle
 */ function calculateDetour(start, end, obstacle, originalPathType, gridSize) {
    const margin = 25; // Extra spacing from component edge for visibility
    const expLeft = obstacle.x - margin;
    const expRight = obstacle.x + obstacle.width + margin;
    const expTop = obstacle.y - margin;
    const expBottom = obstacle.y + obstacle.height + margin;
    // For horizontal segments that cross through
    if (originalPathType === 'horizontal') {
        const y = start.y;
        const above = y < obstacle.y + obstacle.height / 2;
        const detourY = above ? expTop : expBottom;
        // Route: go up/down around, then across, then back down/up
        return [
            start,
            {
                x: start.x,
                y: detourY
            },
            {
                x: end.x,
                y: detourY
            },
            end
        ];
    }
    // For vertical segments that cross through
    const x = start.x;
    const left = x < obstacle.x + obstacle.width / 2;
    const detourX = left ? expLeft : expRight;
    // Route: go left/right around, then up/down, then back
    return [
        start,
        {
            x: detourX,
            y: start.y
        },
        {
            x: detourX,
            y: end.y
        },
        end
    ];
}
/**
 * Check if a point is inside any bounding box
 */ function pointInBounds(point, obstacles, margin = 5) {
    return obstacles.some((obs)=>{
        const expanded = {
            left: obs.x - margin,
            right: obs.x + obs.width + margin,
            top: obs.y - margin,
            bottom: obs.y + obs.height + margin
        };
        return point.x >= expanded.left && point.x <= expanded.right && point.y >= expanded.top && point.y <= expanded.bottom;
    });
}
/**
 * Check if a whole path segment (between two points) would cross through obstacles
 * Returns true if the segment intersects any obstacle bounding box
 */ function pathIntersectsObstacles(start, end, obstacles) {
    // Check if any point along the path is inside an obstacle
    // For orthogonal paths, we need to check the entire segment
    for (const obs of obstacles){
        if (segmentIntersectsBounds(start, end, obs)) {
            return true;
        }
    }
    return false;
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
function pointsToPathD(points, cornerRadius = 8) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    // If no corner radius, use simple straight lines
    if (cornerRadius <= 0 || points.length === 2) {
        const [first, ...rest] = points;
        return `M ${first.x} ${first.y}` + rest.map((p)=>` L ${p.x} ${p.y}`).join('');
    }
    // With corner radius: use quadratic curves at bends
    let d = `M ${points[0].x} ${points[0].y}`;
    for(let i = 1; i < points.length - 1; i++){
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        // Calculate the maximum radius we can use at this corner
        const distToPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const distToNext = Math.hypot(next.x - curr.x, next.y - curr.y);
        const r = Math.min(cornerRadius, distToPrev / 2, distToNext / 2);
        if (r <= 0) {
            // No room for corner, use straight line
            d += ` L ${curr.x} ${curr.y}`;
            continue;
        }
        // Calculate direction vectors
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        // Normalize directions
        const len1 = Math.hypot(dx1, dy1);
        const len2 = Math.hypot(dx2, dy2);
        if (len1 === 0 || len2 === 0) {
            d += ` L ${curr.x} ${curr.y}`;
            continue;
        }
        const nx1 = dx1 / len1;
        const ny1 = dy1 / len1;
        const nx2 = dx2 / len2;
        const ny2 = dy2 / len2;
        // Points where corner curve starts and ends
        const startX = curr.x - nx1 * r;
        const startY = curr.y - ny1 * r;
        const endX = curr.x + nx2 * r;
        const endY = curr.y + ny2 * r;
        // Line to start of corner, then quadratic curve through corner
        d += ` L ${startX} ${startY}`;
        d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
    }
    // Line to final point
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
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
    const obstacles = options.obstacles ?? [];
    const gridSize = options.gridSize ?? 10;
    const all = [
        start,
        ...waypoints,
        end
    ];
    const out = [
        start
    ];
    // If no obstacles, use the original simple routing
    if (obstacles.length === 0) {
        for(let i = 1; i < all.length; i++){
            const a = all[i - 1];
            const b = all[i];
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
    // Enhanced routing with component avoidance
    for(let i = 1; i < all.length; i++){
        const a = all[i - 1];
        const b = all[i];
        if (a.x === b.x && a.y === b.y) continue;
        // Build the initial path for this segment
        let segmentPath;
        if (firstLeg === 'horizontal') {
            const mid = {
                x: b.x,
                y: a.y
            };
            segmentPath = [
                a,
                mid,
                b
            ];
        } else {
            const mid = {
                x: a.x,
                y: b.y
            };
            segmentPath = [
                a,
                mid,
                b
            ];
        }
        // Check each segment of the path for obstacle intersections
        const finalPath = [
            a
        ];
        for(let segIdx = 0; segIdx < segmentPath.length - 1; segIdx++){
            const segStart = segmentPath[segIdx];
            const segEnd = segmentPath[segIdx + 1];
            // Skip if zero length
            if (segStart.x === segEnd.x && segStart.y === segEnd.y) continue;
            // Check if this segment intersects any obstacles
            const intersectsObs = findIntersectingBounds(segStart, segEnd, obstacles);
            if (intersectsObs.length === 0) {
                // No intersection, add segment directly
                finalPath.push(segEnd);
            } else {
                // Find the first obstacle that intersects
                const obstacle = intersectsObs[0];
                // Determine if this is horizontal or vertical segment
                const isHorizontal = segStart.y === segEnd.y;
                const pathType = isHorizontal ? 'horizontal' : 'vertical';
                // Calculate detour around the obstacle
                const detour = calculateDetour(segStart, segEnd, obstacle, pathType, gridSize);
                // Add intermediate detour points (excluding start since it's already in finalPath)
                for(let j = 1; j < detour.length; j++){
                    finalPath.push(detour[j]);
                }
            }
        }
        // Add all points from this segment to the main output (skip first since it's the previous end)
        for(let j = 1; j < finalPath.length; j++){
            out.push(finalPath[j]);
        }
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
    // Precompute component bounding boxes for obstacle avoidance
    const componentBounds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WiringLayer.useMemo[componentBounds]": ()=>{
            const container = containerRef.current;
            if (!container) return [];
            const containerRect = container.getBoundingClientRect();
            // Get all node elements (excluding the wiring layer itself which is in an SVG)
            // Looking for elements with data-node-id attribute
            const nodeElements = container.querySelectorAll('[data-node-id]');
            const bounds = [];
            nodeElements.forEach({
                "WiringLayer.useMemo[componentBounds]": (el)=>{
                    const partId = el.getAttribute('data-node-id');
                    if (!partId) return;
                    // Get the bounding box of the node element
                    const rect = el.getBoundingClientRect();
                    // Convert to container-relative coordinates
                    const x = rect.left - containerRect.left;
                    const y = rect.top - containerRect.top;
                    const width = rect.width;
                    const height = rect.height;
                    // Filter out tiny elements (like the pin hitboxes which have node-id too)
                    if (width < 20 || height < 20) return;
                    // Check if we already have bounds for this part (multiple pin elements might exist)
                    if (!bounds.find({
                        "WiringLayer.useMemo[componentBounds]": (b)=>b.id === partId
                    }["WiringLayer.useMemo[componentBounds]"])) {
                        bounds.push({
                            id: partId,
                            x,
                            y,
                            width,
                            height
                        });
                    }
                }
            }["WiringLayer.useMemo[componentBounds]"]);
            return bounds;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["WiringLayer.useMemo[componentBounds]"], [
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
                    if (!start || !end) {
                        return null;
                    }
                    const waypoints = wirePointOverrides?.has(c.id) ? wirePointOverrides.get(c.id) ?? [] : c.points ?? [];
                    const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateOrthogonalPoints"])(start, end, waypoints, {
                        firstLeg: 'horizontal',
                        obstacles: componentBounds,
                        gridSize
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
        gridSize,
        pinCenters,
        componentBounds
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
                firstLeg: 'vertical',
                obstacles: componentBounds,
                gridSize
            });
            return {
                d: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$wireRouting$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointsToPathD"])(points),
                color: creating.color
            };
        }
    }["WiringLayer.useMemo[preview]"], [
        creating,
        forceTick,
        componentBounds,
        gridSize
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
                    zIndex: 5
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
                                        lineNumber: 510,
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
                                        lineNumber: 555,
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
                                        lineNumber: 572,
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
                                        lineNumber: 589,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, w.id, true, {
                                fileName: "[project]/components/WiringLayer.tsx",
                                lineNumber: 508,
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
                            lineNumber: 607,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/WiringLayer.tsx",
                    lineNumber: 500,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/WiringLayer.tsx",
                lineNumber: 487,
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
                                lineNumber: 640,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 638,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ed133a751aa94545" + " " + "mx-1 h-5 w-px bg-brass/30"
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 656,
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
                        lineNumber: 658,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WiringLayer.tsx",
                lineNumber: 624,
                columnNumber: 9
            }, this),
            hoveredId && !selectedId && (()=>{
                const hoveredWire = wireGeometry.find((w)=>w.id === hoveredId);
                const hoveredConn = connections.find((c)=>c.id === hoveredId);
                if (!hoveredWire || !hoveredConn) return null;
                const pts = hoveredWire.points;
                if (pts.length < 2) return null;
                const midIdx = Math.floor(pts.length / 2);
                const midpoint = pts[midIdx];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        left: midpoint.x,
                        top: midpoint.y,
                        transform: 'translate(-50%, -100%) translateY(-8px)'
                    },
                    className: "jsx-ed133a751aa94545" + " " + "absolute z-50 pointer-events-none",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-ed133a751aa94545" + " " + "bg-ide-panel-bg/95 backdrop-blur-sm border border-ide-border rounded-md px-2.5 py-1.5 shadow-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-ed133a751aa94545" + " " + "flex items-center gap-2 text-[11px] font-mono",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-ed133a751aa94545" + " " + "text-ide-text-muted",
                                    children: hoveredConn.from.partId
                                }, void 0, false, {
                                    fileName: "[project]/components/WiringLayer.tsx",
                                    lineNumber: 695,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-ed133a751aa94545" + " " + "text-ide-accent font-medium",
                                    children: hoveredConn.from.pinId
                                }, void 0, false, {
                                    fileName: "[project]/components/WiringLayer.tsx",
                                    lineNumber: 696,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-ed133a751aa94545" + " " + "text-ide-text-subtle",
                                    children: "→"
                                }, void 0, false, {
                                    fileName: "[project]/components/WiringLayer.tsx",
                                    lineNumber: 697,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-ed133a751aa94545" + " " + "text-ide-text-muted",
                                    children: hoveredConn.to.partId
                                }, void 0, false, {
                                    fileName: "[project]/components/WiringLayer.tsx",
                                    lineNumber: 698,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-ed133a751aa94545" + " " + "text-ide-accent font-medium",
                                    children: hoveredConn.to.pinId
                                }, void 0, false, {
                                    fileName: "[project]/components/WiringLayer.tsx",
                                    lineNumber: 699,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/WiringLayer.tsx",
                            lineNumber: 694,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/WiringLayer.tsx",
                        lineNumber: 693,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/WiringLayer.tsx",
                    lineNumber: 685,
                    columnNumber: 11
                }, this);
            })()
        ]
    }, void 0, true);
}
_s(WiringLayer, "lyF8GpYY0DHMV2CtehU5rpVYGaU=", false, function() {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
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
    const stagedImageData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[stagedImageData]": (s)=>s.stagedImageData
    }["CommandInterface.useAppStore[stagedImageData]"]);
    const stageImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[stageImage]": (s)=>s.stageImage
    }["CommandInterface.useAppStore[stageImage]"]);
    const clearStagedImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CommandInterface.useAppStore[clearStagedImage]": (s)=>s.clearStagedImage
    }["CommandInterface.useAppStore[clearStagedImage]"]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Command history navigation state
    const [historyIndex, setHistoryIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const [tempInput, setTempInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('') // Store current input when navigating
    ;
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Get user command history (most recent first)
    const commandHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommandInterface.useMemo[commandHistory]": ()=>terminalHistory.filter({
                "CommandInterface.useMemo[commandHistory]": (e)=>e.type === 'cmd'
            }["CommandInterface.useMemo[commandHistory]"]).map({
                "CommandInterface.useMemo[commandHistory]": (e)=>e.content
            }["CommandInterface.useMemo[commandHistory]"]).reverse()
    }["CommandInterface.useMemo[commandHistory]"], [
        terminalHistory
    ]);
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
            // Submit on Enter (without Shift)
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!input.trim() || isAiLoading) return;
                void submitCommand(input);
                setInput('');
                setHistoryIndex(-1);
                setTempInput('');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (commandHistory.length === 0) return;
                if (historyIndex === -1) {
                    setTempInput(input); // Save current input
                }
                const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex <= 0) {
                    setHistoryIndex(-1);
                    setInput(tempInput); // Restore original input
                    return;
                }
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        }
    }["CommandInterface.useCallback[handleKeyDown]"], [
        input,
        isAiLoading,
        submitCommand,
        commandHistory,
        historyIndex,
        tempInput
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
    // Stage image instead of sending immediately
    const handleImageUpload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[handleImageUpload]": (e)=>{
            const file = e.target.files?.[0];
            if (!file) return;
            try {
                const reader = new FileReader();
                reader.onload = ({
                    "CommandInterface.useCallback[handleImageUpload]": (event)=>{
                        const base64 = event.target?.result;
                        stageImage(base64);
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
        stageImage
    ]);
    // Quick action to generate circuit from staged image
    const handleGenerateFromImage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CommandInterface.useCallback[handleGenerateFromImage]": ()=>{
            void submitCommand('Analyze this circuit image and recreate it as a virtual Wokwi circuit with appropriate code');
        }
    }["CommandInterface.useCallback[handleGenerateFromImage]"], [
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
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this),
                                    "Builder"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 250,
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
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this),
                                    "Teacher"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 263,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-ide-text-subtle",
                        children: teacherMode ? 'Explains concepts' : 'Builds circuits'
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 248,
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
                                        lineNumber: 291,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 290,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-medium text-ide-text mb-1",
                                    children: "FUNDI AI Assistant"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 293,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-ide-text-muted mb-3",
                                    children: "Describe the circuit you want to build, upload an image, or use voice input."
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 294,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-ide-text-subtle",
                                    children: "Type /help for commands"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                    lineNumber: 297,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 289,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this),
                    terminalHistory.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatMessage, {
                            entry: entry
                        }, entry.id, false, {
                            fileName: "[project]/components/terminal/CommandInterface.tsx",
                            lineNumber: 304,
                            columnNumber: 11
                        }, this)),
                    isAiLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 py-2 text-sm text-ide-accent animate-pulse",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "h-4 w-4 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 308,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Generating..."
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 309,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 307,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-t border-ide-border bg-ide-panel-surface p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg border border-ide-border bg-ide-panel-bg overflow-hidden focus-within:border-ide-accent/50 focus-within:ring-1 focus-within:ring-ide-accent/20 transition-all",
                        children: [
                            stagedImageData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-b border-ide-border p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative inline-block",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: stagedImageData,
                                                alt: "Staged circuit",
                                                className: "h-20 rounded border border-ide-border object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 322,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: clearStagedImage,
                                                className: "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ide-error text-white hover:bg-ide-error/80 transition-colors",
                                                title: "Remove image",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                    className: "h-3 w-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 327,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleGenerateFromImage,
                                        disabled: isAiLoading,
                                        className: "mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-ide-accent/20 px-3 py-1.5 text-xs font-medium text-ide-accent hover:bg-ide-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: "h-3.5 w-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 343,
                                                columnNumber: 19
                                            }, this),
                                            "Generate Circuit from this Image"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 337,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 320,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: inputRef,
                                value: input,
                                onChange: (e)=>setInput(e.target.value),
                                onKeyDown: handleKeyDown,
                                disabled: isAiLoading,
                                placeholder: isListening ? 'Listening...' : isAiLoading ? 'Generating...' : stagedImageData ? 'Add a description or click the button above...' : 'Describe your circuit or ask a question...',
                                rows: 2,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full resize-none bg-transparent px-3 py-2 text-sm text-ide-text outline-none', 'placeholder:text-ide-text-subtle', 'disabled:cursor-not-allowed disabled:opacity-50'),
                                autoComplete: "off",
                                spellCheck: false
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 350,
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
                                                lineNumber: 379,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>fileInputRef.current?.click(),
                                                disabled: isAiLoading,
                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-7 w-7 items-center justify-center rounded-md transition-colors', stagedImageData ? 'text-ide-accent bg-ide-accent/10' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text', 'disabled:cursor-not-allowed disabled:opacity-50'),
                                                title: "Upload circuit image",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ImagePlus$3e$__["ImagePlus"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 386,
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
                                                        lineNumber: 417,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                        lineNumber: 419,
                                                        columnNumber: 21
                                                    }, this),
                                                    isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute inset-0 rounded-md animate-pulse-ring bg-ide-error/30"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 403,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 377,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: isAiLoading || !input.trim() && !stagedImageData,
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all btn-press', (input.trim() || stagedImageData) && !isAiLoading ? 'bg-ide-accent text-white hover:bg-ide-accent-hover' : 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                className: "h-3.5 w-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 439,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Send"
                                            }, void 0, false, {
                                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                                lineNumber: 440,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                                        lineNumber: 429,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/CommandInterface.tsx",
                                lineNumber: 376,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/CommandInterface.tsx",
                        lineNumber: 317,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/terminal/CommandInterface.tsx",
                    lineNumber: 316,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/terminal/CommandInterface.tsx",
                lineNumber: 315,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/CommandInterface.tsx",
        lineNumber: 243,
        columnNumber: 5
    }, this);
}
_s(CommandInterface, "TLZJobekKuI0OPb7jVWMtbnMtqY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$binary$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Binary$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/binary.js [app-client] (ecmascript) <export default as Binary>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function SerialMonitor({ serialOutput, onClear, isRunning, onSendInput }) {
    _s();
    const [autoScroll, setAutoScroll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [baudRate, setBaudRate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(9600);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [lineEnding, setLineEnding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('nl');
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ascii');
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Convert string to hex representation
    const toHex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SerialMonitor.useCallback[toHex]": (str)=>{
            return str.split('').map({
                "SerialMonitor.useCallback[toHex]": (c)=>c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()
            }["SerialMonitor.useCallback[toHex]"]).join(' ');
        }
    }["SerialMonitor.useCallback[toHex]"], []);
    // Process output based on view mode  
    const displayOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SerialMonitor.useMemo[displayOutput]": ()=>{
            if (viewMode === 'hex') {
                return serialOutput.map({
                    "SerialMonitor.useMemo[displayOutput]": (line)=>toHex(line)
                }["SerialMonitor.useMemo[displayOutput]"]);
            }
            return serialOutput;
        }
    }["SerialMonitor.useMemo[displayOutput]"], [
        serialOutput,
        viewMode,
        toHex
    ]);
    // Auto-scroll to bottom when new output arrives (if enabled)
    // Using useLayoutEffect to ensure scroll happens after DOM update (fixes race condition)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "SerialMonitor.useLayoutEffect": ()=>{
            if (autoScroll && scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }["SerialMonitor.useLayoutEffect"], [
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
    const handleSendInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SerialMonitor.useCallback[handleSendInput]": ()=>{
            if (!onSendInput || !inputValue) return;
            // Add line ending based on setting
            let textToSend = inputValue;
            switch(lineEnding){
                case 'nl':
                    textToSend += '\n';
                    break;
                case 'cr':
                    textToSend += '\r';
                    break;
                case 'both':
                    textToSend += '\r\n';
                    break;
            }
            // Send each character
            for (const char of textToSend){
                onSendInput(char);
            }
            setInputValue('');
            inputRef.current?.focus();
        }
    }["SerialMonitor.useCallback[handleSendInput]"], [
        inputValue,
        lineEnding,
        onSendInput
    ]);
    const handleKeyDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SerialMonitor.useCallback[handleKeyDown]": (e)=>{
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendInput();
            }
        }
    }["SerialMonitor.useCallback[handleKeyDown]"], [
        handleSendInput
    ]);
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
                                        lineNumber: 102,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-medium text-ide-text-muted",
                                        children: isRunning ? 'Connected' : 'Disconnected'
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 108,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 101,
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
                                        lineNumber: 119,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 19200,
                                        children: "19200 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 38400,
                                        children: "38400 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 57600,
                                        children: "57600 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 115200,
                                        children: "115200 baud"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: lineEnding,
                                onChange: (e)=>setLineEnding(e.target.value),
                                className: "h-6 rounded border border-ide-border bg-ide-panel-surface px-1.5 text-[10px] text-ide-text-muted outline-none hover:border-ide-border-focus focus:border-ide-accent",
                                title: "Line ending",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "none",
                                        children: "No line ending"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 133,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "nl",
                                        children: "Newline"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 134,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "cr",
                                        children: "Carriage return"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 135,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "both",
                                        children: "Both NL & CR"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setViewMode((v)=>v === 'ascii' ? 'hex' : 'ascii'),
                                title: viewMode === 'ascii' ? 'Switch to HEX view' : 'Switch to ASCII view',
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-6 items-center gap-1 px-1.5 rounded text-[10px] font-medium transition-colors', viewMode === 'hex' ? 'bg-ide-accent/20 text-ide-accent' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$binary$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Binary$3e$__["Binary"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: viewMode === 'hex' ? 'HEX' : 'ASCII'
                                    }, void 0, false, {
                                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                        lineNumber: 154,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: scrollToBottom,
                                title: autoScroll ? 'Auto-scroll ON' : 'Scroll to bottom',
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-6 w-6 items-center justify-center rounded transition-colors', autoScroll ? 'bg-ide-success/20 text-ide-success' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__["ArrowDownToLine"], {
                                    className: "h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 158,
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
                                    lineNumber: 179,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                lineNumber: 98,
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
                                lineNumber: 193,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-ide-text-subtle/70",
                                children: isRunning ? 'Waiting for serial output...' : 'Run simulation to see output'
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 194,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 192,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                    lineNumber: 191,
                    columnNumber: 11
                }, this) : displayOutput.map((line, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-relaxed font-mono', viewMode === 'hex' ? 'text-ide-warning tracking-wide' : 'text-ide-success'),
                        children: line || '\u00A0'
                    }, index, false, {
                        fileName: "[project]/components/terminal/SerialMonitor.tsx",
                        lineNumber: 203,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            onSendInput && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-t border-ide-border px-3 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            ref: inputRef,
                            type: "text",
                            value: inputValue,
                            onChange: (e)=>setInputValue(e.target.value),
                            onKeyDown: handleKeyDown,
                            disabled: !isRunning,
                            placeholder: isRunning ? "Type here to send..." : "Start simulation to send",
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-7 flex-1 rounded border bg-ide-panel-surface px-2 font-mono text-xs', 'text-ide-text placeholder:text-ide-text-subtle', 'outline-none transition-colors', isRunning ? 'border-ide-border hover:border-ide-border-focus focus:border-ide-accent' : 'border-ide-border/50 cursor-not-allowed opacity-50')
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/SerialMonitor.tsx",
                            lineNumber: 217,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleSendInput,
                            disabled: !isRunning || !inputValue,
                            title: "Send",
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-7 w-7 items-center justify-center rounded transition-colors', isRunning && inputValue ? 'bg-ide-accent text-white hover:bg-ide-accent/80' : 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                                lineNumber: 246,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/terminal/SerialMonitor.tsx",
                            lineNumber: 234,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/terminal/SerialMonitor.tsx",
                    lineNumber: 216,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/terminal/SerialMonitor.tsx",
                lineNumber: 215,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/SerialMonitor.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
_s(SerialMonitor, "0NDIz4w1OUMfmzVrCY7Z8mOYgBg=");
_c = SerialMonitor;
var _c;
__turbopack_context__.k.register(_c, "SerialMonitor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/logicAnalyzer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLogicAnalyzer",
    ()=>getLogicAnalyzer
]);
'use client';
// Default channel colors
const CHANNEL_COLORS = [
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#f97316',
    '#ec4899'
];
/**
 * Logic Analyzer class
 */ class LogicAnalyzer {
    samples = [];
    channels = [];
    capturing = false;
    startTime = 0;
    lastChannelState = 0;
    maxSamples = 10000;
    sampleRate = 100000;
    listeners = new Set();
    updateTimer = null;
    constructor(numChannels = 8){
        // Initialize default channels
        for(let i = 0; i < numChannels; i++){
            this.channels.push({
                index: i,
                name: `CH${i}`,
                pin: i + 2,
                color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                enabled: i < 4
            });
        }
    }
    /**
     * Configure a channel
     */ configureChannel(index, config) {
        if (index >= 0 && index < this.channels.length) {
            this.channels[index] = {
                ...this.channels[index],
                ...config
            };
            this.notifyListeners();
        }
    }
    /**
     * Set channel pin mapping
     */ setChannelPin(index, pin) {
        this.configureChannel(index, {
            pin
        });
    }
    /**
     * Set channel name
     */ setChannelName(index, name) {
        this.configureChannel(index, {
            name
        });
    }
    /**
     * Enable/disable a channel
     */ setChannelEnabled(index, enabled) {
        this.configureChannel(index, {
            enabled
        });
    }
    /**
     * Start capturing
     */ startCapture() {
        if (this.capturing) return;
        this.samples = [];
        this.startTime = performance.now();
        this.capturing = true;
        this.lastChannelState = 0;
        console.log('[LogicAnalyzer] Capture started');
        this.notifyListeners();
    }
    /**
     * Stop capturing
     */ stopCapture() {
        if (!this.capturing) return;
        this.capturing = false;
        console.log(`[LogicAnalyzer] Capture stopped. ${this.samples.length} samples recorded.`);
        this.notifyListeners();
    }
    /**
     * Clear captured data
     */ clearCapture() {
        this.samples = [];
        this.lastChannelState = 0;
        this.notifyListeners();
    }
    /**
     * Record a pin state change
     * Call this from the simulation when a monitored pin changes
     */ recordPinChange(pin, high) {
        if (!this.capturing) return;
        // Find which channel this pin is mapped to
        const channel = this.channels.find((ch)=>ch.enabled && ch.pin === pin);
        if (!channel) return;
        // Update channel state bitmask
        if (high) {
            this.lastChannelState |= 1 << channel.index;
        } else {
            this.lastChannelState &= ~(1 << channel.index);
        }
        // Record sample
        const timestamp = (performance.now() - this.startTime) * 1000; // Convert to microseconds
        this.samples.push({
            timestamp,
            channels: this.lastChannelState
        });
        // Limit sample count
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        this.scheduleUpdate();
    }
    /**
     * Record all channel states at once
     * Call this for periodic sampling
     */ recordSample(channelStates) {
        if (!this.capturing) return;
        let state = 0;
        for(let i = 0; i < Math.min(channelStates.length, this.channels.length); i++){
            if (this.channels[i].enabled && channelStates[i]) {
                state |= 1 << i;
            }
        }
        // Only record if state changed
        if (state !== this.lastChannelState) {
            this.lastChannelState = state;
            const timestamp = (performance.now() - this.startTime) * 1000;
            this.samples.push({
                timestamp,
                channels: state
            });
            if (this.samples.length > this.maxSamples) {
                this.samples.shift();
            }
            this.scheduleUpdate();
        }
    }
    /**
     * Get current state
     */ getState() {
        return {
            capturing: this.capturing,
            samples: [
                ...this.samples
            ],
            channels: this.channels.map((ch)=>({
                    ...ch
                })),
            startTime: this.startTime,
            maxSamples: this.maxSamples,
            sampleRate: this.sampleRate
        };
    }
    /**
     * Get samples in a time range
     */ getSamplesInRange(startUs, endUs) {
        return this.samples.filter((s)=>s.timestamp >= startUs && s.timestamp <= endUs);
    }
    /**
     * Calculate frequency of a channel (Hz)
     */ measureFrequency(channelIndex) {
        if (this.samples.length < 2) return null;
        const mask = 1 << channelIndex;
        const edges = [];
        let lastState = false;
        for (const sample of this.samples){
            const high = (sample.channels & mask) !== 0;
            if (high && !lastState) {
                edges.push(sample.timestamp);
            }
            lastState = high;
        }
        if (edges.length < 2) return null;
        // Calculate average period
        let totalPeriod = 0;
        for(let i = 1; i < edges.length; i++){
            totalPeriod += edges[i] - edges[i - 1];
        }
        const avgPeriodUs = totalPeriod / (edges.length - 1);
        return avgPeriodUs > 0 ? 1000000 / avgPeriodUs : null;
    }
    /**
     * Calculate duty cycle of a channel (0-100%)
     */ measureDutyCycle(channelIndex) {
        if (this.samples.length < 2) return null;
        const mask = 1 << channelIndex;
        let highTime = 0;
        let totalTime = 0;
        for(let i = 1; i < this.samples.length; i++){
            const duration = this.samples[i].timestamp - this.samples[i - 1].timestamp;
            const wasHigh = (this.samples[i - 1].channels & mask) !== 0;
            if (wasHigh) {
                highTime += duration;
            }
            totalTime += duration;
        }
        return totalTime > 0 ? highTime / totalTime * 100 : null;
    }
    /**
     * Export samples as CSV
     */ exportCSV() {
        const enabledChannels = this.channels.filter((ch)=>ch.enabled);
        const header = [
            'Timestamp (µs)',
            ...enabledChannels.map((ch)=>ch.name)
        ].join(',');
        const rows = this.samples.map((sample)=>{
            const values = [
                sample.timestamp.toFixed(2)
            ];
            for (const ch of enabledChannels){
                values.push((sample.channels & 1 << ch.index) !== 0 ? '1' : '0');
            }
            return values.join(',');
        });
        return [
            header,
            ...rows
        ].join('\n');
    }
    /**
     * Subscribe to state changes
     */ subscribe(listener) {
        this.listeners.add(listener);
        listener(this.getState());
        return ()=>this.listeners.delete(listener);
    }
    /**
     * Set max samples
     */ setMaxSamples(max) {
        this.maxSamples = Math.max(100, Math.min(100000, max));
    }
    scheduleUpdate() {
        // Debounce to ~30fps for UI updates
        if (this.updateTimer) return;
        this.updateTimer = setTimeout(()=>{
            this.notifyListeners();
            this.updateTimer = null;
        }, 33);
    }
    notifyListeners() {
        const state = this.getState();
        for (const listener of this.listeners){
            listener(state);
        }
    }
}
// Singleton instance
let logicAnalyzerInstance = null;
function getLogicAnalyzer() {
    if (!logicAnalyzerInstance) {
        logicAnalyzerInstance = new LogicAnalyzer();
    }
    return logicAnalyzerInstance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LogicAnalyzerPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogicAnalyzerPanel",
    ()=>LogicAnalyzerPanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/logicAnalyzer.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function LogicAnalyzerPanel({ className }) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [timeScale, setTimeScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1000); // µs per division
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Subscribe to logic analyzer state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicAnalyzerPanel.useEffect": ()=>{
            const analyzer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])();
            const unsubscribe = analyzer.subscribe(setState);
            return unsubscribe;
        }
    }["LogicAnalyzerPanel.useEffect"], []);
    // Render waveforms
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicAnalyzerPanel.useEffect": ()=>{
            if (!state || !canvasRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            // Clear canvas
            ctx.fillStyle = '#0f0f0f';
            ctx.fillRect(0, 0, width, height);
            // Draw grid
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            const divisions = 10;
            for(let i = 0; i <= divisions; i++){
                const x = width / divisions * i;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            // Get enabled channels
            const enabledChannels = state.channels.filter({
                "LogicAnalyzerPanel.useEffect.enabledChannels": (ch)=>ch.enabled
            }["LogicAnalyzerPanel.useEffect.enabledChannels"]);
            if (enabledChannels.length === 0) return;
            const channelHeight = height / enabledChannels.length;
            const samples = state.samples;
            if (samples.length === 0) return;
            // Calculate time range
            const endTime = samples[samples.length - 1]?.timestamp || 0;
            const startTime = Math.max(0, endTime - timeScale * divisions);
            // Draw each channel
            enabledChannels.forEach({
                "LogicAnalyzerPanel.useEffect": (channel, idx)=>{
                    const y0 = idx * channelHeight;
                    const highY = y0 + 10;
                    const lowY = y0 + channelHeight - 10;
                    // Draw channel label
                    ctx.fillStyle = channel.color;
                    ctx.font = '12px monospace';
                    ctx.fillText(channel.name, 5, y0 + 20);
                    // Draw waveform
                    ctx.strokeStyle = channel.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    let lastX = 0;
                    let lastY = lowY;
                    const mask = 1 << channel.index;
                    for (const sample of samples){
                        if (sample.timestamp < startTime) continue;
                        const x = (sample.timestamp - startTime) / (timeScale * divisions) * width;
                        const high = (sample.channels & mask) !== 0;
                        const y = high ? highY : lowY;
                        if (lastX === 0) {
                            ctx.moveTo(0, y);
                        } else {
                            // Draw vertical transition
                            if (y !== lastY) {
                                ctx.lineTo(x, lastY);
                                ctx.lineTo(x, y);
                            }
                        }
                        ctx.lineTo(x, y);
                        lastX = x;
                        lastY = y;
                    }
                    // Extend to edge
                    ctx.lineTo(width, lastY);
                    ctx.stroke();
                    // Draw separator line
                    if (idx < enabledChannels.length - 1) {
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(0, y0 + channelHeight);
                        ctx.lineTo(width, y0 + channelHeight);
                        ctx.stroke();
                    }
                }
            }["LogicAnalyzerPanel.useEffect"]);
        }
    }["LogicAnalyzerPanel.useEffect"], [
        state,
        timeScale
    ]);
    const handleStartCapture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicAnalyzerPanel.useCallback[handleStartCapture]": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().startCapture();
        }
    }["LogicAnalyzerPanel.useCallback[handleStartCapture]"], []);
    const handleStopCapture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicAnalyzerPanel.useCallback[handleStopCapture]": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().stopCapture();
        }
    }["LogicAnalyzerPanel.useCallback[handleStopCapture]"], []);
    const handleClear = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicAnalyzerPanel.useCallback[handleClear]": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().clearCapture();
        }
    }["LogicAnalyzerPanel.useCallback[handleClear]"], []);
    const handleExport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicAnalyzerPanel.useCallback[handleExport]": ()=>{
            const csv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().exportCSV();
            const blob = new Blob([
                csv
            ], {
                type: 'text/csv'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'logic_capture.csv';
            link.click();
            URL.revokeObjectURL(url);
        }
    }["LogicAnalyzerPanel.useCallback[handleExport]"], []);
    const toggleChannel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicAnalyzerPanel.useCallback[toggleChannel]": (index)=>{
            const analyzer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])();
            const channel = state?.channels[index];
            if (channel) {
                analyzer.setChannelEnabled(index, !channel.enabled);
            }
        }
    }["LogicAnalyzerPanel.useCallback[toggleChannel]"], [
        state
    ]);
    if (!state) return null;
    // Calculate measurements for enabled channels
    const measurements = state.channels.filter((ch)=>ch.enabled).map((ch)=>({
            ...ch,
            frequency: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().measureFrequency(ch.index),
            dutyCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$logicAnalyzer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLogicAnalyzer"])().measureDutyCycle(ch.index)
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col h-full bg-ide-panel', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 border-b border-ide-border px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                        className: "h-4 w-4 text-ide-accent"
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 189,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-semibold text-ide-text",
                        children: "Logic Analyzer"
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 190,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 192,
                        columnNumber: 17
                    }, this),
                    !state.capturing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleStartCapture,
                        className: "flex items-center gap-1 px-2 py-1 text-xs bg-ide-success/20 text-ide-success rounded hover:bg-ide-success/30 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                lineNumber: 199,
                                columnNumber: 25
                            }, this),
                            "Capture"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 195,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleStopCapture,
                        className: "flex items-center gap-1 px-2 py-1 text-xs bg-ide-error/20 text-ide-error rounded hover:bg-ide-error/30 transition-colors",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                lineNumber: 207,
                                columnNumber: 25
                            }, this),
                            "Stop"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 203,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClear,
                        className: "p-1.5 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded transition-colors",
                        title: "Clear",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 217,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 212,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleExport,
                        className: "p-1.5 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded transition-colors",
                        title: "Export CSV",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 225,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 220,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setShowSettings(!showSettings),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('p-1.5 rounded transition-colors', showSettings ? 'text-ide-accent bg-ide-accent/20' : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'),
                        title: "Settings",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 238,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                        lineNumber: 228,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                lineNumber: 188,
                columnNumber: 13
            }, this),
            showSettings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-ide-border p-3 bg-ide-panel-hover",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-ide-text-muted",
                                    children: "Time/div:"
                                }, void 0, false, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 248,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: timeScale,
                                    onChange: (e)=>setTimeScale(Number(e.target.value)),
                                    className: "text-xs bg-ide-bg border border-ide-border rounded px-2 py-1 text-ide-text",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 100,
                                            children: "100µs"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 254,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 500,
                                            children: "500µs"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 255,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 1000,
                                            children: "1ms"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 256,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 5000,
                                            children: "5ms"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 257,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 10000,
                                            children: "10ms"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 258,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: 50000,
                                            children: "50ms"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                            lineNumber: 259,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 249,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 247,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-ide-text-muted",
                                    children: "Channels:"
                                }, void 0, false, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 265,
                                    columnNumber: 29
                                }, this),
                                state.channels.map((ch)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleChannel(ch.index),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-2 py-0.5 text-xs rounded border transition-colors', ch.enabled ? 'border-current bg-current/20' : 'border-ide-border text-ide-text-muted'),
                                        style: {
                                            color: ch.enabled ? ch.color : undefined
                                        },
                                        children: ch.name
                                    }, ch.index, false, {
                                        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                        lineNumber: 267,
                                        columnNumber: 33
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 264,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                    lineNumber: 245,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                lineNumber: 244,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "flex-1 min-h-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                    ref: canvasRef,
                    className: "w-full h-full"
                }, void 0, false, {
                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                    lineNumber: 288,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                lineNumber: 287,
                columnNumber: 13
            }, this),
            measurements.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-ide-border p-2 bg-ide-panel-hover",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-4",
                    children: measurements.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 text-xs",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                    className: "h-3 w-3",
                                    style: {
                                        color: m.color
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 300,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-ide-text-muted",
                                    children: [
                                        m.name,
                                        ":"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 301,
                                    columnNumber: 33
                                }, this),
                                m.frequency !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-ide-text",
                                    children: m.frequency > 1000 ? `${(m.frequency / 1000).toFixed(2)} kHz` : `${m.frequency.toFixed(2)} Hz`
                                }, void 0, false, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 303,
                                    columnNumber: 37
                                }, this),
                                m.dutyCycle !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-ide-text-muted",
                                    children: [
                                        "(",
                                        m.dutyCycle.toFixed(1),
                                        "%)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                                    lineNumber: 310,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, m.index, true, {
                            fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                            lineNumber: 299,
                            columnNumber: 29
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                    lineNumber: 297,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                lineNumber: 296,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-ide-border px-3 py-1 text-xs text-ide-text-muted",
                children: [
                    state.samples.length,
                    " samples ",
                    state.capturing && '• Recording...'
                ]
            }, void 0, true, {
                fileName: "[project]/components/LogicAnalyzerPanel.tsx",
                lineNumber: 321,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LogicAnalyzerPanel.tsx",
        lineNumber: 186,
        columnNumber: 9
    }, this);
}
_s(LogicAnalyzerPanel, "31xuvm9GByKFkPM5g5wNKDuC3qo=");
_c = LogicAnalyzerPanel;
const __TURBOPACK__default__export__ = LogicAnalyzerPanel;
var _c;
__turbopack_context__.k.register(_c, "LogicAnalyzerPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/wifiMock.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWiFiMock",
    ()=>getWiFiMock
]);
'use client';
/**
 * Default available networks for simulation
 */ const DEFAULT_NETWORKS = [
    {
        ssid: 'SimulatedWiFi',
        rssi: -45,
        encryption: 'WPA2_PSK',
        channel: 6
    },
    {
        ssid: 'TestNetwork',
        rssi: -65,
        encryption: 'WPA2_PSK',
        channel: 1
    },
    {
        ssid: 'OpenNetwork',
        rssi: -72,
        encryption: 'OPEN',
        channel: 11
    },
    {
        ssid: 'FUNDI_Lab',
        rssi: -55,
        encryption: 'WPA3_PSK',
        channel: 6
    }
];
/**
 * Mock HTTP responses for common endpoints
 */ const MOCK_RESPONSES = {
    'https://httpbin.org/get': {
        status: 200,
        body: JSON.stringify({
            args: {},
            headers: {
                'User-Agent': 'ESP32/1.0'
            },
            origin: '192.168.1.100',
            url: 'https://httpbin.org/get'
        })
    },
    'https://api.github.com': {
        status: 200,
        body: JSON.stringify({
            message: 'GitHub API Mock'
        })
    },
    'https://jsonplaceholder.typicode.com/todos/1': {
        status: 200,
        body: JSON.stringify({
            userId: 1,
            id: 1,
            title: 'Mock todo item',
            completed: false
        })
    }
};
/**
 * WiFi Mock Implementation
 */ class WiFiMock {
    mode = 'OFF';
    status = 'WL_IDLE_STATUS';
    ssid = null;
    localIP = '0.0.0.0';
    gatewayIP = '0.0.0.0';
    subnetMask = '255.255.255.0';
    dns = '8.8.8.8';
    macAddress = 'AA:BB:CC:DD:EE:FF';
    hostname = 'esp32-device';
    rssi = 0;
    availableNetworks = [
        ...DEFAULT_NETWORKS
    ];
    isScanning = false;
    pendingRequests = [];
    completedRequests = [];
    listeners = new Set();
    requestIdCounter = 0;
    /**
     * Set WiFi mode
     */ setMode(mode) {
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
     */ connect(ssid, password) {
        return new Promise((resolve)=>{
            if (this.mode === 'OFF') {
                this.mode = 'STA';
            }
            this.status = 'WL_IDLE_STATUS';
            this.notifyListeners();
            // Find the network
            const network = this.availableNetworks.find((n)=>n.ssid === ssid);
            // Simulate connection delay
            setTimeout(()=>{
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
     */ disconnect() {
        this.ssid = null;
        this.localIP = '0.0.0.0';
        this.rssi = 0;
        this.status = 'WL_DISCONNECTED';
        console.log('[WiFiMock] Disconnected');
        this.notifyListeners();
    }
    /**
     * Scan for networks
     */ scanNetworks() {
        return new Promise((resolve)=>{
            this.isScanning = true;
            this.notifyListeners();
            // Simulate scan time
            setTimeout(()=>{
                // Add some randomness to RSSI values
                this.availableNetworks = this.availableNetworks.map((n)=>({
                        ...n,
                        rssi: n.rssi + Math.floor(Math.random() * 10 - 5)
                    }));
                this.isScanning = false;
                this.status = 'WL_SCAN_COMPLETED';
                console.log(`[WiFiMock] Scan complete, found ${this.availableNetworks.length} networks`);
                this.notifyListeners();
                resolve([
                    ...this.availableNetworks
                ]);
            }, 2000); // 2s scan time
        });
    }
    /**
     * Set hostname
     */ setHostname(name) {
        this.hostname = name;
        this.notifyListeners();
    }
    /**
     * Add a mock network
     */ addMockNetwork(network) {
        this.availableNetworks.push(network);
        this.notifyListeners();
    }
    /**
     * Make an HTTP request
     */ httpRequest(method, url, options) {
        return new Promise((resolve, reject)=>{
            if (this.status !== 'WL_CONNECTED') {
                reject(new Error('Not connected to WiFi'));
                return;
            }
            const request = {
                id: `req_${++this.requestIdCounter}`,
                method,
                url,
                headers: options?.headers,
                body: options?.body,
                timestamp: Date.now()
            };
            this.pendingRequests.push(request);
            console.log(`[WiFiMock] HTTP ${method} ${url}`);
            this.notifyListeners();
            // Simulate network delay
            setTimeout(()=>{
                // Remove from pending
                this.pendingRequests = this.pendingRequests.filter((r)=>r.id !== request.id);
                // Find mock response or generate default
                const mockResponse = MOCK_RESPONSES[url];
                const response = {
                    requestId: request.id,
                    statusCode: mockResponse?.status || 200,
                    headers: mockResponse?.headers || {
                        'Content-Type': 'application/json'
                    },
                    body: mockResponse?.body || JSON.stringify({
                        mock: true,
                        url
                    }),
                    timestamp: Date.now()
                };
                this.completedRequests.push({
                    request,
                    response
                });
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
     */ get(url) {
        return this.httpRequest('GET', url);
    }
    /**
     * Shorthand for POST request
     */ post(url, body, contentType = 'application/json') {
        return this.httpRequest('POST', url, {
            headers: {
                'Content-Type': contentType
            },
            body
        });
    }
    /**
     * Get current state
     */ getState() {
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
            availableNetworks: [
                ...this.availableNetworks
            ],
            isScanning: this.isScanning,
            pendingRequests: [
                ...this.pendingRequests
            ],
            completedRequests: [
                ...this.completedRequests
            ]
        };
    }
    /**
     * Check if connected
     */ isConnected() {
        return this.status === 'WL_CONNECTED';
    }
    /**
     * Get local IP
     */ getLocalIP() {
        return this.localIP;
    }
    /**
     * Subscribe to state changes
     */ subscribe(listener) {
        this.listeners.add(listener);
        listener(this.getState());
        return ()=>this.listeners.delete(listener);
    }
    /**
     * Reset to initial state
     */ reset() {
        this.mode = 'OFF';
        this.status = 'WL_IDLE_STATUS';
        this.ssid = null;
        this.localIP = '0.0.0.0';
        this.gatewayIP = '0.0.0.0';
        this.rssi = 0;
        this.isScanning = false;
        this.pendingRequests = [];
        this.completedRequests = [];
        this.availableNetworks = [
            ...DEFAULT_NETWORKS
        ];
        this.notifyListeners();
    }
    notifyListeners() {
        const state = this.getState();
        for (const listener of this.listeners){
            listener(state);
        }
    }
}
// Singleton instance
let wifiMockInstance = null;
function getWiFiMock() {
    if (!wifiMockInstance) {
        wifiMockInstance = new WiFiMock();
    }
    return wifiMockInstance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/mqttMock.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMQTTMock",
    ()=>getMQTTMock
]);
'use client';
/**
 * MQTT Mock Implementation
 */ class MQTTMock {
    connected = false;
    clientId = '';
    broker = 'mqtt://mock-broker';
    port = 1883;
    subscriptions = new Map();
    retainedMessages = new Map();
    publishedMessages = [];
    receivedMessages = [];
    lastWill;
    listeners = new Set();
    /**
     * Connect to MQTT broker
     */ connect(options = {}) {
        return new Promise((resolve)=>{
            this.broker = options.broker || 'mqtt://mock-broker';
            this.port = options.port || 1883;
            this.clientId = options.clientId || `fundi_${Date.now()}`;
            this.lastWill = options.lastWill;
            console.log(`[MQTTMock] Connecting to ${this.broker}:${this.port} as ${this.clientId}`);
            // Simulate connection delay
            setTimeout(()=>{
                this.connected = true;
                console.log('[MQTTMock] Connected');
                this.notifyListeners();
                resolve(true);
            }, 500);
        });
    }
    /**
     * Disconnect from broker
     */ disconnect() {
        if (!this.connected) return;
        // Trigger last will if configured
        if (this.lastWill) {
            this.publish(this.lastWill.topic, this.lastWill.payload, {
                qos: this.lastWill.qos,
                retain: this.lastWill.retain
            });
        }
        this.connected = false;
        this.subscriptions.clear();
        console.log('[MQTTMock] Disconnected');
        this.notifyListeners();
    }
    /**
     * Subscribe to a topic
     */ subscribe(topic, callback, qos = 0) {
        if (!this.connected) {
            console.warn('[MQTTMock] Cannot subscribe: not connected');
            return;
        }
        const subscription = {
            topic,
            qos,
            callback
        };
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, []);
        }
        this.subscriptions.get(topic).push(subscription);
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
     */ unsubscribe(topic) {
        if (this.subscriptions.delete(topic)) {
            console.log(`[MQTTMock] Unsubscribed from: ${topic}`);
            this.notifyListeners();
        }
    }
    /**
     * Publish a message to a topic
     */ publish(topic, payload, options = {}) {
        if (!this.connected) {
            console.warn('[MQTTMock] Cannot publish: not connected');
            return;
        }
        const message = {
            topic,
            payload,
            qos: options.qos || 0,
            retain: options.retain || false,
            timestamp: Date.now()
        };
        this.publishedMessages.push(message);
        console.log(`[MQTTMock] Published to ${topic}: ${typeof payload === 'string' ? payload : `(${payload.length} bytes)`}`);
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
     */ simulateIncoming(topic, payload, options = {}) {
        const message = {
            topic,
            payload,
            qos: options.qos || 0,
            retain: options.retain || false,
            timestamp: Date.now()
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
     */ deliverMessage(message) {
        // Check each subscription for topic match
        for (const [pattern, subscribers] of this.subscriptions){
            if (this.topicMatches(pattern, message.topic)) {
                for (const sub of subscribers){
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
     */ topicMatches(pattern, topic) {
        const patternParts = pattern.split('/');
        const topicParts = topic.split('/');
        for(let i = 0; i < patternParts.length; i++){
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
     */ getState() {
        return {
            connected: this.connected,
            clientId: this.clientId,
            broker: this.broker,
            port: this.port,
            subscriptions: Array.from(this.subscriptions.keys()),
            publishedMessages: [
                ...this.publishedMessages
            ],
            receivedMessages: [
                ...this.receivedMessages
            ],
            lastWill: this.lastWill
        };
    }
    /**
     * Check if connected
     */ isConnected() {
        return this.connected;
    }
    /**
     * Subscribe to state changes
     */ subscribeToState(listener) {
        this.listeners.add(listener);
        listener(this.getState());
        return ()=>this.listeners.delete(listener);
    }
    /**
     * Reset to initial state
     */ reset() {
        this.disconnect();
        this.publishedMessages = [];
        this.receivedMessages = [];
        this.retainedMessages.clear();
        this.lastWill = undefined;
        this.notifyListeners();
    }
    notifyListeners() {
        const state = this.getState();
        for (const listener of this.listeners){
            listener(state);
        }
    }
}
// Singleton instance
let mqttMockInstance = null;
function getMQTTMock() {
    if (!mqttMockInstance) {
        mqttMockInstance = new MQTTMock();
    }
    return mqttMockInstance;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/NetworkPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NetworkPanel",
    ()=>NetworkPanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$signal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Signal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/signal.js [app-client] (ecmascript) <export default as Signal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.js [app-client] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$wifiMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/wifiMock.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/mqttMock.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function NetworkPanel({ className, boardType }) {
    _s();
    const [wifiState, setWifiState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mqttState, setMqttState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('wifi');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedSSID, setSelectedSSID] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mqttTopic, setMqttTopic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [mqttMessage, setMqttMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Only show for ESP32 boards
    const isESP32 = boardType?.toLowerCase().includes('esp32');
    // Subscribe to WiFi state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NetworkPanel.useEffect": ()=>{
            const wifi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$wifiMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWiFiMock"])();
            const unsubscribe = wifi.subscribe(setWifiState);
            return unsubscribe;
        }
    }["NetworkPanel.useEffect"], []);
    // Subscribe to MQTT state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NetworkPanel.useEffect": ()=>{
            const mqtt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMQTTMock"])();
            const unsubscribe = mqtt.subscribeToState(setMqttState);
            return unsubscribe;
        }
    }["NetworkPanel.useEffect"], []);
    const handleScan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleScan]": async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$wifiMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWiFiMock"])().scanNetworks();
        }
    }["NetworkPanel.useCallback[handleScan]"], []);
    const handleConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleConnect]": async ()=>{
            if (!selectedSSID) return;
            const success = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$wifiMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWiFiMock"])().connect(selectedSSID, password);
            if (success) {
                setPassword('');
                setSelectedSSID(null);
            }
        }
    }["NetworkPanel.useCallback[handleConnect]"], [
        selectedSSID,
        password
    ]);
    const handleDisconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleDisconnect]": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$wifiMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWiFiMock"])().disconnect();
        }
    }["NetworkPanel.useCallback[handleDisconnect]"], []);
    const handleMqttConnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleMqttConnect]": async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMQTTMock"])().connect({
                broker: 'mqtt://mock-broker',
                clientId: `fundi_${Date.now()}`
            });
        }
    }["NetworkPanel.useCallback[handleMqttConnect]"], []);
    const handleMqttDisconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleMqttDisconnect]": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMQTTMock"])().disconnect();
        }
    }["NetworkPanel.useCallback[handleMqttDisconnect]"], []);
    const handlePublish = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handlePublish]": ()=>{
            if (!mqttTopic || !mqttMessage) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMQTTMock"])().publish(mqttTopic, mqttMessage);
            setMqttMessage('');
        }
    }["NetworkPanel.useCallback[handlePublish]"], [
        mqttTopic,
        mqttMessage
    ]);
    const handleSubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NetworkPanel.useCallback[handleSubscribe]": ()=>{
            if (!mqttTopic) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$mqttMock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMQTTMock"])().subscribe(mqttTopic, {
                "NetworkPanel.useCallback[handleSubscribe]": (msg)=>{
                    console.log('[MQTT] Received:', msg);
                }
            }["NetworkPanel.useCallback[handleSubscribe]"]);
            setMqttTopic('');
        }
    }["NetworkPanel.useCallback[handleSubscribe]"], [
        mqttTopic
    ]);
    if (!isESP32) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center justify-center h-full text-ide-text-muted text-sm', className),
            children: "Network features available for ESP32 boards only"
        }, void 0, false, {
            fileName: "[project]/components/NetworkPanel.tsx",
            lineNumber: 96,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col h-full bg-ide-panel', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex border-b border-ide-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('wifi'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors', activeTab === 'wifi' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 115,
                                columnNumber: 21
                            }, this),
                            "WiFi"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 106,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('mqtt'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors', activeTab === 'mqtt' ? 'text-ide-accent border-b-2 border-ide-accent' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 127,
                                columnNumber: 21
                            }, this),
                            "MQTT"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 118,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/NetworkPanel.tsx",
                lineNumber: 105,
                columnNumber: 13
            }, this),
            activeTab === 'wifi' && wifiState && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto p-3 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    wifiState.status === 'WL_CONNECTED' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                        className: "h-4 w-4 text-ide-success"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 139,
                                        columnNumber: 33
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                                        className: "h-4 w-4 text-ide-text-muted"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 141,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-ide-text",
                                        children: wifiState.status === 'WL_CONNECTED' ? `Connected to ${wifiState.ssid}` : 'Disconnected'
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 143,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 137,
                                columnNumber: 25
                            }, this),
                            wifiState.status === 'WL_CONNECTED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleDisconnect,
                                className: "text-xs text-ide-error hover:underline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 150,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 136,
                        columnNumber: 21
                    }, this),
                    wifiState.status === 'WL_CONNECTED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-ide-text-muted space-y-1 bg-ide-bg rounded p-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "IP: ",
                                    wifiState.localIP
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 162,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Gateway: ",
                                    wifiState.gatewayIP
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 163,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "RSSI: ",
                                    wifiState.rssi,
                                    " dBm"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 164,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 161,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-ide-text",
                                        children: "Available Networks"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 171,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleScan,
                                        disabled: wifiState.isScanning,
                                        className: "p-1 text-ide-text-muted hover:text-ide-text disabled:opacity-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-3.5 w-3.5', wifiState.isScanning && 'animate-spin')
                                        }, void 0, false, {
                                            fileName: "[project]/components/NetworkPanel.tsx",
                                            lineNumber: 177,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 172,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 170,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: wifiState.availableNetworks.map((network)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setSelectedSSID(network.ssid),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full flex items-center justify-between p-2 rounded text-left transition-colors', selectedSSID === network.ssid ? 'bg-ide-accent/20 border border-ide-accent' : 'bg-ide-bg hover:bg-ide-panel-hover'),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    network.encryption === 'OPEN' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
                                                        className: "h-3 w-3 text-ide-text-muted"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 45
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                        className: "h-3 w-3 text-ide-text-muted"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 197,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-ide-text",
                                                        children: network.ssid
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/NetworkPanel.tsx",
                                                lineNumber: 193,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$signal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Signal$3e$__["Signal"], {
                                                        className: "h-3 w-3 text-ide-text-muted"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-ide-text-muted",
                                                        children: [
                                                            network.rssi,
                                                            " dBm"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 203,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/NetworkPanel.tsx",
                                                lineNumber: 201,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, network.ssid, true, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 183,
                                        columnNumber: 33
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 181,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 169,
                        columnNumber: 21
                    }, this),
                    selectedSSID && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 pt-2 border-t border-ide-border",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-ide-text",
                                children: [
                                    "Connect to: ",
                                    selectedSSID
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 213,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "password",
                                placeholder: "Password (or leave empty for open)",
                                value: password,
                                onChange: (e)=>setPassword(e.target.value),
                                className: "w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 214,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleConnect,
                                className: "w-full py-1.5 text-xs bg-ide-accent text-white rounded hover:bg-ide-accent/80 transition-colors",
                                children: "Connect"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 221,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 212,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/NetworkPanel.tsx",
                lineNumber: 134,
                columnNumber: 17
            }, this),
            activeTab === 'mqtt' && mqttState && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto p-3 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-2 w-2 rounded-full', mqttState.connected ? 'bg-ide-success' : 'bg-ide-text-muted')
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 238,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-ide-text",
                                        children: mqttState.connected ? 'Connected' : 'Disconnected'
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 242,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 237,
                                columnNumber: 25
                            }, this),
                            mqttState.connected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleMqttDisconnect,
                                className: "text-xs text-ide-error hover:underline",
                                children: "Disconnect"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 247,
                                columnNumber: 29
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleMqttConnect,
                                className: "text-xs text-ide-accent hover:underline",
                                children: "Connect"
                            }, void 0, false, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 254,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/NetworkPanel.tsx",
                        lineNumber: 236,
                        columnNumber: 21
                    }, this),
                    mqttState.connected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-ide-text-muted bg-ide-bg rounded p-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Broker: ",
                                            mqttState.broker
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 267,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Client: ",
                                            mqttState.clientId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 268,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 266,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Topic (e.g., sensors/temp)",
                                        value: mqttTopic,
                                        onChange: (e)=>setMqttTopic(e.target.value),
                                        className: "w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 273,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleSubscribe,
                                        disabled: !mqttTopic,
                                        className: "w-full py-1 text-xs bg-ide-panel-hover text-ide-text rounded hover:bg-ide-border disabled:opacity-50 transition-colors",
                                        children: "Subscribe"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 280,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 272,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2 pt-2 border-t border-ide-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-ide-text",
                                        children: "Publish"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 291,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Message",
                                        value: mqttMessage,
                                        onChange: (e)=>setMqttMessage(e.target.value),
                                        className: "w-full px-2 py-1.5 text-xs bg-ide-bg border border-ide-border rounded text-ide-text focus:outline-none focus:border-ide-accent"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 292,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handlePublish,
                                        disabled: !mqttTopic || !mqttMessage,
                                        className: "w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-ide-accent text-white rounded hover:bg-ide-accent/80 disabled:opacity-50 transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                className: "h-3 w-3"
                                            }, void 0, false, {
                                                fileName: "[project]/components/NetworkPanel.tsx",
                                                lineNumber: 304,
                                                columnNumber: 37
                                            }, this),
                                            "Publish"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 299,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 290,
                                columnNumber: 29
                            }, this),
                            mqttState.subscriptions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1 pt-2 border-t border-ide-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-ide-text",
                                        children: "Subscriptions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 312,
                                        columnNumber: 37
                                    }, this),
                                    mqttState.subscriptions.map((topic)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-ide-text-muted bg-ide-bg rounded px-2 py-1",
                                            children: topic
                                        }, topic, false, {
                                            fileName: "[project]/components/NetworkPanel.tsx",
                                            lineNumber: 314,
                                            columnNumber: 41
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 311,
                                columnNumber: 33
                            }, this),
                            mqttState.publishedMessages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1 pt-2 border-t border-ide-border",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium text-ide-text",
                                        children: "Recent Messages"
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 324,
                                        columnNumber: 37
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-h-32 overflow-auto space-y-1",
                                        children: mqttState.publishedMessages.slice(-5).reverse().map((msg, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs bg-ide-bg rounded px-2 py-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-ide-accent",
                                                        children: msg.topic
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 328,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-ide-text-muted",
                                                        children: " → "
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 49
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-ide-text",
                                                        children: typeof msg.payload === 'string' ? msg.payload : '[binary]'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/NetworkPanel.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/components/NetworkPanel.tsx",
                                                lineNumber: 327,
                                                columnNumber: 45
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/NetworkPanel.tsx",
                                        lineNumber: 325,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NetworkPanel.tsx",
                                lineNumber: 323,
                                columnNumber: 33
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/components/NetworkPanel.tsx",
                lineNumber: 234,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/NetworkPanel.tsx",
        lineNumber: 103,
        columnNumber: 9
    }, this);
}
_s(NetworkPanel, "XU2pK5jXyOCW6NxeqCNkhSUKvT8=");
_c = NetworkPanel;
const __TURBOPACK__default__export__ = NetworkPanel;
var _c;
__turbopack_context__.k.register(_c, "NetworkPanel");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$CommandInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/CommandInterface.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$SerialMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/terminal/SerialMonitor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LogicAnalyzerPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LogicAnalyzerPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NetworkPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/NetworkPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function TerminalPanel({ serialOutput, onClearSerial, isSimulationRunning, onSendSerialInput, boardType }) {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('assistant');
    const isESP32 = boardType?.toLowerCase().includes('esp32');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden bg-ide-panel-bg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface overflow-x-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('serial'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap', activeTab === 'serial' ? 'border-b-2 border-ide-success text-ide-success' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Serial"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            isSimulationRunning && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-ide-success"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 51,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('assistant'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap', activeTab === 'assistant' ? 'border-b-2 border-ide-accent text-ide-accent' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "AI Assistant ✨"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('logic'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap', activeTab === 'logic' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Logic Analyzer"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 78,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    isESP32 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab('network'),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap', activeTab === 'network' ? 'border-b-2 border-cyan-500 text-cyan-500' : 'text-ide-text-muted hover:text-ide-text'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                                className: "h-3.5 w-3.5"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 91,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Network"
                            }, void 0, false, {
                                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1",
                children: [
                    activeTab === 'serial' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$SerialMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SerialMonitor"], {
                        serialOutput: serialOutput,
                        onClear: onClearSerial,
                        isRunning: isSimulationRunning,
                        onSendInput: onSendSerialInput
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 100,
                        columnNumber: 11
                    }, this),
                    activeTab === 'assistant' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$terminal$2f$CommandInterface$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandInterface"], {}, void 0, false, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this),
                    activeTab === 'logic' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LogicAnalyzerPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LogicAnalyzerPanel"], {}, void 0, false, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    activeTab === 'network' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NetworkPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NetworkPanel"], {
                        boardType: boardType
                    }, void 0, false, {
                        fileName: "[project]/components/terminal/TerminalPanel.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/terminal/TerminalPanel.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/terminal/TerminalPanel.tsx",
        lineNumber: 35,
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
"[project]/lib/featuredProjects.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "convertToFundiCircuit",
    ()=>convertToFundiCircuit,
    "convertWokwiConnection",
    ()=>convertWokwiConnection,
    "getFeaturedProject",
    ()=>getFeaturedProject,
    "getFeaturedProjects",
    ()=>getFeaturedProjects,
    "getProjectsByDifficulty",
    ()=>getProjectsByDifficulty,
    "searchProjectsByTag",
    ()=>searchProjectsByTag
]);
'use client';
// Static featured projects data
const FEATURED_PROJECTS = [
    {
        id: "blink-led",
        name: "Blink LED",
        description: "Classic Arduino starter project - blink the built-in LED on pin 13",
        difficulty: "beginner",
        tags: [
            "led",
            "digital-output",
            "starter"
        ],
        estimatedTime: "5 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-led",
                    id: "led1",
                    top: -100,
                    left: 150,
                    attrs: {
                        color: "red"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -60,
                    left: 150,
                    attrs: {
                        value: "220"
                    }
                }
            ],
            connections: [
                [
                    "uno:13",
                    "r1:1",
                    "green",
                    [
                        "h0"
                    ]
                ],
                [
                    "r1:2",
                    "led1:A",
                    "green",
                    [
                        "v0"
                    ]
                ],
                [
                    "led1:C",
                    "uno:GND.1",
                    "black",
                    [
                        "v20",
                        "h-50"
                    ]
                ]
            ]
        },
        code: `// Blink LED - Classic Arduino Starter
// Turns on an LED for 1 second, then off for 1 second, repeatedly.

const int LED_PIN = 13;

void setup() {
  // Initialize the LED pin as output
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink LED started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Turn LED on
  Serial.println("LED ON");
  delay(1000);                   // Wait 1 second
  
  digitalWrite(LED_PIN, LOW);   // Turn LED off
  Serial.println("LED OFF");
  delay(1000);                   // Wait 1 second
}`
    },
    {
        id: "traffic-light",
        name: "Traffic Light Controller",
        description: "Simulate a traffic light with red, yellow, and green LEDs cycling through states",
        difficulty: "beginner",
        tags: [
            "led",
            "digital-output",
            "timing",
            "state-machine"
        ],
        estimatedTime: "10 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-led",
                    id: "led-red",
                    top: -150,
                    left: 150,
                    attrs: {
                        color: "red"
                    }
                },
                {
                    type: "wokwi-led",
                    id: "led-yellow",
                    top: -150,
                    left: 200,
                    attrs: {
                        color: "yellow"
                    }
                },
                {
                    type: "wokwi-led",
                    id: "led-green",
                    top: -150,
                    left: 250,
                    attrs: {
                        color: "green"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -100,
                    left: 150,
                    attrs: {
                        value: "220"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r2",
                    top: -100,
                    left: 200,
                    attrs: {
                        value: "220"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r3",
                    top: -100,
                    left: 250,
                    attrs: {
                        value: "220"
                    }
                }
            ],
            connections: [
                [
                    "uno:11",
                    "r1:1",
                    "red",
                    []
                ],
                [
                    "r1:2",
                    "led-red:A",
                    "red",
                    []
                ],
                [
                    "led-red:C",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "uno:10",
                    "r2:1",
                    "orange",
                    []
                ],
                [
                    "r2:2",
                    "led-yellow:A",
                    "orange",
                    []
                ],
                [
                    "led-yellow:C",
                    "uno:GND.2",
                    "black",
                    []
                ],
                [
                    "uno:9",
                    "r3:1",
                    "green",
                    []
                ],
                [
                    "r3:2",
                    "led-green:A",
                    "green",
                    []
                ],
                [
                    "led-green:C",
                    "uno:GND.3",
                    "black",
                    []
                ]
            ]
        },
        code: `// Traffic Light Controller
// Simulates a standard traffic light sequence

const int RED_PIN = 11;
const int YELLOW_PIN = 10;
const int GREEN_PIN = 9;

// Timing constants (in milliseconds)
const int RED_TIME = 5000;
const int YELLOW_TIME = 2000;
const int GREEN_TIME = 5000;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Traffic Light Controller Started");
  
  // Start with all off
  allOff();
}

void allOff() {
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
}

void loop() {
  // RED phase
  Serial.println("STOP - Red Light");
  allOff();
  digitalWrite(RED_PIN, HIGH);
  delay(RED_TIME);
  
  // GREEN phase
  Serial.println("GO - Green Light");
  allOff();
  digitalWrite(GREEN_PIN, HIGH);
  delay(GREEN_TIME);
  
  // YELLOW phase (caution)
  Serial.println("CAUTION - Yellow Light");
  allOff();
  digitalWrite(YELLOW_PIN, HIGH);
  delay(YELLOW_TIME);
}`
    },
    {
        id: "button-led",
        name: "Button & LED",
        description: "Read a pushbutton and control an LED - learn digital input/output",
        difficulty: "beginner",
        tags: [
            "button",
            "led",
            "digital-input",
            "digital-output"
        ],
        estimatedTime: "10 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-led",
                    id: "led1",
                    top: -120,
                    left: 280,
                    attrs: {
                        color: "green"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -80,
                    left: 280,
                    attrs: {
                        value: "220"
                    }
                },
                {
                    type: "wokwi-pushbutton",
                    id: "btn1",
                    top: -150,
                    left: 50
                }
            ],
            connections: [
                [
                    "uno:12",
                    "r1:1",
                    "green",
                    []
                ],
                [
                    "r1:2",
                    "led1:A",
                    "green",
                    []
                ],
                [
                    "led1:C",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "btn1:1.l",
                    "uno:2",
                    "blue",
                    []
                ],
                [
                    "btn1:2.l",
                    "uno:GND.2",
                    "black",
                    []
                ]
            ]
        },
        code: `// Button & LED - Digital Input/Output
// Press the button to turn on the LED

const int BUTTON_PIN = 2;
const int LED_PIN = 12;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Use internal pull-up resistor
  pinMode(LED_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("Button & LED Demo");
  Serial.println("Press the button to toggle LED");
}

void loop() {
  // Read button state (LOW when pressed due to pull-up)
  int buttonState = digitalRead(BUTTON_PIN);
  
  if (buttonState == LOW) {
    // Button is pressed
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Button PRESSED - LED ON");
  } else {
    // Button is released
    digitalWrite(LED_PIN, LOW);
  }
  
  delay(50);  // Small debounce delay
}`
    },
    {
        id: "potentiometer-led",
        name: "Potentiometer LED Dimmer",
        description: "Control LED brightness with a potentiometer using analog input and PWM output",
        difficulty: "beginner",
        tags: [
            "potentiometer",
            "led",
            "analog-input",
            "pwm",
            "analog"
        ],
        estimatedTime: "10 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-led",
                    id: "led1",
                    top: -120,
                    left: 220,
                    attrs: {
                        color: "blue"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -80,
                    left: 220,
                    attrs: {
                        value: "220"
                    }
                },
                {
                    type: "wokwi-potentiometer",
                    id: "pot1",
                    top: -120,
                    left: 80
                }
            ],
            connections: [
                [
                    "uno:9",
                    "r1:1",
                    "blue",
                    []
                ],
                [
                    "r1:2",
                    "led1:A",
                    "blue",
                    []
                ],
                [
                    "led1:C",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "pot1:VCC",
                    "uno:5V",
                    "red",
                    []
                ],
                [
                    "pot1:GND",
                    "uno:GND.2",
                    "black",
                    []
                ],
                [
                    "pot1:SIG",
                    "uno:A0",
                    "green",
                    []
                ]
            ]
        },
        code: `// Potentiometer LED Dimmer
// Read analog input from potentiometer and control LED brightness via PWM

const int POT_PIN = A0;    // Analog input
const int LED_PIN = 9;     // PWM output (pins 3, 5, 6, 9, 10, 11)

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Potentiometer LED Dimmer");
  Serial.println("Turn the potentiometer to adjust brightness");
}

void loop() {
  // Read potentiometer (0-1023)
  int potValue = analogRead(POT_PIN);
  
  // Map to PWM range (0-255)
  int brightness = map(potValue, 0, 1023, 0, 255);
  
  // Set LED brightness
  analogWrite(LED_PIN, brightness);
  
  // Print values for debugging
  Serial.print("Pot: ");
  Serial.print(potValue);
  Serial.print(" -> Brightness: ");
  Serial.println(brightness);
  
  delay(100);  // Update rate
}`
    },
    {
        id: "servo-sweep",
        name: "Servo Motor Sweep",
        description: "Control a servo motor to sweep back and forth from 0 to 180 degrees",
        difficulty: "beginner",
        tags: [
            "servo",
            "motor",
            "pwm",
            "movement"
        ],
        estimatedTime: "10 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-servo",
                    id: "servo1",
                    top: -150,
                    left: 150
                }
            ],
            connections: [
                [
                    "servo1:V+",
                    "uno:5V",
                    "red",
                    []
                ],
                [
                    "servo1:GND",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "servo1:PWM",
                    "uno:9",
                    "orange",
                    []
                ]
            ]
        },
        code: `// Servo Motor Sweep
// Sweeps the servo back and forth from 0 to 180 degrees

#include <Servo.h>

Servo myServo;

const int SERVO_PIN = 9;
int angle = 0;
int step = 1;

void setup() {
  myServo.attach(SERVO_PIN);
  
  Serial.begin(9600);
  Serial.println("Servo Sweep Demo");
  Serial.println("Sweeping 0-180 degrees");
  
  // Start at 0 degrees
  myServo.write(0);
  delay(500);
}

void loop() {
  // Move servo to current angle
  myServo.write(angle);
  
  // Print current angle
  Serial.print("Angle: ");
  Serial.print(angle);
  Serial.println(" degrees");
  
  // Update angle for next iteration
  angle += step;
  
  // Reverse direction at limits
  if (angle >= 180) {
    angle = 180;
    step = -1;
    Serial.println(">> Reversing direction (going back)");
  } else if (angle <= 0) {
    angle = 0;
    step = 1;
    Serial.println(">> Reversing direction (going forward)");
  }
  
  delay(15);  // Small delay for smooth movement
}`
    },
    {
        id: "buzzer-melody",
        name: "Buzzer Melody Player",
        description: "Play musical notes and melodies using a piezo buzzer",
        difficulty: "beginner",
        tags: [
            "buzzer",
            "music",
            "tone",
            "audio"
        ],
        estimatedTime: "10 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-buzzer",
                    id: "buzzer1",
                    top: -120,
                    left: 150
                }
            ],
            connections: [
                [
                    "buzzer1:1",
                    "uno:8",
                    "orange",
                    []
                ],
                [
                    "buzzer1:2",
                    "uno:GND.1",
                    "black",
                    []
                ]
            ]
        },
        code: `// Buzzer Melody Player
// Play musical notes using tone() function

const int BUZZER_PIN = 8;

// Musical note frequencies (Hz)
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523
#define NOTE_REST 0

// "Twinkle Twinkle Little Star" melody
int melody[] = {
  NOTE_C4, NOTE_C4, NOTE_G4, NOTE_G4, NOTE_A4, NOTE_A4, NOTE_G4,
  NOTE_F4, NOTE_F4, NOTE_E4, NOTE_E4, NOTE_D4, NOTE_D4, NOTE_C4
};

// Note durations: 4 = quarter note
int noteDurations[] = {
  4, 4, 4, 4, 4, 4, 2,
  4, 4, 4, 4, 4, 4, 2
};

int numNotes = sizeof(melody) / sizeof(melody[0]);

void setup() {
  Serial.begin(9600);
  Serial.println("Buzzer Melody Player");
  Serial.println("Playing: Twinkle Twinkle Little Star");
}

void playMelody() {
  for (int i = 0; i < numNotes; i++) {
    int noteDuration = 1000 / noteDurations[i];
    
    if (melody[i] != NOTE_REST) {
      tone(BUZZER_PIN, melody[i], noteDuration);
      Serial.print("Note: ");
      Serial.print(melody[i]);
      Serial.println(" Hz");
    }
    
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    noTone(BUZZER_PIN);
  }
}

void loop() {
  Serial.println("\\n=== Starting melody ===");
  playMelody();
  Serial.println("=== Melody complete ===");
  delay(2000);
}`
    },
    {
        id: "lcd-hello-world",
        name: "LCD Hello World",
        description: "Display text on a 16x2 LCD screen using I2C communication",
        difficulty: "intermediate",
        tags: [
            "lcd",
            "i2c",
            "display",
            "text"
        ],
        estimatedTime: "15 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-lcd1602",
                    id: "lcd1",
                    top: -200,
                    left: 50,
                    attrs: {
                        pins: "i2c"
                    }
                }
            ],
            connections: [
                [
                    "lcd1:VCC",
                    "uno:5V",
                    "red",
                    []
                ],
                [
                    "lcd1:GND",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "lcd1:SDA",
                    "uno:A4",
                    "green",
                    []
                ],
                [
                    "lcd1:SCL",
                    "uno:A5",
                    "blue",
                    []
                ]
            ]
        },
        code: `// LCD Hello World - I2C Display
// Display text on 16x2 LCD using Wire library

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD address is typically 0x27 or 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  
  Serial.begin(9600);
  Serial.println("LCD Hello World Demo");
  
  // Display welcome message
  lcd.setCursor(0, 0);
  lcd.print("Hello, FUNDI!");
  lcd.setCursor(0, 1);
  lcd.print("LCD Working :)");
}

int counter = 0;

void loop() {
  // Update counter every second
  delay(1000);
  counter++;
  
  // Display on second line
  lcd.setCursor(0, 1);
  lcd.print("Count: ");
  lcd.print(counter);
  lcd.print("     ");  // Clear remaining chars
  
  Serial.print("Counter: ");
  Serial.println(counter);
}`
    },
    {
        id: "dht22-temperature",
        name: "DHT22 Temperature Sensor",
        description: "Read temperature and humidity from DHT22 sensor with serial output",
        difficulty: "intermediate",
        tags: [
            "dht22",
            "sensor",
            "temperature",
            "humidity",
            "serial"
        ],
        estimatedTime: "15 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-dht22",
                    id: "dht1",
                    top: -150,
                    left: 150
                }
            ],
            connections: [
                [
                    "dht1:VCC",
                    "uno:5V",
                    "red",
                    []
                ],
                [
                    "dht1:GND",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "dht1:SDA",
                    "uno:2",
                    "green",
                    []
                ]
            ]
        },
        code: `// DHT22 Temperature & Humidity Sensor
// Read sensor data and display via Serial Monitor

#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("DHT22 Temperature & Humidity Sensor");
  Serial.println("=====================================");
  
  dht.begin();
  delay(2000);  // Allow sensor to stabilize
}

void loop() {
  // Read humidity and temperature
  float humidity = dht.readHumidity();
  float tempC = dht.readTemperature();
  float tempF = dht.readTemperature(true);
  
  // Check for read errors
  if (isnan(humidity) || isnan(tempC)) {
    Serial.println("Error reading DHT sensor!");
    delay(2000);
    return;
  }
  
  // Print results
  Serial.println("--- Sensor Reading ---");
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  Serial.print("Temperature: ");
  Serial.print(tempC);
  Serial.print("C / ");
  Serial.print(tempF);
  Serial.println("F");
  
  Serial.println();
  delay(2000);  // Wait 2 seconds between readings
}`
    },
    {
        id: "ultrasonic-distance",
        name: "Ultrasonic Distance Sensor",
        description: "Measure distance using HC-SR04 ultrasonic sensor with LED indicator",
        difficulty: "intermediate",
        tags: [
            "ultrasonic",
            "hc-sr04",
            "sensor",
            "distance",
            "measurement"
        ],
        estimatedTime: "15 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-hc-sr04",
                    id: "ultrasonic1",
                    top: -180,
                    left: 100
                },
                {
                    type: "wokwi-led",
                    id: "led1",
                    top: -120,
                    left: 250,
                    attrs: {
                        color: "red"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -80,
                    left: 250,
                    attrs: {
                        value: "220"
                    }
                }
            ],
            connections: [
                [
                    "ultrasonic1:VCC",
                    "uno:5V",
                    "red",
                    []
                ],
                [
                    "ultrasonic1:GND",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "ultrasonic1:TRIG",
                    "uno:10",
                    "blue",
                    []
                ],
                [
                    "ultrasonic1:ECHO",
                    "uno:11",
                    "green",
                    []
                ],
                [
                    "uno:13",
                    "r1:1",
                    "red",
                    []
                ],
                [
                    "r1:2",
                    "led1:A",
                    "red",
                    []
                ],
                [
                    "led1:C",
                    "uno:GND.2",
                    "black",
                    []
                ]
            ]
        },
        code: `// Ultrasonic Distance Sensor (HC-SR04)
// Measure distance and indicate when object is close

const int TRIG_PIN = 10;
const int ECHO_PIN = 11;
const int LED_PIN = 13;

// Distance threshold for LED warning (in cm)
const int WARNING_DISTANCE = 20;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("HC-SR04 Ultrasonic Distance Sensor");
  Serial.println("==================================");
}

float measureDistance() {
  // Clear trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // Send 10us pulse to trigger
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH);
  
  // Calculate distance
  float distance = duration * 0.0343 / 2.0;
  
  return distance;
}

void loop() {
  float distance = measureDistance();
  
  Serial.print("Distance: ");
  Serial.print(distance, 1);
  Serial.print(" cm");
  
  if (distance < WARNING_DISTANCE && distance > 0) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println(" [!] CLOSE");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println();
  }
  
  delay(200);
}`
    },
    {
        id: "keypad-password",
        name: "Keypad Password Lock",
        description: "4x4 membrane keypad for password entry with LED feedback",
        difficulty: "intermediate",
        tags: [
            "keypad",
            "input",
            "security",
            "password",
            "led"
        ],
        estimatedTime: "20 min",
        diagram: {
            version: 1,
            author: "FUNDI Featured",
            editor: "wokwi",
            parts: [
                {
                    type: "wokwi-arduino-uno",
                    id: "uno",
                    top: 0,
                    left: 0
                },
                {
                    type: "wokwi-membrane-keypad",
                    id: "keypad1",
                    top: -250,
                    left: 80
                },
                {
                    type: "wokwi-led",
                    id: "led-green",
                    top: -100,
                    left: 280,
                    attrs: {
                        color: "green"
                    }
                },
                {
                    type: "wokwi-led",
                    id: "led-red",
                    top: -100,
                    left: 320,
                    attrs: {
                        color: "red"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r1",
                    top: -60,
                    left: 280,
                    attrs: {
                        value: "220"
                    }
                },
                {
                    type: "wokwi-resistor",
                    id: "r2",
                    top: -60,
                    left: 320,
                    attrs: {
                        value: "220"
                    }
                }
            ],
            connections: [
                [
                    "keypad1:R1",
                    "uno:9",
                    "purple",
                    []
                ],
                [
                    "keypad1:R2",
                    "uno:8",
                    "purple",
                    []
                ],
                [
                    "keypad1:R3",
                    "uno:7",
                    "purple",
                    []
                ],
                [
                    "keypad1:R4",
                    "uno:6",
                    "purple",
                    []
                ],
                [
                    "keypad1:C1",
                    "uno:5",
                    "blue",
                    []
                ],
                [
                    "keypad1:C2",
                    "uno:4",
                    "blue",
                    []
                ],
                [
                    "keypad1:C3",
                    "uno:3",
                    "blue",
                    []
                ],
                [
                    "keypad1:C4",
                    "uno:2",
                    "blue",
                    []
                ],
                [
                    "uno:12",
                    "r1:1",
                    "green",
                    []
                ],
                [
                    "r1:2",
                    "led-green:A",
                    "green",
                    []
                ],
                [
                    "led-green:C",
                    "uno:GND.1",
                    "black",
                    []
                ],
                [
                    "uno:11",
                    "r2:1",
                    "red",
                    []
                ],
                [
                    "r2:2",
                    "led-red:A",
                    "red",
                    []
                ],
                [
                    "led-red:C",
                    "uno:GND.2",
                    "black",
                    []
                ]
            ]
        },
        code: `// Keypad Password Lock
// Enter a 4-digit code to unlock

#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

const int GREEN_LED = 12;
const int RED_LED = 11;

const String PASSWORD = "1234";
String enteredCode = "";
const int CODE_LENGTH = 4;

void setup() {
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  
  Serial.begin(9600);
  Serial.println("=== Keypad Password Lock ===");
  Serial.println("Enter 4-digit password:");
  Serial.println("Press * to clear, # to submit");
  
  digitalWrite(RED_LED, HIGH);
  delay(200);
  digitalWrite(RED_LED, LOW);
}

void showGranted() {
  Serial.println(">>> ACCESS GRANTED! <<<");
  for (int i = 0; i < 3; i++) {
    digitalWrite(GREEN_LED, HIGH);
    delay(200);
    digitalWrite(GREEN_LED, LOW);
    delay(200);
  }
}

void showDenied() {
  Serial.println(">>> ACCESS DENIED! <<<");
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED, HIGH);
    delay(200);
    digitalWrite(RED_LED, LOW);
    delay(200);
  }
}

void loop() {
  char key = keypad.getKey();
  
  if (key) {
    Serial.print("Key pressed: ");
    Serial.println(key);
    
    if (key == '*') {
      enteredCode = "";
      Serial.println("[Code cleared]");
    } else if (key == '#') {
      Serial.print("Checking code: ");
      Serial.println(enteredCode);
      
      if (enteredCode == PASSWORD) {
        showGranted();
      } else {
        showDenied();
      }
      enteredCode = "";
      Serial.println("\\nEnter password:");
    } else if (enteredCode.length() < CODE_LENGTH) {
      enteredCode += key;
      Serial.print("Code so far: ");
      for (int i = 0; i < enteredCode.length(); i++) {
        Serial.print("*");
      }
      Serial.println();
    }
  }
}`
    }
];
function getFeaturedProjects() {
    return FEATURED_PROJECTS;
}
function getFeaturedProject(id) {
    return FEATURED_PROJECTS.find((p)=>p.id === id);
}
function getProjectsByDifficulty(difficulty) {
    return FEATURED_PROJECTS.filter((p)=>p.difficulty === difficulty);
}
function searchProjectsByTag(tag) {
    const lowerTag = tag.toLowerCase();
    return FEATURED_PROJECTS.filter((p)=>p.tags.some((t)=>t.toLowerCase().includes(lowerTag)));
}
function convertWokwiConnection(conn) {
    const [fromStr, toStr, color] = conn;
    const [fromPartId, fromPinId] = fromStr.split(':');
    const [toPartId, toPinId] = toStr.split(':');
    return {
        from: {
            partId: fromPartId,
            pinId: fromPinId
        },
        to: {
            partId: toPartId,
            pinId: toPinId
        },
        color
    };
}
function convertToFundiCircuit(project) {
    const parts = project.diagram.parts.map((part)=>({
            id: part.id,
            type: part.type.replace('wokwi-', ''),
            position: {
                x: part.left ?? 0,
                y: part.top ?? 0
            },
            rotation: part.rotate,
            attrs: part.attrs
        }));
    const connections = project.diagram.connections.map((conn, index)=>({
            id: `wire_${index + 1}`,
            ...convertWokwiConnection(conn)
        }));
    return {
        parts,
        connections
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/FeaturedProjectsPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeaturedProjectsPanel",
    ()=>FeaturedProjectsPanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beaker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Beaker$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/beaker.js [app-client] (ecmascript) <export default as Beaker>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$featuredProjects$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/featuredProjects.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const DIFFICULTY_COLORS = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};
const DIFFICULTY_ICONS = {
    beginner: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 42,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    intermediate: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beaker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Beaker$3e$__["Beaker"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 43,
        columnNumber: 17
    }, ("TURBOPACK compile-time value", void 0)),
    advanced: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
        className: "h-3 w-3"
    }, void 0, false, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 44,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0))
};
function ProjectCard({ project, onSelect, isSelected }) {
    const partCount = project.diagram.parts.length;
    const connectionCount = project.diagram.connections.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onSelect,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full text-left p-4 rounded-lg border transition-all duration-200', 'hover:border-ide-accent/50 hover:bg-ide-panel-hover', isSelected ? 'border-ide-accent bg-ide-accent/10' : 'border-ide-border bg-ide-panel-surface'),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-semibold text-ide-text truncate",
                                children: project.name
                            }, void 0, false, {
                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-ide-text-muted mt-1 line-clamp-2",
                                children: project.description
                            }, void 0, false, {
                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 w-5 h-5 rounded-full bg-ide-accent flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                            className: "h-3 w-3 text-white"
                        }, void 0, false, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 80,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex items-center gap-2 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border', DIFFICULTY_COLORS[project.difficulty]),
                        children: [
                            DIFFICULTY_ICONS[project.difficulty],
                            project.difficulty
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-ide-text-muted bg-ide-bg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                className: "h-3 w-3"
                            }, void 0, false, {
                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this),
                            project.estimatedTime
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] text-ide-text-subtle",
                        children: [
                            partCount,
                            " parts • ",
                            connectionCount,
                            " wires"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-2 flex items-center gap-1 flex-wrap",
                children: [
                    project.tags.slice(0, 4).map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-ide-text-subtle bg-ide-bg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                                    className: "h-2.5 w-2.5"
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this),
                                tag
                            ]
                        }, tag, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this)),
                    project.tags.length > 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] text-ide-text-subtle",
                        children: [
                            "+",
                            project.tags.length - 4,
                            " more"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_c = ProjectCard;
function ProjectPreview({ project }) {
    _s();
    const [showCode, setShowCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-ide-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-ide-text",
                        children: project.name
                    }, void 0, false, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-ide-text-muted mt-1",
                        children: project.description
                    }, void 0, false, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex border-b border-ide-border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setShowCode(false),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 px-4 py-2 text-sm font-medium transition-colors', !showCode ? 'text-ide-accent border-b-2 border-ide-accent bg-ide-accent/5' : 'text-ide-text-muted hover:text-ide-text'),
                        children: "Circuit Info"
                    }, void 0, false, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setShowCode(true),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex-1 px-4 py-2 text-sm font-medium transition-colors', showCode ? 'text-ide-accent border-b-2 border-ide-accent bg-ide-accent/5' : 'text-ide-text-muted hover:text-ide-text'),
                        children: "Arduino Code"
                    }, void 0, false, {
                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto p-4",
                children: showCode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                    className: "text-xs font-mono text-ide-text whitespace-pre-wrap bg-ide-bg p-3 rounded-lg border border-ide-border overflow-auto max-h-[400px]",
                    children: project.code
                }, void 0, false, {
                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                    lineNumber: 172,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2",
                                    children: [
                                        "Components (",
                                        project.diagram.parts.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 179,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: project.diagram.parts.map((part)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 text-sm text-ide-text py-1 px-2 rounded bg-ide-bg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-2 h-2 rounded-full bg-ide-accent"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 188,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-mono text-xs",
                                                    children: part.id
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 189,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-ide-text-muted",
                                                    children: "→"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-ide-text-subtle text-xs",
                                                    children: part.type.replace('wokwi-', '')
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, part.id, true, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 184,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 182,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 178,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2",
                                    children: "Connections"
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-ide-text",
                                    children: [
                                        project.diagram.connections.length,
                                        " wire connections"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 204,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2",
                                    children: "What You'll Learn"
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 211,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-1",
                                    children: project.tags.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-ide-text bg-ide-accent/10 border border-ide-accent/20",
                                            children: tag
                                        }, tag, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 216,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 214,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 210,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                    lineNumber: 176,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, this);
}
_s(ProjectPreview, "vIe6NEKEYgSm5bNA+JZKcPiDC7o=");
_c1 = ProjectPreview;
function FeaturedProjectsPanel({ isOpen, onClose }) {
    _s1();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [difficultyFilter, setDifficultyFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedProjectId, setSelectedProjectId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadSuccess, setLoadSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Store actions
    const updateCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FeaturedProjectsPanel.useAppStore[updateCode]": (s)=>s.updateCode
    }["FeaturedProjectsPanel.useAppStore[updateCode]"]);
    const applyGeneratedCircuit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FeaturedProjectsPanel.useAppStore[applyGeneratedCircuit]": (s)=>s.applyGeneratedCircuit
    }["FeaturedProjectsPanel.useAppStore[applyGeneratedCircuit]"]);
    const allProjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FeaturedProjectsPanel.useMemo[allProjects]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$featuredProjects$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFeaturedProjects"])()
    }["FeaturedProjectsPanel.useMemo[allProjects]"], []);
    const filteredProjects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FeaturedProjectsPanel.useMemo[filteredProjects]": ()=>{
            return allProjects.filter({
                "FeaturedProjectsPanel.useMemo[filteredProjects]": (project)=>{
                    // Filter by difficulty
                    if (difficultyFilter !== 'all' && project.difficulty !== difficultyFilter) {
                        return false;
                    }
                    // Filter by search query
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        const matchesName = project.name.toLowerCase().includes(query);
                        const matchesDescription = project.description.toLowerCase().includes(query);
                        const matchesTags = project.tags.some({
                            "FeaturedProjectsPanel.useMemo[filteredProjects].matchesTags": (tag)=>tag.toLowerCase().includes(query)
                        }["FeaturedProjectsPanel.useMemo[filteredProjects].matchesTags"]);
                        return matchesName || matchesDescription || matchesTags;
                    }
                    return true;
                }
            }["FeaturedProjectsPanel.useMemo[filteredProjects]"]);
        }
    }["FeaturedProjectsPanel.useMemo[filteredProjects]"], [
        allProjects,
        difficultyFilter,
        searchQuery
    ]);
    const selectedProject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FeaturedProjectsPanel.useMemo[selectedProject]": ()=>allProjects.find({
                "FeaturedProjectsPanel.useMemo[selectedProject]": (p)=>p.id === selectedProjectId
            }["FeaturedProjectsPanel.useMemo[selectedProject]"]) ?? null
    }["FeaturedProjectsPanel.useMemo[selectedProject]"], [
        allProjects,
        selectedProjectId
    ]);
    const handleLoadProject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "FeaturedProjectsPanel.useCallback[handleLoadProject]": async ()=>{
            if (!selectedProject) return;
            setIsLoading(true);
            setLoadSuccess(false);
            try {
                // Convert project to FUNDI format
                const { parts, connections } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$featuredProjects$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["convertToFundiCircuit"])(selectedProject);
                // Update code
                updateCode(selectedProject.code);
                // Apply circuit with proper type mapping
                const circuitParts = parts.map({
                    "FeaturedProjectsPanel.useCallback[handleLoadProject].circuitParts": (p)=>({
                            id: p.id,
                            type: p.type,
                            position: p.position,
                            rotate: p.rotation,
                            attrs: p.attrs
                        })
                }["FeaturedProjectsPanel.useCallback[handleLoadProject].circuitParts"]);
                const circuitConnections = connections.map({
                    "FeaturedProjectsPanel.useCallback[handleLoadProject].circuitConnections": (c)=>({
                            id: c.id,
                            from: c.from,
                            to: c.to,
                            color: c.color
                        })
                }["FeaturedProjectsPanel.useCallback[handleLoadProject].circuitConnections"]);
                applyGeneratedCircuit(circuitParts, circuitConnections);
                setLoadSuccess(true);
                // Auto-close after success
                setTimeout({
                    "FeaturedProjectsPanel.useCallback[handleLoadProject]": ()=>{
                        onClose();
                    }
                }["FeaturedProjectsPanel.useCallback[handleLoadProject]"], 1000);
            } catch (error) {
                console.error('Failed to load project:', error);
            } finally{
                setIsLoading(false);
            }
        }
    }["FeaturedProjectsPanel.useCallback[handleLoadProject]"], [
        selectedProject,
        updateCode,
        applyGeneratedCircuit,
        onClose
    ]);
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-ide-panel border border-ide-border rounded-xl shadow-2xl w-[900px] max-w-[95vw] h-[700px] max-h-[90vh] flex flex-col overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between border-b border-ide-border px-6 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex h-10 w-10 items-center justify-center rounded-lg bg-ide-accent/10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "h-5 w-5 text-ide-accent"
                                    }, void 0, false, {
                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                        lineNumber: 325,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 324,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-semibold text-ide-text text-lg",
                                            children: "Featured Projects"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 328,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-ide-text-muted",
                                            children: "Load pre-made Wokwi projects to test your simulation"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 329,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 327,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 323,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "p-2 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded-lg transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                lineNumber: 339,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 334,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                    lineNumber: 322,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-[360px] border-r border-ide-border flex flex-col",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 space-y-3 border-b border-ide-border",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ide-text-muted"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    placeholder: "Search projects...",
                                                    value: searchQuery,
                                                    onChange: (e)=>setSearchQuery(e.target.value),
                                                    className: "w-full pl-9 pr-3 py-2 text-sm bg-ide-bg border border-ide-border rounded-lg text-ide-text placeholder:text-ide-text-subtle focus:outline-none focus:border-ide-accent"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 350,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                                    className: "h-4 w-4 text-ide-text-muted"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 363,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-1",
                                                    children: [
                                                        'all',
                                                        'beginner',
                                                        'intermediate',
                                                        'advanced'
                                                    ].map((level)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>setDifficultyFilter(level),
                                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-2 py-1 text-xs rounded-md transition-colors', difficultyFilter === level ? 'bg-ide-accent text-white' : 'bg-ide-bg text-ide-text-muted hover:text-ide-text'),
                                                            children: level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)
                                                        }, level, false, {
                                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                            lineNumber: 367,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                    lineNumber: 364,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 362,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 348,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 overflow-auto p-4 space-y-3",
                                    children: filteredProjects.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center py-8 text-ide-text-muted",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                className: "h-8 w-8 mx-auto mb-2 opacity-50"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                lineNumber: 390,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm",
                                                children: "No projects found"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                lineNumber: 391,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                        lineNumber: 389,
                                        columnNumber: 17
                                    }, this) : filteredProjects.map((project)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProjectCard, {
                                            project: project,
                                            isSelected: selectedProjectId === project.id,
                                            onSelect: ()=>setSelectedProjectId(project.id)
                                        }, project.id, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 395,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 387,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 border-t border-ide-border text-xs text-ide-text-muted",
                                    children: [
                                        filteredProjects.length,
                                        " of ",
                                        allProjects.length,
                                        " projects"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 406,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 346,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 flex flex-col",
                            children: selectedProject ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProjectPreview, {
                                        project: selectedProject
                                    }, void 0, false, {
                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                        lineNumber: 415,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 border-t border-ide-border flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-ide-text-muted",
                                                children: "This will replace your current circuit and code"
                                            }, void 0, false, {
                                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                lineNumber: 419,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    loadSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1 text-xs text-green-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                                lineNumber: 425,
                                                                columnNumber: 25
                                                            }, this),
                                                            "Loaded!"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleLoadProject,
                                                        disabled: isLoading,
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all', isLoading ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed' : 'bg-ide-accent text-white hover:bg-ide-accent/90'),
                                                        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                                    lineNumber: 442,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Loading..."
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                                    lineNumber: 447,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Load Project"
                                                            ]
                                                        }, void 0, true)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                        lineNumber: 429,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                                lineNumber: 422,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                        lineNumber: 418,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 flex items-center justify-center text-ide-text-muted",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                            className: "h-12 w-12 mx-auto mb-3 opacity-30"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 458,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm",
                                            children: "Select a project to preview"
                                        }, void 0, false, {
                                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                            lineNumber: 459,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                    lineNumber: 457,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                                lineNumber: 456,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                            lineNumber: 412,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/FeaturedProjectsPanel.tsx",
                    lineNumber: 344,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/FeaturedProjectsPanel.tsx",
            lineNumber: 320,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/FeaturedProjectsPanel.tsx",
        lineNumber: 319,
        columnNumber: 5
    }, this);
}
_s1(FeaturedProjectsPanel, "DIQDds7O6tkNSzUwNgjBOguVfOU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c2 = FeaturedProjectsPanel;
const __TURBOPACK__default__export__ = FeaturedProjectsPanel;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ProjectCard");
__turbopack_context__.k.register(_c1, "ProjectPreview");
__turbopack_context__.k.register(_c2, "FeaturedProjectsPanel");
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
    // Memoize the JSON string directly to prevent unnecessary re-serialization
    const diagramJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useDiagramSync.useMemo[diagramJson]": ()=>{
            const diagram = {
                version: 1,
                parts: circuitParts.map({
                    "useDiagramSync.useMemo[diagramJson]": (p)=>({
                            id: p.id,
                            type: resolveWokwiType(p.type),
                            top: Math.round(p.position.y),
                            left: Math.round(p.position.x),
                            rotate: p.rotate ?? 0,
                            attrs: p.attrs ?? {}
                        })
                }["useDiagramSync.useMemo[diagramJson]"]),
                connections: connections.map({
                    "useDiagramSync.useMemo[diagramJson]": (c)=>[
                            `${c.from.partId}:${c.from.pinId}`,
                            `${c.to.partId}:${c.to.pinId}`,
                            c.color,
                            []
                        ]
                }["useDiagramSync.useMemo[diagramJson]"])
            };
            return JSON.stringify(diagram, null, 2);
        }
    }["useDiagramSync.useMemo[diagramJson]"], [
        circuitParts,
        connections
    ]);
    // Track previous value to prevent unnecessary updates
    const prevJsonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDiagramSync.useEffect": ()=>{
            if (diagramJson !== prevJsonRef.current) {
                prevJsonRef.current = diagramJson;
                setDiagramJson(diagramJson);
            }
        }
    }["useDiagramSync.useEffect"], [
        diagramJson,
        setDiagramJson
    ]);
}
_s(useDiagramSync, "i+Dii3WxkyaSTiZWvQedF07Xg+Q=", false, function() {
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
"[project]/utils/simulation/cycleScheduler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CycleScheduler",
    ()=>CycleScheduler
]);
'use client';
class CycleScheduler {
    events = [];
    clear() {
        this.events = [];
    }
    get size() {
        return this.events.length;
    }
    schedule(cycle, callback) {
        if (!Number.isFinite(cycle)) return;
        const evt = {
            cycle: Math.max(0, Math.floor(cycle)),
            callback
        };
        // Insert sorted by cycle (small N).
        const idx = this.events.findIndex((e)=>e.cycle > evt.cycle);
        if (idx === -1) {
            this.events.push(evt);
        } else {
            this.events.splice(idx, 0, evt);
        }
    }
    runDue(nowCycle) {
        if (this.events.length === 0) return;
        const now = Math.floor(nowCycle);
        let i = 0;
        while(i < this.events.length && this.events[i].cycle <= now){
            const evt = this.events[i];
            try {
                evt.callback();
            } catch  {
            // Swallow callback errors to avoid wedging the simulation loop.
            }
            i++;
        }
        if (i > 0) {
            this.events.splice(0, i);
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/dht.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DHTDevice",
    ()=>DHTDevice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/gpio.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$cycleScheduler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/cycleScheduler.ts [app-client] (ecmascript)");
'use client';
;
;
function clampNumber(n, min, max) {
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
}
function usToCycles(cpuFrequencyHz, us) {
    return Math.round(cpuFrequencyHz / 1_000_000 * us);
}
function msToCycles(cpuFrequencyHz, ms) {
    return Math.round(cpuFrequencyHz / 1_000 * ms);
}
function toDHT22Bytes(reading) {
    const humidity = clampNumber(reading.humidity, 0, 100);
    const tempC = clampNumber(reading.temperatureC, -40, 80);
    const h10 = Math.round(humidity * 10);
    let t10 = Math.round(tempC * 10);
    // DHT22 encodes sign in the MSB of temperature high byte.
    let tSign = 0;
    if (t10 < 0) {
        tSign = 0x8000;
        t10 = Math.abs(t10);
    }
    const h = h10 & 0xffff;
    const t = t10 & 0x7fff | tSign;
    const b0 = h >> 8 & 0xff;
    const b1 = h & 0xff;
    const b2 = t >> 8 & 0xff;
    const b3 = t & 0xff;
    const b4 = b0 + b1 + b2 + b3 & 0xff;
    return [
        b0,
        b1,
        b2,
        b3,
        b4
    ];
}
function toDHT11Bytes(reading) {
    const humidity = clampNumber(reading.humidity, 0, 100);
    const tempC = clampNumber(reading.temperatureC, 0, 50);
    const b0 = Math.round(humidity) & 0xff;
    const b1 = 0;
    const b2 = Math.round(tempC) & 0xff;
    const b3 = 0;
    const b4 = b0 + b1 + b2 + b3 & 0xff;
    return [
        b0,
        b1,
        b2,
        b3,
        b4
    ];
}
function bytesToBitsMsbFirst(bytes) {
    const bits = [];
    for (const b of bytes){
        for(let i = 7; i >= 0; i--){
            bits.push(b >> i & 1);
        }
    }
    return bits;
}
class DHTDevice {
    type;
    port;
    bit;
    cpuFrequencyHz;
    readValues;
    scheduler = new __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$cycleScheduler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CycleScheduler"]();
    hostLowStartCycle = null;
    armed = false;
    constructor(binding){
        this.type = binding.type;
        this.port = binding.port;
        this.bit = binding.bit;
        this.cpuFrequencyHz = binding.cpuFrequencyHz;
        this.readValues = binding.readValues;
        // Default: released/high.
        this.port.setPin(this.bit, true);
    }
    reset() {
        this.scheduler.clear();
        this.hostLowStartCycle = null;
        this.armed = false;
        this.port.setPin(this.bit, true);
    }
    /** Call frequently (e.g. once per instruction) with current cpu.cycles. */ tick(cpuCycles) {
        this.scheduler.runDue(cpuCycles);
        // If we're mid-response, don't re-arm.
        if (this.scheduler.size > 0) return;
        const pinState = this.port.pinState(this.bit);
        const hostDrivingLow = pinState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PinState"].Low;
        const hostReleasedToInput = pinState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PinState"].Input || pinState === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PinState"].InputPullUp;
        if (hostDrivingLow) {
            if (this.hostLowStartCycle === null) {
                this.hostLowStartCycle = cpuCycles;
                this.armed = false;
            }
            return;
        }
        // Host is not driving low.
        if (this.hostLowStartCycle !== null) {
            const lowDurationCycles = cpuCycles - this.hostLowStartCycle;
            const minLow = this.type === 'dht11' ? msToCycles(this.cpuFrequencyHz, 18) : msToCycles(this.cpuFrequencyHz, 1);
            if (lowDurationCycles >= minLow) {
                this.armed = true;
            }
            this.hostLowStartCycle = null;
        }
        if (this.armed && hostReleasedToInput) {
            this.armed = false;
            this.scheduleResponse(cpuCycles);
        }
        // Keep line high when idle.
        if (!hostDrivingLow && hostReleasedToInput && this.scheduler.size === 0) {
            this.port.setPin(this.bit, true);
        }
    }
    scheduleResponse(nowCycles) {
        const delayUs = 40; // typical 20-40us
        const lowUs = 80;
        const highUs = 80;
        const lowBitUs = 50;
        const high0Us = 28;
        const high1Us = 70;
        const start = nowCycles + usToCycles(this.cpuFrequencyHz, delayUs);
        const reading = this.readValues();
        const bytes = this.type === 'dht11' ? toDHT11Bytes(reading) : toDHT22Bytes(reading);
        const bits = bytesToBitsMsbFirst(bytes);
        let t = start;
        // Sensor response: low 80us, high 80us
        this.scheduler.schedule(t, ()=>this.port.setPin(this.bit, false));
        t += usToCycles(this.cpuFrequencyHz, lowUs);
        this.scheduler.schedule(t, ()=>this.port.setPin(this.bit, true));
        t += usToCycles(this.cpuFrequencyHz, highUs);
        // Data bits: each bit starts with 50us low then high for 0/1 duration
        for(let i = 0; i < bits.length; i++){
            const bit = bits[i];
            this.scheduler.schedule(t, ()=>this.port.setPin(this.bit, false));
            t += usToCycles(this.cpuFrequencyHz, lowBitUs);
            this.scheduler.schedule(t, ()=>this.port.setPin(this.bit, true));
            t += usToCycles(this.cpuFrequencyHz, bit ? high1Us : high0Us);
        }
        // Release high.
        this.scheduler.schedule(t, ()=>this.port.setPin(this.bit, true));
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/simulation/interactiveComponents.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INTERACTIVE_COMPONENT_CONFIG",
    ()=>INTERACTIVE_COMPONENT_CONFIG,
    "getInteractiveComponentManager",
    ()=>getInteractiveComponentManager
]);
'use client';
const INTERACTIVE_COMPONENT_CONFIG = {
    // Potentiometers - analog value 0-1023 (10-bit ADC)
    'potentiometer': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Value'
    },
    'wokwi-potentiometer': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Value'
    },
    'slide-potentiometer': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Value'
    },
    'wokwi-slide-potentiometer': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Value'
    },
    // Temperature sensors
    'dht22': {
        min: -40,
        max: 80,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    'wokwi-dht22': {
        min: -40,
        max: 80,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    'ds18b20': {
        min: -55,
        max: 125,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    'wokwi-ds18b20': {
        min: -55,
        max: 125,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    'ntc-temperature-sensor': {
        min: -40,
        max: 125,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    'wokwi-ntc-temperature-sensor': {
        min: -40,
        max: 125,
        default: 25,
        unit: '°C',
        label: 'Temperature'
    },
    // Distance sensors
    'hc-sr04': {
        min: 2,
        max: 400,
        default: 100,
        unit: 'cm',
        label: 'Distance'
    },
    'wokwi-hc-sr04': {
        min: 2,
        max: 400,
        default: 100,
        unit: 'cm',
        label: 'Distance'
    },
    // Light sensors
    'photoresistor-sensor': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Light'
    },
    'wokwi-photoresistor-sensor': {
        min: 0,
        max: 1023,
        default: 512,
        unit: '',
        label: 'Light'
    },
    // Gas/Air quality
    'gas-sensor': {
        min: 0,
        max: 1023,
        default: 200,
        unit: 'ppm',
        label: 'Gas Level'
    },
    'wokwi-gas-sensor': {
        min: 0,
        max: 1023,
        default: 200,
        unit: 'ppm',
        label: 'Gas Level'
    },
    // PIR Motion sensor
    'pir-motion-sensor': {
        min: 0,
        max: 1,
        default: 0,
        unit: '',
        label: 'Motion'
    },
    'wokwi-pir-motion-sensor': {
        min: 0,
        max: 1,
        default: 0,
        unit: '',
        label: 'Motion'
    },
    // Tilt sensor
    'tilt-sensor': {
        min: 0,
        max: 1,
        default: 0,
        unit: '',
        label: 'Tilted'
    },
    'wokwi-tilt-sensor': {
        min: 0,
        max: 1,
        default: 0,
        unit: '',
        label: 'Tilted'
    }
};
/**
 * Manager for interactive component states
 */ class InteractiveComponentManager {
    states = new Map();
    listeners = new Set();
    /**
     * Register a component for interactive control
     */ registerComponent(partId, partType) {
        // Normalize part type
        const normalizedType = partType.toLowerCase().replace('wokwi-', '');
        // Check if this type is interactive
        const config = INTERACTIVE_COMPONENT_CONFIG[partType] || INTERACTIVE_COMPONENT_CONFIG[normalizedType];
        if (!config) return; // Not an interactive component
        if (!this.states.has(partId)) {
            this.states.set(partId, {
                partId,
                partType,
                value: config.default,
                min: config.min,
                max: config.max,
                unit: config.unit,
                label: config.label
            });
            this.notifyListeners();
        }
    }
    /**
     * Unregister a component
     */ unregisterComponent(partId) {
        if (this.states.delete(partId)) {
            this.notifyListeners();
        }
    }
    /**
     * Update a component's value
     */ setValue(partId, value) {
        const state = this.states.get(partId);
        if (!state) return;
        // Clamp value to valid range
        const clampedValue = Math.max(state.min, Math.min(state.max, value));
        if (state.value !== clampedValue) {
            state.value = clampedValue;
            this.states.set(partId, state);
            this.notifyListeners();
        }
    }
    /**
     * Get a component's current value
     */ getValue(partId) {
        return this.states.get(partId)?.value;
    }
    /**
     * Get a component's state
     */ getState(partId) {
        return this.states.get(partId);
    }
    /**
     * Get all registered interactive components
     */ getAllStates() {
        return new Map(this.states);
    }
    /**
     * Check if a part type is interactive
     */ isInteractive(partType) {
        const normalizedType = partType.toLowerCase().replace('wokwi-', '');
        return partType in INTERACTIVE_COMPONENT_CONFIG || normalizedType in INTERACTIVE_COMPONENT_CONFIG;
    }
    /**
     * Subscribe to state changes
     */ subscribe(listener) {
        this.listeners.add(listener);
        return ()=>this.listeners.delete(listener);
    }
    /**
     * Notify all listeners of state changes
     */ notifyListeners() {
        for (const listener of this.listeners){
            listener(this.states);
        }
    }
    /**
     * Reset all values to defaults
     */ resetAll() {
        for (const [partId, state] of this.states){
            const config = INTERACTIVE_COMPONENT_CONFIG[state.partType] || INTERACTIVE_COMPONENT_CONFIG[state.partType.toLowerCase().replace('wokwi-', '')];
            if (config) {
                state.value = config.default;
                this.states.set(partId, state);
            }
        }
        this.notifyListeners();
    }
    /**
     * Clear all registered components
     */ clear() {
        this.states.clear();
        this.notifyListeners();
    }
}
// Singleton instance
let interactiveManagerInstance = null;
function getInteractiveComponentManager() {
    if (!interactiveManagerInstance) {
        interactiveManagerInstance = new InteractiveComponentManager();
    }
    return interactiveManagerInstance;
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/gpio.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$twi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/twi.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/clock.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/timer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/usart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/cpu/cpu.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$instruction$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/cpu/instruction.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$adc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/avr8js/dist/esm/peripherals/adc.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/i2c.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$lcd1602$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/lcd1602.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$ssd1306$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/ssd1306.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$dht$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/dht.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/interactiveComponents.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function decodeBase64ToBytes(base64) {
    const normalized = base64.trim();
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
function decodeBase64ToString(base64) {
    return new TextDecoder('utf-8').decode(decodeBase64ToBytes(base64));
}
function looksLikeIntelHex(text) {
    // Intel HEX files are text lines starting with ':'
    const t = text.trimStart();
    return t.startsWith(':');
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
    portC;
    portD;
    clock;
    timer0;
    usart;
    twi;
    adc;
    constructor(hexText){
        const program = parseIntelHex(hexText);
        this.cpu = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$cpu$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CPU"](program);
        this.portB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRIOPort"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portBConfig"]);
        this.portC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRIOPort"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portCConfig"]);
        this.portD = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRIOPort"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portDConfig"]);
        // Provide basic Arduino timing (millis/delay rely on timer0 on Uno).
        this.clock = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRClock"](this.cpu, 16_000_000);
        this.timer0 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRTimer"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$timer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["timer0Config"]);
        // ADC for analogRead() support
        this.adc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$adc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRADC"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$adc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["adcConfig"]);
        // USART for Serial communication
        this.usart = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRUSART"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$usart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usart0Config"], 16_000_000);
        // TWI (I2C) for Wire library support
        this.twi = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$twi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVRTWI"](this.cpu, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$twi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twiConfig"], 16_000_000);
        // Bridge avr8js TWI transactions to our simulated I2C bus.
        this.twi.eventHandler = new I2CBusTwiEventHandler(this.twi);
    }
}
class I2CBusTwiEventHandler {
    twi;
    constructor(twi){
        this.twi = twi;
    }
    start() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().start();
        this.twi.completeStart();
    }
    stop() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().stop();
        this.twi.completeStop();
    }
    connectToSlave(addr, write) {
        // In I2C, R/W bit: 0=write, 1=read
        const addressByte = (addr & 0x7f) << 1 | (write ? 0 : 1);
        const ack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().writeByte(addressByte);
        this.twi.completeConnect(ack);
    }
    writeByte(value) {
        const ack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().writeByte(value & 0xff);
        this.twi.completeWrite(ack);
    }
    readByte(ack) {
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])().readByte(ack);
        this.twi.completeRead(value & 0xff);
    }
}
function parseI2CAddress(attr, fallback) {
    if (typeof attr === 'number' && Number.isFinite(attr)) return attr;
    if (typeof attr !== 'string') return fallback;
    const t = attr.trim();
    // supports "0x27" and "39"
    const parsed = t.startsWith('0x') ? Number.parseInt(t.slice(2), 16) : Number.parseInt(t, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function buildAdjacency(connections) {
    const adjacency = new Map();
    const keyOf = (partId, pinId)=>`${partId}:${pinId}`;
    for (const conn of connections){
        const a = keyOf(conn.from.partId, conn.from.pinId);
        const b = keyOf(conn.to.partId, conn.to.pinId);
        if (!adjacency.has(a)) adjacency.set(a, new Set());
        if (!adjacency.has(b)) adjacency.set(b, new Set());
        adjacency.get(a).add(b);
        adjacency.get(b).add(a);
    }
    return adjacency;
}
function findConnectedMcuDigitalPin(adjacency, startKey, mcuId) {
    const queue = [
        startKey
    ];
    const seen = new Set(queue);
    while(queue.length){
        const cur = queue.shift();
        const idx = cur.indexOf(':');
        if (idx > 0) {
            const partId = cur.slice(0, idx);
            const pinId = cur.slice(idx + 1);
            if (partId === mcuId) {
                // Match purely numeric pins (0, 1, 2, ..., 13)
                if (/^\d+$/.test(pinId)) {
                    const n = Number.parseInt(pinId, 10);
                    return Number.isFinite(n) ? n : null;
                }
                // Match analog pins (A0-A5) - these are digital pins 14-19 on Arduino Uno
                const analogMatch = pinId.match(/^A(\d)$/i);
                if (analogMatch) {
                    const analogNum = Number.parseInt(analogMatch[1], 10);
                    if (analogNum >= 0 && analogNum <= 5) {
                        return 14 + analogNum;
                    }
                }
            }
        }
        const neighbors = adjacency.get(cur);
        if (!neighbors) continue;
        for (const n of neighbors){
            if (!seen.has(n)) {
                seen.add(n);
                queue.push(n);
            }
        }
    }
    return null;
}
function getPortBitForArduinoDigitalPin(runner, pin) {
    // Arduino Uno pin mapping:
    // D0-D7: PORTD bits 0-7
    // D8-D13: PORTB bits 0-5
    // A0-A5 (D14-D19): PORTC bits 0-5
    if (pin >= 0 && pin <= 7) return {
        port: runner.portD,
        bit: pin
    };
    if (pin >= 8 && pin <= 13) return {
        port: runner.portB,
        bit: pin - 8
    };
    if (pin >= 14 && pin <= 19) return {
        port: runner.portC,
        bit: pin - 14
    };
    return null;
}
function isAvrPart(partType) {
    return partType === 'wokwi-arduino-uno' || partType === 'wokwi-arduino-nano' || partType === 'wokwi-arduino-mega';
}
// Arduino Uno PWM pins and their timer/OCR register mappings
const PWM_PIN_CONFIGS = {
    3: {
        timer: 'timer2',
        ocrOffset: 0xB4
    },
    5: {
        timer: 'timer0',
        ocrOffset: 0x47
    },
    6: {
        timer: 'timer0',
        ocrOffset: 0x47
    },
    9: {
        timer: 'timer1',
        ocrOffset: 0x88
    },
    10: {
        timer: 'timer1',
        ocrOffset: 0x8A
    },
    11: {
        timer: 'timer2',
        ocrOffset: 0xB3
    }
};
function useSimulation(hexData, partType) {
    _s();
    const circuitParts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useSimulation.useAppStore[circuitParts]": (s)=>s.circuitParts
    }["useSimulation.useAppStore[circuitParts]"]);
    const connections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useSimulation.useAppStore[connections]": (s)=>s.connections
    }["useSimulation.useAppStore[connections]"]);
    const setCircuitPartAttr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useSimulation.useAppStore[setCircuitPartAttr]": (s)=>s.setCircuitPartAttr
    }["useSimulation.useAppStore[setCircuitPartAttr]"]);
    const [isRunning, setIsRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pinStates, setPinStates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [pwmStates, setPwmStates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [serialOutput, setSerialOutput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const runnerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const runningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const serialBufferRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const stepFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        "useSimulation.useRef[stepFrameRef]": ()=>{}
    }["useSimulation.useRef[stepFrameRef]"]);
    const dhtDevicesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const servoDevicesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const hcsr04DevicesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const keypadDevicesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const cyclesPerFrame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useSimulation.useMemo[cyclesPerFrame]": ()=>Math.floor(16_000_000 / 60)
    }["useSimulation.useMemo[cyclesPerFrame]"], []);
    const clearSerialOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[clearSerialOutput]": ()=>{
            setSerialOutput([]);
            serialBufferRef.current = '';
        }
    }["useSimulation.useCallback[clearSerialOutput]"], []);
    const appendSerialLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[appendSerialLine]": (line)=>{
            if (!line) return;
            setSerialOutput({
                "useSimulation.useCallback[appendSerialLine]": (prev)=>[
                        ...prev,
                        line
                    ]
            }["useSimulation.useCallback[appendSerialLine]"]);
        }
    }["useSimulation.useCallback[appendSerialLine]"], []);
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
                    } else if (port === 'B') {
                        // PORTB bits 0-5 -> Digital 8-13
                        for(let bit = 0; bit < 6; bit++){
                            const pin = 8 + bit;
                            next[pin] = (value & 1 << bit) !== 0;
                        }
                    } else {
                        // PORTC bits 0-5 -> Analog A0-A5 (Digital 14-19)
                        for(let bit = 0; bit < 6; bit++){
                            const pin = 14 + bit;
                            next[pin] = (value & 1 << bit) !== 0;
                        }
                    }
                    return next;
                }
            }["useSimulation.useCallback[updatePortPins]"]);
        }
    }["useSimulation.useCallback[updatePortPins]"], []);
    // Read PWM duty cycle values from timer OCR registers
    const updatePwmStates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSimulation.useCallback[updatePwmStates]": (runner)=>{
            setPwmStates({
                "useSimulation.useCallback[updatePwmStates]": (prev)=>{
                    const next = {
                        ...prev
                    };
                    // Read OCR values for PWM pins
                    // Pin 3: OC2B - OCR2B at 0xB4
                    // Pin 5: OC0B - OCR0B at 0x48
                    // Pin 6: OC0A - OCR0A at 0x47
                    // Pin 9: OC1A - OCR1AL at 0x88
                    // Pin 10: OC1B - OCR1BL at 0x8A
                    // Pin 11: OC2A - OCR2A at 0xB3
                    try {
                        const data = runner.cpu.data;
                        next[3] = data[0xB4] ?? 0; // OCR2B
                        next[5] = data[0x48] ?? 0; // OCR0B
                        next[6] = data[0x47] ?? 0; // OCR0A
                        next[9] = data[0x88] ?? 0; // OCR1AL (low byte)
                        next[10] = data[0x8A] ?? 0; // OCR1BL (low byte)
                        next[11] = data[0xB3] ?? 0; // OCR2A
                        // Debug: Log PWM values when they change significantly
                        const hasChanges = Object.entries(next).some({
                            "useSimulation.useCallback[updatePwmStates].hasChanges": ([pin, val])=>prev[parseInt(pin)] !== val && val > 0
                        }["useSimulation.useCallback[updatePwmStates].hasChanges"]);
                        if (hasChanges) {
                            const activePwm = Object.entries(next).filter({
                                "useSimulation.useCallback[updatePwmStates].activePwm": ([, v])=>v > 0
                            }["useSimulation.useCallback[updatePwmStates].activePwm"]);
                            if (activePwm.length > 0) {
                                console.log('[PWM] OCR register values:', Object.fromEntries(activePwm));
                            }
                        }
                    } catch  {
                    // Ignore errors reading CPU data
                    }
                    return next;
                }
            }["useSimulation.useCallback[updatePwmStates]"]);
        }
    }["useSimulation.useCallback[updatePwmStates]"], []);
    // Debug: Log pin state changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSimulation.useEffect": ()=>{
            const activeStates = Object.entries(pinStates).filter({
                "useSimulation.useEffect.activeStates": ([, v])=>v
            }["useSimulation.useEffect.activeStates"]);
            if (activeStates.length > 0) {
                console.log('[Simulation] Active pins (HIGH):', Object.fromEntries(activeStates));
            }
        }
    }["useSimulation.useEffect"], [
        pinStates
    ]);
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
                        // Tick protocol-level input devices that depend on tight timing.
                        for (const dht of dhtDevicesRef.current){
                            dht.tick(runner.cpu.cycles);
                        }
                        for (const servo of servoDevicesRef.current){
                            servo.tick(runner.cpu.cycles);
                        }
                        for (const hcsr04 of hcsr04DevicesRef.current){
                            hcsr04.tick(runner.cpu.cycles);
                        }
                        for (const keypad of keypadDevicesRef.current){
                            keypad.tick();
                        }
                        // Process timers/USART clock events and interrupts.
                        // Without ticking, Arduino time functions (millis/delay) and Serial output won't work.
                        const cpuAny = runner.cpu;
                        // Drain due clock events/interrupts for the current cycle.
                        // Safety cap avoids infinite loops if a peripheral misbehaves.
                        for(let i = 0; i < 32; i++){
                            const dueEvent = cpuAny.nextClockEvent && cpuAny.nextClockEvent.cycles <= cpuAny.cycles;
                            const dueInterrupt = cpuAny.interruptsEnabled && cpuAny.nextInterrupt >= 0;
                            if (!dueEvent && !dueInterrupt) break;
                            cpuAny.tick();
                        }
                        const delta = runner.cpu.cycles - before;
                        remaining -= delta > 0 ? delta : 1;
                    }
                    // Update PWM states once per frame (not every instruction)
                    updatePwmStates(runner);
                    rafRef.current = requestAnimationFrame(stepFrameRef.current);
                }
            })["useSimulation.useEffect"];
        }
    }["useSimulation.useEffect"], [
        cyclesPerFrame,
        updatePwmStates
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
            dhtDevicesRef.current = [];
            servoDevicesRef.current = [];
            hcsr04DevicesRef.current = [];
            keypadDevicesRef.current = [];
            // Reset I2C devices/bus state between runs.
            try {
                const bus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])();
                bus.resetAll();
                bus.clearLog();
            } catch  {
            // Ignore reset errors
            }
            setPinStates({});
            setPwmStates({});
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
            console.log('[Simulation] Run requested', {
                hasHex: !!hexData,
                partType
            });
            if (!hexData) {
                console.warn('[Simulation] No HEX data available');
                appendSerialLine('[Simulation] No compiled program available. Click Run to compile first.');
                return;
            }
            if (!isAvrPart(partType)) {
                console.warn('[Simulation] Unsupported part type for AVR simulation:', partType);
                // avr8js only simulates AVR8 cores; ESP32 is not supported here.
                appendSerialLine(`[Simulation] Board '${partType}' is not supported by the in-browser simulator (AVR only: Uno/Nano/Mega).`);
                return;
            }
            if (!runnerRef.current) {
                try {
                    let decodedText;
                    try {
                        decodedText = decodeBase64ToString(hexData);
                    } catch (e) {
                        const msg = e instanceof Error ? e.message : String(e);
                        console.error('[Simulation] Base64 decode failed:', msg);
                        appendSerialLine(`[Simulation] Failed to decode compiled artifact: ${msg}`);
                        return;
                    }
                    if (!looksLikeIntelHex(decodedText)) {
                        // When compiling for non-AVR targets, the backend returns a binary (.bin) artifact.
                        // Even if the board string is AVR, this provides a clear signal to the user.
                        console.warn('[Simulation] Decoded artifact is not Intel HEX.');
                        appendSerialLine('[Simulation] Compiled output is not an Intel HEX file. Browser simulation currently supports AVR boards only.');
                        return;
                    }
                    const hexText = decodedText;
                    const runner = new AVRRunner(hexText);
                    // Initialize simulated peripherals for the current circuit.
                    try {
                        const bus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$i2c$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getI2CBus"])();
                        bus.resetAll();
                        bus.clearLog();
                        // Instantiate I2C output devices so they can receive Wire traffic.
                        for (const part of circuitParts){
                            const typeLower = part.type.toLowerCase();
                            const attrs = part.attrs ?? {};
                            if (typeLower.includes('lcd1602')) {
                                const addr = parseI2CAddress(attrs.i2cAddress ?? attrs.address, 0x27);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$lcd1602$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLCD1602"])(addr);
                            }
                            if (typeLower.includes('ssd1306') || typeLower.includes('oled')) {
                                const addr = parseI2CAddress(attrs.i2cAddress ?? attrs.address, 0x3c);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$ssd1306$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSSD1306"])(addr);
                            }
                        }
                        // Instantiate DHT input devices and bind them to the MCU pin they are wired to.
                        dhtDevicesRef.current = [];
                        const mcuPart = circuitParts.find({
                            "useSimulation.useCallback[run].mcuPart": (p)=>p.type === partType
                        }["useSimulation.useCallback[run].mcuPart"]);
                        if (mcuPart) {
                            const adjacency = buildAdjacency(connections);
                            for (const part of circuitParts){
                                const typeLower = part.type.toLowerCase();
                                if (!typeLower.includes('dht')) continue;
                                const dhtType = typeLower.includes('dht11') ? 'dht11' : 'dht22';
                                // Try multiple possible pin names that DHT sensors use
                                const possiblePinNames = [
                                    'SDA',
                                    'DATA',
                                    'OUT',
                                    'SIGNAL',
                                    'DQ'
                                ];
                                let foundPin = null;
                                let usedPinName = null;
                                for (const pinName of possiblePinNames){
                                    const startKey = `${part.id}:${pinName}`;
                                    const pin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                                    if (pin != null) {
                                        foundPin = pin;
                                        usedPinName = pinName;
                                        break;
                                    }
                                }
                                if (foundPin == null) {
                                    // Only log detailed debug info in development mode
                                    if ("TURBOPACK compile-time truthy", 1) {
                                        console.log(`[DHT] No connection found for ${part.id} (${dhtType}):`, {
                                            triedPins: possiblePinNames,
                                            adjacencyKeys: [
                                                ...adjacency.keys()
                                            ].filter({
                                                "useSimulation.useCallback[run]": (k)=>k.startsWith(part.id)
                                            }["useSimulation.useCallback[run]"])
                                        });
                                    }
                                    continue;
                                }
                                const portBit = getPortBitForArduinoDigitalPin(runner, foundPin);
                                if (!portBit) {
                                    console.warn(`[DHT] Pin ${foundPin} not supported for DHT simulation`);
                                    continue;
                                }
                                const partId = part.id;
                                const portName = portBit.port === runner.portD ? 'D' : portBit.port === runner.portB ? 'B' : 'C';
                                console.log(`[DHT] Binding ${partId} to port${portName}${portBit.bit} (Arduino pin ${foundPin})`);
                                dhtDevicesRef.current.push(new __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$dht$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DHTDevice"]({
                                    type: dhtType,
                                    port: portBit.port,
                                    bit: portBit.bit,
                                    cpuFrequencyHz: 16_000_000,
                                    readValues: {
                                        "useSimulation.useCallback[run]": ()=>{
                                            const state = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"].getState();
                                            const pNow = state.circuitParts.find({
                                                "useSimulation.useCallback[run].pNow": (p)=>p.id === partId
                                            }["useSimulation.useCallback[run].pNow"]);
                                            const attrs = pNow?.attrs ?? {};
                                            const tRaw = attrs.temperature;
                                            const hRaw = attrs.humidity;
                                            const t = typeof tRaw === 'number' ? tRaw : Number.parseFloat(String(tRaw ?? '25'));
                                            const h = typeof hRaw === 'number' ? hRaw : Number.parseFloat(String(hRaw ?? '50'));
                                            return {
                                                temperatureC: Number.isFinite(t) ? t : 25,
                                                humidity: Number.isFinite(h) ? h : 50
                                            };
                                        }
                                    }["useSimulation.useCallback[run]"]
                                }));
                            }
                        }
                    } catch (e) {
                        console.warn('[Simulation] Peripheral initialization failed:', e);
                    }
                    const onPortB = {
                        "useSimulation.useCallback[run].onPortB": (value)=>updatePortPins('B', value)
                    }["useSimulation.useCallback[run].onPortB"];
                    const onPortC = {
                        "useSimulation.useCallback[run].onPortC": (value)=>updatePortPins('C', value)
                    }["useSimulation.useCallback[run].onPortC"];
                    const onPortD = {
                        "useSimulation.useCallback[run].onPortD": (value)=>updatePortPins('D', value)
                    }["useSimulation.useCallback[run].onPortD"];
                    runner.portB.addListener(onPortB);
                    runner.portC.addListener(onPortC);
                    runner.portD.addListener(onPortD);
                    // Set up ADC channel value provider for analogRead() support
                    // This allows potentiometers and other analog sensors to provide values
                    // Normalize partType for comparison (handle both "wokwi-" prefixed and non-prefixed)
                    const normalizedPartType = partType.replace('wokwi-', '');
                    const mcuPart = circuitParts.find({
                        "useSimulation.useCallback[run].mcuPart": (p)=>{
                            const normalizedPType = p.type.replace('wokwi-', '');
                            return normalizedPType === normalizedPartType;
                        }
                    }["useSimulation.useCallback[run].mcuPart"]);
                    console.log('[ADC Setup] Looking for MCU:', partType, 'normalized:', normalizedPartType);
                    console.log('[ADC Setup] Circuit parts:', circuitParts.map({
                        "useSimulation.useCallback[run]": (p)=>({
                                id: p.id,
                                type: p.type
                            })
                    }["useSimulation.useCallback[run]"]));
                    console.log('[ADC Setup] Found MCU:', mcuPart?.id, mcuPart?.type);
                    if (mcuPart) {
                        const adjacency = buildAdjacency(connections);
                        // Map analog channels to the components connected to them
                        const analogChannelMap = new Map(); // channel -> partId
                        const interactiveManager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInteractiveComponentManager"])();
                        for (const part of circuitParts){
                            const typeLower = part.type.toLowerCase();
                            // Check for analog input components
                            if (typeLower.includes('potentiometer') || typeLower.includes('photoresistor') || typeLower.includes('ntc') || typeLower.includes('ldr')) {
                                // Register the component with the interactive manager
                                interactiveManager.registerComponent(part.id, part.type);
                                // Find which analog pin this component's signal pin is connected to
                                const signalPins = [
                                    'SIG',
                                    'SIGNAL',
                                    'OUT',
                                    'WIPER',
                                    'AO'
                                ];
                                for (const pinName of signalPins){
                                    const startKey = `${part.id}:${pinName}`;
                                    const mcuPin = findConnectedMcuDigitalPin(adjacency, startKey, mcuPart.id);
                                    if (mcuPin != null && mcuPin >= 14 && mcuPin <= 19) {
                                        // Analog pins A0-A5 are digital pins 14-19
                                        const channel = mcuPin - 14;
                                        analogChannelMap.set(channel, part.id);
                                        console.log(`[ADC] Mapped ${part.id} (${pinName}) to analog channel ${channel} (A${channel})`);
                                        break;
                                    }
                                }
                            }
                        }
                        // Set up ADC channel value callback
                        // The callback receives an ADCMuxInput object with type and channel info
                        runner.adc.onADCRead = ({
                            "useSimulation.useCallback[run]": (input)=>{
                                // Only handle single-ended ADC reads (normal analogRead)
                                if (input.type === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$adc$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ADCMuxInputType"].SingleEnded) {
                                    const channel = input.channel;
                                    const partId = analogChannelMap.get(channel);
                                    if (partId) {
                                        // Get value from interactive component manager
                                        const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInteractiveComponentManager"])();
                                        const value = manager.getValue(partId) ?? 512;
                                        console.log(`[ADC] Channel ${channel} (${partId}) read: ${value}`);
                                        // Complete the ADC read with the value
                                        runner.adc.completeADCRead(value);
                                        return;
                                    }
                                }
                                // Default: complete with mid-range value
                                runner.adc.completeADCRead(512);
                            }
                        })["useSimulation.useCallback[run]"];
                    }
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
                    updatePortPins('C', runner.cpu.data[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portCConfig"].PORT]);
                    updatePortPins('D', runner.cpu.data[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$avr8js$2f$dist$2f$esm$2f$peripherals$2f$gpio$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["portDConfig"].PORT]);
                    runnerRef.current = runner;
                    console.log('[Simulation] AVR Runner initialized successfully');
                    appendSerialLine('[Simulation] Started (AVR8js)');
                } catch (err) {
                    console.error('[Simulation] Failed to initialize AVR runner:', err);
                    const msg = err instanceof Error ? err.message : String(err);
                    appendSerialLine(`[Simulation] Failed to start: ${msg}`);
                    return;
                }
            }
            if (runningRef.current) return;
            runningRef.current = true;
            setIsRunning(true);
            rafRef.current = requestAnimationFrame(stepFrame);
        }
    }["useSimulation.useCallback[run]"], [
        appendSerialLine,
        circuitParts,
        connections,
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
        pwmStates,
        serialOutput,
        clearSerialOutput
    };
}
_s(useSimulation, "0Xyoc/xDHW+CrQCpDBPluS5+S5E=", false, function() {
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
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-code.js [app-client] (ecmascript) <export default as FileCode>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-client] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$tree$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderTree$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-tree.js [app-client] (ecmascript) <export default as FolderTree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-close.js [app-client] (ecmascript) <export default as PanelLeftClose>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left-open.js [app-client] (ecmascript) <export default as PanelLeftOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.js [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-client] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-client] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/github.js [app-client] (ecmascript) <export default as Github>");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FeaturedProjectsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/FeaturedProjectsPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useDiagramSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useDiagramSync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSimulation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useSimulation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAppStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/cn.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/simulation/interactiveComponents.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
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
                    lineNumber: 99,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 93,
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
                    lineNumber: 107,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-1 h-5 w-px bg-ide-border"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 109,
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
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 110,
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
                    lineNumber: 124,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_c = CanvasToolbar;
/* ============================================
   Unified Action Bar (Command Center)
   ============================================ */ function UnifiedActionBar({ isCompiling, compilationError, onRun, hasProgram, isRunning, onStop }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-6 left-1/2 z-40 -translate-x-1/2 animate-slide-up",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "floating-bar flex items-center gap-2 px-3 py-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: onRun,
                    disabled: isCompiling,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group relative flex items-center gap-2 rounded-lg px-4 py-2', 'text-sm font-semibold transition-all duration-200', 'btn-press', isCompiling ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed' : isRunning ? 'bg-ide-success/20 text-ide-success cursor-not-allowed' : 'bg-ide-success text-white hover:bg-ide-success/90 shadow-lg shadow-ide-success/20'),
                    title: isRunning ? 'Simulation running' : 'Compile and run',
                    children: isCompiling ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 170,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Compiling..."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 171,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : isRunning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-2 w-2 rounded-full bg-ide-success animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 175,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Running..."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 176,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                className: "h-4 w-4 fill-current"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 180,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Run Simulation"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 181,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 152,
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
                        lineNumber: 200,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-1 h-6 w-px bg-ide-border"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2 rounded-lg bg-ide-panel-bg/80 px-3 py-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-2 w-2 rounded-full transition-colors duration-300', isCompiling ? 'bg-ide-warning animate-pulse' : compilationError ? 'bg-ide-error' : hasProgram ? isRunning ? 'bg-ide-success animate-pulse' : 'bg-ide-success' : 'bg-ide-text-subtle')
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 207,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-medium text-ide-text-muted",
                            children: isCompiling ? 'Compiling' : compilationError ? 'Error' : hasProgram ? isRunning ? 'Running' : 'Ready' : 'Idle'
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 221,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 206,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 150,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
_c1 = UnifiedActionBar;
/* ============================================
   Simulation Canvas Inner (ReactFlow)
   ============================================ */ function SimulationCanvasInner({ canvasRef, isRunning, componentPinStates, componentPwmStates }) {
    _s();
    const addPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[addPart]": (s)=>s.addPart
    }["SimulationCanvasInner.useAppStore[addPart]"]);
    const removePart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[removePart]": (s)=>s.removePart
    }["SimulationCanvasInner.useAppStore[removePart]"]);
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
    const circuitGeneratedVersion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "SimulationCanvasInner.useAppStore[circuitGeneratedVersion]": (s)=>s.circuitGeneratedVersion
    }["SimulationCanvasInner.useAppStore[circuitGeneratedVersion]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useDiagramSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDiagramSync"])();
    const { zoomIn, zoomOut, fitView, setViewport } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useReactFlow"])();
    // Auto-fit view after AI generates a circuit
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            if (circuitGeneratedVersion > 0 && circuitParts.length > 0) {
                // Delay to allow nodes to render in ReactFlow
                const timer = setTimeout({
                    "SimulationCanvasInner.useEffect.timer": ()=>{
                        fitView({
                            padding: 0.2,
                            duration: 500
                        });
                    }
                }["SimulationCanvasInner.useEffect.timer"], 150);
                return ({
                    "SimulationCanvasInner.useEffect": ()=>clearTimeout(timer)
                })["SimulationCanvasInner.useEffect"];
            }
        }
    }["SimulationCanvasInner.useEffect"], [
        circuitGeneratedVersion,
        fitView,
        circuitParts.length
    ]);
    const getCanvasRect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[getCanvasRect]": ()=>{
            return canvasRef.current?.getBoundingClientRect() ?? null;
        }
    }["SimulationCanvasInner.useCallback[getCanvasRect]"], [
        canvasRef
    ]);
    const [selectedEdge, setSelectedEdge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [nodes, setNodes, onNodesChange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useNodesState"])([]);
    // Track button pressed states for simulation input
    const [pressedButtons, setPressedButtons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Track interactive component values for display
    const [interactiveValues, setInteractiveValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Register interactive components and subscribe to value changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInteractiveComponentManager"])();
            // Register all interactive components in the circuit
            for (const part of circuitParts){
                if (manager.isInteractive(part.type)) {
                    manager.registerComponent(part.id, part.type);
                }
            }
            // Subscribe to value changes to update display
            const unsubscribe = manager.subscribe({
                "SimulationCanvasInner.useEffect.unsubscribe": (states)=>{
                    const values = {};
                    for (const [partId, state] of states){
                        values[partId] = state.value;
                    }
                    setInteractiveValues(values);
                }
            }["SimulationCanvasInner.useEffect.unsubscribe"]);
            // Initialize values from current state
            const currentStates = manager.getAllStates();
            const initialValues = {};
            for (const [partId, state] of currentStates){
                initialValues[partId] = state.value;
            }
            setInteractiveValues(initialValues);
            return unsubscribe;
        }
    }["SimulationCanvasInner.useEffect"], [
        circuitParts
    ]);
    // Handler for interactive component value changes (potentiometers, etc.)
    const handleValueChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleValueChange]": (partId, value)=>{
            const manager = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$simulation$2f$interactiveComponents$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInteractiveComponentManager"])();
            manager.setValue(partId, value);
            console.log('[SimulationCanvas] Value change:', partId, value);
        }
    }["SimulationCanvasInner.useCallback[handleValueChange]"], []);
    // Handlers for button press/release
    const handleButtonPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleButtonPress]": (partId)=>{
            setPressedButtons({
                "SimulationCanvasInner.useCallback[handleButtonPress]": (prev)=>new Set(prev).add(partId)
            }["SimulationCanvasInner.useCallback[handleButtonPress]"]);
            console.log('[SimulationCanvas] Button pressed:', partId);
        }
    }["SimulationCanvasInner.useCallback[handleButtonPress]"], []);
    const handleButtonRelease = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[handleButtonRelease]": (partId)=>{
            setPressedButtons({
                "SimulationCanvasInner.useCallback[handleButtonRelease]": (prev)=>{
                    const next = new Set(prev);
                    next.delete(partId);
                    return next;
                }
            }["SimulationCanvasInner.useCallback[handleButtonRelease]"]);
            console.log('[SimulationCanvas] Button released:', partId);
        }
    }["SimulationCanvasInner.useCallback[handleButtonRelease]"], []);
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
            // Don't sync while user is dragging - this prevents the sync from
            // resetting node positions during drag
            if (isDraggingRef.current) return;
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
                            partType: part.type.replace('wokwi-', ''),
                            onDeletePart: removePart,
                            attrs: part.attrs ?? {},
                            // Interactive component handlers
                            onValueChange: handleValueChange,
                            interactiveValue: interactiveValues[part.id],
                            onButtonPress: handleButtonPress,
                            onButtonRelease: handleButtonRelease
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
            // Check if parts have changed: different count or different IDs
            const idsChanged = newIds.size !== currentIds.size || [
                ...newIds
            ].some({
                "SimulationCanvasInner.useEffect": (id)=>!currentIds.has(id)
            }["SimulationCanvasInner.useEffect"]) || [
                ...currentIds
            ].some({
                "SimulationCanvasInner.useEffect": (id)=>!newIds.has(id)
            }["SimulationCanvasInner.useEffect"]);
            // Only sync when IDs change (parts added/removed)
            // Don't sync based on position changes - let ReactFlow handle position updates
            if (idsChanged) {
                console.log('[SimulationCanvas] Syncing nodes due to ID change:', {
                    oldCount: nodes.length,
                    newCount: newNodes.length
                });
                setNodes(newNodes);
            }
        }
    }["SimulationCanvasInner.useEffect"], [
        circuitParts,
        getCanvasRect,
        handleButtonPress,
        handleButtonRelease,
        handleValueChange,
        interactiveValues,
        nodes,
        removePart,
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
                                        getCanvasRect,
                                        onDeletePart: removePart,
                                        onValueChange: handleValueChange,
                                        interactiveValue: interactiveValues[node.id],
                                        onButtonPress: handleButtonPress,
                                        onButtonRelease: handleButtonRelease
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
        handleButtonPress,
        handleButtonRelease,
        handleValueChange,
        interactiveValues,
        removePart,
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
    // Update node data with simulation pin states for visual component updates
    // Force re-render by including a timestamp when PWM values change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SimulationCanvasInner.useEffect": ()=>{
            const updateTime = Date.now();
            setNodes({
                "SimulationCanvasInner.useEffect": (nds)=>nds.map({
                        "SimulationCanvasInner.useEffect": (node)=>{
                            if (node.type === 'wokwi') {
                                const simStates = componentPinStates?.[node.id];
                                const pwmValue = componentPwmStates?.[node.id];
                                const hasPwm = typeof pwmValue === 'number' && pwmValue > 0;
                                return {
                                    ...node,
                                    // Force ReactFlow to detect changes by updating a top-level property
                                    data: {
                                        ...node.data,
                                        simulationPinStates: simStates,
                                        pwmValue: pwmValue,
                                        // Include update timestamp to force re-render when values change
                                        _simUpdateTime: hasPwm || simStates ? updateTime : undefined
                                    }
                                };
                            }
                            return node;
                        }
                    }["SimulationCanvasInner.useEffect"])
            }["SimulationCanvasInner.useEffect"]);
        }
    }["SimulationCanvasInner.useEffect"], [
        componentPinStates,
        componentPwmStates,
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
    // Double-click to delete component
    const onNodeDoubleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeDoubleClick]": (_, node)=>{
            // Get the part type for a better confirmation message
            const part = circuitParts.find({
                "SimulationCanvasInner.useCallback[onNodeDoubleClick].part": (p)=>p.id === node.id
            }["SimulationCanvasInner.useCallback[onNodeDoubleClick].part"]);
            const partName = part?.type.replace('wokwi-', '').replace(/-/g, ' ') || 'component';
            if (confirm(`Delete this ${partName}?`)) {
                removePart(node.id);
            }
        }
    }["SimulationCanvasInner.useCallback[onNodeDoubleClick]"], [
        circuitParts,
        removePart
    ]);
    // Group-drag engine
    const dragStartNodesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const dragStartWirePointsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const dragWireModeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const [wirePointOverrides, setWirePointOverrides] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isDraggingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const onNodeDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SimulationCanvasInner.useCallback[onNodeDragStart]": (_, node)=>{
            isDraggingRef.current = true;
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
            isDraggingRef.current = false;
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
                                partType,
                                onValueChange: handleValueChange,
                                onButtonPress: handleButtonPress,
                                onButtonRelease: handleButtonRelease
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
        handleButtonPress,
        handleButtonRelease,
        handleValueChange,
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
                lineNumber: 669,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SelectionOverlay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                containerRef: canvasRef
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 676,
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
                onNodeDoubleClick: onNodeDoubleClick,
                onNodeDragStart: onNodeDragStart,
                onNodeDrag: onNodeDrag,
                onNodeDragStop: onNodeDragStop,
                snapToGrid: true,
                snapGrid: [
                    20,
                    20
                ],
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
                        lineNumber: 711,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Controls"], {
                        className: "!left-4 !bottom-20"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 712,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WiringLayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        containerRef: canvasRef,
                        wirePointOverrides: wirePointOverrides ?? undefined
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 714,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 678,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 660,
        columnNumber: 5
    }, this);
}
_s(SimulationCanvasInner, "V7Tz0wdTDq7g3M1si8nWsGwsLa8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
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
function SimulationCanvas({ isRunning, componentPinStates, componentPwmStates }) {
    _s1();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$xyflow$2f$react$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ReactFlowProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationCanvasInner, {
            canvasRef: canvasRef,
            isRunning: isRunning,
            componentPinStates: componentPinStates,
            componentPwmStates: componentPwmStates
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 735,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 734,
        columnNumber: 5
    }, this);
}
_s1(SimulationCanvas, "hw7YJ5TVw+lAu0tRkzoDS8rL7/E=");
_c3 = SimulationCanvas;
/* ============================================
   Code Editor Panel
   ============================================ */ function CodeEditorPanel({ compilationError }) {
    _s2();
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[files]": (s)=>s.files
    }["CodeEditorPanel.useAppStore[files]"]);
    const openFilePaths = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[openFilePaths]": (s)=>s.openFilePaths
    }["CodeEditorPanel.useAppStore[openFilePaths]"]);
    const activeFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[activeFilePath]": (s)=>s.activeFilePath
    }["CodeEditorPanel.useAppStore[activeFilePath]"]);
    const setActiveFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[setActiveFile]": (s)=>s.setActiveFile
    }["CodeEditorPanel.useAppStore[setActiveFile]"]);
    const closeFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[closeFile]": (s)=>s.closeFile
    }["CodeEditorPanel.useAppStore[closeFile]"]);
    const updateFileContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[updateFileContent]": (s)=>s.updateFileContent
    }["CodeEditorPanel.useAppStore[updateFileContent]"]);
    const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "CodeEditorPanel.useAppStore[settings]": (s)=>s.settings
    }["CodeEditorPanel.useAppStore[settings]"]);
    const activeFile = files.find((f)=>f.path === activeFilePath);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col overflow-hidden bg-ide-panel-surface",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-bg overflow-x-auto",
                children: openFilePaths.map((path)=>{
                    const file = files.find((f)=>f.path === path);
                    if (!file) return null;
                    const isActive = path === activeFilePath;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group flex h-full items-center gap-1.5 border-r border-ide-border px-2 text-xs font-medium transition-colors cursor-pointer', isActive ? 'bg-ide-panel-surface text-ide-text border-b-2 border-b-ide-accent' : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'),
                        onClick: ()=>setActiveFile(path),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode$3e$__["FileCode"], {
                                className: "h-3.5 w-3.5 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 782,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate max-w-[120px]",
                                children: file.path
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 783,
                                columnNumber: 15
                            }, this),
                            file.includeInSimulation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-1.5 w-1.5 rounded-full bg-ide-success shrink-0",
                                title: "Included in simulation"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 785,
                                columnNumber: 17
                            }, this),
                            openFilePaths.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    closeFile(path);
                                },
                                className: "ml-1 flex h-4 w-4 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-ide-panel-hover transition-all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 796,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 788,
                                columnNumber: 17
                            }, this)
                        ]
                    }, path, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 772,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 766,
                columnNumber: 7
            }, this),
            compilationError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-b border-ide-error/30 bg-ide-error/10 px-4 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                    className: "whitespace-pre-wrap break-words font-mono text-xs text-ide-error",
                    children: compilationError
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 807,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 806,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 p-2",
                children: activeFile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    value: activeFile.content,
                    onChange: (e)=>updateFileContent(activeFile.path, e.target.value),
                    spellCheck: false,
                    readOnly: activeFile.isReadOnly,
                    style: {
                        fontSize: `${settings.editorFontSize}px`,
                        tabSize: settings.editorTabSize
                    },
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-full w-full resize-none rounded-md bg-ide-panel-bg p-4', 'font-mono leading-6 text-ide-text', 'border border-ide-border', 'focus:outline-none focus:ring-1 focus:ring-ide-accent/50 focus:border-ide-accent/50', 'placeholder:text-ide-text-subtle', activeFile.isReadOnly && 'opacity-75 cursor-not-allowed'),
                    placeholder: "// Write your Arduino code here..."
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 816,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full items-center justify-center text-ide-text-subtle",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: "No file selected"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 834,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 833,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 814,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 764,
        columnNumber: 5
    }, this);
}
_s2(CodeEditorPanel, "5cySjkr8MWVJUhaHoctnH0bdWhg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c4 = CodeEditorPanel;
/* ============================================
   Files Panel Component
   ============================================ */ function FilesPanel() {
    _s3();
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[files]": (s)=>s.files
    }["FilesPanel.useAppStore[files]"]);
    const activeFilePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[activeFilePath]": (s)=>s.activeFilePath
    }["FilesPanel.useAppStore[activeFilePath]"]);
    const openFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[openFile]": (s)=>s.openFile
    }["FilesPanel.useAppStore[openFile]"]);
    const addFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[addFile]": (s)=>s.addFile
    }["FilesPanel.useAppStore[addFile]"]);
    const deleteFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[deleteFile]": (s)=>s.deleteFile
    }["FilesPanel.useAppStore[deleteFile]"]);
    const renameFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[renameFile]": (s)=>s.renameFile
    }["FilesPanel.useAppStore[renameFile]"]);
    const toggleFileSimulation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "FilesPanel.useAppStore[toggleFileSimulation]": (s)=>s.toggleFileSimulation
    }["FilesPanel.useAppStore[toggleFileSimulation]"]);
    const [showNewFileInput, setShowNewFileInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newFileName, setNewFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [contextMenu, setContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [renamingFile, setRenamingFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [renameValue, setRenameValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const handleAddFile = ()=>{
        if (newFileName.trim()) {
            addFile(newFileName.trim());
            setNewFileName('');
            setShowNewFileInput(false);
        }
    };
    const handleContextMenu = (e, file)=>{
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            file
        });
    };
    const handleRename = (oldPath)=>{
        if (renameValue.trim() && renameValue !== oldPath) {
            renameFile(oldPath, renameValue.trim());
        }
        setRenamingFile(null);
        setRenameValue('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-ide-border px-3 py-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-medium text-ide-text-muted",
                        children: "PROJECT FILES"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 885,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setShowNewFileInput(true),
                        className: "flex h-6 w-6 items-center justify-center rounded text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                        title: "New File",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 892,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 886,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 884,
                columnNumber: 7
            }, this),
            showNewFileInput && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-ide-border px-3 py-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    value: newFileName,
                    onChange: (e)=>setNewFileName(e.target.value),
                    onKeyDown: (e)=>{
                        if (e.key === 'Enter') handleAddFile();
                        if (e.key === 'Escape') {
                            setShowNewFileInput(false);
                            setNewFileName('');
                        }
                    },
                    placeholder: "filename.cpp",
                    className: "w-full rounded border border-ide-border bg-ide-panel-bg px-2 py-1 text-xs text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none",
                    autoFocus: true
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 899,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 898,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-auto p-2",
                children: files.map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onContextMenu: (e)=>handleContextMenu(e, file),
                        onClick: ()=>openFile(file.path),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('group flex items-center justify-between rounded px-2 py-1.5 text-xs cursor-pointer transition-colors', activeFilePath === file.path ? 'bg-ide-accent/20 text-ide-text' : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'),
                        children: [
                            renamingFile === file.path ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: renameValue,
                                onChange: (e)=>setRenameValue(e.target.value),
                                onBlur: ()=>handleRename(file.path),
                                onKeyDown: (e)=>{
                                    if (e.key === 'Enter') handleRename(file.path);
                                    if (e.key === 'Escape') {
                                        setRenamingFile(null);
                                        setRenameValue('');
                                    }
                                },
                                className: "flex-1 rounded border border-ide-accent bg-ide-panel-bg px-1 text-xs text-ide-text focus:outline-none",
                                autoFocus: true,
                                onClick: (e)=>e.stopPropagation()
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 932,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$code$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCode$3e$__["FileCode"], {
                                        className: "h-3.5 w-3.5 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 950,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: file.path
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 951,
                                        columnNumber: 17
                                    }, this),
                                    file.isMain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "shrink-0 rounded bg-ide-accent/20 px-1 py-0.5 text-[9px] font-medium text-ide-accent",
                                        children: "main"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 953,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 949,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        toggleFileSimulation(file.path);
                                    },
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-5 w-5 items-center justify-center rounded transition-colors', file.includeInSimulation ? 'text-ide-success hover:bg-ide-success/20' : 'text-ide-text-subtle hover:bg-ide-panel-hover'),
                                    title: file.includeInSimulation ? 'Included in simulation' : 'Excluded from simulation',
                                    children: file.includeInSimulation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 974,
                                        columnNumber: 45
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 974,
                                        columnNumber: 75
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 960,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 959,
                                columnNumber: 13
                            }, this)
                        ]
                    }, file.path, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 920,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 918,
                columnNumber: 7
            }, this),
            contextMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-50",
                        onClick: ()=>setContextMenu(null)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 984,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-50 w-40 rounded-lg border border-ide-border bg-ide-panel-surface py-1 shadow-lg",
                        style: {
                            left: contextMenu.x,
                            top: contextMenu.y
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setRenamingFile(contextMenu.file.path);
                                    setRenameValue(contextMenu.file.path);
                                    setContextMenu(null);
                                },
                                className: "flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text",
                                children: "Rename"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 992,
                                columnNumber: 13
                            }, this),
                            !contextMenu.file.isMain && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    deleteFile(contextMenu.file.path);
                                    setContextMenu(null);
                                },
                                className: "flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ide-error hover:bg-ide-error/10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        className: "h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1012,
                                        columnNumber: 17
                                    }, this),
                                    "Delete"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1004,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 988,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 882,
        columnNumber: 5
    }, this);
}
_s3(FilesPanel, "PMbg/YvshfagjMRY3Geaq587nyk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
_c5 = FilesPanel;
function LeftPanel() {
    _s4();
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
                                lineNumber: 1055,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: tab.label
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1056,
                                columnNumber: 15
                            }, this)
                        ]
                    }, tab.key, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1044,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1039,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-0 flex-1 overflow-hidden",
                children: [
                    activeTab === 'components' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full overflow-auto p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ComponentLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1066,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1065,
                        columnNumber: 11
                    }, this),
                    activeTab === 'files' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FilesPanel, {}, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1070,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1063,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1037,
        columnNumber: 5
    }, this);
}
_s4(LeftPanel, "xS+ob+rHSvt7VPIaW/bMTlbaAmQ=");
_c6 = LeftPanel;
/* ============================================
   Resize Handle Component
   ============================================ */ function ResizeHandle({ direction = 'horizontal', className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PanelResizeHandle"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('resize-handle group relative flex items-center justify-center', direction === 'horizontal' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize', className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$cn$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('absolute rounded-full bg-ide-border opacity-0 group-hover:opacity-100 transition-opacity', direction === 'horizontal' ? 'w-0.5 h-8' : 'h-0.5 w-8')
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 1097,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1088,
        columnNumber: 5
    }, this);
}
_c7 = ResizeHandle;
function Home() {
    _s5();
    const [leftPanelCollapsed, setLeftPanelCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bottomPanelCollapsed, setBottomPanelCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPublishModal, setShowPublishModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showFeaturedProjects, setShowFeaturedProjects] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[files]": (s)=>s.files
    }["Home.useAppStore[files]"]);
    const circuitParts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[circuitParts]": (s)=>s.circuitParts
    }["Home.useAppStore[circuitParts]"]);
    const connections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "Home.useAppStore[connections]": (s)=>s.connections
    }["Home.useAppStore[connections]"]);
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
    const { run: simRun, stop: simStop, isRunning: simIsRunning, pinStates, pwmStates, serialOutput, clearSerialOutput } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useSimulation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSimulation"])(hex, compiledBoard ?? '');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!hex || !compiledBoard) return;
            if (isCompiling) return;
            if (compilationError) return;
            if (simIsRunning) return;
            console.log('[Page] Auto-starting simulation');
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
    // Compute component pin states based on connections and Arduino pinStates
    // This maps component IDs to their simulated pin values for visual updates
    const componentPinStates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[componentPinStates]": ()=>{
            const states = {};
            const mcuPart = circuitParts.find({
                "Home.useMemo[componentPinStates].mcuPart": (p)=>p.type.includes('arduino') || p.type.includes('esp32') || p.type.includes('pi-pico')
            }["Home.useMemo[componentPinStates].mcuPart"]);
            if (!mcuPart) {
                console.log('[componentPinStates] No MCU part found in:', circuitParts.map({
                    "Home.useMemo[componentPinStates]": (p)=>({
                            id: p.id,
                            type: p.type
                        })
                }["Home.useMemo[componentPinStates]"]));
                return states;
            }
            console.log('[componentPinStates] MCU:', mcuPart.id, 'type:', mcuPart.type);
            console.log('[componentPinStates] Connections:', connections.length, connections);
            console.log('[componentPinStates] Pin states from simulation:', pinStates);
            const keyOf = {
                "Home.useMemo[componentPinStates].keyOf": (partId, pinId)=>`${partId}:${pinId}`
            }["Home.useMemo[componentPinStates].keyOf"];
            // Build an undirected connectivity graph of all wired pin endpoints.
            const adjacency = new Map();
            for (const conn of connections){
                const a = keyOf(conn.from.partId, conn.from.pinId);
                const b = keyOf(conn.to.partId, conn.to.pinId);
                if (!adjacency.has(a)) adjacency.set(a, new Set());
                if (!adjacency.has(b)) adjacency.set(b, new Set());
                adjacency.get(a).add(b);
                adjacency.get(b).add(a);
            }
            console.log('[componentPinStates] Adjacency graph:', [
                ...adjacency.entries()
            ].map({
                "Home.useMemo[componentPinStates]": ([k, v])=>`${k} -> [${[
                        ...v
                    ].join(', ')}]`
            }["Home.useMemo[componentPinStates]"]));
            // For pass-through components (resistors, wires), treat all pins as electrically connected.
            // This allows signal propagation through these components.
            const passThroughTypes = [
                'resistor',
                'wokwi-resistor'
            ];
            for (const part of circuitParts){
                if (!passThroughTypes.some({
                    "Home.useMemo[componentPinStates]": (t)=>part.type.includes(t)
                }["Home.useMemo[componentPinStates]"])) continue;
                // Find all pins of this part that are in the adjacency graph
                const partPins = [];
                for (const key of adjacency.keys()){
                    if (key.startsWith(`${part.id}:`)) {
                        partPins.push(key);
                    }
                }
                // Connect all pins of this pass-through component to each other
                for(let i = 0; i < partPins.length; i++){
                    for(let j = i + 1; j < partPins.length; j++){
                        adjacency.get(partPins[i])?.add(partPins[j]);
                        adjacency.get(partPins[j])?.add(partPins[i]);
                    }
                }
            }
            console.log('[componentPinStates] Adjacency after pass-through:', [
                ...adjacency.entries()
            ].map({
                "Home.useMemo[componentPinStates]": ([k, v])=>`${k} -> [${[
                        ...v
                    ].join(', ')}]`
            }["Home.useMemo[componentPinStates]"]));
            // Seed known net values from MCU pins + basic power/ground inference.
            const netValue = new Map();
            const normalizePinName = {
                "Home.useMemo[componentPinStates].normalizePinName": (pinId)=>pinId.trim().toUpperCase()
            }["Home.useMemo[componentPinStates].normalizePinName"];
            const inferFixedPinValue = {
                "Home.useMemo[componentPinStates].inferFixedPinValue": (pinId)=>{
                    const p = normalizePinName(pinId);
                    if (p === 'GND' || p === 'GROUND') return false;
                    if (p === 'VCC' || p === '5V' || p === '3V3' || p === '3.3V' || p === 'VIN') return true;
                    return null;
                }
            }["Home.useMemo[componentPinStates].inferFixedPinValue"];
            const inferMcuPinValue = {
                "Home.useMemo[componentPinStates].inferMcuPinValue": (pinId)=>{
                    const fixed = inferFixedPinValue(pinId);
                    if (fixed !== null) return fixed;
                    // Digital pins exposed as numeric strings on Wokwi Arduino elements ("13", "0", ...)
                    if (/^\d+$/.test(pinId)) {
                        const pinNum = parseInt(pinId, 10);
                        const v = pinStates[pinNum];
                        return typeof v === 'boolean' ? v : null;
                    }
                    return null;
                }
            }["Home.useMemo[componentPinStates].inferMcuPinValue"];
            for (const conn of connections){
                for (const endpoint of [
                    conn.from,
                    conn.to
                ]){
                    if (endpoint.partId !== mcuPart.id) continue;
                    const v = inferMcuPinValue(endpoint.pinId);
                    if (v === null) continue;
                    netValue.set(keyOf(endpoint.partId, endpoint.pinId), v);
                }
            }
            // Also seed any explicit power/ground pins on any part (helps when the MCU isn't directly connected).
            for (const conn of connections){
                for (const endpoint of [
                    conn.from,
                    conn.to
                ]){
                    const fixed = inferFixedPinValue(endpoint.pinId);
                    if (fixed === null) continue;
                    netValue.set(keyOf(endpoint.partId, endpoint.pinId), fixed);
                }
            }
            // Propagate values across connected nets (simple BFS).
            // If multiple seeds exist on the same net, the first discovered value wins (simplest behavior).
            const queue = [
                ...netValue.keys()
            ];
            const seen = new Set(queue);
            while(queue.length){
                const cur = queue.shift();
                const curVal = netValue.get(cur);
                if (curVal === undefined) continue;
                const neighbors = adjacency.get(cur);
                if (!neighbors) continue;
                for (const n of neighbors){
                    if (!netValue.has(n)) {
                        netValue.set(n, curVal);
                    }
                    if (!seen.has(n)) {
                        seen.add(n);
                        queue.push(n);
                    }
                }
            }
            // Materialize per-component pin states for visual updates.
            for (const [k, v] of netValue.entries()){
                const idx = k.indexOf(':');
                if (idx < 0) continue;
                const partId = k.slice(0, idx);
                const pinId = k.slice(idx + 1);
                if (!states[partId]) states[partId] = {};
                states[partId][pinId] = v;
            }
            console.log('[componentPinStates] Final states:', states);
            return states;
        }
    }["Home.useMemo[componentPinStates]"], [
        circuitParts,
        connections,
        pinStates
    ]);
    // Compute PWM values for components based on connections to PWM pins
    // This follows the connection graph through passive components (resistors, wires)
    const componentPwmStates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[componentPwmStates]": ()=>{
            const states = {};
            const mcuPart = circuitParts.find({
                "Home.useMemo[componentPwmStates].mcuPart": (p)=>p.type.includes('arduino') || p.type.includes('esp32') || p.type.includes('pi-pico')
            }["Home.useMemo[componentPwmStates].mcuPart"]);
            if (!mcuPart) return states;
            // Build adjacency graph for tracing connections
            const adjacency = new Map();
            for (const conn of connections){
                const a = `${conn.from.partId}:${conn.from.pinId}`;
                const b = `${conn.to.partId}:${conn.to.pinId}`;
                if (!adjacency.has(a)) adjacency.set(a, new Set());
                if (!adjacency.has(b)) adjacency.set(b, new Set());
                adjacency.get(a).add(b);
                adjacency.get(b).add(a);
            }
            // For resistors, treat both pins as connected (pass-through)
            const resistorParts = circuitParts.filter({
                "Home.useMemo[componentPwmStates].resistorParts": (p)=>p.type.toLowerCase().includes('resistor') || p.type.toLowerCase().includes('wire')
            }["Home.useMemo[componentPwmStates].resistorParts"]);
            for (const resistor of resistorParts){
                const pin1 = `${resistor.id}:1`;
                const pin2 = `${resistor.id}:2`;
                // Connect pin1's neighbors to pin2's neighbors (pass-through)
                const neighbors1 = adjacency.get(pin1) ?? new Set();
                const neighbors2 = adjacency.get(pin2) ?? new Set();
                for (const n1 of neighbors1){
                    for (const n2 of neighbors2){
                        if (n1 !== n2 && !n1.startsWith(resistor.id) && !n2.startsWith(resistor.id)) {
                            if (!adjacency.has(n1)) adjacency.set(n1, new Set());
                            if (!adjacency.has(n2)) adjacency.set(n2, new Set());
                            adjacency.get(n1).add(n2);
                            adjacency.get(n2).add(n1);
                        }
                    }
                }
            }
            // PWM pins on Arduino Uno
            const pwmPins = [
                3,
                5,
                6,
                9,
                10,
                11
            ];
            // For each PWM pin with a value, find connected components
            for (const pinNum of pwmPins){
                const pwmValue = pwmStates[pinNum];
                if (typeof pwmValue !== 'number' || pwmValue === 0) continue;
                const startKey = `${mcuPart.id}:${pinNum}`;
                const neighbors = adjacency.get(startKey);
                if (!neighbors) continue;
                // BFS to find all connected components through the graph
                const visited = new Set([
                    startKey
                ]);
                const queue = [
                    ...neighbors
                ];
                while(queue.length > 0){
                    const current = queue.shift();
                    if (visited.has(current)) continue;
                    visited.add(current);
                    const [partId, pinId] = current.split(':');
                    const part = circuitParts.find({
                        "Home.useMemo[componentPwmStates].part": (p)=>p.id === partId
                    }["Home.useMemo[componentPwmStates].part"]);
                    if (part) {
                        // Skip MCU, resistors, and wires - they're pass-through components
                        const isPassThrough = part.id === mcuPart.id || part.type.toLowerCase().includes('resistor') || part.type.toLowerCase().includes('wire');
                        if (!isPassThrough) {
                            // This is an active component (LED, servo, etc.) - assign PWM value
                            states[partId] = pwmValue;
                            console.log(`[PWM] Mapped pin ${pinNum} (value=${pwmValue}) to ${partId} via ${pinId}`);
                        }
                    }
                    // Continue BFS
                    const nextNeighbors = adjacency.get(current);
                    if (nextNeighbors) {
                        for (const n of nextNeighbors){
                            if (!visited.has(n)) {
                                queue.push(n);
                            }
                        }
                    }
                }
            }
            return states;
        }
    }["Home.useMemo[componentPwmStates]"], [
        circuitParts,
        connections,
        pwmStates
    ]);
    // Debug: Log PWM states changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const activePwm = Object.entries(pwmStates).filter({
                "Home.useEffect.activePwm": ([, v])=>v > 0
            }["Home.useEffect.activePwm"]);
            if (activePwm.length > 0) {
                console.log('[Page] Active PWM states:', Object.fromEntries(activePwm));
            }
        }
    }["Home.useEffect"], [
        pwmStates
    ]);
    // Debug: Log componentPwmStates changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (Object.keys(componentPwmStates).length > 0) {
                console.log('[Page] componentPwmStates updated:', componentPwmStates);
            }
        }
    }["Home.useEffect"], [
        componentPwmStates
    ]);
    // Debug: Log componentPinStates changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (Object.keys(componentPinStates).length > 0) {
                console.log('[Page] componentPinStates updated:', componentPinStates);
            }
        }
    }["Home.useEffect"], [
        componentPinStates
    ]);
    // Prepare project data for publishing
    const prepareProjectForPublish = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[prepareProjectForPublish]": ()=>{
            return {
                files: files.map({
                    "Home.useCallback[prepareProjectForPublish]": (f)=>({
                            path: f.path,
                            content: f.content
                        })
                }["Home.useCallback[prepareProjectForPublish]"]),
                circuit: {
                    parts: circuitParts,
                    connections: connections
                }
            };
        }
    }["Home.useCallback[prepareProjectForPublish]"], [
        files,
        circuitParts,
        connections
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
                                    lineNumber: 1415,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2d$close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeftClose$3e$__["PanelLeftClose"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1417,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1408,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/workspace",
                                className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-6 w-6 items-center justify-center rounded-md bg-ide-accent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-bold text-white",
                                            children: "F"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1423,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1422,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-xs font-semibold text-ide-text leading-none",
                                                children: "FUNDI"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1426,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-ide-text-muted leading-none mt-0.5",
                                                children: "IoT Workbench"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1429,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1425,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1421,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-5 w-px bg-ide-border"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1435,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/workspace",
                                className: "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                title: "Workspace",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1442,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden md:inline",
                                        children: "Workspace"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1443,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1437,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1406,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        deviceName: "Arduino Uno",
                        isConnected: true
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1448,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setShowFeaturedProjects(true),
                                className: "flex h-7 items-center gap-1.5 rounded-md bg-purple-500/10 px-3 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors",
                                title: "Load Featured Projects",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1458,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "Featured"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1459,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1452,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setShowPublishModal(true),
                                className: "flex h-7 items-center gap-1.5 rounded-md bg-ide-accent/10 px-3 text-xs font-medium text-ide-accent hover:bg-ide-accent/20 transition-colors",
                                title: "Publish to Gallery",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1467,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "hidden sm:inline",
                                        children: "Publish"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1468,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1461,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/settings",
                                className: "flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                title: "Settings",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1475,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1470,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1451,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1404,
                columnNumber: 7
            }, this),
            showPublishModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-md rounded-xl border border-ide-border bg-ide-panel-surface p-6 shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold",
                                    children: "Publish Project"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1485,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setShowPublishModal(false),
                                    className: "flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1491,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1486,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1484,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        const data = prepareProjectForPublish();
                                        console.log('Ready to publish to GitHub:', data);
                                    // TODO: Implement GitHub OAuth and API integration
                                    },
                                    className: "flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$github$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Github$3e$__["Github"], {
                                            className: "h-5 w-5 text-ide-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1504,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-medium",
                                                    children: "Publish to GitHub"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1506,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-ide-text-muted",
                                                    children: "Create a new repository or gist"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1507,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1505,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1495,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        const data = prepareProjectForPublish();
                                        const blob = new Blob([
                                            JSON.stringify(data, null, 2)
                                        ], {
                                            type: 'application/json'
                                        });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'fundi-project.json';
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    },
                                    className: "flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                            className: "h-5 w-5 text-ide-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1526,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-medium",
                                                    children: "Download Project"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1528,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-ide-text-muted",
                                                    children: "Export as JSON file"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1529,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1527,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1512,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1494,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 rounded-lg bg-ide-info/10 border border-ide-info/30 p-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-ide-info",
                                children: "ℹ️ GitHub integration requires authentication. Coming soon!"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1536,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1535,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1483,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1482,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$FeaturedProjectsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showFeaturedProjects,
                onClose: ()=>setShowFeaturedProjects(false)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1545,
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
                                        lineNumber: 1562,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1556,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                                    direction: "horizontal"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1564,
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
                                        defaultSize: bottomPanelCollapsed ? 100 : 60,
                                        minSize: 30,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative h-full overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationCanvas, {
                                                    isRunning: simIsRunning,
                                                    componentPinStates: componentPinStates,
                                                    componentPwmStates: componentPwmStates
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1574,
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
                                                    lineNumber: 1581,
                                                    columnNumber: 19
                                                }, this),
                                                bottomPanelCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setBottomPanelCollapsed(false),
                                                    className: "absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-lg bg-ide-panel-surface/90 border border-ide-border px-3 py-1.5 text-xs text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover transition-colors backdrop-blur-sm",
                                                    title: "Show Code Editor",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1598,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Show Editor"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1599,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1592,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1573,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1572,
                                        columnNumber: 15
                                    }, this),
                                    !bottomPanelCollapsed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                                                direction: "vertical"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1607,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$resizable$2d$panels$2f$dist$2f$react$2d$resizable$2d$panels$2e$browser$2e$development$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Panel"], {
                                                defaultSize: 40,
                                                minSize: 15,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative h-full flex flex-col",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between border-b border-ide-border bg-ide-panel-surface px-2 py-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] font-medium text-ide-text-muted uppercase tracking-wider",
                                                                    children: "Code Editor"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 1614,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setBottomPanelCollapsed(true),
                                                                    className: "flex h-5 w-5 items-center justify-center rounded text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors",
                                                                    title: "Collapse Code Editor",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                        className: "h-3.5 w-3.5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 1621,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 1615,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1613,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1 min-h-0",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CodeEditorPanel, {
                                                                compilationError: compilationError
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 1625,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1624,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1611,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1610,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1570,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1569,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ResizeHandle, {
                            direction: "horizontal"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1636,
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
                                lineNumber: 1640,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1639,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1552,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1551,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1402,
        columnNumber: 5
    }, this);
}
_s5(Home, "kVVKkjFwriA1Mch5X7IEy24N6rg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAppStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
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
_c8 = Home;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "CanvasToolbar");
__turbopack_context__.k.register(_c1, "UnifiedActionBar");
__turbopack_context__.k.register(_c2, "SimulationCanvasInner");
__turbopack_context__.k.register(_c3, "SimulationCanvas");
__turbopack_context__.k.register(_c4, "CodeEditorPanel");
__turbopack_context__.k.register(_c5, "FilesPanel");
__turbopack_context__.k.register(_c6, "LeftPanel");
__turbopack_context__.k.register(_c7, "ResizeHandle");
__turbopack_context__.k.register(_c8, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_270610df._.js.map