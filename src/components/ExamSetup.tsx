'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CategoryFilter } from './CategoryFilter'
import type { Exam } from '@/types/exam'

export function ExamSetup({ exam }: { exam: Exam }) {
  const router = useRouter()
  const hasCategories = exam.questions.some(q => q.category)
  const allSkills = [...new Set(exam.questions.map(q => q.skill ?? 'General'))]
  const [selectedSkills, setSelectedSkills] = useState<string[]>(allSkills)

  const selectedCount = exam.questions.filter(q =>
    selectedSkills.includes(q.skill ?? 'General')
  ).length

  const handleStart = () => {
    if (selectedSkills.length === 0) return
    const params = hasCategories
      ? `?skills=${encodeURIComponent(selectedSkills.join(','))}`
      : ''
    router.push(`/exam/${exam.id}/session${params}`)
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-8">
          ← Back to exams
        </a>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{exam.displayName}</h1>
          <p className="text-gray-400">{exam.questionCount} questions total</p>
        </div>

        {hasCategories ? (
          <div className="mb-8">
            <CategoryFilter questions={exam.questions} onFilterChange={setSelectedSkills} />
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-gray-400 text-sm">All {exam.questionCount} questions will be included.</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          {selectedSkills.length === 0 ? (
            <p className="text-neon-red text-sm">Select at least one skill to continue.</p>
          ) : (
            <p className="text-gray-400 text-sm">
              <span className="text-white font-medium">{selectedCount}</span> questions selected
            </p>
          )}
          <button
            onClick={handleStart}
            disabled={selectedSkills.length === 0}
            className="px-6 py-3 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-glow-cyan"
          >
            Start Exam →
          </button>
        </div>
      </motion.div>
    </main>
  )
}
