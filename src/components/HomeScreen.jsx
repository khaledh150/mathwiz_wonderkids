import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Trophy, Lock } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const WORDEE_PLAY_URL = 'https://wordee-wonderkids.vercel.app/play'

export default function HomeScreen({ onPractice }) {
  const { t } = useLang()
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const res = await fetch('https://rlsuwlvzeaioanudtmxp.supabase.co/rest/v1/competition_state?select=is_unlocked&id=in.(english,math)', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsc3V3bHZ6ZWFpb2FudWR0bXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjQwNjIsImV4cCI6MjA2NDkwMDA2Mn0.D0dOaxPc_QLHAY01Y__RKGJ-JXhqjRFcQZAlGF3pcRk',
          },
        })
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setUnlocked(data.some(s => s.is_unlocked))
      } catch {}
    }
    check()
    const id = setInterval(check, 5000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
      <motion.img
        src="/wonderkids_logo.webp"
        alt="WonderKids"
        className="h-28 sm:h-40 w-auto drop-shadow-xl"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      />
      <motion.h1
        className="text-3xl sm:text-5xl font-extrabold mt-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        MathWiz
      </motion.h1>

      <div className="flex flex-col gap-4 mt-8 w-full max-w-xs sm:max-w-sm">
        <motion.button
          onClick={onPractice}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 sm:py-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white font-extrabold text-xl sm:text-2xl rounded-2xl shadow-xl active:scale-95 transition-transform cursor-pointer gummy-shadow gummy-press"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
        >
          <Calculator className="w-7 h-7 sm:w-8 sm:h-8" />
          {t('home.practice') || 'Practice'}
        </motion.button>

        <motion.button
          onClick={unlocked ? () => { window.location.href = WORDEE_PLAY_URL } : undefined}
          className={`w-full flex items-center justify-center gap-3 px-6 py-5 sm:py-6 font-extrabold text-xl sm:text-2xl rounded-2xl shadow-xl transition-all cursor-pointer ${
            unlocked
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white active:scale-95 animate-pulse gummy-shadow'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={unlocked ? { scale: 0.95 } : {}}
        >
          {unlocked ? (
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
          {t('home.competition') || 'Competition'}
        </motion.button>

        {!unlocked && (
          <motion.p
            className="text-center text-sm text-text-muted font-medium -mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t('home.locked') || 'Opens when the admin starts the lobby'}
          </motion.p>
        )}
      </div>
    </div>
  )
}
