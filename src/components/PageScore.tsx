'use client'

import { motion } from 'framer-motion'

interface PageScoreProps {
  correct: number
  total: number
  onRetry?: () => void
}

export function PageScore({ correct, total, onRetry }: PageScoreProps) {
  const allCorrect = correct === total
  const pct = Math.round((correct / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 flex items-center justify-between ${
        allCorrect ? 'border-neon-green/40 bg-neon-green/10' : 'border-neon-cyan/20 bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${allCorrect ? 'text-neon-green' : 'text-white'}`}>
          {correct}/{total}
        </span>
        <div>
          <p className="text-sm text-gray-400">correct on this page</p>
          <p className={`text-xs font-medium ${
            allCorrect ? 'text-neon-green' : pct >= 70 ? 'text-neon-cyan' : 'text-neon-red'
          }`}>
            {pct}% — {allCorrect ? '🎉 Perfect!' : pct >= 70 ? 'Good job!' : 'Keep practicing'}
          </p>
        </div>
      </div>
      {!allCorrect && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg border border-neon-cyan/40 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/10 transition-colors"
        >
          Retry Incorrect
        </button>
      )}
    </motion.div>
  )
}
