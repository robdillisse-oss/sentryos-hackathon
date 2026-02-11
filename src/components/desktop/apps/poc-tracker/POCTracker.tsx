'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { calculatePOCStats, getProgressColor } from './utils'
import { MutualActionPlan } from './MutualActionPlan'
import { POCByPhase } from './POCByPhase'
import { SuccessCriteria } from './SuccessCriteria'
import { parseCatawikiExcel } from './excelParser'
import { TrendingUp, CheckCircle, AlertCircle, Clock, ListTodo, Layers, Target } from 'lucide-react'

type TabType = 'action-plan' | 'phases' | 'success-criteria'

export function POCTracker() {
  const [project, setProject] = useState<POCProject | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('action-plan')

  // Load project data on mount
  useEffect(() => {
    Sentry.logger.info('POC Tracker loaded')
    Sentry.metrics.count('poc_tracker.page_load', 1)

    // Load Catawiki POC data
    const catawikiPOC = parseCatawikiExcel()
    setProject(catawikiPOC)

    Sentry.logger.info('Loaded Catawiki POC project', {
      customer: catawikiPOC.customerName,
      project_name: catawikiPOC.projectName
    })
  }, [])

  const handleToggleActionItem = (id: string) => {
    if (!project) return

    setProject({
      ...project,
      actionPlan: project.actionPlan.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Action item toggled', {
            item_id: id,
            status: newStatus
          })
          Sentry.metrics.count('poc_tracker.action_item_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...item, status: newStatus }
        }
        return item
      })
    })
  }

  const handleTogglePhaseTask = (phaseId: string, taskId: string) => {
    if (!project) return

    setProject({
      ...project,
      phases: project.phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => {
              if (task.id === taskId) {
                const newStatus = task.status === 'completed' ? 'in-progress' : 'completed'
                Sentry.logger.info('Phase task toggled', {
                  phase_id: phaseId,
                  task_id: taskId,
                  status: newStatus
                })
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
    })
  }

  const handleToggleCriterion = (id: string) => {
    if (!project) return

    setProject({
      ...project,
      successCriteria: project.successCriteria.map(criterion => {
        if (criterion.id === id) {
          const newStatus = criterion.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Success criterion toggled', {
            criterion_id: id,
            status: newStatus
          })
          Sentry.metrics.count('poc_tracker.success_criterion_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...criterion, status: newStatus }
        }
        return criterion
      })
    })
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1a2a]">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-[#7553ff] mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-[#9086a3]">Loading POC data...</p>
        </div>
      </div>
    )
  }

  const stats = calculatePOCStats(project)

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-semibold text-[#e8e4f0]">{project.customerName}</h1>
            <p className="text-sm text-[#9086a3]">{project.projectName}</p>
          </div>
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
