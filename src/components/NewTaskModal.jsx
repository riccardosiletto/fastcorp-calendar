import React, { useState } from 'react'
import { X, User } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import './ProjectSettingsModal.css'

const TEAM_MEMBERS = [
  { value: '', label: 'Unassigned' },
  { value: 'riccardo', label: 'Riccardo', color: '#3b82f6' },
  { value: 'stefano', label: 'Stefano', color: '#10b981' },
  { value: 'roy', label: 'Roy', color: '#f59e0b' },
]

const NewTaskModal = ({ onClose, preselectedProjectId = null }) => {
  const { projects, addTask } = useApp()
  const [taskData, setTaskData] = useState({
    title: '',
    projectId: preselectedProjectId || (projects.length > 0 ? projects[0].id : ''),
    label: 'in-progress',
    date: '',
    owner: '',
  })

  const labelOptions = [
    { value: 'high-priority', label: 'High Priority' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'in-review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
  ]

  const handleCreate = () => {
    if (taskData.title.trim() && taskData.projectId) {
      addTask({
        ...taskData,
        date: taskData.date || null,
        owner: taskData.owner || null,
      })
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Project *</label>
            <div className="project-select-wrapper">
              <select
                value={taskData.projectId}
                onChange={(e) => setTaskData({ ...taskData, projectId: e.target.value })}
                className="project-select"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Priority / Status</label>
            <select
              value={taskData.label}
              onChange={(e) => setTaskData({ ...taskData, label: e.target.value })}
              className="label-select"
            >
              {labelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Owner</label>
            <div className="owner-select-wrapper">
              <select
                value={taskData.owner}
                onChange={(e) => setTaskData({ ...taskData, owner: e.target.value })}
                className="owner-select"
              >
                {TEAM_MEMBERS.map(member => (
                  <option key={member.value} value={member.value}>
                    {member.label}
                  </option>
                ))}
              </select>
              {taskData.owner && (
                <div
                  className="owner-avatar-preview"
                  style={{ backgroundColor: TEAM_MEMBERS.find(m => m.value === taskData.owner)?.color }}
                >
                  {taskData.owner.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Due Date (Optional)</label>
            <input
              type="date"
              value={taskData.date}
              onChange={(e) => setTaskData({ ...taskData, date: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleCreate}
            disabled={!taskData.title.trim() || !taskData.projectId}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewTaskModal

