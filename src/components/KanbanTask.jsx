import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Clock } from 'lucide-react'
import ProjectIcon from './ProjectIcon'
import './KanbanBoard.css'

const TEAM_MEMBERS = {
  riccardo: { label: 'Riccardo', color: '#3b82f6' },
  stefano: { label: 'Stefano', color: '#10b981' },
  roy: { label: 'Roy', color: '#f59e0b' },
}

const KanbanTask = ({ task, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const projectData = {
    name: task.projectName,
    logo: task.projectLogo,
    color: task.projectColor
  }

  const ownerData = task.owner ? TEAM_MEMBERS[task.owner] : null

  if (isOverlay) {
    return (
      <div className="kanban-task">
        <div className="task-header">
          <ProjectIcon project={projectData} size="small" />
          <span className="task-project-name">{task.projectName}</span>
        </div>
        <h4 className="task-title">{task.title}</h4>
        <div className="task-footer">
          {task.date && (
            <div className="task-meta">
              <Calendar size={14} />
              <span>{new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {ownerData && (
            <div
              className="task-owner-badge"
              style={{ backgroundColor: ownerData.color }}
              title={ownerData.label}
            >
              {task.owner.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-task ${isDragging ? 'dragging' : ''}`}
      data-task-id={task.id}
    >
      <div className="task-header">
        <ProjectIcon project={projectData} size="small" />
        <span className="task-project-name">{task.projectName}</span>
      </div>
      <h4 className="task-title">{task.title}</h4>
      <div className="task-footer">
        {task.date && (
          <div className="task-meta">
            <Calendar size={14} />
            <span>{new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
        {ownerData && (
          <div
            className="task-owner-badge"
            style={{ backgroundColor: ownerData.color }}
            title={ownerData.label}
          >
            {task.owner.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanTask

