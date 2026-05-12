import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { fireConfettiBurst } from '../utils/confetti'
import { CheckCircle, XCircle, MinusCircle, Clock, Target, RotateCcw, Home } from 'lucide-react'

function getGrade(accuracy, t) {
  if (accuracy === 100) return { text: t('results.perfect'), color: 'text-gold' }
  if (accuracy >= 80) return { text: t('results.excellent'), color: 'text-green' }
  if (accuracy >= 60) return { text: t('results.great'), color: 'text-secondary' }
  if (accuracy >= 40) return { text: t('results.good'), color: 'text-orange' }
  return { text: t('results.keepTrying'), color: 'text-primary' }
}

export default function ResultsPage({ examData, onTryAgain, onBackToHome }) {
  const { t } = useLang()
  const { correct, wrong, skipped, totalQuestions, timeTaken, accuracy } = examData
  const grade = getGrade(accuracy, t)

  useEffect(() => {
    if (accuracy >= 60) {
      const timer = setTimeout(fireConfettiBurst, 500)
      return () => clearTimeout(timer)
    }
  }, [accuracy])

  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  return (
    <div className="flex-1 flex items-center justify-center p-3 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Landscape-optimized: horizontal layout */}
        <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
          {/* Left: Score circle + grade */}
          <div className="text-center shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center gummy-shadow-lg mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white">{correct}</div>
                <div className="text-white/70 text-[10px]">{t('results.outOf')} {totalQuestions}</div>
              </div>
            </motion.div>
            <h1 className="text-xl lg:text-2xl font-bold text-text mt-2">{t('results.title')}</h1>
            <p className={`text-base font-bold ${grade.color}`}>{grade.text}</p>
          </div>

          {/* Right: Stats + buttons */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-2xl p-4 gummy-shadow-lg">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: CheckCircle, label: t('results.correct'), value: correct, color: 'text-green', bg: 'bg-green/10' },
                  { icon: XCircle, label: t('results.wrong'), value: wrong, color: 'text-red', bg: 'bg-red/10' },
                  { icon: MinusCircle, label: t('results.skipped'), value: skipped, color: 'text-text-muted', bg: 'bg-bg' },
                  { icon: Clock, label: t('results.timeTaken'), value: `${minutes}:${String(seconds).padStart(2, '0')}`, color: 'text-purple', bg: 'bg-purple/10' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-2 text-center`}>
                    <Icon size={20} className={`${color} mx-auto mb-0.5`} />
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                    <div className="text-text-muted text-[10px]">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 bg-bg rounded-xl p-2">
                <Target size={18} className="text-primary" />
                <span className="text-text font-bold text-lg">{accuracy}%</span>
                <span className="text-text-light text-sm">{t('results.accuracy')}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onTryAgain}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold gummy-shadow gummy-press"
              >
                <RotateCcw size={18} />
                {t('results.tryAgain')}
              </motion.button>
              <button
                onClick={onBackToHome}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-text font-medium gummy-shadow gummy-press"
              >
                <Home size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
