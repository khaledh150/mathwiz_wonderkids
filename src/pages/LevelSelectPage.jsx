import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { levelConfig } from '../data/mathEngine'
import { playSound } from '../utils/sound'
import { HelpCircle, ChevronRight, Printer, ArrowLeft } from 'lucide-react'

const levelNameKeys = [
  'levels.level1', 'levels.level2', 'levels.level3', 'levels.level4',
  'levels.level5', 'levels.level6', 'levels.level7', 'levels.level8',
]

export default function LevelSelectPage({ onSelectLevel, onPrint, onBack }) {
  const { t } = useLang()

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto relative">
      <div className="max-w-2xl md:max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-8 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-0 p-2 md:p-3 rounded-full bg-white/80 shadow-md active:scale-90 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-text-light md:!w-6 md:!h-6" />
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-1">
            {t('levels.title')}
          </h1>
        </div>

        <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
          {levelConfig.map((config, i) => (
            <motion.button
              key={config.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSound('select')
                onSelectLevel(config)
              }}
              className={`w-full text-left p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gradient-to-br ${config.color} text-white gummy-shadow gummy-press transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl md:text-3xl mb-1">{config.emoji}</div>
                  <div className="font-bold text-lg md:text-xl">
                    {t('levels.level')} {config.level}
                  </div>
                  <div className="text-white/80 text-sm md:text-base font-medium">
                    {t(levelNameKeys[i])}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-white/70 text-xs md:text-sm">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={13} className="md:!w-4 md:!h-4" />
                      {config.questions} {t('levels.questions')}
                    </span>
                  </div>
                </div>
                <ChevronRight size={24} className="text-white/60 md:!w-7 md:!h-7" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onPrint}
          className="mt-4 md:mt-6 mx-auto flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white text-text-light font-medium md:text-lg gummy-shadow gummy-press hover:text-text transition-all"
        >
          <Printer size={18} className="md:!w-5 md:!h-5" />
          {t('print.printButton')}
        </motion.button>
      </div>
    </div>
  )
}
