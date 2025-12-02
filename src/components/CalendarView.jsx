import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Sun, Moon } from 'lucide-react'
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
import './CalendarView.css'

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedTask, setDraggedTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const { projects, moveTaskToDate, theme, toggleTheme } = useApp()

  const allTasks = useMemo(() => {
    return projects.flatMap(project =>
      project.tasks.map(task => ({
        ...task,
        projectName: project.name,
        projectColor: project.color,
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

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

  const handleDayClick = (day, e) => {
    // Don't trigger if clicking on a task
    if (e.target.closest('.calendar-task-full')) return
    setSelectedDate(day)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-view-header">
        <h1 className="view-title">{format(currentDate, 'MMMM yyyy')}</h1>
        <div className="view-controls">
          <button className="control-btn today" onClick={goToToday}>
            Today
          </button>
          <div className="nav-group">
            <button className="control-btn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className="control-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="control-btn theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="control-btn primary">
            <Plus size={20} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      <div className="full-calendar">
        <div className="calendar-weekdays-full">
          {weekDays.map(day => (
            <div key={day} className="weekday-full">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days-full">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isFirstOfMonth = format(day, 'd') === '1'

            return (
              <div
                key={idx}
                className={`calendar-day-full ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                onClick={(e) => handleDayClick(day, e)}
              >
                <div className="day-header-full">
                  <span className="day-number-full">
                    {format(day, 'd')}
                    {isFirstOfMonth && (
                      <span className="month-label-full">{format(day, 'MMM')}</span>
                    )}
                  </span>
                  {isTodayDate && <span className="today-badge">Today</span>}
                </div>
                <div className="day-tasks-full">
                  {dayTasks.map(task => {
                    const taskDate = task.date ? new Date(task.date) : null
                    const taskTime = taskDate ? format(taskDate, 'HH:mm') : null

                    return (
                      <div
                        key={task.id}
                        className="calendar-task-full"
                        style={{ backgroundColor: task.projectColor }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                      >
                        <ProjectIcon project={task.project} size="small" />
                        <div className="task-content-full">
                          {taskTime && taskTime !== '00:00' && (
                            <span className="task-time-full">{taskTime}</span>
                          )}
                          <span className="task-title-full">{task.title}</span>
                        </div>
                      </div>
                    )
                  })}
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
    </div>
  )
}

export default CalendarView

