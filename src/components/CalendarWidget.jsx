import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProjectIcon from './ProjectIcon'
import AssignTaskModal from './AssignTaskModal'
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  addDays,
  subDays
} from 'date-fns'
import './CalendarWidget.css'

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedTask, setDraggedTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const { projects, moveTaskToDate } = useApp()

  const allTasks = useMemo(() => {
    return projects.flatMap(project => 
      project.tasks.map(task => ({
        ...task,
        projectName: project.name,
        projectColor: project.color,
        projectLogo: project.logo,
        project: { name: project.name, logo: project.logo, color: project.color }
      }))
    )
  }, [projects])

  const calendarDays = useMemo(() => {
    // Get the start of the current week
    const weekStart = startOfWeek(currentDate)
    
    // Calculate 6 rows of 7 days (42 days total)
    // Current week is in row 2, so we need to go back 1 week (7 days)
    const calStart = subDays(weekStart, 7)
    
    // Then show 6 weeks total (42 days)
    const calEnd = addDays(calStart, 41)

    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getTasksForDate = (date) => {
    return allTasks.filter(task => 
      task.date && isSameDay(new Date(task.date), date)
    )
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, date) => {
    e.preventDefault()
    if (draggedTask) {
      moveTaskToDate(draggedTask.id, date.toISOString())
      setDraggedTask(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleDayClick = (day) => {
    setSelectedDate(day)
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h2 className="calendar-title">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="calendar-controls">
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
          <div className="nav-buttons">
            <button className="nav-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isFirstOfMonth = format(day, 'd') === '1'

            return (
              <div
                key={idx}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                onClick={() => handleDayClick(day)}
              >
                <div className="day-number">
                  {format(day, 'd')}
                  {isFirstOfMonth && (
                    <span className="month-label">{format(day, 'MMM')}</span>
                  )}
                </div>
                <div className="day-tasks">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className="calendar-task"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <ProjectIcon project={task.project} size="small" />
                      <span className="task-text">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <AssignTaskModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <div className="unscheduled-tasks">
        <h3>Unscheduled Tasks</h3>
        <div className="unscheduled-list">
          {allTasks.filter(task => !task.date).map(task => (
            <div
              key={task.id}
              className="unscheduled-task"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
            >
              <ProjectIcon project={task.project} size="small" />
              <div className="task-info">
                <span className="task-text">{task.title}</span>
                <span className="task-project">{task.projectName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarWidget

