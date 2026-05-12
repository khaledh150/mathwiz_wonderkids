import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { saveUser, getUser } from '../utils/storage'
import { playSound, initAudio } from '../utils/sound'
import { UserCircle, KeyRound, ArrowRight, Sparkles } from 'lucide-react'

export default function WelcomePage({ onContinue }) {
  const { t } = useLang()
  const existing = getUser()
  const [name, setName] = useState(existing?.name || '')
  const [code, setCode] = useState(existing?.code || '')
  const [error, setError] = useState('')

  function handleStart() {
    initAudio()
    const trimmedName = name.trim()
    const trimmedCode = code.trim()

    if (!trimmedName) {
      setError(t('welcome.nameRequired'))
      return
    }
    if (!trimmedCode) {
      setError(t('welcome.codeRequired'))
      return
    }

    playSound('select')
    const user = { name: trimmedName, code: trimmedCode, registeredAt: Date.now() }
    saveUser(user)
    onContinue(user)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.img
            src="/wonderkids_logo.webp"
            alt="WonderKids"
            className="h-24 w-auto mx-auto mb-4"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
            {t('welcome.greeting')}
          </h1>
          <p className="text-text-light text-lg">
            {t('welcome.description')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 gummy-shadow-lg space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-bg border-2 border-transparent focus-within:border-primary/40 transition-colors">
              <UserCircle size={22} className="text-text-muted shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder={t('welcome.enterName')}
                className="flex-1 bg-transparent outline-none text-text font-medium placeholder:text-text-muted"
                maxLength={40}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-bg border-2 border-transparent focus-within:border-primary/40 transition-colors">
              <KeyRound size={22} className="text-text-muted shrink-0" />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder={t('welcome.enterCode')}
                className="flex-1 bg-transparent outline-none text-text font-medium placeholder:text-text-muted uppercase tracking-wider"
                maxLength={20}
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red text-sm font-medium px-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleStart}
            whileTap={{ scale: 0.96 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg gummy-shadow gummy-press transition-all animate-pulse-glow"
          >
            <Sparkles size={22} />
            {t('welcome.startButton')}
            <ArrowRight size={22} />
          </motion.button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-text-muted text-xs">
          <Sparkles size={12} />
          <span>{t('app.tagline')}</span>
          <Sparkles size={12} />
        </div>
      </motion.div>
    </div>
  )
}
