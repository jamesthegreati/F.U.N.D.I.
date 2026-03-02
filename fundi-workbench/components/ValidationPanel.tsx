import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { ValidationIssue, ValidationSeverity } from '@/utils/validation/types';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onIssueClick?: (issue: ValidationIssue) => void;
  className?: string;
}

const severityConfig: Record<ValidationSeverity, { icon: React.ElementType; color: string; label: string }> = {
  critical: {
    icon: XCircle,
    color: 'text-red-500',
    label: 'CRITICAL',
  },
  error: {
    icon: AlertCircle,
    color: 'text-orange-500',
    label: 'ERROR',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    label: 'WARNING',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    label: 'INFO',
  },
};

export function ValidationPanel({ issues, onIssueClick, className = '' }: ValidationPanelProps) {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (issues.length === 0) {
    return (
      <div className={`p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${className}`}>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Info className="w-5 h-5" />
          <span className="font-medium">Circuit validation passed</span>
        </div>
        <p className="mt-1 text-sm text-green-600 dark:text-green-500">
          No electrical issues detected. Circuit is safe to build.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Circuit Validation
          </h3>
          <div className="flex items-center gap-3 text-sm">
            {criticalCount > 0 && (
              <span className="text-red-500 font-medium">{criticalCount} critical</span>
            )}
            {errorCount > 0 && (
              <span className="text-orange-500 font-medium">{errorCount} errors</span>
            )}
            {warningCount > 0 && (
              <span className="text-yellow-500 font-medium">{warningCount} warnings</span>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="max-h-96 overflow-y-auto">
        {issues.map((issue) => (
          <ValidationIssueCard
            key={issue.id}
            issue={issue}
            onClick={() => onIssueClick?.(issue)}
          />
        ))}
      </div>
    </div>
  );
}

interface ValidationIssueCardProps {
  issue: ValidationIssue;
  onClick?: () => void;
}

function ValidationIssueCard({ issue, onClick }: ValidationIssueCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
      onClick={() => {
        setExpanded(!expanded);
        onClick?.();
      }}
    >
      {/* Issue Header */}
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {issue.category.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {issue.message}
          </p>
          {issue.affectedParts.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Affected: {issue.affectedParts.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (issue.explanation || issue.suggestion || issue.calculation) && (
        <div className="mt-3 ml-8 space-y-2 text-sm">
          {issue.explanation && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Why this matters:</p>
              <p className="text-gray-600 dark:text-gray-400">{issue.explanation}</p>
            </div>
          )}

          {issue.suggestion && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">💡 Suggestion:</p>
              <p className="text-blue-800 dark:text-blue-400">{issue.suggestion}</p>
            </div>
          )}

          {issue.calculation && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">📐 Calculation:</p>
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {issue.calculation}
              </code>
            </div>
          )}

          {issue.learnMoreUrl && (
            <a
              href={issue.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

interface ValidationBadgeProps {
  issueCount: number;
  severity: ValidationSeverity;
  onClick?: () => void;
}

export function ValidationBadge({ issueCount, severity, onClick }: ValidationBadgeProps) {
  if (issueCount === 0) return null;

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        severity === 'critical'
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
          : severity === 'error'
          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
          : severity === 'warning'
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
      }`}
    >
      <Icon className="w-3 h-3" />
      <span>{issueCount}</span>
    </button>
  );
}
