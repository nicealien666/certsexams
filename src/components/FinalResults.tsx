'use client'

import { motion } from 'framer-motion'
import { ProgressBar } from './ProgressBar'
import { MistakeReview } from './MistakeReview'
import type { Question, AnswerLetter, CategoryScore } from '@/types/exam'

interface FinalResultsProps {
  examDisplayName: string
  questions: Question[]
  answers: Record<string, AnswerLetter>
  totalCorrect: number
  totalQuestions: number
  percentage: number
  categoryScores: CategoryScore[]
  wrongQuestionIds: string[]
  onRestart: () => void
  onBackToExams: () => void
}

export function FinalResults({
  examDisplayName,
  questions,
  answers,
  totalCorrect,
  totalQuestions,
  percentage,
  categoryScores,
  wrongQuestionIds,
  onRestart,
  onBackToExams,
}: FinalResultsProps) {
  const passed = percentage >= 70

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div
          className={`rounded-2xl border p-8 text-center mb-8 ${
            passed ? 'border-neon-green/40 bg-neon-green/5' : 'border-neon-red/30 bg-neon-red/5'
          }`}
        >
          <p className="text-gray-400 mb-2">{examDisplayName}</p>
          <div className={`text-7xl font-bold mb-2 ${passed ? 'text-neon-green' : 'text-neon-red'}`}>
            {percentage}%
          </div>
          <p className="text-gray-300 mb-4">{totalCorrect} / {totalQuestions} correct</p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            passed ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
          }`}>
            {passed ? '✓ PASS' : '✗ FAIL'}
          </span>
          {!passed && <p className="text-xs text-gray-500 mt-3">Passing score: 70%</p>}
        </div>

        {categoryScores.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Score by Category</h3>
            <div className="space-y-4">
              {categoryScores.map(cs => (
                <div key={cs.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{cs.category}</span>
                    <span className="text-gray-400">{cs.correct}/{cs.total}</span>
                  </div>
                  <ProgressBar current={cs.correct} total={cs.total} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 transition-all hover:shadow-glow-cyan"
          >
            Restart Exam
          </button>
          <button
            onClick={onBackToExams}
            className="flex-1 py-3 rounded-lg border border-white/10 text-gray-300 text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            Back to Exams
          </button>
        </div>

        <MistakeReview questions={questions} answers={answers} wrongIds={wrongQuestionIds} />
      </motion.div>
    </main>
  )
}
