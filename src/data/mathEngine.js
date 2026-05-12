function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateDistractors(correct, count, min, max) {
  const distractors = new Set()
  const offsets = [1, -1, 2, -2, 5, -5, 10, -10, 3, -3]

  for (const offset of offsets) {
    if (distractors.size >= count) break
    const val = correct + offset
    if (val !== correct && val >= min && val <= max) {
      distractors.add(val)
    }
  }

  let attempts = 0
  while (distractors.size < count && attempts < 50) {
    const val = rand(Math.max(min, correct - 20), Math.min(max, correct + 20))
    if (val !== correct) distractors.add(val)
    attempts++
  }

  return [...distractors].slice(0, count)
}

function formatQuestion(a, op, b) {
  const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[op]
  return `${a} ${opSymbol} ${b} = ?`
}

const levelGenerators = {
  1: () => {
    const type = rand(1, 3)
    if (type === 1) {
      const a = rand(1, 5)
      const b = rand(1, 5)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 0, max: 15 }
    } else if (type === 2) {
      const b = rand(1, 4)
      const a = rand(b, b + 5)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 10 }
    } else {
      const answer = rand(1, 10)
      const options = { question: `Which number comes after ${answer - 1}?`, answer, min: 1, max: 15 }
      return options
    }
  },

  2: () => {
    const type = rand(1, 3)
    if (type === 1) {
      const a = rand(1, 10)
      const b = rand(1, 10)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 0, max: 25 }
    } else if (type === 2) {
      const b = rand(1, 9)
      const a = rand(b + 1, 18)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 18 }
    } else {
      const a = rand(2, 10)
      const b = rand(1, 5)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 0, max: 20 }
    }
  },

  3: () => {
    const type = rand(1, 4)
    if (type === 1) {
      const a = rand(10, 50)
      const b = rand(10, 50)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 10, max: 110 }
    } else if (type === 2) {
      const b = rand(5, 30)
      const a = rand(b + 10, 80)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 80 }
    } else if (type === 3) {
      const a = rand(2, 5)
      const b = rand(2, 5)
      return { question: formatQuestion(a, '*', b), answer: a * b, min: 2, max: 30 }
    } else {
      const a = rand(10, 99)
      const b = rand(1, 9)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 10, max: 110 }
    }
  },

  4: () => {
    const type = rand(1, 4)
    if (type === 1) {
      const a = rand(50, 200)
      const b = rand(50, 200)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 50, max: 450 }
    } else if (type === 2) {
      const b = rand(20, 100)
      const a = rand(b + 50, 300)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 300 }
    } else if (type === 3) {
      const a = rand(2, 9)
      const b = rand(2, 9)
      return { question: formatQuestion(a, '*', b), answer: a * b, min: 2, max: 90 }
    } else {
      const b = rand(2, 5)
      const a = b * rand(2, 9)
      return { question: formatQuestion(a, '/', b), answer: a / b, min: 1, max: 20 }
    }
  },

  5: () => {
    const type = rand(1, 5)
    if (type === 1) {
      const a = rand(100, 500)
      const b = rand(100, 500)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 100, max: 1100 }
    } else if (type === 2) {
      const b = rand(50, 300)
      const a = rand(b + 100, 800)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 800 }
    } else if (type === 3) {
      const a = rand(10, 30)
      const b = rand(2, 9)
      return { question: formatQuestion(a, '*', b), answer: a * b, min: 10, max: 300 }
    } else if (type === 4) {
      const b = rand(2, 9)
      const a = b * rand(5, 20)
      return { question: formatQuestion(a, '/', b), answer: a / b, min: 1, max: 25 }
    } else {
      const a = rand(100, 999)
      const b = rand(100, 999)
      return { question: `${a} + ${b} = ?`, answer: a + b, min: 100, max: 2000 }
    }
  },

  6: () => {
    const type = rand(1, 5)
    if (type === 1) {
      const a = rand(1000, 5000)
      const b = rand(1000, 5000)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 1000, max: 11000 }
    } else if (type === 2) {
      const b = rand(500, 3000)
      const a = rand(b + 1000, 8000)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 8000 }
    } else if (type === 3) {
      const a = rand(10, 50)
      const b = rand(10, 50)
      return { question: formatQuestion(a, '*', b), answer: a * b, min: 50, max: 2600 }
    } else if (type === 4) {
      const b = rand(5, 20)
      const a = b * rand(10, 50)
      return { question: formatQuestion(a, '/', b), answer: a / b, min: 1, max: 60 }
    } else {
      const a = rand(10, 30)
      const b = rand(10, 30)
      const c = rand(1, 10)
      return { question: `${a} × ${b} + ${c} = ?`, answer: a * b + c, min: 10, max: 1000 }
    }
  },

  7: () => {
    const type = rand(1, 6)
    if (type === 1) {
      const a = rand(1000, 9999)
      const b = rand(1000, 9999)
      return { question: formatQuestion(a, '+', b), answer: a + b, min: 1000, max: 20000 }
    } else if (type === 2) {
      const b = rand(1000, 5000)
      const a = rand(b + 2000, 15000)
      return { question: formatQuestion(a, '-', b), answer: a - b, min: 0, max: 15000 }
    } else if (type === 3) {
      const a = rand(20, 99)
      const b = rand(10, 50)
      return { question: formatQuestion(a, '*', b), answer: a * b, min: 100, max: 5000 }
    } else if (type === 4) {
      const b = rand(10, 30)
      const a = b * rand(10, 40)
      return { question: formatQuestion(a, '/', b), answer: a / b, min: 1, max: 50 }
    } else if (type === 5) {
      const a = rand(10, 50)
      const b = rand(10, 50)
      const c = rand(5, 30)
      return { question: `${a} × ${b} − ${c} = ?`, answer: a * b - c, min: 10, max: 2600 }
    } else {
      const a = rand(100, 500)
      const b = rand(2, 5)
      const c = rand(10, 50)
      return { question: `${a} ÷ ${b} + ${c} = ?`, answer: a / b + c, min: 10, max: 350 }
    }
  },
}

export function generateExam(level, questionCount = 20) {
  const generator = levelGenerators[level]
  if (!generator) throw new Error(`Invalid level: ${level}`)

  const questions = []
  const usedAnswers = new Set()

  for (let i = 0; i < questionCount; i++) {
    let attempts = 0
    let q

    do {
      q = generator()
      attempts++
    } while (usedAnswers.has(q.answer) && attempts < 20)

    usedAnswers.add(q.answer)

    const distractors = generateDistractors(q.answer, 3, q.min, q.max)
    const choices = shuffle([q.answer, ...distractors])

    questions.push({
      id: i + 1,
      question: q.question,
      choices,
      correctAnswer: q.answer,
      selectedAnswer: null,
    })
  }

  return shuffle(questions).map((q, i) => ({ ...q, id: i + 1 }))
}

export const levelConfig = [
  { level: 1, questions: 20, timeMinutes: 10, color: 'from-pink-300 to-rose-400', emoji: '🌟', colorHex: '#FF6B9D' },
  { level: 2, questions: 20, timeMinutes: 10, color: 'from-orange-300 to-amber-400', emoji: '🔥', colorHex: '#FB923C' },
  { level: 3, questions: 20, timeMinutes: 10, color: 'from-yellow-300 to-amber-400', emoji: '⚡', colorHex: '#FFE66D' },
  { level: 4, questions: 20, timeMinutes: 10, color: 'from-green-300 to-emerald-400', emoji: '🍀', colorHex: '#34D399' },
  { level: 5, questions: 20, timeMinutes: 10, color: 'from-teal-300 to-cyan-400', emoji: '🌊', colorHex: '#4ECDC4' },
  { level: 6, questions: 20, timeMinutes: 10, color: 'from-blue-300 to-indigo-400', emoji: '🚀', colorHex: '#818CF8' },
  { level: 7, questions: 20, timeMinutes: 10, color: 'from-purple-300 to-violet-400', emoji: '👑', colorHex: '#A78BFA' },
]
