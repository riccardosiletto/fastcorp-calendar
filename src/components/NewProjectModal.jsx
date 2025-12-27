import React, { useState, useRef } from 'react'
import { X, Upload, Palette, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './ProjectSettingsModal.css'

const NewProjectModal = ({ onClose }) => {
  const { addProject } = useApp()
  const [projectData, setProjectData] = useState({
    name: '',
    color: '#ffa500',
    logo: null,
    dueDate: '',
    monthlyFee: '',
    performanceFee: '',
  })
  const fileInputRef = useRef(null)

  const colorOptions = [
    '#ffa500', // Orange
    '#ff6b35', // Red-Orange
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#ec4899', // Pink
  ]

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProjectData({ ...projectData, logo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setProjectData({ ...projectData, logo: null })
  }

  const handleCreate = () => {
    if (projectData.name.trim()) {
      addProject(projectData)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
              placeholder="Enter project name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Project Logo (Optional)</label>
            <div className="logo-section">
              {projectData.logo ? (
                <div className="logo-preview">
                  <img src={projectData.logo} alt="Project logo" />
                  <button className="remove-logo-btn" onClick={handleRemoveLogo}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                  <Upload size={20} />
                  <span>Upload Logo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p className="form-hint">Upload an image file (PNG, JPG, SVG)</p>
          </div>

          {!projectData.logo && (
            <div className="form-group">
              <label>
                <Palette size={16} />
                <span>Project Color</span>
              </label>
              <div className="color-picker">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${projectData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setProjectData({ ...projectData, color })}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Due Date (Optional)</label>
            <input
              type="date"
              value={projectData.dueDate}
              onChange={(e) => setProjectData({ ...projectData, dueDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={16} />
              <span>Monthly Fee (€)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={projectData.monthlyFee}
              onChange={(e) => setProjectData({ ...projectData, monthlyFee: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>
              <DollarSign size={16} />
              <span>Performance Fee (€)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={projectData.performanceFee}
              onChange={(e) => setProjectData({ ...projectData, performanceFee: e.target.value })}
              placeholder="0.00"
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
            disabled={!projectData.name.trim()}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewProjectModal

