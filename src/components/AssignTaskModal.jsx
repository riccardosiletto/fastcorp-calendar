import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import './ProjectSettingsModal.css'

const AssignTaskModal = ({ date, onClose }) => {
  const { projects, moveTaskToDate } = useApp()
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedTime, setSelectedTime] = useState('09:00')

  // Get all tasks
  const allTasks = projects.flatMap(project =>
    project.tasks.map(task => ({
      ...task,
      projectName: project.name,
      projectLogo: project.logo,
      projectColor: project.color,
    }))
  )

  const handleAssign = () => {
    if (selectedTaskId) {
      // Combine date with selected time
      const [hours, minutes] = selectedTime.split(':')
      const dateWithTime = new Date(date)
      dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      moveTaskToDate(selectedTaskId, dateWithTime.toISOString())
      onClose()
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Task to {formatDate(date)}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Select a task to assign *</label>
            <div className="task-selection-list">
              {allTasks.length === 0 ? (
                <p className="no-tasks-message">No tasks available. Create a task first.</p>
              ) : (
                allTasks.map(task => {
                  // Ensure status and priority have fallback values
                  const status = task.status || 'todo'
                  const priority = task.priority || 'medium'

                  return (
                    <div
                      key={task.id}
                      className={`task-selection-item ${selectedTaskId === task.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <input
                        type="radio"
                        name="task"
                        value={task.id}
                        checked={selectedTaskId === task.id}
                        onChange={() => setSelectedTaskId(task.id)}
                        className="task-radio"
                      />
                      <div className="task-selection-content">
                        <div className="task-selection-title">
                          <span className={`task-title ${task.completed ? '' : ''}`}>
                            {task.title}
                          </span>
                          <span className={`task-label-badge label-${status}`}>
                            {status.replace('-', ' ')}
                          </span>
                          <span className={`task-label-badge label-${priority}`} style={{ opacity: 0.7 }}>
                            {priority}
                          </span>
                        </div>
                        <div className="task-selection-project">
                          <ProjectIcon project={{ name: task.projectName, logo: task.projectLogo, color: task.projectColor }} size="small" />
                          <span>{task.projectName}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {selectedTaskId && (
            <div className="form-group">
              <label>Select time (optional)</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="time-input"
              />
              <span className="form-hint">Choose a time for this task</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleAssign}
            disabled={!selectedTaskId}
          >
            Assign Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignTaskModal

