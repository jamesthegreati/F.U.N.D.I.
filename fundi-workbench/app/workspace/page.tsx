'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Upload, 
  Github,
  Clock,
  Cpu,
  ArrowLeft,
} from 'lucide-react'
import { useAppStore, type Project } from '@/store/useAppStore'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ProjectCard({ 
  project,
  onDelete 
}: { 
  project: Project
  onDelete: () => void 
}) {
  const loadProject = useAppStore((s) => s.loadProject)

  return (
    <div className="group relative rounded-xl border border-ide-border bg-ide-panel-surface p-4 transition-all hover:border-ide-accent/50 hover:shadow-lg hover:shadow-ide-accent/5">
      {/* Project Icon */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ide-accent/10">
          <Cpu className="h-6 w-6 text-ide-accent" />
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-error/20 hover:text-ide-error transition-colors"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      <h3 className="mb-1 text-sm font-semibold text-ide-text truncate">
        {project.name}
      </h3>
      <div className="mb-3 flex items-center gap-1.5 text-xs text-ide-text-muted">
        <Clock className="h-3 w-3" />
        <span>{formatDate(project.lastModified)}</span>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-3 text-xs text-ide-text-subtle">
        <span>{project.files.length} files</span>
        <span>•</span>
        <span>{project.circuitParts.length} components</span>
      </div>

      {/* Actions */}
      <Link
        href="/"
        onClick={() => loadProject(project.id)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-ide-accent/10 px-4 py-2 text-sm font-medium text-ide-accent transition-colors hover:bg-ide-accent/20"
      >
        <FolderOpen className="h-4 w-4" />
        Open Project
      </Link>
    </div>
  )
}

export default function WorkspacePage() {
  const projects = useAppStore((s) => s.projects)
  const createProject = useAppStore((s) => s.createProject)
  const deleteProject = useAppStore((s) => s.deleteProject)
  
  const [newProjectName, setNewProjectName] = useState('')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  const handleCreateProject = useCallback(() => {
    const name = newProjectName.trim() || 'Untitled Project'
    createProject(name)
    setNewProjectName('')
    setShowNewProjectModal(false)
  }, [createProject, newProjectName])

  const handleDeleteProject = useCallback((id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteProject(id)
    }
  }, [deleteProject])

  return (
    <div className="min-h-screen bg-ide-panel-bg text-ide-text">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-ide-border bg-ide-panel-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-ide-text-muted hover:text-ide-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Editor</span>
            </Link>
            <div className="h-5 w-px bg-ide-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ide-accent">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold">FUNDI Workspace</h1>
                <p className="text-[10px] text-ide-text-muted">Manage your projects</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex h-9 items-center gap-2 rounded-lg border border-ide-border px-3 text-sm text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-ide-accent px-4 text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-ide-panel-surface border border-ide-border">
              <Cpu className="h-10 w-10 text-ide-text-subtle" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-ide-text">No projects yet</h2>
            <p className="mb-6 text-sm text-ide-text-muted">
              Create your first project to get started building IoT circuits.
            </p>
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 rounded-lg bg-ide-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Projects</h2>
              <span className="text-sm text-ide-text-muted">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => handleDeleteProject(project.id, project.name)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-ide-border bg-ide-panel-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Create New Project</h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm text-ide-text-muted">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My IoT Project"
                className="w-full rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-ide-text-muted hover:bg-ide-panel-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                className="rounded-lg bg-ide-accent px-4 py-2 text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal (UI Stub) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-ide-border bg-ide-panel-surface p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">Import Project</h3>
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover"
              >
                <Upload className="h-5 w-5 text-ide-accent" />
                <div>
                  <div className="text-sm font-medium">Upload ZIP File</div>
                  <div className="text-xs text-ide-text-muted">
                    Import a project from a .zip archive
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover"
              >
                <Github className="h-5 w-5 text-ide-accent" />
                <div>
                  <div className="text-sm font-medium">Import from GitHub</div>
                  <div className="text-xs text-ide-text-muted">
                    Clone a repository from GitHub URL
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-ide-warning/10 border border-ide-warning/30 p-3">
              <p className="text-xs text-ide-warning">
                ⚠️ Import functionality is coming soon. Stay tuned!
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-ide-text-muted hover:bg-ide-panel-hover transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
