import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

function getApiErrorMessage(error, fallback = 'Request failed. Please try again.') {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.error) return error.response.data.error
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (error.message === 'Network Error') {
    return 'Cannot reach the backend server. Check VITE_API_URL and Render backend status.'
  }
  return fallback
}

export async function uploadPDF(file) {
  const fd = new FormData()
  fd.append('file', file)

  try {
    const res = await api.post('/upload', fd)
    return res.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'PDF upload failed. Please try again.'))
  }
}

async function postJson(endpoint, payload, fallback) {
  try {
    const res = await api.post(endpoint, payload)
    return res.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback))
  }
}

export async function generateSummary(text) { return postJson('/generate-summary', { text }, 'Summary generation failed.') }
export async function generateNotes(text) { return postJson('/generate-notes', { text }, 'Notes generation failed.') }
export async function generateFlashcards(text) { return postJson('/generate-flashcards', { text }, 'Flashcards generation failed.') }
export async function generateQuiz(text, num_questions = 10, difficulty = 'medium') { return postJson('/generate-quiz', { text, num_questions, difficulty }, 'Quiz generation failed.') }
export async function generateInterview(text) { return postJson('/generate-interview', { text }, 'Interview generation failed.') }
export async function generatePlan(text, exam_date = '', hours_per_day = 2) { return postJson('/generate-plan', { text, exam_date, hours_per_day }, 'Study plan generation failed.') }
export async function translateText(text, target_language = 'Spanish') { return postJson('/translate', { text, target_language }, 'Translation failed.') }

export default api