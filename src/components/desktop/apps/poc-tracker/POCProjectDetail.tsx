'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { calculatePOCStats, getProgressColor } from './utils'
import { CompanyLogo } from './CompanyLogo'
import { useAuth } from './auth'
import { MutualActionPlan } from './MutualActionPlan'
import { POCByPhase } from './POCByPhase'
import { SuccessCriteria } from './SuccessCriteria'
import { ArrowLeft, ListTodo, Layers, Target, LogOut, User } from 'lucide-react'

type TabType = 'action-plan' | 'phases' | 'success-criteria'

interface POCProjectDetailProps {
  project: POCProject
  onBack: () => void
  onUpdate: (project: POCProject) => void
}

export function POCProjectDetail({ project, onBack, onUpdate }: POCProjectDetailProps) {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('action-plan')

  const handleToggleActionItem = (id: string) => {
    const updatedProject = {
      ...project,
      actionPlan: project.actionPlan.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Action item toggled', { item_id: id, status: newStatus })
          Sentry.metrics.count('poc_tracker.action_item_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...item, status: newStatus }
        }
        return item
      })
    }
    onUpdate(updatedProject)
  }

  const handleTogglePhaseTask = (phaseId: string, taskId: string) => {
    const updatedProject = {
      ...project,
      phases: project.phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => {
              if (task.id === taskId) {
                const newStatus = task.status === 'completed' ? 'in-progress' : 'completed'
                Sentry.logger.info('Phase task toggled', { phase_id: phaseId, task_id: taskId, status: newStatus })
                Sentry.metrics.count('poc_tracker.phase_task_toggled', 1, {
                  attributes: { completed: (newStatus === 'completed').toString() }
                })
                return { ...task, status: newStatus }
              }
              return task
            })
          }
        }
        return phase
      })
    }
    onUpdate(updatedProject)
  }

  const handleToggleCriterion = (id: string) => {
    const updatedProject = {
      ...project,
      successCriteria: project.successCriteria.map(criterion => {
        if (criterion.id === id) {
          const newStatus = criterion.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Success criterion toggled', { criterion_id: id, status: newStatus })
          Sentry.metrics.count('poc_tracker.success_criterion_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...criterion, status: newStatus }
        }
        return criterion
      })
    }
    onUpdate(updatedProject)
  }

  const stats = calculatePOCStats(project)

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2 py-1 text-sm text-[#9086a3] hover:text-[#7553ff] hover:bg-[#1e1a2a] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <div className="h-4 w-px bg-[#362552]" />
          <CompanyLogo
            companyName={project.customerName}
            size="small"
          />
          <div className="h-4 w-px bg-[#362552]" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[#e8e4f0]">{project.customerName}</h1>
            <p className="text-sm text-[#9086a3]">{project.projectName}</p>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1a2a] rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#7553ff]/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#7553ff]" />
                )}
              </div>
              <span className="text-sm text-[#e8e4f0]">{user.name}</span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1e1a2a] text-[#9086a3] hover:text-[#e8e4f0] text-sm rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#362552]" />

          <div className="text-right">
            <div className="text-2xl font-bold text-[#e8e4f0]">{stats.overallCompletion}%</div>
            <div className={`text-xs ${stats.onTrack ? 'text-green-400' : 'text-red-400'}`}>
              {stats.onTrack ? '✓ On Track' : '⚠ Behind Schedule'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1e1a2a] rounded-full h-2 mb-2">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(stats.overallCompletion, stats.onTrack)}`}
            style={{ width: `${stats.overallCompletion}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Action Plan</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedActionItems}/{stats.totalActionItems}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Phase Tasks</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Success Criteria</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedCriteria}/{stats.totalCriteria}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Days Left</div>
            <div className={`font-semibold ${stats.daysRemaining < 7 ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
              {stats.daysRemaining > 0 ? stats.daysRemaining : 'Overdue'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#362552] bg-[#2a2438]">
        <button
          onClick={() => {
            setActiveTab('action-plan')
            Sentry.logger.info('Switched to Action Plan tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'action-plan' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'action-plan'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Mutual Action Plan
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedActionItems}/{stats.totalActionItems}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('phases')
            Sentry.logger.info('Switched to Phases tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'phases' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'phases'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <Layers className="w-4 h-4" />
          POC by Phase
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedTasks}/{stats.totalTasks}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('success-criteria')
            Sentry.logger.info('Switched to Success Criteria tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'success-criteria' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'success-criteria'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <Target className="w-4 h-4" />
          Success Criteria
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedCriteria}/{stats.totalCriteria}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'action-plan' && (
          <MutualActionPlan
            items={project.actionPlan}
            onToggleStatus={handleToggleActionItem}
          />
        )}
        {activeTab === 'phases' && (
          <POCByPhase
            phases={project.phases}
            onToggleTask={handleTogglePhaseTask}
          />
        )}
        {activeTab === 'success-criteria' && (
          <SuccessCriteria
            criteria={project.successCriteria}
            onToggleStatus={handleToggleCriterion}
          />
        )}
      </div>
    </div>
  )
}
