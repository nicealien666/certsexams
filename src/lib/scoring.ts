import type { Question, AnswerLetter, ScoreResult, CategoryScore } from '@/types/exam'

export function checkAnswer(question: Question, selected: AnswerLetter): boolean {
  return selected === question.correctAnswer
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<string, AnswerLetter>
): ScoreResult {
  const results = questions.map(q => ({
    id: q.id,
    correct: answers[q.id] ? checkAnswer(q, answers[q.id]) : false,
  }))

  const correct = results.filter(r => r.correct).length
  const wrongQuestionIds = results.filter(r => !r.correct).map(r => r.id)

  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    wrongQuestionIds,
  }
}

export function aggregateByCategory(
  questions: Question[],
  answers: Record<string, AnswerLetter>
): CategoryScore[] {
  const map = new Map<string, { correct: number; total: number }>()

  for (const q of questions) {
    const cat = q.category ?? 'Uncategorized'
    const entry = map.get(cat) ?? { correct: 0, total: 0 }
    entry.total++
    if (answers[q.id] && checkAnswer(q, answers[q.id])) entry.correct++
    map.set(cat, entry)
  }

  return Array.from(map.entries()).map(([category, score]) => ({ category, ...score }))
}
