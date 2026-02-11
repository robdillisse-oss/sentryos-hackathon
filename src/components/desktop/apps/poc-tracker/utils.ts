import { POCProject, POCStats, Milestone } from './types'

export function calculatePOCStats(project: POCProject): POCStats {
  const totalMilestones = project.milestones.length
  const completedMilestones = project.milestones.filter(m => m.completed).length
  const completionPercentage = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0

  const now = new Date()
  const overdueMilestones = project.milestones.filter(m =>
    !m.completed && m.dueDate && new Date(m.dueDate) < now
  ).length

  const targetDate = new Date(project.targetCompletionDate)
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate if on track (completed milestones / total milestones should be >= elapsed time / total time)
  const startDate = new Date(project.startDate)
  const totalDuration = targetDate.getTime() - startDate.getTime()
  const elapsedDuration = now.getTime() - startDate.getTime()
  const expectedProgress = totalDuration > 0 ? (elapsedDuration / totalDuration) : 0
  const actualProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) : 0
  const onTrack = actualProgress >= expectedProgress * 0.9 // 90% threshold

  return {
    totalMilestones,
    completedMilestones,
    completionPercentage,
    overdueMilestones,
    daysRemaining,
    onTrack
  }
}

export function getMilestoneStatusColor(milestone: Milestone): string {
  if (milestone.completed) return 'text-green-400'
  if (milestone.dueDate && new Date(milestone.dueDate) < new Date()) return 'text-red-400'
  return 'text-yellow-400'
}

export function getProjectStatusColor(status: POCProject['status']): string {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'in-progress': return 'bg-blue-500'
    case 'blocked': return 'bg-red-500'
    case 'not-started': return 'bg-gray-500'
    default: return 'bg-gray-500'
  }
}

export function getProgressColor(percentage: number, onTrack: boolean): string {
  if (percentage === 100) return 'bg-green-500'
  if (!onTrack) return 'bg-red-500'
  if (percentage >= 50) return 'bg-blue-500'
  return 'bg-yellow-500'
}
