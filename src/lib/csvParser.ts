import Papa from 'papaparse'
import type { Question, AnswerLetter } from '@/types/exam'

type RawRow = Record<string, string>

function normalizeAnswer(value: string | undefined, row: RawRow): AnswerLetter | null {
  if (!value) return null
  const upper = value.trim().toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(upper)) return upper as AnswerLetter

  // Match full option text to letter
  const letters: AnswerLetter[] = ['A', 'B', 'C', 'D']
  for (const letter of letters) {
    if (row[`Option${letter}`]?.trim() === value.trim()) return letter
  }
  return null
}

export function parseCSV(content: string, examId: string): Question[] {
  if (!content.trim()) return []

  const result = Papa.parse<RawRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const hasCategory = result.meta.fields?.includes('Category') ?? false

  return result.data
    .map((row, index): Question | null => {
      const correctAnswer = normalizeAnswer(row.CorrectAnswer, row)
      if (!correctAnswer) {
        console.warn(`[csvParser] Q${index + 1} skipped: invalid CorrectAnswer "${row.CorrectAnswer}"`)
        return null
      }

      const question = row.Question?.trim()
      if (!question) return null

      return {
        id: `${examId}-${index}`,
        category: hasCategory ? row.Category?.trim() || undefined : undefined,
        skill: hasCategory ? row.Skill?.trim() || undefined : undefined,
        question,
        options: {
          A: row.OptionA?.trim() ?? '',
          B: row.OptionB?.trim() ?? '',
          C: row.OptionC?.trim() ?? '',
          D: row.OptionD?.trim() ?? '',
        },
        correctAnswer,
        explanation: row.Explanation?.trim() || undefined,
      }
    })
    .filter((q): q is Question => q !== null)
}
