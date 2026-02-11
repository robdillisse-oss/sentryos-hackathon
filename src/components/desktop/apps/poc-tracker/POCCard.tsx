'use client'

import { POCProject, Milestone } from './types'
import { calculatePOCStats, getProjectStatusColor, getProgressColor, getMilestoneStatusColor } from './utils'
import { CheckCircle2, Circle, Clock, AlertTriangle, Edit, Calendar } from 'lucide-react'

interface POCCardProps {
  project: POCProject
  onEdit: (project: POCProject) => void
  onToggleMilestone: (projectId: string, milestoneId: string) => void
}

export function POCCard({ project, onEdit, onToggleMilestone }: POCCardProps) {
  const stats = calculatePOCStats(project)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="bg-[#2a2438] rounded-lg border border-[#362552] p-4 hover:border-[#7553ff] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-[#e8e4f0]">{project.customerName}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${getProjectStatusColor(project.status)} text-white`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-[#9086a3]">{project.projectName}</p>
        </div>
        <button
          onClick={() => onEdit(project)}
          className="p-1.5 hover:bg-[#362552] rounded transition-colors"
          title="Edit POC"
        >
          <Edit className="w-4 h-4 text-[#9086a3]" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#9086a3]">Overall Progress</span>
          <span className="text-sm font-semibold text-[#e8e4f0]">{stats.completionPercentage}%</span>
        </div>
        <div className="w-full bg-[#1e1a2a] rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(stats.completionPercentage, stats.onTrack)}`}
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="text-[#9086a3]">
            {stats.completedMilestones} / {stats.totalMilestones} milestones
          </span>
          {!stats.onTrack && stats.daysRemaining > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Behind schedule
            </span>
          )}
          {stats.onTrack && stats.daysRemaining > 0 && (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              On track
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-[#362552]">
        <div className="bg-[#1e1a2a] rounded p-2">
          <div className="flex items-center gap-1.5 text-[#9086a3] text-xs mb-1">
            <Calendar className="w-3 h-3" />
            <span>Days Remaining</span>
          </div>
          <p className={`text-lg font-semibold ${stats.daysRemaining < 7 ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
            {stats.daysRemaining > 0 ? stats.daysRemaining : 'Overdue'}
          </p>
        </div>
        <div className="bg-[#1e1a2a] rounded p-2">
          <div className="flex items-center gap-1.5 text-[#9086a3] text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>Overdue</span>
          </div>
          <p className={`text-lg font-semibold ${stats.overdueMilestones > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {stats.overdueMilestones}
          </p>
        </div>
      </div>

      {/* Contacts */}
      <div className="mb-4 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-[#9086a3]">Sentry Contact:</span>
          <span className="text-[#e8e4f0]">{project.sentryContact}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9086a3]">Customer Contact:</span>
          <span className="text-[#e8e4f0]">{project.customerContact}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9086a3]">Target Date:</span>
          <span className="text-[#e8e4f0]">{formatDate(project.targetCompletionDate)}</span>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h4 className="text-xs font-semibold text-[#9086a3] mb-2 uppercase">Milestones</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {project.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-start gap-2 p-2 bg-[#1e1a2a] rounded hover:bg-[#1e1a2a]/70 transition-colors cursor-pointer"
              onClick={() => onToggleMilestone(project.id, milestone.id)}
            >
              {milestone.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-[#9086a3] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${milestone.completed ? 'line-through text-[#9086a3]' : 'text-[#e8e4f0]'}`}>
                  {milestone.title}
                </p>
                {milestone.description && (
                  <p className="text-xs text-[#9086a3] mt-0.5">{milestone.description}</p>
                )}
                {milestone.dueDate && (
                  <p className={`text-xs mt-1 ${getMilestoneStatusColor(milestone)}`}>
                    Due: {formatDate(milestone.dueDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
          {project.milestones.length === 0 && (
            <p className="text-sm text-[#9086a3] text-center py-4">No milestones yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
