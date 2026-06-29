import React, { useState } from 'react'

export default function Flashcards({ data }){
  const cards = Array.isArray(data?.cards) ? data.cards : []
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if(!cards.length) return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">No flashcards available.</div>

  const cur = cards[idx]
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Flashcards</p>
        <h2 className="text-xl font-bold">Flip to reveal the answer</h2>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div className="relative h-64 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl" style={{ perspective: '1200px' }}>
            <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.8s' }}>
              <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl p-6 text-center text-lg font-medium" style={{ backfaceVisibility: 'hidden' }}>
                <div>{cur.front || cur.question || 'Card front'}</div>
              </div>
              <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-2xl bg-indigo-600/90 p-6 text-center text-lg font-medium" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <div>{cur.back || cur.answer || 'Card back'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button onClick={() => setFlipped(!flipped)} className="rounded-full bg-indigo-600 px-4 py-2 text-sm">Reveal Answer</button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => { setFlipped(false); setIdx((idx - 1 + cards.length) % cards.length) }} className="rounded-full bg-slate-800 px-3 py-2 text-sm">◀ Prev</button>
        <div className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{idx + 1} / {cards.length}</div>
        <button onClick={() => { setFlipped(false); setIdx((idx + 1) % cards.length) }} className="rounded-full bg-slate-800 px-3 py-2 text-sm">Next ▶</button>
      </div>
    </div>
  )
}
