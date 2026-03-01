'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Beaker,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  Lightbulb,
  Play,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  convertToFundiCircuit,
  type FeaturedProject,
} from '@/lib/featuredProjects';
import {
  getInputTestProjects,
  INPUT_TEST_CATEGORIES,
} from '@/lib/inputTestProjects';
import { useAppStore, type CircuitPart, type Connection } from '@/store/useAppStore';

interface ComponentTestsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const DIFFICULTY_ICONS: Record<string, React.ReactNode> = {
  beginner: <Lightbulb className="h-3 w-3" />,
  intermediate: <Beaker className="h-3 w-3" />,
  advanced: <Zap className="h-3 w-3" />,
};

function TestProjectCard({
  project,
  onSelect,
  isSelected,
}: {
  project: FeaturedProject;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const partCount = project.diagram.parts.length;
  const connectionCount = project.diagram.connections.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all duration-200',
        'hover:border-cyan-500/50 hover:bg-ide-panel-hover',
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10'
          : 'border-ide-border bg-ide-panel-surface'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-ide-text text-sm truncate">{project.name}</h3>
          <p className="text-xs text-ide-text-muted mt-0.5 line-clamp-2">
            {project.description}
          </p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
            DIFFICULTY_COLORS[project.difficulty]
          )}
        >
          {DIFFICULTY_ICONS[project.difficulty]}
          {project.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] text-ide-text-muted bg-ide-bg">
          <Clock className="h-2.5 w-2.5" />
          {project.estimatedTime}
        </span>
        <span className="text-[10px] text-ide-text-subtle">
          {partCount} parts · {connectionCount} wires
        </span>
      </div>
    </button>
  );
}

function TestProjectPreview({ project }: { project: FeaturedProject }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b border-ide-border">
        <h3 className="font-semibold text-ide-text">{project.name}</h3>
        <p className="text-sm text-ide-text-muted mt-1">{project.description}</p>
      </div>

      <div className="flex border-b border-ide-border">
        <button
          type="button"
          onClick={() => setShowCode(false)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            !showCode
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          Circuit Info
        </button>
        <button
          type="button"
          onClick={() => setShowCode(true)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            showCode
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          Arduino Code
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {showCode ? (
          <pre className="text-xs font-mono text-ide-text whitespace-pre-wrap bg-ide-bg p-3 rounded-lg border border-ide-border overflow-auto max-h-[400px]">
            {project.code}
          </pre>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2">
                Components ({project.diagram.parts.length})
              </h4>
              <div className="space-y-1">
                {project.diagram.parts.map((part) => (
                  <div
                    key={part.id}
                    className="flex items-center gap-2 text-sm text-ide-text py-1 px-2 rounded bg-ide-bg"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="font-mono text-xs">{part.id}</span>
                    <span className="text-ide-text-muted">→</span>
                    <span className="text-ide-text-subtle text-xs">
                      {part.type.replace('wokwi-', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2">
                Connections
              </h4>
              <p className="text-sm text-ide-text">
                {project.diagram.connections.length} wire connections
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2">
                Topics Covered
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ComponentTestsPanel({ isOpen, onClose }: ComponentTestsPanelProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadSuccess, setLoadSuccess] = useState(false);

  const updateCode = useAppStore((s) => s.updateCode);
  const updateFileContent = useAppStore((s) => s.updateFileContent);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const openFile = useAppStore((s) => s.openFile);
  const applyGeneratedCircuit = useAppStore((s) => s.applyGeneratedCircuit);

  const allProjects = useMemo(() => getInputTestProjects(), []);

  const projectMap = useMemo(
    () => new Map(allProjects.map((p) => [p.id, p])),
    [allProjects]
  );

  const selectedProject = useMemo(
    () => (selectedProjectId ? (projectMap.get(selectedProjectId) ?? null) : null),
    [projectMap, selectedProjectId]
  );

  const toggleCategory = useCallback((name: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleLoadProject = useCallback(async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setLoadSuccess(false);

    try {
      const { parts, connections } = convertToFundiCircuit(selectedProject);

      openFile('main.cpp');
      setActiveFile('main.cpp');
      updateCode(selectedProject.code);
      updateFileContent('main.cpp', selectedProject.code);

      const circuitParts: CircuitPart[] = parts.map((p) => ({
        id: p.id,
        type: p.type,
        position: p.position,
        rotate: p.rotation,
        attrs: p.attrs as Record<string, string> | undefined,
      }));

      const circuitConnections: Connection[] = connections.map((c) => ({
        id: c.id,
        from: c.from,
        to: c.to,
        color: c.color,
      }));

      applyGeneratedCircuit(circuitParts, circuitConnections);
      setLoadSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to load test project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, openFile, setActiveFile, updateCode, updateFileContent, applyGeneratedCircuit, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-ide-panel border border-ide-border rounded-xl shadow-2xl w-[900px] max-w-[95vw] h-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ide-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-ide-text text-lg">Component Tests</h2>
              <p className="text-xs text-ide-text-muted">
                Test circuits for every input component with Arduino Uno
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - categorised project list */}
          <div className="w-[360px] border-r border-ide-border flex flex-col">
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {INPUT_TEST_CATEGORIES.map((category) => {
                const isCollapsed = collapsedCategories.has(category.name);
                const projects = category.ids
                  .map((id) => projectMap.get(id))
                  .filter((p): p is FeaturedProject => p !== undefined);

                return (
                  <div key={category.name}>
                    {/* Category header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-ide-panel-hover transition-colors text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-ide-text-muted flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-ide-text-muted flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                        {category.name}
                      </span>
                      <span className="ml-auto text-[10px] text-ide-text-subtle">
                        {projects.length}
                      </span>
                    </button>

                    {/* Project cards */}
                    {!isCollapsed && (
                      <div className="mt-1 space-y-1.5 pl-2">
                        {projects.map((project) => (
                          <TestProjectCard
                            key={project.id}
                            project={project}
                            isSelected={selectedProjectId === project.id}
                            onSelect={() => setSelectedProjectId(project.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="p-4 border-t border-ide-border text-xs text-ide-text-muted">
              {allProjects.length} test circuits · Arduino Uno
            </div>
          </div>

          {/* Right panel - Preview */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedProject ? (
              <>
                <TestProjectPreview project={selectedProject} />

                <div className="p-4 border-t border-ide-border flex items-center justify-between">
                  <div className="text-xs text-ide-text-muted">
                    This will replace your current circuit and code
                  </div>
                  <div className="flex items-center gap-2">
                    {loadSuccess && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Check className="h-4 w-4" />
                        Loaded!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleLoadProject}
                      disabled={isLoading}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                        isLoading
                          ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'
                          : 'bg-cyan-500 text-white hover:bg-cyan-400'
                      )}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Load Project
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-ide-text-muted">
                <div className="text-center">
                  <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a test to preview</p>
                  <p className="text-xs mt-1 opacity-60">
                    {allProjects.length} input component tests available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentTestsPanel;
