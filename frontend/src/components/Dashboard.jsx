import React, { useState } from 'react'
import {
  uploadPDF,
  generateSummary,
  generateNotes,
  generateFlashcards,
  generateQuiz,
  generateInterview,
  generatePlan,
} from '../services/api'

export default function Dashboard({ onOpen, sessionData, onUploadSession }){
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('Upload a PDF to get started')
  const uploadedText = sessionData?.text || ''
  const meta = sessionData?.metadata || null

  async function handleUpload(e){
    const f = e.target.files[0]
    if(!f) return

    setFile(f)
    setStatus('Uploading and extracting text...')
    try{
      const res = await uploadPDF(f)
      if (!res.success) {
        setStatus(res.message || 'Upload failed')
        return
      }

      onUploadSession({
        text: res.text_preview || '',
        metadata: {
          filename: res.filename,
          pageCount: res.page_count,
          fileSize: res.file_size,
        },
      })
      setStatus('Upload complete. Choose a study tool to generate content.')
    }catch(err){
      setStatus('Upload failed. Check that the Flask backend is running.')
    }
  }

  async function openTool(view){
    if (!uploadedText) {
      setStatus('Upload a PDF first.')
      return
    }

    setStatus(`Generating ${view}...`)
    try {
      let data = null
      if (view === 'translate') {
        onOpen('translate', { text: uploadedText, metadata: meta })
        setStatus('Translation ready. Select a language and translate.')
        return
      }

      switch (view) {
        case 'summary':
          data = await generateSummary(uploadedText)
          break
        case 'notes':
          data = await generateNotes(uploadedText)
          break
        case 'flashcards':
          data = await generateFlashcards(uploadedText)
          break
        case 'quiz':
          data = await generateQuiz(uploadedText, 5, 'medium')
          break
        case 'interview':
          data = await generateInterview(uploadedText)
          break
        case 'planner':
          data = await generatePlan(uploadedText, '', 2)
          break
        default:
          break
      }

      if (data) {
        onOpen(view, data)
        setStatus(`${view.charAt(0).toUpperCase() + view.slice(1)} ready.`)
      }
    } catch (err) {
      setStatus('Generation failed. Check the backend connection.')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <h2 className="mb-3 text-xl font-semibold">Upload PDF</h2>
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-indigo-500/50 bg-slate-800/80 px-4 py-8 text-center text-sm text-slate-300">
          <input type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
          <span>{file ? file.name : 'Choose a PDF file'}</span>
        </label>
        <p className="mt-3 text-sm text-slate-400">{status}</p>
        {meta && (
          <div className="mt-4 rounded-xl bg-slate-800/80 p-3 text-sm text-slate-300">
            <p><span className="font-semibold">File:</span> {meta.filename}</p>
            <p><span className="font-semibold">Pages:</span> {meta.pageCount}</p>
            <p><span className="font-semibold">Size:</span> {(meta.fileSize / 1024).toFixed(1)} KB</p>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <button onClick={() => openTool('summary')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">🧠 Summary</button>
          <button onClick={() => openTool('notes')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">📝 Notes</button>
          <button onClick={() => openTool('flashcards')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">🃏 Flashcards</button>
          <button onClick={() => openTool('quiz')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">❓ Quiz</button>
          <button onClick={() => openTool('interview')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">🎤 Interview</button>
          <button onClick={() => openTool('planner')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">📅 Study Plan</button>
          <button onClick={() => openTool('translate')} className="rounded-xl bg-indigo-600 px-3 py-2 text-left">🌐 Translate</button>
        </div>
      </aside>
    </div>
  )
}
