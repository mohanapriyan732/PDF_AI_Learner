import React from 'react'

export default function Translate({ data }){
  const orig = data?.content || data?.original || data?.text || ''
  const trans = data?.translated_text || data?.translation || data?.translated || ''
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Translation</p>
        <h2 className="text-xl font-bold">Bilingual view</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-400">Original</div>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{orig || 'No source text available.'}</pre>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-400">Translation</div>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{trans || 'No translation generated yet.'}</pre>
        </div>
      </div>
    </div>
  )
}
