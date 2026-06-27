'use client'

import { motion } from 'framer-motion'
import { ExamCard } from './ExamCard'
import type { ExamMeta } from '@/types/exam'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function ExamGrid({ exams }: { exams: ExamMeta[] }) {
  if (exams.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-2">No exam files found</p>
        <p className="text-gray-500 text-sm">
          Add CSV files to <code className="text-neon-cyan">/data/exams/</code> to get started
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {exams.map(exam => (
        <motion.div key={exam.id} variants={item}>
          <ExamCard exam={exam} />
        </motion.div>
      ))}
    </motion.div>
  )
}
