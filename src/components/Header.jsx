import { useLang } from '../i18n/LanguageContext'
import { toggleFullscreen, isFullscreen } from '../utils/fullscreen'
import { Globe, Maximize, Minimize } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header({ showControls = true, minimal = false }) {
  const { lang, toggleLang, t } = useLang()
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const handler = () => setIsFull(isFullscreen())
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
    }
  }, [])

  return (
    <header className="no-print flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <img
          src="/wonderkids_logo.webp"
          alt="WonderKids"
          className="h-8 w-auto"
        />
        {!minimal && (
          <span className="font-bold text-lg text-text hidden sm:inline">
            {t('app.title')}
          </span>
        )}
      </div>

      {showControls && (
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple/10 text-purple font-semibold text-sm hover:bg-purple/20 active:scale-95 transition-all"
            aria-label="Toggle language"
          >
            <Globe size={16} />
            <span>{lang === 'en' ? 'TH' : 'EN'}</span>
          </button>

          <button
            onClick={() => { toggleFullscreen(); setIsFull(!isFull) }}
            className="p-2 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 active:scale-95 transition-all"
            aria-label="Toggle fullscreen"
          >
            {isFull ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      )}
    </header>
  )
}
