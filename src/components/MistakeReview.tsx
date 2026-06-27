'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Question, AnswerLetter } from '@/types/exam'

interface MistakeReviewProps {
  questions: Question[]
  answers: Record<string, AnswerLetter>
  wrongIds: string[]
}

export function MistakeReview({ questions, answers, wrongIds }: MistakeReviewProps) {
  const [open, setOpen] = useState<string | null>(null)
  const wrongQuestions = questions.filter(q => wrongIds.includes(q.id))

  if (wrongQuestions.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">Review Mistakes ({wrongQuestions.length})</h3>
      <div className="space-y-2">
        {wrongQuestions.map((q, i) => (
          <div key={q.id} className="rounded-lg border border-neon-red/20 bg-neon-red/5 overflow-hidden">
            <button
              onClick={() => setOpen(open === q.id ? null : q.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm text-gray-300 truncate pr-4">
                <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                {q.question}
              </span>
              <span className="text-gray-400 text-xs flex-shrink-0">{open === q.id ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {open === q.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-neon-red font-medium mt-0.5 flex-shrink-0">Your answer:</span>
                      <span className="text-sm text-neon-red">
                        {answers[q.id] ? `${answers[q.id]}: ${q.options[answers[q.id]]}` : 'Not answered'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-neon-green font-medium mt-0.5 flex-shrink-0">Correct:</span>
                      <span className="text-sm text-neon-green">
                        {q.correctAnswer}: {q.options[q.correctAnswer]}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">{q.explanation}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
