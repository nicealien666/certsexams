'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { scoreAnswers, aggregateByCategory } from '@/lib/scoring'
import { FinalResults } from './FinalResults'
import type { ExamSessionState, AnswerLetter } from '@/types/exam'

export function ExamResultsLoader({
  examId,
  examDisplayName,
}: {
  examId: string
  examDisplayName: string
}) {
  const router = useRouter()
  const [session, setSession] = useState<ExamSessionState | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`exam-session-${examId}`)
      if (raw) {
        setSession(JSON.parse(raw) as ExamSessionState)
      } else {
        router.replace(`/exam/${examId}`)
      }
    } catch {
      router.replace(`/exam/${examId}`)
    }
  }, [examId, router])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading results...</p>
      </div>
    )
  }

  const { filteredQuestions, answers } = session
  const typedAnswers = answers as Record<string, AnswerLetter>
  const scoreResult = scoreAnswers(filteredQuestions, typedAnswers)
  const categoryScores = aggregateByCategory(filteredQuestions, typedAnswers)

  const handleRestart = () => {
    sessionStorage.removeItem(`exam-session-${examId}`)
    router.push(`/exam/${examId}`)
  }

  const handleBackToExams = () => {
    sessionStorage.removeItem(`exam-session-${examId}`)
    router.push('/')
  }

  return (
    <FinalResults
      examDisplayName={examDisplayName}
      questions={filteredQuestions}
      answers={typedAnswers}
      totalCorrect={scoreResult.correct}
      totalQuestions={scoreResult.total}
      percentage={scoreResult.percentage}
      categoryScores={categoryScores}
      wrongQuestionIds={scoreResult.wrongQuestionIds}
      onRestart={handleRestart}
      onBackToExams={handleBackToExams}
    />
  )
}
