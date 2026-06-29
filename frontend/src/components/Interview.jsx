import React, { useState } from 'react'

export default function Interview({ data }){
  const initialQuestions = []
  const sections = ['technical', 'conceptual', 'hr']
  sections.forEach((section) => {
    const values = Array.isArray(data?.[section]) ? data[section] : []
    values.forEach((question) => initialQuestions.push({ role: 'ai', text: question }))
  })

  const [arr, setArr] = useState(initialQuestions.length ? initialQuestions : [{ role: 'ai', text: 'Tell me about the topic and I will shape interview questions around it.' }])
  const [text, setText] = useState('')

  function send(){
    if(!text.trim()) return
    const answer = text.trim()
    setArr((current) => [...current, { role: 'user', text: answer }])
    setText('')

    const followUps = [
      'Great answer. Can you explain how you would apply that in a real project?',
      'What would you do if you had to simplify this for a beginner?',
      'Can you give one concrete example that supports your point?',
      'How would you respond if the interviewer challenged this approach?',
    ]

    const followUp = followUps[arr.length % followUps.length]
    setTimeout(() => {
      setArr((current) => [...current, { role: 'ai', text: followUp }])
    }, 600)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Interview mode</p>
        <h2 className="text-xl font-bold">Practice with live prompts</h2>
      </div>

      <div className="flex h-[28rem] flex-col rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex-1 space-y-2 overflow-auto">
          {arr.map((message, index) => (
            <div key={index} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={text} onChange={(event) => setText(event.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200" placeholder="Type your answer..." />
          <button onClick={send} className="rounded-xl bg-indigo-600 px-3 py-2 text-sm">Send</button>
        </div>
      </div>
    </div>
  )
}
