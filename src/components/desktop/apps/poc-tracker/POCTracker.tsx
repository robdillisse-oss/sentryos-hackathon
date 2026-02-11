'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { POCProjectList } from './POCProjectList'
import { POCProjectDetail } from './POCProjectDetail'
import { parseCatawikiExcel } from './excelParser'

export function POCTracker() {
  const [projects, setProjects] = useState<POCProject[]>([])
  const [selectedProject, setSelectedProject] = useState<POCProject | null>(null)

  // Load projects on mount
  useEffect(() => {
    Sentry.logger.info('POC Tracker loaded')
    Sentry.metrics.count('poc_tracker.page_load', 1)

    // Load Catawiki POC as a sample project
    const catawikiPOC = parseCatawikiExcel()

    // You could also create more sample projects here
    const allProjects = [catawikiPOC]

    setProjects(allProjects)

    Sentry.logger.info('Loaded POC projects', { count: allProjects.length })
  }, [])

  const handleSelectProject = (project: POCProject) => {
    Sentry.logger.info('Selected POC project', {
      project_id: project.id,
      customer: project.customerName
    })
    Sentry.metrics.count('poc_tracker.project_opened', 1)
    setSelectedProject(project)
  }

  const handleBackToList = () => {
    Sentry.logger.info('Returned to project list')
    Sentry.metrics.count('poc_tracker.back_to_list', 1)
    setSelectedProject(null)
  }

  const handleUpdateProject = (updatedProject: POCProject) => {
    setProjects(projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    ))
    setSelectedProject(updatedProject)
  }

  // Show detail view if a project is selected
  if (selectedProject) {
    return (
      <POCProjectDetail
        project={selectedProject}
        onBack={handleBackToList}
        onUpdate={handleUpdateProject}
      />
    )
  }

  // Show list view
  return (
    <POCProjectList
      projects={projects}
      onSelectProject={handleSelectProject}
    />
  )
}
