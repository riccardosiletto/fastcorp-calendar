import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { db } from '../lib/indexeddb'
import syncManager from '../lib/sync'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

const initialProjects = [
  {
    id: 'skillsherpa',
    name: 'SkillSherpa',
    logo: '/loghi progetti/SkillSherpa.svg',
    color: '#10b981',
    dueDate: null,
    progress: 0,
    tasks: [
      { id: 'task-ss-1', projectId: 'skillsherpa', title: 'Lp', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-ss-2', projectId: 'skillsherpa', title: 'Results Page', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-ss-3', projectId: 'skillsherpa', title: 'Creatives', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-ss-4', projectId: 'skillsherpa', title: 'Tracking e wireframe', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-ss-5', projectId: 'skillsherpa', title: 'Career Lab', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-ss-6', projectId: 'skillsherpa', title: 'AI Voice Agent', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false }
    ]
  },
  {
    id: 'design2taste',
    name: 'Design2Taste',
    logo: '/loghi progetti/Design2Taste.svg',
    color: '#ff6b35',
    dueDate: null,
    progress: 0,
    tasks: [
      { id: 'task-d2t-1', projectId: 'design2taste', title: 'Post IG', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-d2t-2', projectId: 'design2taste', title: 'Campigns', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-d2t-3', projectId: 'design2taste', title: 'Home Page', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false },
      { id: 'task-d2t-4', projectId: 'design2taste', title: 'Monthly report', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-d2t-5', projectId: 'design2taste', title: 'AI Redesigner', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false },
      { id: 'task-d2t-6', projectId: 'design2taste', title: 'Check competitor Simone, Ylenia', description: '', status: 'todo', priority: 'low', date: null, assignedTo: '', completed: false }
    ]
  },
  {
    id: 'doeatbetter',
    name: 'DoEatBetter',
    logo: '/loghi progetti/DoEatBetter.svg',
    color: '#8b5cf6',
    dueDate: null,
    progress: 0,
    tasks: [
      { id: 'task-deb-1', projectId: 'doeatbetter', title: 'Nuova Delivery', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false },
      { id: 'task-deb-2', projectId: 'doeatbetter', title: 'Check bl email Francesco', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-deb-3', projectId: 'doeatbetter', title: 'Backlinks', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-deb-4', projectId: 'doeatbetter', title: 'Proposta 2025', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false },
      { id: 'task-deb-5', projectId: 'doeatbetter', title: 'PR', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false }
    ]
  },
  {
    id: '24hassistance',
    name: '24Hassistance',
    logo: '/loghi progetti/24Hassistance.svg',
    color: '#ffa500',
    dueDate: null,
    progress: 0,
    tasks: [
      { id: 'task-24h-1', projectId: '24hassistance', title: 'email Matteo', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-24h-2', projectId: '24hassistance', title: 'Ealih check', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false }
    ]
  },
  {
    id: 'hrtrails',
    name: 'HRtrails',
    logo: '/loghi progetti/HRtrails.svg',
    color: '#3b82f6',
    dueDate: null,
    progress: 0,
    tasks: [
      { id: 'task-hr-1', projectId: 'hrtrails', title: 'Mail Renzo', description: '', status: 'todo', priority: 'medium', date: null, assignedTo: '', completed: false },
      { id: 'task-hr-2', projectId: 'hrtrails', title: 'Inizio doc', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false },
      { id: 'task-hr-3', projectId: 'hrtrails', title: 'Inizio MVP', description: '', status: 'todo', priority: 'high', date: null, assignedTo: '', completed: false }
    ]
  }
]

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState('light')
  const [syncStatus, setSyncStatus] = useState('connecting') // 'connecting', 'synced', 'offline'
  const projectsRef = useRef(projects)

  // Keep ref updated
  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  // Helper: Sync to server immediately
  const syncToServer = async (projectsList) => {
    const allTasks = projectsList.flatMap(p => p.tasks)
    const projectsWithoutTasks = projectsList.map(({ tasks, ...project }) => project)
    const success = await syncManager.syncNow(projectsWithoutTasks, allTasks)
    setSyncStatus(success ? 'synced' : 'offline')
  }

  // Initialize IndexedDB and load data
  useEffect(() => {
    const initDB = async () => {
      try {
        setLoading(true)
        await db.init()
        console.log('🔧 IndexedDB initialized')

        // Load theme
        let savedTheme = await db.getSetting('theme')
        if (!savedTheme) {
          savedTheme = localStorage.getItem('fastcorp-theme') || 'light'
          await db.saveSetting('theme', savedTheme)
        }
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)

        // Load projects and tasks from IndexedDB
        let loadedProjects = await db.getAllProjects()
        let loadedTasks = await db.getAllTasks()

        console.log('📊 Database status:', loadedProjects.length, 'projects,', loadedTasks.length, 'tasks')

        // If no data, try to load from default-data.json first, then fallback to initialProjects
        if (loadedTasks.length === 0) {
          console.log('📦 Loading initial data...')
          await db.clearAllData()

          let dataToLoad = null

          // Try to fetch default-data.json (contains your saved data with calendar assignments)
          try {
            const response = await fetch('/default-data.json')
            if (response.ok) {
              const defaultData = await response.json()
              if (defaultData.projects && defaultData.tasks && defaultData.tasks.length > 0) {
                dataToLoad = defaultData
                console.log('📁 Found default-data.json with', defaultData.tasks.length, 'tasks')
              }
            }
          } catch (e) {
            console.log('⚠️ No default-data.json found, using initial data')
          }

          if (dataToLoad) {
            // Load from default-data.json
            for (const project of dataToLoad.projects) {
              await db.saveProject(project)
            }
            for (const task of dataToLoad.tasks) {
              await db.saveTask(task)
            }
          } else {
            // Fallback to hardcoded initial projects
            for (const project of initialProjects) {
              const { tasks, ...projectWithoutTasks } = project
              await db.saveProject(projectWithoutTasks)
              for (const task of tasks) {
                await db.saveTask(task)
              }
            }
          }

          loadedProjects = await db.getAllProjects()
          loadedTasks = await db.getAllTasks()
        }

        // Combine projects with their tasks
        const projectsWithTasks = loadedProjects.map(project => ({
          ...project,
          tasks: loadedTasks.filter(task => task.projectId === project.id)
        }))

        setProjects(projectsWithTasks)
        console.log('✅ App ready with', projectsWithTasks.reduce((acc, p) => acc + p.tasks.length, 0), 'total tasks')

      } catch (err) {
        console.error('❌ Error initializing database:', err)
        setError(err.message)
        setProjects(initialProjects)
      } finally {
        setLoading(false)
      }
    }

    initDB()
  }, [])

  // Start sync polling after loading
  useEffect(() => {
    if (loading) return

    const getLocalData = () => {
      const current = projectsRef.current
      const allTasks = current.flatMap(p => p.tasks)
      const projectsWithoutTasks = current.map(({ tasks, ...project }) => project)
      return { projects: projectsWithoutTasks, tasks: allTasks }
    }

    const onDataReceived = async (serverData) => {
      try {
        console.log('📥 Receiving data from server:', serverData.tasks.length, 'tasks')

        await db.clearAllData()

        for (const project of serverData.projects) {
          await db.saveProject(project)
        }
        for (const task of serverData.tasks) {
          await db.saveTask(task)
        }

        const loadedProjects = await db.getAllProjects()
        const loadedTasks = await db.getAllTasks()
        const projectsWithTasks = loadedProjects.map(project => ({
          ...project,
          tasks: loadedTasks.filter(task => task.projectId === project.id)
        }))

        setProjects(projectsWithTasks)
        setSyncStatus('synced')
        console.log('✅ Synced from server!')
      } catch (err) {
        console.error('Error applying server data:', err)
      }
    }

    // Start polling for updates
    syncManager.startPolling(getLocalData, onDataReceived)

    return () => {
      syncManager.stopPolling()
    }
  }, [loading])

  // Save theme
  useEffect(() => {
    if (!loading) {
      db.saveSetting('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, loading])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const addProject = async (project) => {
    const newProject = {
      ...project,
      id: `project-${Date.now()}`,
      tasks: [],
      progress: 0,
    }

    try {
      const { tasks, ...projectWithoutTasks } = newProject
      await db.saveProject(projectWithoutTasks)
      const newProjects = [...projects, newProject]
      setProjects(newProjects)
      await syncToServer(newProjects) // Sync immediately
    } catch (err) {
      console.error('Error adding project:', err)
      setError(err.message)
    }
  }

  const updateProject = async (projectId, updates) => {
    try {
      const project = projects.find(p => p.id === projectId)
      const updated = { ...project, ...updates }
      const { tasks, ...projectWithoutTasks } = updated
      await db.saveProject(projectWithoutTasks)
      const newProjects = projects.map(p => p.id === projectId ? updated : p)
      setProjects(newProjects)
      await syncToServer(newProjects) // Sync immediately
    } catch (err) {
      console.error('Error updating project:', err)
      setError(err.message)
    }
  }

  const deleteProject = async (projectId) => {
    try {
      await db.deleteProject(projectId)
      const newProjects = projects.filter(p => p.id !== projectId)
      setProjects(newProjects)
      await syncToServer(newProjects) // Sync immediately
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err.message)
    }
  }

  const reorderProjects = async (newProjects) => {
    setProjects(newProjects)
    for (const project of newProjects) {
      const { tasks, ...projectWithoutTasks } = project
      await db.saveProject(projectWithoutTasks)
    }
    await syncToServer(newProjects) // Sync immediately
  }

  const addTask = async (task) => {
    const labelToStatusMap = {
      'high-priority': { status: 'todo', priority: 'high' },
      'in-progress': { status: 'in-progress', priority: 'medium' },
      'in-review': { status: 'in-review', priority: 'medium' },
      'completed': { status: 'completed', priority: 'low' },
    }

    const statusInfo = task.label ? labelToStatusMap[task.label] || { status: 'todo', priority: 'medium' } : {}

    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: task.label === 'completed' || false,
      status: task.status || statusInfo.status || 'todo',
      priority: task.priority || statusInfo.priority || 'medium',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      owner: task.owner || null,
    }
    delete newTask.label

    try {
      await db.saveTask(newTask)
      const newProjects = projects.map(p => {
        if (p.id === task.projectId) {
          return { ...p, tasks: [...p.tasks, newTask] }
        }
        return p
      })
      setProjects(newProjects)
      console.log('✅ Task created:', newTask.title)
      await syncToServer(newProjects) // Sync immediately
    } catch (err) {
      console.error('Error adding task:', err)
      setError(err.message)
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      let taskToUpdate = null
      for (const project of projects) {
        const task = project.tasks.find(t => t.id === taskId)
        if (task) {
          taskToUpdate = { ...task, ...updates }
          break
        }
      }

      if (taskToUpdate) {
        await db.saveTask(taskToUpdate)
        const newProjects = projects.map(project => ({
          ...project,
          tasks: project.tasks.map(task => task.id === taskId ? taskToUpdate : task)
        }))
        setProjects(newProjects)
        await syncToServer(newProjects) // Sync immediately
      }
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err.message)
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await db.deleteTask(taskId)
      const newProjects = projects.map(project => ({
        ...project,
        tasks: project.tasks.filter(task => task.id !== taskId)
      }))
      setProjects(newProjects)
      await syncToServer(newProjects) // Sync immediately
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
    }
  }

  const moveTaskToDate = (taskId, date) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId)
    const updates = { date }

    // When assigning a date, automatically set label to "scheduled"
    // Keep the label if it's already "in-progress" or "high-priority"
    if (task && task.label !== 'in-progress' && task.label !== 'high-priority') {
      updates.label = 'scheduled'
    }

    updateTask(taskId, updates)
  }

  const toggleTaskComplete = async (taskId) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId)
    if (task) {
      await updateTask(taskId, { completed: !task.completed })
    }
  }

  // Export/Import functions
  const exportData = async () => {
    try {
      const data = await db.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fastcorp-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    } catch (err) {
      console.error('Error exporting data:', err)
      setError(err.message)
      return false
    }
  }

  const importData = async (file) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.importData(data)

      const loadedProjects = await db.getAllProjects()
      const loadedTasks = await db.getAllTasks()
      const projectsWithTasks = loadedProjects.map(project => ({
        ...project,
        tasks: loadedTasks.filter(task => task.projectId === project.id)
      }))
      setProjects(projectsWithTasks)
      await syncToServer(projectsWithTasks) // Sync immediately

      if (data.data.theme) {
        setTheme(data.data.theme)
      }

      return true
    } catch (err) {
      console.error('Error importing data:', err)
      setError(err.message)
      return false
    }
  }

  // Reset to initial data
  const resetToInitialData = async () => {
    try {
      console.log('🔄 Resetting to initial data...')
      await db.clearAllData()
      localStorage.removeItem('fastcorp-backup')

      for (const project of initialProjects) {
        const { tasks, ...projectWithoutTasks } = project
        await db.saveProject(projectWithoutTasks)
        for (const task of tasks) {
          await db.saveTask(task)
        }
      }

      setProjects(initialProjects)
      await syncToServer(initialProjects) // Sync immediately
      console.log('✅ Reset completed!')
      return true
    } catch (err) {
      console.error('Error resetting data:', err)
      setError(err.message)
      return false
    }
  }

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    reorderProjects,
    addTask,
    updateTask,
    deleteTask,
    moveTaskToDate,
    toggleTaskComplete,
    theme,
    toggleTheme,
    loading,
    error,
    exportData,
    importData,
    resetToInitialData,
    syncStatus, // 'connecting', 'synced', 'offline'
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
