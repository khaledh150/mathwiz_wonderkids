import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { useTimer } from '../hooks/useTimer'
import { useSwipe } from '../hooks/useSwipe'
import { generateExam } from '../data/mathEngine'
import { playSound } from '../utils/sound'
import { saveExamAnswers } from '../utils/storage'
import { requestFullscreen } from '../utils/fullscreen'
import CountdownOverlay from '../components/CountdownOverlay'
import { Clock, ChevronRight, ChevronLeft, Flag, AlertTriangle } from 'lucide-react'

export default function ExamPage({ levelConfig: config, user, onFinish }) {
  const { t } = useLang()
  const [phase, setPhase] = useState('countdown')
  const [questions, setQuestions] = useState(() => generateExam(config.level, config.questions))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const answersRef = useRef({})
  const startTimeRef = useRef(null)

  const totalSeconds = config.timeMinutes * 60

  const handleTimeUp = useCallback(() => {
    playSound('timeWarning')
    finishExam()
  }, [])

  const { timeLeft, start: startTimer, stop: stopTimer, getElapsedSeconds } = useTimer(totalSeconds, handleTimeUp)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answersRef.current).length

  function finishExam() {
    stopTimer()
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
      totalTime: totalSeconds,
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
    setSelectedAnswer(answersRef.current[questions[index].id] ?? null)
    setCurrentIndex(index)
  }

  function handleNext() {
    if (selectedAnswer !== null) {
      answersRef.current[currentQuestion.id] = selectedAnswer
    }

    if (isLastQuestion) {
      if (answeredCount < questions.length) {
        setShowConfirmFinish(true)
      } else {
        finishExam()
      }
    } else {
      playSound('tap')
      goToQuestion(currentIndex + 1)
    }
  }

  function handleSkip() {
    playSound('swipe')
    if (isLastQuestion) {
      setShowConfirmFinish(true)
    } else {
      goToQuestion(currentIndex + 1)
    }
  }

  function handleSelectAnswer(choice) {
    playSound('select')
    setSelectedAnswer(choice)
    answersRef.current[currentQuestion.id] = choice
  }

  function handleCountdownComplete() {
    setPhase('exam')
    startTimeRef.current = Date.now()
    startTimer()
    requestFullscreen()
  }

  const swipeHandlers = useSwipe(handleSkip, null, 60)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timePercent = (timeLeft / totalSeconds) * 100
  const isTimeWarning = timeLeft <= 60
  const isTimeCritical = timeLeft <= 30

  if (phase === 'countdown') {
    return <CountdownOverlay onComplete={handleCountdownComplete} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" {...swipeHandlers}>
      {/* Timer Bar */}
      <div className="no-print shrink-0 px-3 py-2 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-text-light">
            {t('exam.question')} {currentIndex + 1} {t('exam.of')} {questions.length}
          </span>
          <div className={`flex items-center gap-1 font-bold text-lg ${isTimeCritical ? 'text-red animate-pulse' : isTimeWarning ? 'text-orange' : 'text-text'}`}>
            <Clock size={18} />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${isTimeCritical ? 'bg-red' : isTimeWarning ? 'bg-orange' : 'bg-secondary'}`}
            style={{ width: `${timePercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {/* Question dots */}
        <div className="flex gap-1 mt-2 justify-center flex-wrap">
          {questions.map((q, i) => {
            const answered = answersRef.current[q.id] !== undefined
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                  i === currentIndex
                    ? 'bg-primary text-white scale-110'
                    : answered
                    ? 'bg-secondary/20 text-secondary'
                    : 'bg-bg text-text-muted'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl"
          >
            {/* Question */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 gummy-shadow-lg mb-4 text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.choices.map((choice, i) => {
                const isSelected = selectedAnswer === choice
                const labels = ['A', 'B', 'C', 'D']
                return (
                  <motion.button
                    key={`${currentQuestion.id}-${choice}`}
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

      {/* Bottom Navigation */}
      <div className="no-print shrink-0 px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-border flex items-center justify-between gap-3">
        <button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-text-light font-medium disabled:opacity-30 hover:bg-bg active:scale-95 transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setShowConfirmFinish(true)}
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-orange font-medium hover:bg-orange/10 active:scale-95 transition-all"
        >
          <Flag size={16} />
          {t('exam.finish')}
        </button>

        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-secondary-dark text-white font-bold gummy-shadow gummy-press transition-all"
        >
          {isLastQuestion ? t('exam.finish') : t('exam.next')}
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Confirm Finish Modal */}
      <AnimatePresence>
        {showConfirmFinish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-text/60 backdrop-blur-sm p-4"
            onClick={() => setShowConfirmFinish(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full gummy-shadow-lg text-center"
            >
              <AlertTriangle size={40} className="text-orange mx-auto mb-3" />
              <p className="text-text font-bold text-lg mb-1">{t('exam.finish')}?</p>
              <p className="text-text-light text-sm mb-4">
                {t('exam.confirmFinish')}
              </p>
              <p className="text-sm text-text-muted mb-4">
                {answeredCount}/{questions.length} {t('levels.questions')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmFinish(false)}
                  className="flex-1 py-3 rounded-xl bg-bg text-text font-medium active:scale-95 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => { setShowConfirmFinish(false); finishExam() }}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-all"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
