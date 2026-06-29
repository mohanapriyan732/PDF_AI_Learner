import React from 'react'

export default function Notes({ data }){
  const content = data || {}
  const sections = Array.isArray(content.section_notes) ? content.section_notes : []
  const overview = content.overview || ''
  const takeaways = Array.isArray(content.takeaways) ? content.takeaways : []

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Study notes</p>
        <h2 className="text-xl font-bold">Structured notes</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Overview</h3>
          <p className="text-sm leading-7 text-slate-300">{overview || 'No overview available yet.'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Takeaways</h3>
          {takeaways.length ? (
            <ul className="space-y-2 text-sm text-slate-300">
              {takeaways.map((item, index) => <li key={index} className="rounded-lg bg-slate-800/70 px-3 py-2">• {item}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No takeaways were generated.</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {sections.length ? sections.map((section, index) => (
          <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h4 className="font-semibold">{section.title || `Section ${index + 1}`}</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {(section.points || []).map((point, pointIndex) => <li key={pointIndex} className="rounded-lg bg-slate-800/70 px-3 py-2">{point}</li>)}
            </ul>
          </div>
        )) : <p className="text-sm text-slate-400">No structured notes found.</p>}
      </div>
    </div>
  )
}
