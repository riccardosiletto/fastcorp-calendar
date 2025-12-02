import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import './Timeline.css'

const Timeline = () => {
  const { projects, theme, toggleTheme } = useApp()

  const allTasksWithDates = projects.flatMap(project =>
    project.tasks
      .filter(task => task.date)
      .map(task => ({
        ...task,
        projectName: project.name,
        projectColor: project.color,
        project: { name: project.name, logo: project.logo, color: project.color }
      }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date))

  const groupedByDate = allTasksWithDates.reduce((acc, task) => {
    const dateKey = new Date(task.date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(task)
    return acc
  }, {})

  return (
    <div className="timeline-view">
      <div className="timeline-header">
        <div className="timeline-title-section">
          <h1 className="view-title">Timeline</h1>
          <p className="timeline-subtitle">Chronological view of all scheduled tasks</p>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="timeline-container">
        {Object.entries(groupedByDate).length === 0 ? (
          <div className="timeline-empty">
            <p>No scheduled tasks yet. Drag tasks to the calendar to schedule them!</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, tasks]) => (
            <div key={date} className="timeline-group">
              <div className="timeline-date">
                <div className="timeline-dot"></div>
                <h3>{date}</h3>
              </div>
              <div className="timeline-tasks">
                {tasks.map(task => (
                  <div key={task.id} className="timeline-task">
                    <div 
                      className="timeline-task-indicator" 
                      style={{ backgroundColor: task.projectColor }}
                    ></div>
                    <div className="timeline-task-content">
                      <div className="timeline-task-header">
                        <ProjectIcon project={task.project} size="small" />
                        <h4>{task.title}</h4>
                      </div>
                      <p className="timeline-task-project">{task.projectName}</p>
                      <span className={`timeline-task-label label-${task.label}`}>
                        {task.label.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Timeline

