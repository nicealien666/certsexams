export type AnswerLetter = 'A' | 'B' | 'C' | 'D'
export type PageMode = 'answering' | 'reviewing' | 'retrying'

export interface Question {
  id: string
  category?: string
  skill?: string
  question: string
  options: Record<AnswerLetter, string>
  correctAnswer: AnswerLetter
  explanation?: string
}

export interface ExamMeta {
  id: string
  displayName: string
  questionCount: number
  categories: string[]
}

export interface Exam extends ExamMeta {
  questions: Question[]
}

export interface ScoreResult {
  correct: number
  total: number
  percentage: number
  wrongQuestionIds: string[]
}

export interface CategoryScore {
  category: string
  correct: number
  total: number
}

export interface ExamSessionState {
  examId: string
  filteredQuestions: Question[]
  currentPage: number
  answers: Record<string, AnswerLetter>
  submitted: Record<number, boolean>
  pageMode: Record<number, PageMode>
}
