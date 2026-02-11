'use client'

import { POCProject } from './types'
import { POCProjectCard } from './POCProjectCard'
import { Plus, TrendingUp } from 'lucide-react'

interface POCProjectListProps {
  projects: POCProject[]
  onSelectProject: (project: POCProject) => void
  onNewProject?: () => void
}

export function POCProjectList({ projects, onSelectProject, onNewProject }: POCProjectListProps) {
  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#7553ff]" />
          <h1 className="text-lg font-semibold text-[#e8e4f0]">POC Tracker</h1>
          <span className="text-sm text-[#9086a3]">({projects.length} projects)</span>
        </div>
        {onNewProject && (
          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New POC
          </button>
        )}
      </div>

      {/* Project Grid */}
      <div className="flex-1 overflow-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="w-16 h-16 text-[#362552] mb-4" />
            <h3 className="text-lg font-semibold text-[#e8e4f0] mb-2">No POC Projects</h3>
            <p className="text-sm text-[#9086a3] mb-4">
              Get started by creating your first POC project
            </p>
            {onNewProject && (
              <button
                onClick={onNewProject}
                className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First POC
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <POCProjectCard
                key={project.id}
                project={project}
                onClick={() => onSelectProject(project)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
