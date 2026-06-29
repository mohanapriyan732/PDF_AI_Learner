import React, { useState } from 'react'

export default function Quiz({ data }){
  const qs = Array.isArray(data?.questions) ? data.questions : []
  const [i, setI] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showSummary, setShowSummary] = useState(false)

  if(!qs.length) return <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">No quiz questions available.</div>

  const cur = qs[i]
  const options = cur.options || cur.choices || []
  const correct = cur.correct_answer || cur.answer_index || cur.correct

  function submit(){
    if (selected == null || answered) return
    const isCorrect = String(selected) === String(correct)
    if (isCorrect) setScore((value) => value + 1)
    setAnswered(true)
    if (i === qs.length - 1) setShowSummary(true)
  }

  function nextQuestion(){
    setI((value) => Math.min(qs.length - 1, value + 1))
    setSelected(null)
    setAnswered(false)
    setShowSummary(false)
  }

  function prevQuestion(){
    setI((value) => Math.max(0, value - 1))
    setSelected(null)
    setAnswered(false)
    setShowSummary(false)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Quiz mode</p>
          <h2 className="text-xl font-bold">Question {i + 1} / {qs.length}</h2>
        </div>
        <div className="rounded-full bg-indigo-600/20 px-3 py-1 text-sm text-indigo-300">Score {score}</div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="mb-3 text-lg font-semibold">{cur.question || cur.q || 'Question'}</h3>
        <div className="space-y-2">
          {options.map((option, index) => {
            let optionClass = 'border-slate-700 bg-slate-800/70 text-slate-300'
            if (selected === index && !answered) optionClass = 'border-indigo-500 bg-indigo-600/20 text-white'
            if (answered && index === Number(correct)) optionClass = 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
            if (answered && selected === index && index !== Number(correct)) optionClass = 'border-rose-500 bg-rose-600/20 text-rose-200'

            return (
              <button
                key={index}
                onClick={() => setSelected(index)}
                disabled={answered}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm ${optionClass}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-4 rounded-lg bg-slate-800/80 p-3 text-sm text-slate-300">
            <div className="font-semibold">Answer:</div>
            <div>{options[Number(correct)] || correct}</div>
            {cur.explanation ? <div className="mt-2 text-slate-400">{cur.explanation}</div> : null}
          </div>
        )}

        {showSummary && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Final score: {score} / {qs.length}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button onClick={prevQuestion} className="rounded-full bg-slate-800 px-3 py-2 text-sm">◀ Prev</button>
        <div className="flex gap-2">
          <button onClick={submit} className="rounded-full bg-indigo-600 px-3 py-2 text-sm">Submit</button>
          <button onClick={nextQuestion} className="rounded-full bg-slate-800 px-3 py-2 text-sm">Next ▶</button>
        </div>
      </div>
    </div>
  )
}
