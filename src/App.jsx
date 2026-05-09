import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import LoginPage from './pages/LoginPage'
import EnemyEditorPage from './pages/EnemyEditorPage'
import './App.css'

function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsubscribe()
  }, [])

  if (user === undefined) return <p className="loading">Loading...</p>

  return user ? <EnemyEditorPage /> : <LoginPage />
}

export default App
