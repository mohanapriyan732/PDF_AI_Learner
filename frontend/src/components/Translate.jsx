import React, { useState } from 'react'
import { translateText } from '../services/api'

export default function Translate({ data, sessionData }){
  const orig = data?.text || data?.content || data?.original || sessionData?.text || ''
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [translatedText, setTranslatedText] = useState(data?.translated_text || data?.translation || data?.translated || '')
  const [status, setStatus] = useState('Choose a language and translate the uploaded content.')

  async function handleTranslate() {
    if (!orig) {
      setStatus('Upload a PDF first.')
      return
    }

    setStatus('Translating...')
    try {
      const result = await translateText(orig, targetLanguage)
      setTranslatedText(result.translated_text || result.translation || result.translated || '')
      setStatus(`Translated to ${targetLanguage}.`)
    } catch (error) {
      setStatus('Translation failed. Check the backend connection.')
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-400">Translation</p>
          <h2 className="text-xl font-bold">Bilingual view</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
          <button onClick={handleTranslate} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm">Translate</button>
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-400">{status}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-400">Original</div>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{orig || 'No source text available.'}</pre>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-400">Translation</div>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{translatedText || 'No translation generated yet.'}</pre>
        </div>
      </div>
    </div>
  )
}
