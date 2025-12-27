import React, { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, MoreHorizontal, Pencil, Copy, Sun, Moon, LayoutGrid, Columns, Settings, Trash2, Edit2, GripVertical, Info, ChevronDown, Check, Eye, Calendar, Hourglass, AlertTriangle, TrendingUp, DollarSign, Zap } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useApp } from '../context/AppContext'
import CalendarWidget from './CalendarWidget'
import KanbanBoard from './KanbanBoard'
import ProjectIcon from './ProjectIcon'
import ProjectSettingsModal from './ProjectSettingsModal'
import NewProjectModal from './NewProjectModal'
import NewTaskModal from './NewTaskModal'
import EditTaskModal from './EditTaskModal'
import './Dashboard.css'

// Status configuration for the switcher
const STATUS_CONFIG = [
  { id: 'to-schedule', icon: Eye, label: 'To be scheduled', color: '#94a3b8' },
  { id: 'scheduled', icon: Calendar, label: 'Scheduled', color: '#3b82f6' },
  { id: 'in-progress', icon: Hourglass, label: 'In Progress', color: '#fbbf24' },
  { id: 'high-priority', icon: AlertTriangle, label: 'High Priority', color: '#ef4444' },
]

// Sortable Task Component
const SortableTask = ({ task, onToggle, onEdit, onDelete, onStatusChange, projectColor }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const infoIconRef = useRef(null)

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

  const handleMouseEnter = () => {
    if (infoIconRef.current) {
      const rect = infoIconRef.current.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
    setShowTooltip(true)
  }

  // Get current status - default to 'scheduled' if has date, otherwise 'to-schedule'
  const getDefaultStatus = () => {
    if (task.label) return task.label
    return task.date ? 'scheduled' : 'to-schedule'
  }
  const currentStatus = STATUS_CONFIG.find(s => s.id === getDefaultStatus()) || STATUS_CONFIG[0]

  // Cycle to next status
  const handleStatusClick = (e) => {
    e.stopPropagation()
    const currentLabel = getDefaultStatus()
    const currentIndex = STATUS_CONFIG.findIndex(s => s.id === currentLabel)
    const nextIndex = (currentIndex + 1) % STATUS_CONFIG.length
    onStatusChange(task.id, STATUS_CONFIG[nextIndex].id)
  }

  const StatusIcon = currentStatus.icon

  return (
    <div ref={setNodeRef} style={style} className={`task-item ${isDragging ? 'dragging' : ''}`}>
      <div className="task-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </div>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="task-checkbox"
      />
      <span className={`task-title ${task.completed ? 'completed' : ''}`}>
        {task.title}
      </span>
      {task.comments && (
        <>
          <div
            className="task-info-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowTooltip(false)}
            ref={infoIconRef}
          >
            <Info size={14} className="task-info-icon" />
          </div>
          {showTooltip && createPortal(
            <div
              className="task-comment-tooltip"
              style={{
                position: 'fixed',
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {task.comments}
            </div>,
            document.body
          )}
        </>
      )}
      {task.completed ? (
        <div
          className="task-status-btn completed-status"
          title="Completed"
        >
          <Check size={14} />
        </div>
      ) : (
        <button
          className="task-status-btn"
          onClick={handleStatusClick}
          title={currentStatus.label}
          style={{ color: currentStatus.color }}
        >
          <StatusIcon size={14} />
        </button>
      )}
      <div className="task-actions">
        <button
          className="task-action-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          <Edit2 size={13} />
        </button>
      </div>
    </div>
  )
}

// Sortable Project Card Component
const SortableProjectCard = ({ project, onEdit, onDelete, onToggleTask, onEditTask, onDeleteTask, onStatusChange, onAddTask, showNewTaskInput, setShowNewTaskInput, openDropdown, setOpenDropdown, dropdownRef }) => {
  const [scrollState, setScrollState] = useState({ atTop: true, atBottom: false })
  const [completedScrollState, setCompletedScrollState] = useState({ atTop: true, atBottom: false })
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)
  const scrollContainerRef = useRef(null)
  const completedScrollRef = useRef(null)

  // Separate incomplete and completed tasks
  const incompleteTasks = useMemo(() => {
    return project.tasks.filter(task => !task.completed)
  }, [project.tasks])

  const completedTasks = useMemo(() => {
    return project.tasks.filter(task => task.completed)
  }, [project.tasks])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleScroll = (e) => {
    const element = e.target
    const atTop = element.scrollTop === 0
    const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1

    setScrollState({ atTop, atBottom })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const atTop = container.scrollTop === 0
      const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 1
      setScrollState({ atTop, atBottom })
    }
  }, [incompleteTasks.length])

  const handleCompletedScroll = (e) => {
    const element = e.target
    const atTop = element.scrollTop === 0
    const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1
    setCompletedScrollState({ atTop, atBottom })
  }

  return (
    <div ref={setNodeRef} style={style} className={`project-card ${isDragging ? 'dragging' : ''}`} {...attributes} {...listeners}>
      <div className="project-card-header">
        <div className="project-info">
          <ProjectIcon project={project} size="medium" />
          <h3 className="project-title">{project.name}</h3>
        </div>
        <div className="project-actions">
          <button
            className="icon-button"
            onClick={() => onEdit(project)}
            title="Project Settings"
          >
            <Settings size={16} />
          </button>
          <div className="dropdown-wrapper" ref={openDropdown === project.id ? dropdownRef : null}>
            <button
              className="icon-button"
              onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
            {openDropdown === project.id && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    onEdit(project)
                    setOpenDropdown(null)
                  }}
                >
                  <Settings size={16} />
                  <span>Edit Settings</span>
                </button>
                <button
                  className="dropdown-item delete"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 size={16} />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {project.dueDate && (
        <div className="project-due">
          Due: {new Date(project.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      )}

      <div className="project-tasks">
        {incompleteTasks.length > 0 && (
          <div
            ref={scrollContainerRef}
            className={`tasks-scroll-container ${incompleteTasks.length > 5 ? 'has-more' : ''} ${!scrollState.atTop ? 'scrolled' : ''} ${scrollState.atBottom ? 'at-bottom' : ''}`}
            onScroll={handleScroll}
          >
            <SortableContext
              items={incompleteTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {incompleteTasks.map(task => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                  projectColor={project.color}
                />
              ))}
            </SortableContext>
          </div>
        )}

        {showNewTaskInput === project.id ? (
          <div className="new-task-input">
            <input
              type="text"
              placeholder="Task title..."
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onAddTask(project.id, e.target.value)
                }
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  onAddTask(project.id, e.target.value)
                } else {
                  setShowNewTaskInput(null)
                }
              }}
            />
          </div>
        ) : (
          <button
            className="add-task-btn"
            onClick={() => setShowNewTaskInput(project.id)}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        )}

        {/* Completed Tasks Accordion */}
        {completedTasks.length > 0 && (
          <div className="completed-accordion">
            <button
              className={`completed-accordion-header ${isCompletedExpanded ? 'expanded' : ''}`}
              onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
            >
              <div className="completed-accordion-title">
                <Check size={9} />
                <span>Completed</span>
              </div>
              <ChevronDown size={16} className={`accordion-chevron ${isCompletedExpanded ? 'rotated' : ''}`} />
            </button>

            {isCompletedExpanded && (
              <div
                ref={completedScrollRef}
                className={`completed-tasks-container ${completedTasks.length > 3 ? 'has-more' : ''} ${!completedScrollState.atTop ? 'scrolled' : ''} ${completedScrollState.atBottom ? 'at-bottom' : ''}`}
                onScroll={handleCompletedScroll}
              >
                <SortableContext
                  items={completedTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedTasks.map(task => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                      projectColor={project.color}
                    />
                  ))}
                </SortableContext>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { projects, addTask, toggleTaskComplete, deleteProject, deleteTask, updateTask, reorderProjects, theme, toggleTheme } = useApp()
  const [showNewTaskInput, setShowNewTaskInput] = useState(null)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'kanban'
  const [editingProject, setEditingProject] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const dropdownRef = useRef(null)

  // Calculate revenue totals
  const revenueStats = useMemo(() => {
    const mrr = projects.reduce((sum, p) => sum + (parseFloat(p.monthlyFee) || 0), 0)
    const arr = mrr * 12
    const performanceFee = projects.reduce((sum, p) => sum + (parseFloat(p.performanceFee) || 0), 0)
    return { mrr, arr, performanceFee }
  }, [projects])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleAddTask = (projectId, taskTitle) => {
    if (taskTitle.trim()) {
      addTask({
        title: taskTitle,
        projectId,
        label: 'in-progress',
        date: null,
      })
      setShowNewTaskInput(null)
    }
  }

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId)
      setOpenDropdown(null)
    }
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  const handleStatusChange = (taskId, newLabel) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId)
    const updates = { label: newLabel }

    // If moving to "to-schedule", clear the date
    if (newLabel === 'to-schedule' && task?.date) {
      updates.date = null
    }

    updateTask(taskId, updates)
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // Check if dragging a project
    const isProjectDrag = projects.some(p => p.id === active.id)

    if (isProjectDrag && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.id === active.id)
      const newIndex = projects.findIndex(p => p.id === over.id)

      const newProjects = arrayMove(projects, oldIndex, newIndex)
      reorderProjects(newProjects)
      return
    }

    // Handle task dragging
    if (!isProjectDrag) {
      // Find source project and task
      let sourceProject = null
      let taskToMove = null

      for (const project of projects) {
        const task = project.tasks.find(t => t.id === active.id)
        if (task) {
          sourceProject = project
          taskToMove = task
          break
        }
      }

      if (!taskToMove || !sourceProject) return

      // Find target project
      let targetProjectId = null

      // Check if dropped on another task
      for (const project of projects) {
        const targetTask = project.tasks.find(t => t.id === over.id)
        if (targetTask) {
          targetProjectId = project.id
          break
        }
      }

      // If not dropped on a task, check if dropped on a project card
      if (!targetProjectId) {
        targetProjectId = projects.find(p => p.id === over.id)?.id
      }

      if (!targetProjectId) return

      // If moving to a different project, update task's projectId
      if (sourceProject.id !== targetProjectId) {
        updateTask(taskToMove.id, { projectId: targetProjectId })
      } else {
        // Reorder within the same project
        const oldIndex = sourceProject.tasks.findIndex(t => t.id === active.id)
        const newIndex = sourceProject.tasks.findIndex(t => t.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newTasks = arrayMove(sourceProject.tasks, oldIndex, newIndex)
          const updatedProjects = projects.map(p =>
            p.id === sourceProject.id ? { ...p, tasks: newTasks } : p
          )
          reorderProjects(updatedProjects)
        }
      }
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
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="revenue-cards">
            <div className="revenue-card arr">
              <div className="revenue-icon">
                <TrendingUp size={16} />
              </div>
              <div className="revenue-info">
                <span className="revenue-label">ARR</span>
                <span className="revenue-value">{formatCurrency(revenueStats.arr)}</span>
              </div>
            </div>
            <div className="revenue-card mrr">
              <div className="revenue-icon">
                <DollarSign size={16} />
              </div>
              <div className="revenue-info">
                <span className="revenue-label">MRR</span>
                <span className="revenue-value">{formatCurrency(revenueStats.mrr)}</span>
              </div>
            </div>
            <div className="revenue-card performance">
              <div className="revenue-icon">
                <Zap size={16} />
              </div>
              <div className="revenue-info">
                <span className="revenue-label">Performance</span>
                <span className="revenue-value">{formatCurrency(revenueStats.performanceFee)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="new-task-btn" onClick={() => setShowNewTaskModal(true)}>
            <Plus size={20} />
            <span>New Task</span>
          </button>
          <div className="notification-icon">🔔</div>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="projects-section">
          <div className="section-title">
            <div className="title-with-toggle">
              <h2>Projects Overview</h2>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                  title="Kanban View (Priority Mode)"
                >
                  <Columns size={18} />
                </button>
              </div>
            </div>
            <button className="add-project-btn" onClick={() => setShowNewProjectModal(true)}>
              <Plus size={16} />
              <span>Add Project</span>
            </button>
          </div>

          {viewMode === 'kanban' ? (
            <KanbanBoard />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={[...projects.map(p => p.id), ...projects.flatMap(p => p.tasks.map(t => t.id))]}
                strategy={rectSortingStrategy}
              >
                <div className="projects-grid">
                  {projects.map(project => (
                    <SortableProjectCard
                      key={project.id}
                      project={project}
                      onEdit={setEditingProject}
                      onDelete={handleDeleteProject}
                      onToggleTask={toggleTaskComplete}
                      onEditTask={setEditingTask}
                      onDeleteTask={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onAddTask={handleAddTask}
                      showNewTaskInput={showNewTaskInput}
                      setShowNewTaskInput={setShowNewTaskInput}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      dropdownRef={dropdownRef}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId && !projects.find(p => p.id === activeId) ? (
                  <div className="task-item dragging-overlay">
                    <span className="task-title">
                      {projects.flatMap(p => p.tasks).find(t => t.id === activeId)?.title}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <div className="calendar-section">
          <CalendarWidget />
        </div>
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

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  )
}

export default Dashboard

