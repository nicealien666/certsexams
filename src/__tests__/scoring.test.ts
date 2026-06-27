import { checkAnswer, scoreAnswers, aggregateByCategory } from '@/lib/scoring'
import type { Question } from '@/types/exam'

const makeQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 'q1',
  question: 'Test question?',
  options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
  correctAnswer: 'A',
  ...overrides,
})

describe('checkAnswer', () => {
  it('returns true when selected answer matches correctAnswer', () => {
    expect(checkAnswer(makeQuestion({ correctAnswer: 'B' }), 'B')).toBe(true)
  })

  it('returns false when selected answer does not match', () => {
    expect(checkAnswer(makeQuestion({ correctAnswer: 'A' }), 'C')).toBe(false)
  })
})

describe('scoreAnswers', () => {
  const questions = [
    makeQuestion({ id: 'q1', correctAnswer: 'A' }),
    makeQuestion({ id: 'q2', correctAnswer: 'B' }),
    makeQuestion({ id: 'q3', correctAnswer: 'C' }),
  ]

  it('returns correct count and percentage', () => {
    const answers = { q1: 'A' as const, q2: 'A' as const, q3: 'C' as const }
    const result = scoreAnswers(questions, answers)
    expect(result.correct).toBe(2)
    expect(result.total).toBe(3)
    expect(result.percentage).toBe(67)
  })

  it('includes wrong question ids', () => {
    const answers = { q1: 'A' as const, q2: 'A' as const, q3: 'C' as const }
    expect(scoreAnswers(questions, answers).wrongQuestionIds).toEqual(['q2'])
  })

  it('counts unanswered questions as wrong', () => {
    const result = scoreAnswers(questions, { q1: 'A' as const })
    expect(result.correct).toBe(1)
    expect(result.wrongQuestionIds).toContain('q2')
    expect(result.wrongQuestionIds).toContain('q3')
  })

  it('returns 100% when all correct', () => {
    const answers = { q1: 'A' as const, q2: 'B' as const, q3: 'C' as const }
    expect(scoreAnswers(questions, answers).percentage).toBe(100)
  })
})

describe('aggregateByCategory', () => {
  const questions = [
    makeQuestion({ id: 'q1', category: 'Git', correctAnswer: 'A' }),
    makeQuestion({ id: 'q2', category: 'Git', correctAnswer: 'B' }),
    makeQuestion({ id: 'q3', category: 'GitHub', correctAnswer: 'C' }),
  ]

  it('groups by category with correct/total counts', () => {
    const answers = { q1: 'A' as const, q2: 'A' as const, q3: 'C' as const }
    const result = aggregateByCategory(questions, answers)
    const git = result.find(r => r.category === 'Git')!
    const github = result.find(r => r.category === 'GitHub')!
    expect(git.correct).toBe(1)
    expect(git.total).toBe(2)
    expect(github.correct).toBe(1)
    expect(github.total).toBe(1)
  })

  it('labels questions without category as "Uncategorized"', () => {
    const qs = [makeQuestion({ id: 'q1', category: undefined })]
    const result = aggregateByCategory(qs, { q1: 'A' as const })
    expect(result[0].category).toBe('Uncategorized')
  })
})
