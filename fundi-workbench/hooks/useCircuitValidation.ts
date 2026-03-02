import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { electricalValidator } from '@/utils/validation/electricalValidator';
import type { ValidationResult } from '@/utils/validation/types';

/**
 * Hook for electrical circuit validation
 * Automatically validates circuit when parts or connections change
 */
export function useCircuitValidation(options?: { debounceMs?: number; enabled?: boolean }) {
  const { debounceMs = 500, enabled = true } = options || {};

  const circuitParts = useAppStore((state) => state.circuitParts);
  const connections = useAppStore((state) => state.connections);

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Convert connections to the format expected by validator
  const circuitConnections = useMemo(() => {
    return connections.map(conn => ({
      source: `${conn.from.partId}:${conn.from.pinId}`,
      target: `${conn.to.partId}:${conn.to.pinId}`,
      color: conn.color,
    }));
  }, [connections]);

  useEffect(() => {
    if (!enabled) {
      setValidationResult(null);
      return;
    }

    // Debounce validation to avoid running on every keystroke
    const timeoutId = setTimeout(() => {
      if (circuitParts.length === 0) {
        setValidationResult(null);
        return;
      }

      setIsValidating(true);

      try {
        const result = electricalValidator.validateCircuit(
          circuitParts,
          circuitConnections
        );
        setValidationResult(result);
      } catch (error) {
        console.error('[Validation] Error during circuit validation:', error);
        setValidationResult(null);
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [circuitParts, circuitConnections, enabled, debounceMs]);

  return {
    validationResult,
    isValidating,
    issues: validationResult?.issues || [],
    criticalIssues: validationResult?.issues.filter(i => i.severity === 'critical') || [],
    errorIssues: validationResult?.issues.filter(i => i.severity === 'error') || [],
    warningIssues: validationResult?.issues.filter(i => i.severity === 'warning') || [],
    infoIssues: validationResult?.issues.filter(i => i.severity === 'info') || [],
    hasIssues: (validationResult?.issues.length || 0) > 0,
    hasCriticalIssues: (validationResult?.issues.filter(i => i.severity === 'critical').length || 0) > 0,
    hasErrors: (validationResult?.issues.filter(i => i.severity === 'error').length || 0) > 0,
    powerConsumption: validationResult?.powerConsumption,
  };
}
