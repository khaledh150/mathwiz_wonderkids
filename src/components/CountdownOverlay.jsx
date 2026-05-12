import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { playSound } from '../utils/sound'

const STEPS = ['ready', '3', '2', '1', 'go']

export default function CountdownOverlay({ onComplete }) {
  const { t } = useLang()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= STEPS.length) {
      onComplete()
      return
    }

    const current = STEPS[step]
    if (current === 'go') {
      playSound('countdownGo')
    } else if (current !== 'ready') {
      playSound('countdown')
    }

    const delay = current === 'ready' ? 1200 : current === 'go' ? 800 : 1000
    const timer = setTimeout(() => setStep(step + 1), delay)
    return () => clearTimeout(timer)
  }, [step, onComplete])

  const current = STEPS[step]
  if (step >= STEPS.length) return null

  const display =
    current === 'ready' ? t('exam.ready') :
    current === 'go' ? t('exam.go') :
    current

  const colors = {
    ready: 'text-purple',
    3: 'text-primary',
    2: 'text-orange',
    1: 'text-red',
    go: 'text-green',
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-text/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className={`text-[min(30vw,12rem)] font-bold ${colors[current]} drop-shadow-lg`}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
