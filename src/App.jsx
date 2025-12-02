import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import Projects from './components/Projects'
import Timeline from './components/Timeline'
import { AppProvider, useApp } from './context/AppContext'
import './App.css'

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard')
  const { loading } = useApp()

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <CalendarView />
      case 'projects':
        return <Projects />
      case 'timeline':
        return <Timeline />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '18px',
          color: 'var(--text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App

