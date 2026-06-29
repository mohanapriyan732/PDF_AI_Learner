import React from 'react'

export default function Planner({ data }){
  const tasks = Array.isArray(data?.study_days)
    ? data.study_days
    : Array.isArray(data?.plan)
      ? data.plan
      : Array.isArray(data?.tasks)
        ? data.tasks
        : []

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Study planner</p>
        <h2 className="text-xl font-bold">A structured timeline for your revision</h2>
      </div>

      <div className="space-y-4">
        {tasks.length ? tasks.map((task, index) => {
          const day = task.day || task.day_number || task.date || `Day ${index + 1}`
          const topic = task.topic || task.title || task.name || task.subject || 'Topic'
          const taskList = Array.isArray(task.tasks)
            ? task.tasks
            : task.notes
              ? [task.notes]
              : [task.summary || task.description || 'Focus block']
          const duration = task.duration || task.hours || task.time || 'Flexible'
          const progress = task.progress ?? task.done_percent ?? task.percent ?? 0

          return (
            <div key={index} className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-4 pl-8">
              <div className="absolute left-3 top-5 h-3 w-3 rounded-full bg-indigo-500" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-indigo-300">{day}</div>
                  <div className="font-semibold text-slate-100">{topic}</div>
                </div>
                <div className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">{duration}</div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {taskList.map((item, itemIndex) => <li key={itemIndex} className="rounded-lg bg-slate-800/70 px-3 py-2">• {item}</li>)}
              </ul>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )
        }) : <p className="text-sm text-slate-400">No study plan available.</p>}
      </div>
    </div>
  )
}
