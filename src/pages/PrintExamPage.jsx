import { useState, useRef } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { generateExam, levelConfig } from '../data/mathEngine'
import { ArrowLeft, Printer, Key } from 'lucide-react'

function stripQuestionMark(text) {
  return text.replace(/\s*\?\s*$/, '').trim()
}

const QUESTIONS_PER_PAGE = 100
const QUESTIONS_PER_COL = 50

export default function PrintExamPage({ onBack }) {
  const { t, lang } = useLang()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [examData, setExamData] = useState(null)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const answerKeyRef = useRef(null)

  function handleGenerate(level) {
    const questions = generateExam(level, levelConfig[level - 1].questions)
    setSelectedLevel(level)
    setExamData(questions)
    setShowAnswerKey(false)
  }

  function handlePrint() {
    window.print()
  }

  if (!examData) {
    return (
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="flex items-center gap-1 text-text-light mb-4 hover:text-text">
            <ArrowLeft size={18} /> {t('print.backButton')}
          </button>
          <h1 className="text-2xl font-bold text-text mb-2">{t('print.title')}</h1>
          <p className="text-text-light mb-6">{t('print.subtitle')}</p>
          <div className="space-y-2">
            {levelConfig.map((config) => (
              <button
                key={config.level}
                onClick={() => handleGenerate(config.level)}
                className={`w-full p-4 rounded-2xl bg-gradient-to-br ${config.color} text-white font-bold text-left gummy-shadow gummy-press`}
              >
                {config.emoji} {t('levels.level')} {config.level} - {t('print.generateButton')}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(examData.length / QUESTIONS_PER_PAGE)
  const pages = []
  for (let p = 0; p < totalPages; p++) {
    const start = p * QUESTIONS_PER_PAGE
    const pageQuestions = examData.slice(start, start + QUESTIONS_PER_PAGE)
    const leftCol = pageQuestions.slice(0, QUESTIONS_PER_COL)
    const rightCol = pageQuestions.slice(QUESTIONS_PER_COL)
    pages.push({ leftCol, rightCol, startNum: start + 1, pageNum: p + 1 })
  }

  return (
    <div className="flex-1">
      <div className="no-print p-4 flex items-center justify-between max-w-3xl mx-auto">
        <button onClick={() => setExamData(null)} className="flex items-center gap-1 text-text-light hover:text-text">
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !showAnswerKey
              setShowAnswerKey(next)
              if (next) setTimeout(() => answerKeyRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold gummy-shadow gummy-press ${
              showAnswerKey ? 'bg-orange text-white' : 'bg-white text-orange'
            }`}
          >
            <Key size={18} />
            {t('print.answerKey')}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-bold gummy-shadow gummy-press"
          >
            <Printer size={18} /> {t('print.printButton')}
          </button>
        </div>
      </div>

      {pages.map((page, pi) => (
        <div
          key={pi}
          className="print-page bg-white mx-auto max-w-3xl"
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '16px',
            boxSizing: 'border-box',
            pageBreakAfter: pi < pages.length - 1 ? 'always' : 'auto',
          }}
        >
          <div className="text-center mb-1 border-b border-black pb-1">
            <h1 className="print-title font-bold leading-tight">MathWiz Competition</h1>
            <p className="print-subtitle">{t('levels.level')} {selectedLevel}</p>
            <div className="flex justify-between mt-1 print-small">
              <span>{t('print.studentName')} _________________________</span>
              <span>{t('print.date')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</span>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-6 print-questions">
            <div className="flex-1">
              {page.leftCol.map((q, i) => {
                const num = page.startNum + i
                const text = lang === 'en' && q.questionEn ? q.questionEn : q.question
                return (
                  <div key={q.id} className="print-q-row">
                    <span className="print-q-num">{num}.</span>
                    <span>{stripQuestionMark(text)}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-px bg-gray-300 shrink-0" />
            <div className="flex-1">
              {page.rightCol.map((q, i) => {
                const num = page.startNum + QUESTIONS_PER_COL + i
                const text = lang === 'en' && q.questionEn ? q.questionEn : q.question
                return (
                  <div key={q.id} className="print-q-row">
                    <span className="print-q-num">{num}.</span>
                    <span>{stripQuestionMark(text)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center print-small text-gray-400 mt-1 border-t border-gray-200 pt-0.5">
            {t('print.page')} {page.pageNum} / {totalPages} &mdash; &copy; Wonder Kids Co., LTD.
          </div>
        </div>
      ))}

      {showAnswerKey && (
        <div
          ref={answerKeyRef}
          className="print-page bg-white mx-auto mt-4 max-w-3xl"
          style={{
            fontFamily: 'Arial, sans-serif',
            padding: '16px',
            boxSizing: 'border-box',
            pageBreakBefore: 'always',
          }}
        >
          <h2 className="text-lg font-bold mb-3 border-b-2 border-black pb-2">
            {t('print.answerKey')} &mdash; {t('levels.level')} {selectedLevel}
          </h2>
          <div className="grid grid-cols-10 gap-x-3 gap-y-0.5 text-xs">
            {examData.map((q, i) => (
              <div key={q.id} className="flex gap-1">
                <span className="font-bold">{i + 1}.</span>
                <span>{q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
