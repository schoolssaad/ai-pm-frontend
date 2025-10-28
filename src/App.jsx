import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({  { session } }) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const handleLogin = () => supabase.auth.signInWithOAuth({ provider: 'google' })
  const handleLogout = () => supabase.auth.signOut()

  const generateTasks = async () => {
    const res = await fetch('/api/ai/generate-tasks', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${user?.id_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()
    setTasks(data.tasks)
  }

  if (!user) return <button onClick={handleLogin}>Login with Google</button>

  return (
    <div>
      <h1>AI Project Manager</h1>
      <button onClick={handleLogout}>Logout</button>
      
      <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., Launch a mobile app" />
      <button onClick={generateTasks}>Generate Tasks</button>

      {tasks.map((task, i) => (
        <div key={i} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <button onClick={() => sendToTrello(task)}>Add to Trello</button>
        </div>
      ))}
    </div>
  )
}

export default App
