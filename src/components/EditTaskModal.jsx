import React, { useState } from 'react'
import { X, Trash2, Eye, Calendar, Hourglass, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import './ProjectSettingsModal.css'

const STATUS_OPTIONS = [
  { value: 'to-schedule', label: 'To be Scheduled', icon: Eye, color: '#94a3b8' },
  { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: '#3b82f6' },
  { value: 'in-progress', label: 'In Progress', icon: Hourglass, color: '#fbbf24' },
  { value: 'high-priority', label: 'High Priority', icon: AlertTriangle, color: '#ef4444' },
]

const EditTaskModal = ({ task, onClose, onDelete }) => {
  const { projects, updateTask } = useApp()
  const [taskData, setTaskData] = useState({
    title: task.title,
    projectId: task.projectId,
    label: task.label || 'to-schedule',
    date: task.date ? task.date.split('T')[0] : '',
    comments: task.comments || '',
  })

  const handleSave = () => {
    if (taskData.title.trim() && taskData.projectId) {
      updateTask(task.id, {
        ...taskData,
        date: taskData.date || null,
      })
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
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
            <label>Status</label>
            <div className="status-select-wrapper">
              <select
                value={taskData.label}
                onChange={(e) => setTaskData({ ...taskData, label: e.target.value })}
                className="label-select"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div 
                className="status-icon-preview"
                style={{ color: STATUS_OPTIONS.find(s => s.value === taskData.label)?.color }}
              >
                {(() => {
                  const StatusIcon = STATUS_OPTIONS.find(s => s.value === taskData.label)?.icon || Eye
                  return <StatusIcon size={18} />
                })()}
              </div>
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

          <div className="form-group">
            <label>Comments (Optional)</label>
            <textarea
              value={taskData.comments}
              onChange={(e) => setTaskData({ ...taskData, comments: e.target.value })}
              placeholder="Add any notes or comments about this task..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button className="delete-task-btn" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Delete Task</span>
          </button>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!taskData.title.trim() || !taskData.projectId}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTaskModal

