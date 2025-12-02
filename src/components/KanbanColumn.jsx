import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanTask from './KanbanTask'
import { AlertCircle } from 'lucide-react'
import './KanbanBoard.css'

const KanbanColumn = ({ column, tasks }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map(task => task.id)
  const isOverLimit = column.limit && tasks.length > column.limit
  const wipCount = tasks.length

  return (
    <div className="kanban-column">
      <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
        <div className="column-title-section">
          <h3 className="column-title">{column.title}</h3>
          <span className={`task-count ${isOverLimit ? 'over-limit' : ''}`}>
            {wipCount}
            {column.limit && ` / ${column.limit}`}
          </span>
        </div>
        {isOverLimit && (
          <div className="wip-warning">
            <AlertCircle size={16} />
            <span>WIP Limit Exceeded</span>
          </div>
        )}
      </div>

      <div ref={setNodeRef} className="kanban-column-content">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="empty-column">
              <p>Drop tasks here</p>
            </div>
          ) : (
            tasks.map(task => (
              <KanbanTask key={task.id} task={task} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default KanbanColumn

