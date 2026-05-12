import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { useSwipe } from '../hooks/useSwipe'
import { generateExam } from '../data/mathEngine'
import { playSound } from '../utils/sound'
import { saveExamAnswers, saveExamProgress, getExamProgress, clearExamProgress } from '../utils/storage'
import { requestFullscreen, toggleFullscreen, isFullscreen } from '../utils/fullscreen'
import CountdownOverlay from '../components/CountdownOverlay'
import { Clock, ChevronRight, ChevronLeft, Globe, Maximize, Minimize } from 'lucide-react'

const EXAM_DURATION_MS = 10 * 60 * 1000

export default function ExamPage({ levelConfig: config, user, onFinish }) {
  const { t, lang, toggleLang } = useLang()

  const savedProgress = getExamProgress()
  const isResuming = savedProgress
    && savedProgress.level === config.level
    && savedProgress.user?.name === user?.name
    && savedProgress.questions?.length === config.questions

  if (savedProgress && !isResuming) clearExamProgress()

  const [phase, setPhase] = useState(isResuming ? 'exam' : 'countdown')
  const [questions] = useState(() => {
    if (isResuming) return savedProgress.questions
    return generateExam(config.level, config.questions)
  })
  const [currentIndex, setCurrentIndex] = useState(isResuming ? savedProgress.currentIndex : 0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isFull, setIsFull] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_MS)
  const answersRef = useRef(isResuming ? (savedProgress.answers || {}) : {})
  const deadlineRef = useRef(null)
  const timerRafRef = useRef(null)
  const finishedRef = useRef(false)

  function startCountdown(deadlineMs) {
    deadlineRef.current = deadlineMs
    function tick() {
      const remaining = deadlineRef.current - Date.now()
      if (remaining <= 0) {
        setTimeLeft(0)
        if (!finishedRef.current) {
          finishedRef.current = true
          playSound('timeWarning')
          finishExam()
        }
        return
      }
      setTimeLeft(remaining)
      timerRafRef.current = requestAnimationFrame(tick)
    }
    timerRafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (isResuming && phase === 'exam') {
      const elapsedMs = (savedProgress.elapsedSeconds || 0) * 1000
      const deadline = Date.now() + (EXAM_DURATION_MS - elapsedMs)
      startCountdown(deadline)
      setSelectedAnswer(answersRef.current[questions[currentIndex]?.id] ?? null)
    }
    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFull(isFullscreen())
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  function getElapsedSeconds() {
    if (!deadlineRef.current) return 0
    const remaining = deadlineRef.current - Date.now()
    return Math.round((EXAM_DURATION_MS - Math.max(0, remaining)) / 1000)
  }

  function persistProgress() {
    saveExamProgress({
      level: config.level,
      user,
      questions,
      answers: { ...answersRef.current },
      currentIndex,
      elapsedSeconds: getElapsedSeconds(),
    })
  }

  function finishExam() {
    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)
    clearExamProgress()
    const elapsed = getElapsedSeconds()
    const results = questions.map((q) => ({
      id: q.id,
      question: q.question,
      correctAnswer: q.correctAnswer,
      selectedAnswer: answersRef.current[q.id] ?? null,
      isCorrect: answersRef.current[q.id] === q.correctAnswer,
      isSkipped: answersRef.current[q.id] === undefined,
    }))

    const correct = results.filter((r) => r.isCorrect).length
    const wrong = results.filter((r) => !r.isCorrect && !r.isSkipped).length
    const skipped = results.filter((r) => r.isSkipped).length

    const examData = {
      user,
      level: config.level,
      totalQuestions: questions.length,
      correct,
      wrong,
      skipped,
      timeTaken: elapsed,
      totalTime: EXAM_DURATION_MS / 1000,
      score: correct,
      accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      results,
      completedAt: Date.now(),
    }

    saveExamAnswers(examData)
    playSound('complete')
    onFinish(examData)
  }

  function goToQuestion(index) {
    if (index < 0 || index >= questions.length) return
    persistProgress()
    setSelectedAnswer(answersRef.current[questions[index].id] ?? null)
    setCurrentIndex(index)
  }

  function handleNext() {
    if (selectedAnswer !== null) {
      answersRef.current[currentQuestion.id] = selectedAnswer
    }
    if (currentIndex < questions.length - 1) {
      playSound('tap')
      goToQuestion(currentIndex + 1)
    }
  }

  function handleSkip() {
    playSound('swipe')
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1)
    }
  }

  function handleSelectAnswer(choice) {
    playSound('select')
    setSelectedAnswer(choice)
    answersRef.current[currentQuestion.id] = choice
    persistProgress()
  }

  function handleCountdownComplete() {
    setPhase('exam')
    const deadline = Date.now() + EXAM_DURATION_MS
    startCountdown(deadline)
    requestFullscreen()
  }

  const swipeHandlers = useSwipe(handleSkip, null, 60)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answersRef.current).length

  const totalSec = Math.ceil(timeLeft / 1000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  const isTimeWarning = totalSec <= 60
  const isTimeCritical = totalSec <= 30

  const questionProgress = ((currentIndex + 1) / questions.length) * 100

  if (phase === 'countdown') {
    return <CountdownOverlay onComplete={handleCountdownComplete} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" {...swipeHandlers}>
      {/* Header: logo, question counter, timer, controls */}
      <div className="no-print shrink-0 px-3 py-2 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <img src="/wonderkids_logo.webp" alt="WonderKids" className="h-7 w-auto" />
            <span className="text-sm font-medium text-text-light">
              {t('exam.question')} {currentIndex + 1} {t('exam.of')} {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 font-bold text-lg tabular-nums ${isTimeCritical ? 'text-red animate-pulse' : isTimeWarning ? 'text-orange' : 'text-text'}`}>
              <Clock size={18} />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple/10 text-purple font-semibold text-xs"
            >
              <Globe size={14} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
            <button
              onClick={() => { toggleFullscreen(); setIsFull(!isFull) }}
              className="p-1.5 rounded-full bg-secondary/10 text-secondary"
            >
              {isFull ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
        {/* Question progress bar - fills as you advance through questions */}
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl"
          >
            <div className="bg-white rounded-3xl p-5 sm:p-7 gummy-shadow-lg mb-3 text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-relaxed break-words">
                {currentQuestion.question}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.choices.map((choice, i) => {
                const isSelected = selectedAnswer === choice
                const labels = ['A', 'B', 'C', 'D']
                return (
                  <motion.button
                    key={`${currentQuestion.id}-${choice}-${i}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectAnswer(choice)}
                    className={`relative p-4 sm:p-5 rounded-2xl font-bold text-xl sm:text-2xl transition-all gummy-press ${
                      isSelected
                        ? 'bg-primary text-white gummy-shadow-lg scale-[1.03]'
                        : 'bg-white text-text gummy-shadow hover:bg-bg'
                    }`}
                  >
                    <span className={`absolute top-2 left-3 text-xs font-bold ${isSelected ? 'text-white/60' : 'text-text-muted'}`}>
                      {labels[i]}
                    </span>
                    {choice}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-text-muted text-xs">
          {t('exam.swipeHint')}
        </p>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="no-print shrink-0 px-4 py-3 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="pointer-events-auto p-3 rounded-full bg-white/80 backdrop-blur-sm text-text-light gummy-shadow disabled:opacity-30 hover:bg-white active:scale-95 transition-all"
        >
          <ChevronLeft size={22} />
        </button>

        <motion.button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto flex items-center gap-1 px-7 py-3 rounded-full bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold text-lg gummy-shadow gummy-press disabled:opacity-40 transition-all"
        >
          {t('exam.next')}
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </div>
  )
}
