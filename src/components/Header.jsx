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
            className="p-2 rounded-full bg-white/80 shadow-md active:scale-90 transition-transform text-purple"
            aria-label="Toggle language"
          >
            <Globe size={18} />
          </button>

          <button
            onClick={() => { toggleFullscreen(); setIsFull(!isFull) }}
            className="p-2 rounded-full bg-white/80 shadow-md active:scale-90 transition-transform text-secondary"
            aria-label="Toggle fullscreen"
          >
            {isFull ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      )}
    </header>
  )
}
