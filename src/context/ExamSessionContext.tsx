'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Question, AnswerLetter, PageMode, ExamSessionState } from '@/types/exam'

const QUESTIONS_PER_PAGE = 10

interface ExamSessionContextValue extends ExamSessionState {
  setAnswer: (questionId: string, answer: AnswerLetter) => void
  submitPage: (pageIndex: number) => void
  setPageMode: (pageIndex: number, mode: PageMode) => void
  goToPage: (pageIndex: number) => void
  resetSession: () => void
  totalPages: number
  questionsPerPage: number
  getPageQuestions: (pageIndex: number) => Question[]
}

const ExamSessionContext = createContext<ExamSessionContextValue | null>(null)

function makeInitialState(examId: string, filteredQuestions: Question[]): ExamSessionState {
  return { examId, filteredQuestions, currentPage: 0, answers: {}, submitted: {}, pageMode: {} }
}

export function ExamSessionProvider({
  children,
  examId,
  filteredQuestions,
}: {
  children: React.ReactNode
  examId: string
  filteredQuestions: Question[]
}) {
  const storageKey = `exam-session-${examId}`

  const [state, setState] = useState<ExamSessionState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved) as ExamSessionState
          if (parsed.examId === examId && parsed.filteredQuestions.length === filteredQuestions.length) {
            return parsed
          }
        }
      } catch {}
    }
    return makeInitialState(examId, filteredQuestions)
  })

  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(state)) } catch {}
  }, [state, storageKey])

  const setAnswer = useCallback((questionId: string, answer: AnswerLetter) => {
    setState(prev => ({ ...prev, answers: { ...prev.answers, [questionId]: answer } }))
  }, [])

  const submitPage = useCallback((pageIndex: number) => {
    setState(prev => ({
      ...prev,
      submitted: { ...prev.submitted, [pageIndex]: true },
      pageMode: { ...prev.pageMode, [pageIndex]: 'reviewing' },
    }))
  }, [])

  const setPageMode = useCallback((pageIndex: number, mode: PageMode) => {
    setState(prev => ({ ...prev, pageMode: { ...prev.pageMode, [pageIndex]: mode } }))
  }, [])

  const goToPage = useCallback((pageIndex: number) => {
    setState(prev => ({ ...prev, currentPage: pageIndex }))
  }, [])

  const resetSession = useCallback(() => {
    try { sessionStorage.removeItem(storageKey) } catch {}
    setState(makeInitialState(examId, filteredQuestions))
  }, [examId, filteredQuestions, storageKey])

  const getPageQuestions = useCallback((pageIndex: number) => {
    const start = pageIndex * QUESTIONS_PER_PAGE
    return filteredQuestions.slice(start, start + QUESTIONS_PER_PAGE)
  }, [filteredQuestions])

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE)

  return (
    <ExamSessionContext.Provider value={{
      ...state,
      setAnswer, submitPage, setPageMode, goToPage, resetSession,
      totalPages, questionsPerPage: QUESTIONS_PER_PAGE, getPageQuestions,
    }}>
      {children}
    </ExamSessionContext.Provider>
  )
}

export function useExamSession(): ExamSessionContextValue {
  const ctx = useContext(ExamSessionContext)
  if (!ctx) throw new Error('useExamSession must be used within ExamSessionProvider')
  return ctx
}
