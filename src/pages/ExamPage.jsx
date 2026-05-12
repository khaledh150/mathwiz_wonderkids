import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { useSwipe } from '../hooks/useSwipe'
import { generateExam } from '../data/mathEngine'
import { playSound } from '../utils/sound'
import { saveExamAnswers, saveExamProgress, getExamProgress, clearExamProgress } from '../utils/storage'
import { requestFullscreen, toggleFullscreen, isFullscreen } from '../utils/fullscreen'
import CountdownOverlay from '../components/CountdownOverlay'
import { Clock, ChevronRight, ChevronLeft, Globe, Maximize, Minimize } from 'lucide-react'

const EXAM_DURATION_SEC = 10 * 60

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
  const [displaySeconds, setDisplaySeconds] = useState(EXAM_DURATION_SEC)
  const answersRef = useRef(isResuming ? (savedProgress.answers || {}) : {})
  const deadlineRef = useRef(null)
  const intervalRef = useRef(null)
  const finishedRef = useRef(false)
  const saveTimeoutRef = useRef(null)

  function startCountdown(deadlineMs) {
    deadlineRef.current = deadlineMs
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000))
      setDisplaySeconds(remaining)
      if (remaining <= 0 && !finishedRef.current) {
        finishedRef.current = true
        clearInterval(intervalRef.current)
        playSound('timeWarning')
        finishExam()
      }
    }, 500)
  }

  useEffect(() => {
    if (isResuming && phase === 'exam') {
      const elapsedMs = (savedProgress.elapsedSeconds || 0) * 1000
      const deadline = Date.now() + (EXAM_DURATION_SEC * 1000 - elapsedMs)
      setDisplaySeconds(Math.max(0, Math.floor((deadline - Date.now()) / 1000)))
      startCountdown(deadline)
      setSelectedAnswer(answersRef.current[questions[currentIndex]?.id] ?? null)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
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
    return Math.round((EXAM_DURATION_SEC * 1000 - Math.max(0, remaining)) / 1000)
  }

  function debouncedSave() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveExamProgress({
        level: config.level,
        user: { name: user?.name, code: user?.code },
        questions,
        answers: { ...answersRef.current },
        currentIndex,
        elapsedSeconds: getElapsedSeconds(),
      })
    }, 1000)
  }

  function finishExam() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
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

    saveExamAnswers({
      user,
      level: config.level,
      totalQuestions: questions.length,
      correct,
      wrong,
      skipped,
      timeTaken: elapsed,
      totalTime: EXAM_DURATION_SEC,
      score: correct,
      accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
      results,
      completedAt: Date.now(),
    })

    playSound('complete')
    onFinish({
      user,
      level: config.level,
      totalQuestions: questions.length,
      correct,
      wrong,
      skipped,
      timeTaken: elapsed,
      totalTime: EXAM_DURATION_SEC,
      score: correct,
      accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    })
  }

  function goToQuestion(index) {
    if (index < 0 || index >= questions.length) return
    setSelectedAnswer(answersRef.current[questions[index].id] ?? null)
    setCurrentIndex(index)
    debouncedSave()
  }

  function handleNext() {
    if (selectedAnswer !== null) {
      answersRef.current[currentQuestion.id] = selectedAnswer
    }
    if (currentIndex < questions.length - 1) {
      playSound('tap')
      goToQuestion(currentIndex + 1)
    } else {
      finishExam()
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
    debouncedSave()
  }

  function handleCountdownComplete() {
    setPhase('exam')
    const deadline = Date.now() + EXAM_DURATION_SEC * 1000
    setDisplaySeconds(EXAM_DURATION_SEC)
    startCountdown(deadline)
    requestFullscreen()
  }

  const swipeHandlers = useSwipe(handleSkip, null, 60)

  const currentQuestion = questions[currentIndex]
  const minutes = Math.floor(displaySeconds / 60)
  const seconds = displaySeconds % 60
  const isTimeWarning = displaySeconds <= 60
  const isTimeCritical = displaySeconds <= 30
  const questionProgress = ((currentIndex + 1) / questions.length) * 100

  if (phase === 'countdown') {
    return <CountdownOverlay onComplete={handleCountdownComplete} />
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden" {...swipeHandlers}>
      <div className="no-print shrink-0 px-3 py-1.5 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <img src="/wonderkids_logo.webp" alt="WonderKids" className="h-6 w-auto" />
            <span className="text-xs font-medium text-text-light">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 font-bold text-base tabular-nums ${isTimeCritical ? 'text-red animate-pulse' : isTimeWarning ? 'text-orange' : 'text-text'}`}>
              <Clock size={16} />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple/10 text-purple font-semibold text-xs"
            >
              <Globe size={12} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
            <button
              onClick={() => { toggleFullscreen(); setIsFull(!isFull) }}
              className="p-1 rounded-full bg-secondary/10 text-secondary"
            >
              {isFull ? <Minimize size={14} /> : <Maximize size={14} />}
            </button>
          </div>
        </div>
        <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 sm:p-4 gap-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl"
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-7 gummy-shadow-lg mb-2 sm:mb-3 text-center">
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold text-text leading-snug break-words">
                {lang === 'en' && currentQuestion.questionEn ? currentQuestion.questionEn : currentQuestion.question}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {currentQuestion.choices.map((choice, i) => {
                const isSelected = selectedAnswer === choice
                const labels = ['A', 'B', 'C', 'D']
                return (
                  <motion.button
                    key={`${currentQuestion.id}-${choice}-${i}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectAnswer(choice)}
                    className={`relative p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all gummy-press ${
                      isSelected
                        ? 'bg-primary text-white gummy-shadow-lg scale-[1.03]'
                        : 'bg-white text-text gummy-shadow hover:bg-bg'
                    }`}
                  >
                    <span className={`absolute top-1 left-2 text-[10px] sm:text-xs font-bold ${isSelected ? 'text-white/60' : 'text-text-muted'}`}>
                      {labels[i]}
                    </span>
                    {choice}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="no-print shrink-0 px-3 py-2 sm:py-3">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="p-2.5 sm:p-3 rounded-full bg-white/80 backdrop-blur-sm text-text-light gummy-shadow disabled:opacity-30 hover:bg-white active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <p className="text-text-muted text-[10px] sm:text-xs">{t('exam.swipeHint')}</p>

          <motion.button
            onClick={handleNext}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-white font-bold text-base sm:text-lg gummy-shadow gummy-press transition-all ${
              currentIndex === questions.length - 1
                ? 'bg-gradient-to-r from-primary to-primary-dark'
                : 'bg-gradient-to-r from-secondary to-secondary-dark'
            }`}
          >
            {currentIndex === questions.length - 1 ? t('exam.finish') : t('exam.next')}
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
