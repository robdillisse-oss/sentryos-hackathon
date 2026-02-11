'use client'

import { useState, useEffect } from 'react'
import { POCProject, Milestone } from './types'
import { X, Plus, Trash2 } from 'lucide-react'

interface POCFormProps {
  project?: POCProject
  onSave: (project: POCProject) => void
  onClose: () => void
}

export function POCForm({ project, onSave, onClose }: POCFormProps) {
  const [formData, setFormData] = useState<Partial<POCProject>>({
    customerName: '',
    projectName: '',
    startDate: new Date(),
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    sentryContact: '',
    customerContact: '',
    status: 'not-started',
    milestones: [],
    notes: ''
  })

  useEffect(() => {
    if (project) {
      setFormData(project)
    }
  }, [project])

  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const poc: POCProject = {
      id: project?.id || crypto.randomUUID(),
      customerName: formData.customerName || '',
      projectName: formData.projectName || '',
      startDate: formData.startDate || new Date(),
      targetCompletionDate: formData.targetCompletionDate || new Date(),
      sentryContact: formData.sentryContact || '',
      customerContact: formData.customerContact || '',
      status: formData.status || 'not-started',
      milestones: formData.milestones || [],
      notes: formData.notes
    }

    onSave(poc)
  }

  const addMilestone = () => {
    if (!newMilestone.title.trim()) return

    const milestone: Milestone = {
      id: crypto.randomUUID(),
      title: newMilestone.title,
      description: newMilestone.description,
      completed: false
    }

    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), milestone]
    }))

    setNewMilestone({ title: '', description: '' })
  }

  const removeMilestone = (id: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: (prev.milestones || []).filter(m => m.id !== id)
    }))
  }

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2438] rounded-lg border border-[#362552] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#362552]">
          <h2 className="text-lg font-semibold text-[#e8e4f0]">
            {project ? 'Edit POC' : 'New POC Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#362552] rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#9086a3]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                placeholder="Performance Monitoring POC"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Sentry Contact *
              </label>
              <input
                type="text"
                required
                value={formData.sentryContact}
                onChange={(e) => setFormData({ ...formData, sentryContact: e.target.value })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                placeholder="john@sentry.io"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Customer Contact *
              </label>
              <input
                type="text"
                required
                value={formData.customerContact}
                onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                placeholder="jane@acme.com"
              />
            </div>
          </div>

          {/* Dates and Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formatDateForInput(formData.startDate!)}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={formatDateForInput(formData.targetCompletionDate!)}
                onChange={(e) => setFormData({ ...formData, targetCompletionDate: new Date(e.target.value) })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as POCProject['status'] })}
                className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#e8e4f0] mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full bg-[#1e1a2a] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none resize-none"
              placeholder="Additional notes about this POC..."
            />
          </div>

          {/* Milestones */}
          <div className="border-t border-[#362552] pt-4">
            <h3 className="text-sm font-semibold text-[#e8e4f0] mb-3">Milestones</h3>

            {/* Add Milestone */}
            <div className="bg-[#1e1a2a] rounded p-3 mb-3">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full bg-[#2a2438] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                  placeholder="Milestone title"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <input
                  type="text"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="w-full bg-[#2a2438] text-[#e8e4f0] text-sm rounded px-3 py-2 border border-[#362552] focus:border-[#7553ff] focus:outline-none"
                  placeholder="Description (optional)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <button
                  type="button"
                  onClick={addMilestone}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>
            </div>

            {/* Milestone List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(formData.milestones || []).map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-2 p-2 bg-[#1e1a2a] rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e8e4f0]">{milestone.title}</p>
                    {milestone.description && (
                      <p className="text-xs text-[#9086a3] mt-0.5">{milestone.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(milestone.id)}
                    className="p-1 hover:bg-[#362552] rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
              {(formData.milestones || []).length === 0 && (
                <p className="text-sm text-[#9086a3] text-center py-4">No milestones added yet</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#362552]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#362552] hover:bg-[#3f2d5e] text-[#e8e4f0] text-sm rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
          >
            {project ? 'Save Changes' : 'Create POC'}
          </button>
        </div>
      </div>
    </div>
  )
}
