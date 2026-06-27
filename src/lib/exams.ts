import fs from 'fs'
import path from 'path'
import { cache } from 'react'
import { parseCSV } from './csvParser'
import type { Exam, ExamMeta } from '@/types/exam'

const EXAMS_DIR = path.join(process.cwd(), 'data', 'exams')

function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const listExams = cache(async (): Promise<ExamMeta[]> => {
  let files: string[]
  try {
    files = fs.readdirSync(EXAMS_DIR).filter(f => f.endsWith('.csv'))
  } catch {
    return []
  }

  return files.map(file => {
    const id = file.replace('.csv', '')
    const content = fs.readFileSync(path.join(EXAMS_DIR, `${id}.csv`), 'utf-8')
    const questions = parseCSV(content, id)
    const categories = [...new Set(questions.map(q => q.category).filter(Boolean))] as string[]
    return { id, displayName: slugToDisplayName(id), questionCount: questions.length, categories }
  })
})

export const loadExam = cache(async (id: string): Promise<Exam> => {
  const filePath = path.join(EXAMS_DIR, `${id}.csv`)
  if (!fs.existsSync(filePath)) throw new Error(`Exam not found: ${id}`)

  const content = fs.readFileSync(filePath, 'utf-8')
  const questions = parseCSV(content, id)
  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))] as string[]

  return {
    id,
    displayName: slugToDisplayName(id),
    questionCount: questions.length,
    categories,
    questions,
  }
})
