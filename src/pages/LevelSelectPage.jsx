import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { levelConfig } from '../data/mathEngine'
import { playSound } from '../utils/sound'
import { requestFullscreen } from '../utils/fullscreen'
import { Clock, HelpCircle, ChevronRight, Printer } from 'lucide-react'

const levelNameKeys = [
  'levels.level1', 'levels.level2', 'levels.level3', 'levels.level4',
  'levels.level5', 'levels.level6', 'levels.level7', 'levels.level8',
]

export default function LevelSelectPage({ onSelectLevel, onPrint }) {
  const { t } = useLang()

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">
            {t('levels.title')}
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {levelConfig.map((config, i) => (
            <motion.button
              key={config.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSound('select')
                requestFullscreen()
                onSelectLevel(config)
              }}
              className={`w-full text-left p-4 rounded-2xl bg-gradient-to-br ${config.color} text-white gummy-shadow gummy-press transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl mb-1">{config.emoji}</div>
                  <div className="font-bold text-lg">
                    {t('levels.level')} {config.level}
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    {t(levelNameKeys[i])}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={13} />
                      {config.questions} {t('levels.questions')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {config.timeMinutes} {t('levels.minutes')}
                    </span>
                  </div>
                </div>
                <ChevronRight size={24} className="text-white/60" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onPrint}
          className="mt-4 mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-text-light font-medium gummy-shadow gummy-press hover:text-text transition-all"
        >
          <Printer size={18} />
          {t('print.printButton')}
        </motion.button>
      </div>
    </div>
  )
}
