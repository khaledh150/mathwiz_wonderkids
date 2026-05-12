import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LanguageProvider } from './i18n/LanguageContext'
import { checkVersionAndReload, getUser, getExamProgress } from './utils/storage'
import { levelConfig } from './data/mathEngine'
import { APP_VERSION } from './version'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import OfflineBanner from './components/OfflineBanner'
import WelcomePage from './pages/WelcomePage'
import LevelSelectPage from './pages/LevelSelectPage'
import ExamPage from './pages/ExamPage'
import ResultsPage from './pages/ResultsPage'
import PrintExamPage from './pages/PrintExamPage'

const PAGES = {
  LOADING: 'loading',
  WELCOME: 'welcome',
  LEVELS: 'levels',
  EXAM: 'exam',
  RESULTS: 'results',
  PRINT: 'print',
}

function AppContent() {
  const [page, setPage] = useState(PAGES.LOADING)
  const [user, setUser] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [examResults, setExamResults] = useState(null)

  useEffect(() => {
    checkVersionAndReload(APP_VERSION)

    const existing = getUser()
    const savedExam = getExamProgress()
    const timer = setTimeout(() => {
      if (savedExam && existing) {
        setUser(existing)
        const lvl = levelConfig.find((l) => l.level === savedExam.level)
        if (lvl) {
          setSelectedLevel(lvl)
          setPage(PAGES.EXAM)
        } else {
          setPage(PAGES.LEVELS)
        }
      } else if (existing) {
        setUser(existing)
        setPage(PAGES.LEVELS)
      } else {
        setPage(PAGES.WELCOME)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  function handleUserContinue(userData) {
    setUser(userData)
    setPage(PAGES.LEVELS)
  }

  function handleSelectLevel(levelCfg) {
    setSelectedLevel(levelCfg)
    setPage(PAGES.EXAM)
  }

  function handleExamFinish(results) {
    setExamResults(results)
    setPage(PAGES.RESULTS)
  }

  function handleTryAgain() {
    setPage(PAGES.EXAM)
  }

  const showHeader = page !== PAGES.LOADING && page !== PAGES.EXAM

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
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
          {page === PAGES.LOADING && <LoadingScreen />}

          {page === PAGES.WELCOME && (
            <WelcomePage onContinue={handleUserContinue} />
          )}

          {page === PAGES.LEVELS && (
            <LevelSelectPage
              user={user}
              onSelectLevel={handleSelectLevel}
              onPrint={() => setPage(PAGES.PRINT)}
            />
          )}

          {page === PAGES.EXAM && selectedLevel && (
            <ExamPage
              key={`exam-${selectedLevel.level}`}
              levelConfig={selectedLevel}
              user={user}
              onFinish={handleExamFinish}
            />
          )}

          {page === PAGES.RESULTS && examResults && (
            <ResultsPage
              examData={examResults}
              onTryAgain={handleTryAgain}
              onBackToHome={() => { setUser(null); setPage(PAGES.WELCOME) }}
            />
          )}

          {page === PAGES.PRINT && (
            <PrintExamPage onBack={() => setPage(PAGES.LEVELS)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer with copyright */}
      {page !== PAGES.LOADING && page !== PAGES.EXAM && (
        <footer className="no-print text-center py-3 text-text-muted text-xs">
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
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
