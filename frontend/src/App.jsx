import React, { useState } from 'react'
import Dashboard from './components/Dashboard'
import Summary from './components/Summary'
import Notes from './components/Notes'
import Flashcards from './components/Flashcards'
import Quiz from './components/Quiz'
import Interview from './components/Interview'
import Planner from './components/Planner'
import Translate from './components/Translate'

const views = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'summary', label: 'Summary' },
  { key: 'notes', label: 'Notes' },
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'interview', label: 'Interview' },
  { key: 'planner', label: 'Planner' },
  { key: 'translate', label: 'Translate' },
]

export default function App() {
  const [view, setView] = useState('dashboard')
  const [payload, setPayload] = useState(null)

  const openView = (nextView, nextPayload = payload) => {
    setView(nextView)
    setPayload(nextPayload)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">AI PDF Learner</p>
            <h1 className="text-2xl font-bold">Turn a PDF into a complete study toolkit.</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {views.map((item) => (
              <button
                key={item.key}
                onClick={() => openView(item.key, payload)}
                className={`rounded-full px-3 py-2 text-sm transition ${view === item.key ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <main>
          {view === 'dashboard' && <Dashboard onOpen={openView} />}
          {view === 'summary' && <Summary data={payload} />}
          {view === 'notes' && <Notes data={payload} />}
          {view === 'flashcards' && <Flashcards data={payload} />}
          {view === 'quiz' && <Quiz data={payload} />}
          {view === 'interview' && <Interview data={payload} />}
          {view === 'planner' && <Planner data={payload} />}
          {view === 'translate' && <Translate data={payload} />}
        </main>
      </div>
    </div>
  )
}
