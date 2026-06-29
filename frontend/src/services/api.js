import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
})

export async function uploadPDF(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await api.post('/upload', fd)
  return res.data
}

export async function generateSummary(text) { const res = await api.post('/generate-summary', { text }); return res.data }
export async function generateNotes(text) { const res = await api.post('/generate-notes', { text }); return res.data }
export async function generateFlashcards(text) { const res = await api.post('/generate-flashcards', { text }); return res.data }
export async function generateQuiz(text, num_questions = 10, difficulty = 'medium') { const res = await api.post('/generate-quiz', { text, num_questions, difficulty }); return res.data }
export async function generateInterview(text) { const res = await api.post('/generate-interview', { text }); return res.data }
export async function generatePlan(text, exam_date = '', hours_per_day = 2) { const res = await api.post('/generate-plan', { text, exam_date, hours_per_day }); return res.data }
export async function translateText(text, target_language = 'Spanish') { const res = await api.post('/translate', { text, target_language }); return res.data }

export default api
