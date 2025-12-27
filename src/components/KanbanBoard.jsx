import React, { useMemo, useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useApp } from '../context/AppContext'
import KanbanColumn from './KanbanColumn'
import KanbanTask from './KanbanTask'
import './KanbanBoard.css'

const KanbanBoard = () => {
  const { projects, updateTask } = useApp()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns = [
    { id: 'to-schedule', title: 'To be Scheduled', color: '#94a3b8', limit: null },
    { id: 'scheduled', title: 'Scheduled', color: '#3b82f6', limit: null },
    { id: 'in-progress', title: 'In Progress', color: '#fbbf24', limit: 5 },
    { id: 'high-priority', title: 'High Priority', color: '#ef4444', limit: 3 },
  ]

  const allTasks = useMemo(() => {
    return projects.flatMap(project =>
      project.tasks.map(task => ({
        ...task,
        projectName: project.name,
        projectColor: project.color,
        projectLogo: project.logo,
      }))
    )
  }, [projects])

  // Derive effective label from task properties to sync calendar with Kanban
  const getEffectiveLabel = (task) => {
    // If task has explicit label of in-progress or high-priority, keep it
    if (task.label === 'in-progress' || task.label === 'high-priority') {
      return task.label
    }
    // If task has a date assigned, it's scheduled
    if (task.date) {
      return 'scheduled'
    }
    // If task has explicit label, use it
    if (task.label) {
      return task.label
    }
    // Default: to be scheduled
    return 'to-schedule'
  }

  const tasksByColumn = useMemo(() => {
    const grouped = {}
    columns.forEach(col => {
      grouped[col.id] = allTasks.filter(task => getEffectiveLabel(task) === col.id)
    })
    return grouped
  }, [allTasks, columns])

  const handleDragStart = (event) => {
    const { active } = event
    const task = allTasks.find(t => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id
    const newStatus = over.id

    // Check if dropping on a column
    if (columns.find(col => col.id === newStatus)) {
      const task = allTasks.find(t => t.id === taskId)
      const updates = { label: newStatus }
      
      // If moving to "to-schedule", clear the date
      if (newStatus === 'to-schedule' && task?.date) {
        updates.date = null
      }
      
      updateTask(taskId, updates)
    }

    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="kanban-task-overlay">
            <KanbanTask task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard

