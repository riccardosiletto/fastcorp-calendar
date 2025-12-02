// IndexedDB service for persistent storage
// Works offline, no account needed, persists across all ports!

const DB_NAME = 'FastCorpCalendar'
const DB_VERSION = 1
const PROJECTS_STORE = 'projects'
const TASKS_STORE = 'tasks'
const SETTINGS_STORE = 'settings'

class IndexedDBService {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create projects store
        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' })
          projectStore.createIndex('name', 'name', { unique: false })
        }

        // Create tasks store
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' })
          taskStore.createIndex('projectId', 'projectId', { unique: false })
          taskStore.createIndex('status', 'status', { unique: false })
        }

        // Create settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' })
        }
      }
    })
  }

  // Projects
  async getAllProjects() {
    const tx = this.db.transaction(PROJECTS_STORE, 'readonly')
    const store = tx.objectStore(PROJECTS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async saveProject(project) {
    const tx = this.db.transaction(PROJECTS_STORE, 'readwrite')
    const store = tx.objectStore(PROJECTS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.put(project)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteProject(projectId) {
    const tx = this.db.transaction([PROJECTS_STORE, TASKS_STORE], 'readwrite')
    
    // Delete project
    const projectStore = tx.objectStore(PROJECTS_STORE)
    projectStore.delete(projectId)
    
    // Delete all tasks for this project
    const taskStore = tx.objectStore(TASKS_STORE)
    const index = taskStore.index('projectId')
    const request = index.openCursor(IDBKeyRange.only(projectId))
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // Tasks
  async getAllTasks() {
    const tx = this.db.transaction(TASKS_STORE, 'readonly')
    const store = tx.objectStore(TASKS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getTasksByProject(projectId) {
    const tx = this.db.transaction(TASKS_STORE, 'readonly')
    const store = tx.objectStore(TASKS_STORE)
    const index = store.index('projectId')
    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async saveTask(task) {
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    const store = tx.objectStore(TASKS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.put(task)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteTask(taskId) {
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    const store = tx.objectStore(TASKS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.delete(taskId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Settings
  async getSetting(key) {
    const tx = this.db.transaction(SETTINGS_STORE, 'readonly')
    const store = tx.objectStore(SETTINGS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  async saveSetting(key, value) {
    const tx = this.db.transaction(SETTINGS_STORE, 'readwrite')
    const store = tx.objectStore(SETTINGS_STORE)
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Export/Import for backup
  async exportData() {
    const projects = await this.getAllProjects()
    const tasks = await this.getAllTasks()
    const theme = await this.getSetting('theme')
    
    return {
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        projects,
        tasks,
        theme
      }
    }
  }

  async importData(data) {
    const tx = this.db.transaction([PROJECTS_STORE, TASKS_STORE, SETTINGS_STORE], 'readwrite')
    
    // Clear existing data
    tx.objectStore(PROJECTS_STORE).clear()
    tx.objectStore(TASKS_STORE).clear()
    
    // Import projects
    const projectStore = tx.objectStore(PROJECTS_STORE)
    data.data.projects.forEach(project => {
      projectStore.put(project)
    })
    
    // Import tasks
    const taskStore = tx.objectStore(TASKS_STORE)
    data.data.tasks.forEach(task => {
      taskStore.put(task)
    })
    
    // Import theme
    if (data.data.theme) {
      const settingsStore = tx.objectStore(SETTINGS_STORE)
      settingsStore.put({ key: 'theme', value: data.data.theme })
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async clearAllData() {
    const tx = this.db.transaction([PROJECTS_STORE, TASKS_STORE, SETTINGS_STORE], 'readwrite')
    tx.objectStore(PROJECTS_STORE).clear()
    tx.objectStore(TASKS_STORE).clear()
    tx.objectStore(SETTINGS_STORE).clear()
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

// Create singleton instance
export const db = new IndexedDBService()

