import { useLang } from '../i18n/LanguageContext'
import { toggleFullscreen, isFullscreen } from '../utils/fullscreen'
import { Globe, Maximize, Minimize } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header({ showControls = true }) {
  const { toggleLang } = useLang()
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

  if (!showControls) return null

  return (
    <div className="no-print fixed top-3 right-3 z-50 flex items-center gap-2">
      <button
        onClick={toggleLang}
        className="p-2 rounded-full bg-white/80 shadow-md active:scale-90 transition-transform text-purple-500"
        aria-label="Toggle language"
      >
        <Globe size={18} />
      </button>

      <button
        onClick={() => { toggleFullscreen(); setIsFull(!isFull) }}
        className="p-2 rounded-full bg-white/80 shadow-md active:scale-90 transition-transform text-purple-500"
        aria-label="Toggle fullscreen"
      >
        {isFull ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  )
}
