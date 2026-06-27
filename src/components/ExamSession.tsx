'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExamSessionProvider, useExamSession } from '@/context/ExamSessionContext'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { PageScore } from './PageScore'
import { Confetti } from './Confetti'
import { scoreAnswers } from '@/lib/scoring'
import type { Question, AnswerLetter } from '@/types/exam'

function SessionContent({ examId, examDisplayName }: { examId: string; examDisplayName: string }) {
  const router = useRouter()
  const {
    filteredQuestions,
    currentPage,
    answers,
    submitted,
    pageMode,
    setAnswer,
    submitPage,
    setPageMode,
    retryPage,
    goToPage,
    resetSession,
    totalPages,
    getPageQuestions,
  } = useExamSession()

  const pageQuestions = getPageQuestions(currentPage)
  const mode = pageMode[currentPage] ?? 'answering'
  const isSubmitted = submitted[currentPage] ?? false
  const allAnswered = pageQuestions.every(q => answers[q.id])
  const isLastPage = currentPage === totalPages - 1

  const pageScore = isSubmitted ? scoreAnswers(pageQuestions, answers) : null
  const allCorrectOnPage = pageScore?.correct === pageQuestions.length

  const globalAnswered = filteredQuestions.filter(q => answers[q.id]).length
  const questionStart = currentPage * 10 + 1
  const questionEnd = Math.min(questionStart + pageQuestions.length - 1, filteredQuestions.length)

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
      <Confetti trigger={!!(allCorrectOnPage && isSubmitted)} />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Questions {questionStart}–{questionEnd} of {filteredQuestions.length}
            </p>
            <h1 className="text-xl font-bold text-white">{examDisplayName}</h1>
          </div>
          <button
            onClick={() => { resetSession(); router.push(`/exam/${examId}`) }}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ✕ Restart
          </button>
        </div>
        <ProgressBar current={globalAnswered} total={filteredQuestions.length} label="Overall progress" />
      </div>

      {isSubmitted && pageScore && (
        <div className="mb-6">
          <PageScore
            correct={pageScore.correct}
            total={pageScore.total}
            onRetry={
              pageScore.wrongQuestionIds.length > 0 && mode === 'reviewing'
                ? () => retryPage(currentPage, pageScore.wrongQuestionIds)
                : undefined
            }
          />
        </div>
      )}

      <div className="space-y-4 mb-8">
        {pageQuestions.map((q, i) => {
          const qMode =
            !isSubmitted
              ? 'answering'
              : mode === 'retrying' && pageScore?.wrongQuestionIds.includes(q.id)
              ? 'retrying'
              : 'reviewing'

          return (
            <QuestionCard
              key={q.id}
              question={q}
              index={questionStart - 1 + i}
              selectedAnswer={answers[q.id] as AnswerLetter | undefined}
              mode={qMode}
              onSelect={letter => setAnswer(q.id, letter)}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => { goToPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          disabled={currentPage === 0}
          className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-2">
          {!isSubmitted ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => submitPage(currentPage)}
              disabled={!allAnswered}
              className="px-6 py-2 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-glow-cyan"
            >
              Submit Answers
            </motion.button>
          ) : mode === 'retrying' ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { submitPage(currentPage); setPageMode(currentPage, 'reviewing') }}
              className="px-6 py-2 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 transition-all hover:shadow-glow-cyan"
            >
              Resubmit
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (isLastPage) { router.push(`/exam/${examId}/results`) } else { goToPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}
              className="px-6 py-2 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 transition-all hover:shadow-glow-cyan"
            >
              {isLastPage ? 'See Results →' : 'Next 10 Questions →'}
            </motion.button>
          )}
        </div>
      </div>
    </main>
  )
}

export function ExamSession({
  examId,
  examDisplayName,
  filteredQuestions,
}: {
  examId: string
  examDisplayName: string
  filteredQuestions: Question[]
}) {
  return (
    <ExamSessionProvider examId={examId} filteredQuestions={filteredQuestions}>
      <SessionContent examId={examId} examDisplayName={examDisplayName} />
    </ExamSessionProvider>
  )
}
