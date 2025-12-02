import React, { useState, useRef } from 'react'
import { LayoutDashboard, Calendar, FolderKanban, Clock, Plus, Download, Upload, RotateCcw, Cloud, CloudOff, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import './Sidebar.css'

const Sidebar = ({ currentView, onViewChange }) => {
  const { projects, addProject, exportData, importData, resetToInitialData, syncStatus } = useApp()
  const [showAddProject, setShowAddProject] = useState(false)
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    const success = await exportData()
    if (success) {
      alert('✅ Data exported successfully!')
    } else {
      alert('❌ Error exporting data. Check console for details.')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('⚠️ This will replace all current data. Continue?')) {
      event.target.value = ''
      return
    }

    const success = await importData(file)
    if (success) {
      alert('✅ Data imported successfully!')
    } else {
      alert('❌ Error importing data. Check console for details.')
    }
    event.target.value = ''
  }

  const handleReset = async () => {
    if (!confirm('⚠️ This will reset ALL data to initial state. You will lose all changes. Continue?')) {
      return
    }

    const success = await resetToInitialData()
    if (success) {
      alert('✅ Data reset to initial state!')
      window.location.reload()
    } else {
      alert('❌ Error resetting data. Check console for details.')
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ]

  const taskLabels = [
    { id: 'high-priority', label: 'High Priority', color: 'var(--label-red)' },
    { id: 'in-progress', label: 'In Progress', color: 'var(--label-yellow)' },
    { id: 'completed', label: 'Completed', color: 'var(--label-green)' },
    { id: 'in-review', label: 'In Review', color: 'var(--label-blue)' },
  ]

  // Sync status indicator
  const getSyncStatusInfo = () => {
    switch (syncStatus) {
      case 'synced':
        return { icon: Cloud, text: 'Synced', className: 'sync-status synced' }
      case 'offline':
        return { icon: CloudOff, text: 'Offline', className: 'sync-status offline' }
      default:
        return { icon: Loader, text: 'Syncing...', className: 'sync-status connecting' }
    }
  }

  const statusInfo = getSyncStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/loghi progetti/logo fastcorp.png" alt="TaskCorp" className="logo-image" />
          <h1 className="logo-text">TaskCorp</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>MY PROJECTS</h3>
          <button className="add-button" onClick={() => setShowAddProject(!showAddProject)}>
            + Add
          </button>
        </div>
        <div className="project-list">
          {projects.map(project => (
            <div key={project.id} className="project-item">
              <ProjectIcon project={project} size="small" />
              <span className="project-name">{project.name}</span>
              <span className="project-count">{project.tasks.length}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>TASK LABELS</h3>
        </div>
        <div className="label-list">
          {taskLabels.map(label => (
            <div key={label.id} className="label-item">
              <div className="label-indicator" style={{ backgroundColor: label.color }}></div>
              <span className="label-name">{label.label}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="new-task-button">
        <Plus size={20} />
        <span>New Task</span>
      </button>

      <div className="sidebar-footer">
        {/* Sync Status Indicator - Always visible */}
        <div className={statusInfo.className} title="Auto-sync is always active">
          <StatusIcon size={18} className={syncStatus === 'connecting' ? 'spinning' : ''} />
          <span>{statusInfo.text}</span>
        </div>

        <button className="footer-button" onClick={handleExport} title="Export data as JSON">
          <Download size={18} />
          <span>Export</span>
        </button>
        <button className="footer-button" onClick={handleImportClick} title="Import data from JSON">
          <Upload size={18} />
          <span>Import</span>
        </button>
        <button className="footer-button reset-btn" onClick={handleReset} title="Reset to initial data">
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
    </aside>
  )
}

export default Sidebar
