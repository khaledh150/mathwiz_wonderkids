import { useState } from 'react'
import { useLang } from '../i18n/LanguageContext'
import { generateExam, levelConfig } from '../data/mathEngine'
import { ArrowLeft, Printer } from 'lucide-react'

export default function PrintExamPage({ onBack }) {
  const { t } = useLang()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [examData, setExamData] = useState(null)

  function handleGenerate(level) {
    const questions = generateExam(level, levelConfig[level - 1].questions)
    setSelectedLevel(level)
    setExamData(questions)
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

  const today = new Date().toLocaleDateString()

  return (
    <div className="flex-1">
      <div className="no-print p-4 flex items-center justify-between max-w-3xl mx-auto">
        <button onClick={() => setExamData(null)} className="flex items-center gap-1 text-text-light hover:text-text">
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-bold gummy-shadow gummy-press"
        >
          <Printer size={18} /> {t('print.printButton')}
        </button>
      </div>

      {/* Printable Exam Sheet */}
      <div className="max-w-3xl mx-auto p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">MathWiz Competition</h1>
          <p className="text-lg">{t('levels.level')} {selectedLevel}</p>
          <div className="flex justify-between mt-4 text-sm">
            <span>{t('print.studentName')} _________________________</span>
            <span>{t('print.date')} {today}</span>
          </div>
        </div>

        <p className="text-sm mb-6 italic">{t('print.instructions')}</p>

        <div className="space-y-4">
          {examData.map((q, i) => (
            <div key={q.id} className="flex gap-3 items-start">
              <span className="font-bold min-w-[2rem] text-right">{i + 1}.</span>
              <div className="flex-1">
                <p className="font-bold text-lg mb-1">{q.question}</p>
                <div className="grid grid-cols-4 gap-2">
                  {q.choices.map((choice, ci) => (
                    <span key={ci} className="text-sm">
                      {['A', 'B', 'C', 'D'][ci]}. {choice}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key - separate page */}
        <div className="break-before-page pt-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2">
            {t('print.answerKey')} - {t('levels.level')} {selectedLevel}
          </h2>
          <div className="grid grid-cols-5 gap-2 text-sm">
            {examData.map((q, i) => {
              const correctIndex = q.choices.indexOf(q.correctAnswer)
              return (
                <div key={q.id} className="flex gap-1">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{['A', 'B', 'C', 'D'][correctIndex]} ({q.correctAnswer})</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
