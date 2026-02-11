'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { POCCard } from './POCCard'
import { POCForm } from './POCForm'
import { Plus, Filter, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

// Sample POC data for demo
const SAMPLE_POCS: POCProject[] = [
  {
    id: '1',
    customerName: 'Acme Corporation',
    projectName: 'Performance Monitoring POC',
    startDate: new Date('2026-02-01'),
    targetCompletionDate: new Date('2026-03-15'),
    sentryContact: 'john.doe@sentry.io',
    customerContact: 'jane.smith@acme.com',
    status: 'in-progress',
    milestones: [
      {
        id: 'm1',
        title: 'Initial SDK Installation',
        description: 'Install and configure Sentry SDK in production',
        completed: true,
        completedDate: new Date('2026-02-05')
      },
      {
        id: 'm2',
        title: 'Configure Performance Monitoring',
        description: 'Set up transaction tracing and custom spans',
        completed: true,
        completedDate: new Date('2026-02-10')
      },
      {
        id: 'm3',
        title: 'Integrate with CI/CD',
        description: 'Add release tracking and deploy notifications',
        completed: false,
        dueDate: new Date('2026-02-20')
      },
      {
        id: 'm4',
        title: 'Team Training Session',
        description: 'Train engineering team on Sentry features',
        completed: false,
        dueDate: new Date('2026-03-01')
      },
      {
        id: 'm5',
        title: 'Final Review & Decision',
        description: 'Executive review and purchase decision',
        completed: false,
        dueDate: new Date('2026-03-15')
      }
    ],
    notes: 'High priority customer, enterprise plan expected'
  },
  {
    id: '2',
    customerName: 'TechStart Inc',
    projectName: 'Error Tracking & Alerting',
    startDate: new Date('2026-01-15'),
    targetCompletionDate: new Date('2026-02-28'),
    sentryContact: 'sarah.wilson@sentry.io',
    customerContact: 'mike.chen@techstart.com',
    status: 'in-progress',
    milestones: [
      {
        id: 'm6',
        title: 'SDK Setup',
        description: 'Install Sentry in React and Node.js apps',
        completed: true,
        completedDate: new Date('2026-01-18')
      },
      {
        id: 'm7',
        title: 'Alert Configuration',
        description: 'Set up email and Slack notifications',
        completed: true,
        completedDate: new Date('2026-01-25')
      },
      {
        id: 'm8',
        title: 'Source Map Upload',
        description: 'Configure automated source map uploads',
        completed: false,
        dueDate: new Date('2026-02-15')
      },
      {
        id: 'm9',
        title: 'Issue Workflow Integration',
        description: 'Connect with Jira for issue tracking',
        completed: false,
        dueDate: new Date('2026-02-25')
      }
    ]
  }
]

export function POCTracker() {
  const [projects, setProjects] = useState<POCProject[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<POCProject | undefined>()
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'blocked'>('all')

  // Load projects from localStorage on mount
  useEffect(() => {
    Sentry.logger.info('POC Tracker loaded')
    Sentry.metrics.count('poc_tracker.page_load', 1)

    const saved = localStorage.getItem('sentry-poc-projects')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Convert date strings back to Date objects
        const hydrated = parsed.map((p: POCProject) => ({
          ...p,
          startDate: new Date(p.startDate),
          targetCompletionDate: new Date(p.targetCompletionDate),
          milestones: p.milestones.map(m => ({
            ...m,
            completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
            dueDate: m.dueDate ? new Date(m.dueDate) : undefined
          }))
        }))
        setProjects(hydrated)
        Sentry.logger.info('Loaded POC projects from storage', { count: hydrated.length })
      } catch (error) {
        Sentry.logger.error('Failed to load POC projects', {
          error: error instanceof Error ? error.message : String(error)
        })
        setProjects(SAMPLE_POCS)
      }
    } else {
      // First time - load sample data
      setProjects(SAMPLE_POCS)
      localStorage.setItem('sentry-poc-projects', JSON.stringify(SAMPLE_POCS))
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('sentry-poc-projects', JSON.stringify(projects))
    }
  }, [projects])

  const handleSaveProject = (project: POCProject) => {
    const isNew = !projects.find(p => p.id === project.id)

    if (isNew) {
      Sentry.logger.info('New POC project created', {
        customer: project.customerName,
        project_name: project.projectName
      })
      Sentry.metrics.count('poc_tracker.project_created', 1)
      setProjects([...projects, project])
    } else {
      Sentry.logger.info('POC project updated', {
        project_id: project.id,
        customer: project.customerName
      })
      Sentry.metrics.count('poc_tracker.project_updated', 1)
      setProjects(projects.map(p => p.id === project.id ? project : p))
    }

    setShowForm(false)
    setEditingProject(undefined)
  }

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(projects.map(project => {
      if (project.id !== projectId) return project

      const milestones = project.milestones.map(milestone => {
        if (milestone.id !== milestoneId) return milestone

        const newCompleted = !milestone.completed
        Sentry.logger.info('Milestone toggled', {
          project_id: projectId,
          milestone_id: milestoneId,
          completed: newCompleted
        })
        Sentry.metrics.count('poc_tracker.milestone_toggled', 1, {
          attributes: { completed: newCompleted.toString() }
        })

        return {
          ...milestone,
          completed: newCompleted,
          completedDate: newCompleted ? new Date() : undefined
        }
      })

      return { ...project, milestones }
    }))
  }

  const handleEdit = (project: POCProject) => {
    Sentry.logger.info('Editing POC project', { project_id: project.id })
    setEditingProject(project)
    setShowForm(true)
  }

  const handleNewPOC = () => {
    Sentry.logger.info('Creating new POC project')
    setEditingProject(undefined)
    setShowForm(true)
  }

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter)

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    blocked: projects.filter(p => p.status === 'blocked').length
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#7553ff]" />
          <h1 className="text-lg font-semibold text-[#e8e4f0]">POC Tracker</h1>
        </div>
        <button
          onClick={handleNewPOC}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          New POC
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 p-4 border-b border-[#362552]">
        <div className="bg-[#2a2438] rounded p-3">
          <p className="text-xs text-[#9086a3] mb-1">Total POCs</p>
          <p className="text-2xl font-bold text-[#e8e4f0]">{stats.total}</p>
        </div>
        <div className="bg-[#2a2438] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#9086a3] mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>In Progress</span>
          </div>
          <p className="text-2xl font-bold text-[#e8e4f0]">{stats.inProgress}</p>
        </div>
        <div className="bg-[#2a2438] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#9086a3] mb-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-[#2a2438] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#9086a3] mb-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>Blocked</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#362552]">
        <Filter className="w-4 h-4 text-[#9086a3]" />
        <span className="text-sm text-[#9086a3]">Filter:</span>
        {(['all', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              filter === status
                ? 'bg-[#7553ff] text-white'
                : 'bg-[#2a2438] text-[#9086a3] hover:bg-[#362552]'
            }`}
          >
            {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* POC List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="w-16 h-16 text-[#362552] mb-4" />
            <h3 className="text-lg font-semibold text-[#e8e4f0] mb-2">No POCs Found</h3>
            <p className="text-sm text-[#9086a3] mb-4">
              {filter === 'all'
                ? 'Get started by creating your first POC project'
                : `No POCs with status "${filter}"`}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleNewPOC}
                className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First POC
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <POCCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onToggleMilestone={handleToggleMilestone}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <POCForm
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setShowForm(false)
            setEditingProject(undefined)
          }}
        />
      )}
    </div>
  )
}
