import { useState, useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { t } = useLang()

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="no-print fixed bottom-0 left-0 right-0 z-[90] bg-orange/90 text-white text-center py-2 md:py-3 px-4 text-sm md:text-base font-medium flex items-center justify-center gap-2">
      <WifiOff size={16} className="md:!w-5 md:!h-5" />
      {t('common.offline')}
    </div>
  )
}
