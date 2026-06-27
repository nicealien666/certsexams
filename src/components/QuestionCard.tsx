'use client'

import { motion } from 'framer-motion'
import type { Question, AnswerLetter, PageMode } from '@/types/exam'

const LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D']

interface QuestionCardProps {
  question: Question
  index: number
  selectedAnswer?: AnswerLetter
  mode: PageMode
  onSelect: (letter: AnswerLetter) => void
}

function getOptionStyle(
  letter: AnswerLetter,
  question: Question,
  selected: AnswerLetter | undefined,
  mode: PageMode
): string {
  const base =
    'flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm text-left transition-all duration-200'

  if (mode === 'answering') {
    return selected === letter
      ? `${base} border-neon-cyan bg-neon-cyan/10 text-white shadow-glow-cyan-sm`
      : `${base} border-white/10 bg-white/5 text-gray-300 hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white cursor-pointer`
  }

  if (letter === question.correctAnswer) {
    return `${base} border-neon-green bg-neon-green/10 text-neon-green shadow-glow-green`
  }
  if (selected === letter) {
    return `${base} border-neon-red bg-neon-red/10 text-neon-red shadow-glow-red`
  }
  if (mode === 'retrying') {
    return `${base} border-white/10 bg-white/5 text-gray-300 hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white cursor-pointer opacity-60`
  }
  return `${base} border-white/5 bg-white/[0.02] text-gray-500 opacity-50`
}

export function QuestionCard({ question, index, selectedAnswer, mode, onSelect }: QuestionCardProps) {
  const isReviewing = mode === 'reviewing'
  const isRetrying = mode === 'retrying'
  const wasWrong = selectedAnswer !== undefined && selectedAnswer !== question.correctAnswer

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.04, duration: 0.3 }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
    >
      {(question.category || question.skill) && (
        <div className="flex gap-2 mb-3">
          {question.category && (
            <span className="text-xs text-gray-500 bg-white/5 rounded px-2 py-0.5">{question.category}</span>
          )}
          {question.skill && (
            <span className="text-xs text-neon-cyan/60 bg-neon-cyan/5 rounded px-2 py-0.5">{question.skill}</span>
          )}
        </div>
      )}

      <p className="text-white font-medium mb-4 leading-relaxed">
        <span className="text-gray-500 mr-2">Q{index + 1}.</span>
        {question.question}
      </p>

      <div className="space-y-2">
        {LETTERS.map(letter => {
          const canClick =
            mode === 'answering' ||
            (isRetrying && letter !== question.correctAnswer && !(wasWrong && letter === selectedAnswer))

          return (
            <button
              key={letter}
              className={getOptionStyle(letter, question, selectedAnswer, mode)}
              onClick={() => canClick && onSelect(letter)}
              disabled={isReviewing || (isRetrying && !canClick)}
            >
              <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                {letter}
              </span>
              <span>{question.options[letter]}</span>
            </button>
          )
        })}
      </div>

      {(isReviewing || isRetrying) && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-3 overflow-hidden"
        >
          <p className="text-xs text-gray-400">
            <span className="text-neon-cyan font-medium">Explanation: </span>
            {question.explanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
