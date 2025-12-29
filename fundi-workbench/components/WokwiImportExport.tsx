'use client';

import { useState, useCallback, useRef } from 'react';
import {
    Upload,
    Download,
    FileJson,
    X,
    AlertCircle,
    CheckCircle,
    Copy
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    importWokwiDiagram,
    exportWokwiDiagram,
    validateWokwiDiagram,
    downloadWokwiDiagram,
    FundiCircuit,
    WokwiDiagram
} from '@/utils/wokwiDiagram';

interface WokwiImportExportProps {
    /** Current circuit to export */
    circuit?: FundiCircuit;
    /** Callback when circuit is imported */
    onImport?: (circuit: FundiCircuit) => void;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Close callback */
    onClose: () => void;
}

/**
 * Wokwi Import/Export Dialog
 */
export function WokwiImportExport({
    circuit,
    onImport,
    isOpen,
    onClose
}: WokwiImportExportProps) {
    const [mode, setMode] = useState<'import' | 'export'>('import');
    const [jsonContent, setJsonContent] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    const handleOpen = useCallback(() => {
        setJsonContent('');
        setErrors([]);
        setSuccess(false);
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);

            // Validate
            const validation = validateWokwiDiagram(content);
            setErrors(validation.errors);
            setSuccess(validation.valid);
        };
        reader.readAsText(file);
    }, []);

    // Handle import
    const handleImport = useCallback(() => {
        if (!jsonContent || errors.length > 0) return;

        try {
            const circuit = importWokwiDiagram(jsonContent);
            onImport?.(circuit);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (e) {
            setErrors([e instanceof Error ? e.message : 'Import failed']);
        }
    }, [jsonContent, errors.length, onImport, onClose]);

    // Handle export
    const handleExport = useCallback(() => {
        if (!circuit) return;

        const diagram = exportWokwiDiagram(circuit);
        downloadWokwiDiagram(diagram, 'diagram.json');
        setSuccess(true);
    }, [circuit]);

    // Copy to clipboard
    const handleCopy = useCallback(() => {
        if (!circuit) return;

        const diagram = exportWokwiDiagram(circuit);
        const json = JSON.stringify(diagram, null, 2);
        navigator.clipboard.writeText(json);
        setSuccess(true);
    }, [circuit]);

    // Generate preview JSON
    const previewJson = useCallback(() => {
        if (!circuit) return '';
        const diagram = exportWokwiDiagram(circuit);
        return JSON.stringify(diagram, null, 2);
    }, [circuit]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-ide-panel border border-ide-border rounded-lg shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ide-border px-4 py-3">
                    <div className="flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-ide-accent" />
                        <span className="font-semibold text-ide-text">Wokwi Project</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Mode tabs */}
                <div className="flex border-b border-ide-border">
                    <button
                        onClick={() => { setMode('import'); handleOpen(); }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                            mode === 'import'
                                ? 'text-ide-accent border-b-2 border-ide-accent'
                                : 'text-ide-text-muted hover:text-ide-text'
                        )}
                    >
                        <Upload className="h-4 w-4" />
                        Import
                    </button>
                    <button
                        onClick={() => { setMode('export'); handleOpen(); }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                            mode === 'export'
                                ? 'text-ide-accent border-b-2 border-ide-accent'
                                : 'text-ide-text-muted hover:text-ide-text'
                        )}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {mode === 'import' ? (
                        <div className="space-y-4">
                            {/* File input */}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-8 border-2 border-dashed border-ide-border rounded-lg hover:border-ide-accent transition-colors text-center"
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-ide-text-muted" />
                                    <span className="text-sm text-ide-text-muted">
                                        Click to select diagram.json file
                                    </span>
                                </button>
                            </div>

                            {/* Or paste JSON */}
                            <div className="text-center text-xs text-ide-text-muted">
                                — or paste JSON below —
                            </div>

                            <textarea
                                value={jsonContent}
                                onChange={(e) => {
                                    setJsonContent(e.target.value);
                                    if (e.target.value) {
                                        const validation = validateWokwiDiagram(e.target.value);
                                        setErrors(validation.errors);
                                        setSuccess(validation.valid);
                                    } else {
                                        setErrors([]);
                                        setSuccess(false);
                                    }
                                }}
                                placeholder='{"version": 1, "parts": [...], "connections": [...]}'
                                className="w-full h-40 px-3 py-2 text-xs font-mono bg-ide-bg border border-ide-border rounded text-ide-text resize-none focus:outline-none focus:border-ide-accent"
                            />

                            {/* Validation result */}
                            {jsonContent && (
                                <div className={cn(
                                    'flex items-start gap-2 p-3 rounded',
                                    errors.length > 0 ? 'bg-ide-error/10' : 'bg-ide-success/10'
                                )}>
                                    {errors.length > 0 ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 text-ide-error mt-0.5" />
                                            <div className="text-xs text-ide-error">
                                                {errors.map((err, i) => (
                                                    <div key={i}>{err}</div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-ide-success" />
                                            <span className="text-xs text-ide-success">Valid Wokwi diagram</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Preview */}
                            {circuit ? (
                                <>
                                    <div className="text-xs text-ide-text-muted">
                                        Circuit with {circuit.parts.length} parts and {circuit.connections.length} connections
                                    </div>
                                    <textarea
                                        value={previewJson()}
                                        readOnly
                                        className="w-full h-64 px-3 py-2 text-xs font-mono bg-ide-bg border border-ide-border rounded text-ide-text resize-none"
                                    />
                                </>
                            ) : (
                                <div className="py-8 text-center text-ide-text-muted">
                                    No circuit to export
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 rounded bg-ide-success/10">
                                    <CheckCircle className="h-4 w-4 text-ide-success" />
                                    <span className="text-xs text-ide-success">Exported successfully!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-ide-border px-4 py-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-ide-text-muted hover:text-ide-text transition-colors"
                    >
                        Cancel
                    </button>

                    {mode === 'import' ? (
                        <button
                            onClick={handleImport}
                            disabled={!jsonContent || errors.length > 0}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-ide-accent text-white rounded hover:bg-ide-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                            Import Circuit
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                disabled={!circuit}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-ide-panel-hover text-ide-text rounded hover:bg-ide-border disabled:opacity-50 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                                Copy
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={!circuit}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-ide-accent text-white rounded hover:bg-ide-accent/80 disabled:opacity-50 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WokwiImportExport;
