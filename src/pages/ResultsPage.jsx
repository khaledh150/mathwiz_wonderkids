import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { fireConfettiBurst } from '../utils/confetti'
import { CheckCircle, XCircle, MinusCircle, Clock, Target, RotateCcw, Home, ArrowLeft } from 'lucide-react'

function getGrade(accuracy, t) {
  if (accuracy === 100) return { text: t('results.perfect'), color: 'text-gold' }
  if (accuracy >= 80) return { text: t('results.excellent'), color: 'text-green' }
  if (accuracy >= 60) return { text: t('results.great'), color: 'text-secondary' }
  if (accuracy >= 40) return { text: t('results.good'), color: 'text-orange' }
  return { text: t('results.keepTrying'), color: 'text-primary' }
}

export default function ResultsPage({ examData, onTryAgain, onBackToLevels, onBackToHome }) {
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

  const stats = [
    { icon: CheckCircle, label: t('results.correct'), value: correct, color: 'text-green', bg: 'bg-green/10' },
    { icon: XCircle, label: t('results.wrong'), value: wrong, color: 'text-red', bg: 'bg-red/10' },
    { icon: MinusCircle, label: t('results.skipped'), value: skipped, color: 'text-text-muted', bg: 'bg-bg' },
    { icon: Clock, label: t('results.timeTaken'), value: `${minutes}:${String(seconds).padStart(2, '0')}`, color: 'text-purple', bg: 'bg-purple/10' },
  ]

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-3"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center gummy-shadow-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{correct}</div>
                <div className="text-white/70 text-xs">{t('results.outOf')} {totalQuestions}</div>
              </div>
            </div>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">{t('results.title')}</h1>
          <p className={`text-xl font-bold ${grade.color}`}>{grade.text}</p>
        </div>

        <div className="bg-white rounded-3xl p-5 gummy-shadow-lg mb-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value, color, bg }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${bg} rounded-2xl p-3 text-center`}
              >
                <Icon size={24} className={`${color} mx-auto mb-1`} />
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-text-muted text-xs">{label}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 bg-bg rounded-2xl p-3">
            <Target size={20} className="text-primary" />
            <span className="text-text font-bold text-lg">{accuracy}%</span>
            <span className="text-text-light text-sm">{t('results.accuracy')}</span>
          </div>
        </div>

        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onTryAgain}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold gummy-shadow gummy-press"
          >
            <RotateCcw size={20} />
            {t('results.tryAgain')}
          </motion.button>
          <div className="flex gap-2">
            <button
              onClick={onBackToLevels}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-text font-medium gummy-shadow gummy-press"
            >
              <ArrowLeft size={18} />
              {t('results.backToLevels')}
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-text font-medium gummy-shadow gummy-press"
            >
              <Home size={18} />
              {t('results.backToHome')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
