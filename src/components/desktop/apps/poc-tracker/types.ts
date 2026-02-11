// Mutual Action Plan types
export interface ActionPlanItem {
  id: string
  dueDate?: Date
  milestone: string
  owner: string
  status: 'completed' | 'in-progress' | 'not-started'
  notes?: string
}

// POC by Phase types
export interface PhaseTask {
  id: string
  task: string
  resources: string
  owner: string
  targetDate?: Date
  status: 'completed' | 'in-progress' | 'not-started'
  notes: string
}

export interface Phase {
  id: string
  name: string
  tasks: PhaseTask[]
}

// Success Criteria types
export interface SuccessCriterion {
  id: string
  criteria: string
  validation: string
  category: string
  priority: 'high' | 'medium' | 'low'
  currentState: string
  status: 'completed' | 'in-progress' | 'not-started'
  notes: string
}

// Main POC Project
export interface POCProject {
  id: string
  customerName: string
  projectName: string
  startDate: Date
  targetCompletionDate: Date
  sentryContact: string
  customerContact: string
  sentryTeam: Array<{ name: string; role: string }>
  customerTeam: Array<{ name: string; role: string }>
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  actionPlan: ActionPlanItem[]
  phases: Phase[]
  successCriteria: SuccessCriterion[]
  notes?: string
}

export interface POCStats {
  totalActionItems: number
  completedActionItems: number
  totalTasks: number
  completedTasks: number
  totalCriteria: number
  completedCriteria: number
  overallCompletion: number
  daysRemaining: number
  onTrack: boolean
}
