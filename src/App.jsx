import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider } from './i18n/LanguageContext'
import { checkVersionAndReload, getExamProgress } from './utils/storage'
import { levelConfig } from './data/mathEngine'
import { APP_VERSION } from './version'
import Header from './components/Header'
import SplashScreen from './components/SplashScreen'
import HomeScreen from './components/HomeScreen'
import OfflineBanner from './components/OfflineBanner'
import LevelSelectPage from './pages/LevelSelectPage'
import ModeSelectPage from './pages/ModeSelectPage'
import PracticePage from './pages/PracticePage'
import ExamPage from './pages/ExamPage'
import ResultsPage from './pages/ResultsPage'
import PrintExamPage from './pages/PrintExamPage'
import InAppBrowserGuard from './components/InAppBrowserGuard'

const PAGES = {
  SPLASH: 'splash',
  HOME: 'home',
  LEVELS: 'levels',
  MODE: 'mode',
  PRACTICE: 'practice',
  EXAM: 'exam',
  RESULTS: 'results',
  PRINT: 'print',
}

function AppContent() {
  const [page, setPage] = useState(PAGES.SPLASH)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [examResults, setExamResults] = useState(null)
  const [examKey, setExamKey] = useState(0)

  useEffect(() => {
    checkVersionAndReload(APP_VERSION)
  }, [])

  useEffect(() => {
    if (page !== PAGES.SPLASH) {
      window.history.pushState({ page }, '', `#${page}`)
    }
  }, [page])

  useEffect(() => {
    const onPopState = (e) => {
      const target = e.state?.page
      if (target === PAGES.LEVELS) setPage(PAGES.LEVELS)
      else if (target === PAGES.MODE) setPage(PAGES.MODE)
      else if (target === PAGES.RESULTS) setPage(PAGES.RESULTS)
      else setPage(PAGES.HOME)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleSplashDone = useCallback(() => {
    const savedExam = getExamProgress()
    if (savedExam) {
      const lvl = levelConfig.find((l) => l.level === savedExam.level)
      if (lvl) {
        setSelectedLevel(lvl)
        setPage(PAGES.EXAM)
        return
      }
    }
    setPage(PAGES.HOME)
  }, [])

  function handleSelectLevel(levelCfg) {
    setSelectedLevel(levelCfg)
    setPage(PAGES.MODE)
  }

  function handleSelectMode(mode) {
    if (mode === 'practice') {
      setPage(PAGES.PRACTICE)
    } else {
      setPage(PAGES.EXAM)
    }
  }

  function handleExamFinish(results) {
    setExamResults(results)
    setPage(PAGES.RESULTS)
  }

  const showHeader = page !== PAGES.SPLASH && page !== PAGES.HOME && page !== PAGES.EXAM && page !== PAGES.PRACTICE

  return (
    <div className="min-h-screen-safe flex flex-col bg-bg">
      {showHeader && <Header />}

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {page === PAGES.SPLASH && (
            <SplashScreen onDone={handleSplashDone} />
          )}

          {page === PAGES.HOME && (
            <HomeScreen onPractice={() => setPage(PAGES.LEVELS)} />
          )}

          {page === PAGES.LEVELS && (
            <LevelSelectPage
              onSelectLevel={handleSelectLevel}
              onPrint={() => setPage(PAGES.PRINT)}
              onBack={() => setPage(PAGES.HOME)}
            />
          )}

          {page === PAGES.MODE && selectedLevel && (
            <ModeSelectPage
              levelConfig={selectedLevel}
              onSelectMode={handleSelectMode}
              onBack={() => setPage(PAGES.LEVELS)}
            />
          )}

          {page === PAGES.PRACTICE && selectedLevel && (
            <PracticePage
              key={`practice-${selectedLevel.level}`}
              levelConfig={selectedLevel}
              onExit={() => setPage(PAGES.MODE)}
            />
          )}

          {page === PAGES.EXAM && selectedLevel && (
            <ExamPage
              key={`exam-${selectedLevel.level}-${examKey}`}
              levelConfig={selectedLevel}
              user={null}
              onFinish={handleExamFinish}
              onExit={() => setPage(PAGES.MODE)}
            />
          )}

          {page === PAGES.RESULTS && examResults && (
            <ResultsPage
              examData={examResults}
              onBackToHome={() => setPage(PAGES.HOME)}
              onTryAgain={() => { setExamKey(k => k + 1); setPage(PAGES.EXAM) }}
            />
          )}

          {page === PAGES.PRINT && (
            <PrintExamPage onBack={() => setPage(PAGES.LEVELS)} />
          )}
        </motion.div>
      </AnimatePresence>

      {page !== PAGES.SPLASH && page !== PAGES.HOME && page !== PAGES.EXAM && page !== PAGES.PRACTICE && (
        <footer className="no-print text-center py-3 md:py-4 text-text-muted text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} Wonder Kids Co. All rights reserved.</p>
          <p className="mt-0.5">v{APP_VERSION}</p>
        </footer>
      )}

      <OfflineBanner />
    </div>
  )
}

export default function App() {
  return (
    <InAppBrowserGuard>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </InAppBrowserGuard>
  )
}
