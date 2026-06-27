'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ExamMeta } from '@/types/exam'

export function ExamCard({ exam }: { exam: ExamMeta }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-neon-cyan/40 hover:shadow-glow-cyan transition-all duration-300"
    >
      <div className="mb-5 flex-1">
        <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{exam.displayName}</h3>
        <p className="text-sm text-gray-400">{exam.questionCount} questions</p>
        {exam.categories.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{exam.categories.length} categories</p>
        )}
      </div>
      <Link
        href={`/exam/${exam.id}`}
        className="block w-full text-center py-2.5 px-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
      >
        Start Exam →
      </Link>
    </motion.div>
  )
}
