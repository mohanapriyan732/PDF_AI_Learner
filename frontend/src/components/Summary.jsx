import React from 'react'

export default function Summary({ data }){
  const content = data || {}
  const points = Array.isArray(content.key_points) ? content.key_points : []
  const chapters = Array.isArray(content.chapter_wise_summary) ? content.chapter_wise_summary : []
  const keywords = Array.isArray(content.important_keywords) ? content.important_keywords : []
  const title = content.title || content.short_summary || 'Summary'
  const body = content.detailed_summary || content.short_summary || content.summary || ''

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Study summary</p>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">AI generated</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Overview</h3>
          <p className="text-sm leading-7 text-slate-300">{body || 'No summary content available yet.'}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Key points</h3>
          {points.length ? (
            <ul className="space-y-2 text-sm text-slate-300">
              {points.map((point, index) => <li key={index} className="rounded-lg bg-slate-800/70 px-3 py-2">• {point}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No key points available.</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Chapter breakdown</h3>
          {chapters.length ? (
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div key={index} className="rounded-lg border border-slate-800 bg-slate-800/70 p-3">
                  <div className="font-medium text-slate-100">{chapter.title || `Chapter ${index + 1}`}</div>
                  <p className="mt-1 text-sm text-slate-400">{chapter.summary || chapter.notes || ''}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No chapter breakdown is available.</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 font-semibold">Keywords</h3>
          {keywords.length ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span key={index} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{keyword}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No keywords were generated.</p>
          )}
        </div>
      </div>
    </div>
  )
}
