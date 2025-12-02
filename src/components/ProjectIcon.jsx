import React from 'react'
import './ProjectIcon.css'

const ProjectIcon = ({ project, size = 'medium' }) => {
  if (project.logo) {
    return (
      <div className={`project-icon logo ${size}`}>
        <img src={project.logo} alt={project.name} />
      </div>
    )
  }

  // Show colored circle with first letter
  const initial = project.name.charAt(0).toUpperCase()

  return (
    <div 
      className={`project-icon circle ${size}`}
      style={{ backgroundColor: project.color }}
    >
      <span>{initial}</span>
    </div>
  )
}

export default ProjectIcon

