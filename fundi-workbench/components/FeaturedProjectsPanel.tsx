'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Beaker,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  getFeaturedProjects,
  convertToFundiCircuit,
  type FeaturedProject,
} from '@/lib/featuredProjects';
import { useAppStore, type CircuitPart, type Connection } from '@/store/useAppStore';

interface FeaturedProjectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

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

function ProjectCard({
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
        'w-full text-left p-4 rounded-lg border transition-all duration-200',
        'hover:border-ide-accent/50 hover:bg-ide-panel-hover',
        isSelected
          ? 'border-ide-accent bg-ide-accent/10'
          : 'border-ide-border bg-ide-panel-surface'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ide-text truncate">{project.name}</h3>
          <p className="text-xs text-ide-text-muted mt-1 line-clamp-2">
            {project.description}
          </p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-ide-accent flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Difficulty badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
            DIFFICULTY_COLORS[project.difficulty]
          )}
        >
          {DIFFICULTY_ICONS[project.difficulty]}
          {project.difficulty}
        </span>

        {/* Time estimate */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-ide-text-muted bg-ide-bg">
          <Clock className="h-3 w-3" />
          {project.estimatedTime}
        </span>

        {/* Component count */}
        <span className="text-[10px] text-ide-text-subtle">
          {partCount} parts • {connectionCount} wires
        </span>
      </div>

      {/* Tags */}
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {project.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] text-ide-text-subtle bg-ide-bg"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
        {project.tags.length > 4 && (
          <span className="text-[9px] text-ide-text-subtle">
            +{project.tags.length - 4} more
          </span>
        )}
      </div>
    </button>
  );
}

function ProjectPreview({ project }: { project: FeaturedProject }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Preview header */}
      <div className="p-4 border-b border-ide-border">
        <h3 className="font-semibold text-ide-text">{project.name}</h3>
        <p className="text-sm text-ide-text-muted mt-1">{project.description}</p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-ide-border">
        <button
          type="button"
          onClick={() => setShowCode(false)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            !showCode
              ? 'text-ide-accent border-b-2 border-ide-accent bg-ide-accent/5'
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
              ? 'text-ide-accent border-b-2 border-ide-accent bg-ide-accent/5'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          Arduino Code
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {showCode ? (
          <pre className="text-xs font-mono text-ide-text whitespace-pre-wrap bg-ide-bg p-3 rounded-lg border border-ide-border overflow-auto max-h-[400px]">
            {project.code}
          </pre>
        ) : (
          <div className="space-y-4">
            {/* Components list */}
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
                    <div className="w-2 h-2 rounded-full bg-ide-accent" />
                    <span className="font-mono text-xs">{part.id}</span>
                    <span className="text-ide-text-muted">→</span>
                    <span className="text-ide-text-subtle text-xs">
                      {part.type.replace('wokwi-', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections count */}
            <div>
              <h4 className="text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2">
                Connections
              </h4>
              <p className="text-sm text-ide-text">
                {project.diagram.connections.length} wire connections
              </p>
            </div>

            {/* Learning objectives */}
            <div>
              <h4 className="text-xs font-semibold text-ide-text-muted uppercase tracking-wide mb-2">
                What You&apos;ll Learn
              </h4>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-ide-text bg-ide-accent/10 border border-ide-accent/20"
                  >
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

export function FeaturedProjectsPanel({ isOpen, onClose }: FeaturedProjectsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadSuccess, setLoadSuccess] = useState(false);

  // Store actions
  const updateCode = useAppStore((s) => s.updateCode);
  const applyGeneratedCircuit = useAppStore((s) => s.applyGeneratedCircuit);

  const allProjects = useMemo(() => getFeaturedProjects(), []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Filter by difficulty
      if (difficultyFilter !== 'all' && project.difficulty !== difficultyFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(query);
        const matchesDescription = project.description.toLowerCase().includes(query);
        const matchesTags = project.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        return matchesName || matchesDescription || matchesTags;
      }

      return true;
    });
  }, [allProjects, difficultyFilter, searchQuery]);

  const selectedProject = useMemo(
    () => allProjects.find((p) => p.id === selectedProjectId) ?? null,
    [allProjects, selectedProjectId]
  );

  const handleLoadProject = useCallback(async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setLoadSuccess(false);

    try {
      // Convert project to FUNDI format
      const { parts, connections } = convertToFundiCircuit(selectedProject);

      // Update code
      updateCode(selectedProject.code);

      // Apply circuit with proper type mapping
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

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, updateCode, applyGeneratedCircuit, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-ide-panel border border-ide-border rounded-xl shadow-2xl w-[900px] max-w-[95vw] h-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ide-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ide-accent/10">
              <Sparkles className="h-5 w-5 text-ide-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-ide-text text-lg">Featured Projects</h2>
              <p className="text-xs text-ide-text-muted">
                Load pre-made Wokwi projects to test your simulation
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
          {/* Left sidebar - Project list */}
          <div className="w-[360px] border-r border-ide-border flex flex-col">
            {/* Search and filters */}
            <div className="p-4 space-y-3 border-b border-ide-border">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ide-text-muted" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-ide-bg border border-ide-border rounded-lg text-ide-text placeholder:text-ide-text-subtle focus:outline-none focus:border-ide-accent"
                />
              </div>

              {/* Difficulty filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-ide-text-muted" />
                <div className="flex gap-1">
                  {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyFilter(level)}
                        className={cn(
                          'px-2 py-1 text-xs rounded-md transition-colors',
                          difficultyFilter === level
                            ? 'bg-ide-accent text-white'
                            : 'bg-ide-bg text-ide-text-muted hover:text-ide-text'
                        )}
                      >
                        {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Project list */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-ide-text-muted">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects found</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onSelect={() => setSelectedProjectId(project.id)}
                  />
                ))
              )}
            </div>

            {/* Stats */}
            <div className="p-4 border-t border-ide-border text-xs text-ide-text-muted">
              {filteredProjects.length} of {allProjects.length} projects
            </div>
          </div>

          {/* Right panel - Preview */}
          <div className="flex-1 flex flex-col">
            {selectedProject ? (
              <>
                <ProjectPreview project={selectedProject} />

                {/* Action footer */}
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
                          : 'bg-ide-accent text-white hover:bg-ide-accent/90'
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
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a project to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedProjectsPanel;
