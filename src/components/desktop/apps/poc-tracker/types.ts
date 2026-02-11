export interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  completedDate?: Date
  dueDate?: Date
  assignee?: string
}

export interface POCProject {
  id: string
  customerName: string
  projectName: string
  startDate: Date
  targetCompletionDate: Date
  sentryContact: string
  customerContact: string
  milestones: Milestone[]
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  notes?: string
}

export interface POCStats {
  totalMilestones: number
  completedMilestones: number
  completionPercentage: number
  overdueMilestones: number
  daysRemaining: number
  onTrack: boolean
}
