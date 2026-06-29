import React from 'react'

export default function Planner({ data }){
  const tasks = Array.isArray(data?.study_days) ? data.study_days : []
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Study planner</p>
        <h2 className="text-xl font-bold">A structured timeline for your revision</h2>
      </div>

      <div className="space-y-3">
        {tasks.length ? tasks.map((task, index) => (
          <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-100">{task.title || task.day || `Day ${index + 1}`}</div>
                <div className="mt-1 text-sm text-slate-400">{task.notes || task.tasks || 'Focus block'}</div>
              </div>
              <div className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">{task.duration || 'Plan'}</div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${task.progress || task.done_percent || 0}%` }} />
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No study plan available.</p>}
      </div>
    </div>
  )
}
