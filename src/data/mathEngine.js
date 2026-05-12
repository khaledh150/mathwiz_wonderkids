import { getExamQuestions } from './questionBank'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateExam(level, questionCount = 100) {
  const bank = getExamQuestions(level)

  const selected = shuffle(bank).slice(0, questionCount)

  return selected.map((q, i) => {
    const choices = shuffle([q.answer, ...q.distractors])
    const out = {
      id: i + 1,
      question: q.question,
      choices,
      correctAnswer: q.answer,
      selectedAnswer: null,
    }
    if (q.questionEn) out.questionEn = q.questionEn
    return out
  })
}

export const levelConfig = [
  { level: 1, questions: 100, timeMinutes: 10, color: 'from-pink-300 to-rose-400', emoji: '🌟', colorHex: '#FF6B9D' },
  { level: 2, questions: 100, timeMinutes: 10, color: 'from-orange-300 to-amber-400', emoji: '🔥', colorHex: '#FB923C' },
  { level: 3, questions: 100, timeMinutes: 10, color: 'from-yellow-300 to-amber-400', emoji: '⚡', colorHex: '#FFE66D' },
  { level: 4, questions: 100, timeMinutes: 10, color: 'from-green-300 to-emerald-400', emoji: '🍀', colorHex: '#34D399' },
  { level: 5, questions: 100, timeMinutes: 10, color: 'from-teal-300 to-cyan-400', emoji: '🌊', colorHex: '#4ECDC4' },
  { level: 6, questions: 100, timeMinutes: 10, color: 'from-blue-300 to-indigo-400', emoji: '🚀', colorHex: '#818CF8' },
  { level: 7, questions: 100, timeMinutes: 10, color: 'from-purple-300 to-violet-400', emoji: '👑', colorHex: '#A78BFA' },
]
