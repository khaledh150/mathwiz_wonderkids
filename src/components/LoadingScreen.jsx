import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'

export default function LoadingScreen({ message }) {
  const { t } = useLang()

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
      <motion.img
        src="/wonderkids_logo.webp"
        alt="WonderKids"
        className="h-60 w-auto mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-primary"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
      <p className="text-text-light text-lg font-medium">
        {message || t('app.loading')}
      </p>
    </div>
  )
}
