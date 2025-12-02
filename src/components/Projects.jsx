import React, { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal, Pencil, Sun, Moon, Settings, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import ProjectSettingsModal from './ProjectSettingsModal'
import NewProjectModal from './NewProjectModal'
import './Projects.css'

const Projects = () => {
  const { projects, toggleTaskComplete, deleteProject, theme, toggleTheme } = useApp()
  const [editingProject, setEditingProject] = useState(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId)
      setOpenDropdown(null)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="projects-view">
      <div className="projects-view-header">
        <h1 className="view-title">All Projects</h1>
        <div className="header-actions">
          <button className="control-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="control-btn primary" onClick={() => setShowNewProjectModal(true)}>
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-detail-card">
            <div className="project-detail-header">
              <div className="project-main-info">
                <ProjectIcon project={project} size="large" />
                <div>
                  <h2 className="project-detail-title">{project.name}</h2>
                  {project.dueDate && (
                    <p className="project-detail-due">
                      Due: {new Date(project.dueDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="project-detail-actions">
                <button 
                  className="icon-button"
                  onClick={() => setEditingProject(project)}
                  title="Project Settings"
                >
                  <Settings size={18} />
                </button>
                <div className="dropdown-wrapper" ref={openDropdown === project.id ? dropdownRef : null}>
                  <button 
                    className="icon-button"
                    onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                    title="More options"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {openDropdown === project.id && (
                    <div className="dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          setEditingProject(project)
                          setOpenDropdown(null)
                        }}
                      >
                        <Settings size={16} />
                        <span>Edit Settings</span>
                      </button>
                      <button 
                        className="dropdown-item delete"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 size={16} />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="project-detail-tasks">
              <h3>Tasks</h3>
              <div className="tasks-grid">
                {project.tasks.map(task => (
                  <div key={task.id} className="task-detail-item">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTaskComplete(task.id)}
                      className="task-checkbox-large"
                    />
                    <div className="task-detail-content">
                      <span className={`task-detail-title ${task.completed ? 'completed' : ''}`}>
                        {task.title}
                      </span>
                      <div className="task-detail-meta">
                        <span className={`task-label-badge label-${task.label}`}>
                          {task.label.replace('-', ' ')}
                        </span>
                        {task.date && (
                          <span className="task-date">
                            {new Date(task.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProject && (
        <ProjectSettingsModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
        />
      )}
    </div>
  )
}

export default Projects

