# Certification Exam Trainer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js 14 certification exam trainer that reads CSVs from `/data/exams/`, supports category/skill filtering, and deploys to Vercel from a new GitHub repo.

**Architecture:** Next.js 14 App Router with Server Components loading CSVs via `fs`, passing parsed questions to Client Components for interactive exam state. Exam session state lives in React Context + `sessionStorage`. Results page reads `sessionStorage` directly.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, papaparse, canvas-confetti, Jest

---

## File Map

| File | Responsibility |
|---|---|
| `src/types/exam.ts` | All domain types |
| `src/lib/csvParser.ts` | Parse CSV content → `Question[]` |
| `src/lib/exams.ts` | fs scan + parse, server-only |
| `src/lib/scoring.ts` | Answer checking + category aggregation |
| `src/context/ExamSessionContext.tsx` | Client state + sessionStorage sync |
| `src/components/AnimatedBackground.tsx` | Dark grid background |
| `src/components/ExamCard.tsx` | Landing page card (client) |
| `src/components/ExamGrid.tsx` | Stagger-animated card grid (client) |
| `src/components/CategoryFilter.tsx` | Category/skill checkbox filter (client) |
| `src/components/ExamSetup.tsx` | Setup page interactive shell (client) |
| `src/components/QuestionCard.tsx` | Single question with answer states (client) |
| `src/components/ProgressBar.tsx` | Animated progress bar (client) |
| `src/components/PageScore.tsx` | Per-page score banner (client) |
| `src/components/Confetti.tsx` | canvas-confetti burst (client) |
| `src/components/ExamSession.tsx` | Full exam session UI (client) |
| `src/components/MistakeReview.tsx` | Expandable wrong-answer list (client) |
| `src/components/FinalResults.tsx` | Results layout (client) |
| `src/components/ExamResultsLoader.tsx` | Reads sessionStorage, renders FinalResults (client) |
| `src/app/page.tsx` | Landing — Server Component |
| `src/app/exam/[examId]/page.tsx` | Setup — Server Component wrapper |
| `src/app/exam/[examId]/session/page.tsx` | Session — Server Component wrapper |
| `src/app/exam/[examId]/results/page.tsx` | Results — Server Component wrapper |

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: standard Next.js scaffold (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, etc.)

- [ ] **Step 1: Scaffold with create-next-app**

Run from `C:\Projects\Claude\CertsExams`:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --no-git
```
When prompted about existing directory, confirm overwrite. The existing `data/` and `docs/` directories are preserved.

Expected: scaffold created with `src/app/`, `public/`, `package.json`, `tsconfig.json`.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion papaparse canvas-confetti
npm install -D @types/papaparse @types/canvas-confetti
```

Expected: no errors.

- [ ] **Step 3: Create component directories**

```bash
mkdir -p src/components src/lib src/types src/context src/__tests__
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on `http://localhost:3000`. Visit it and see the default Next.js page. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 project with Tailwind and dependencies"
```

---

### Task 2: Configure Tailwind design tokens and global styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        'neon-cyan': '#00e5ff',
        'neon-green': '#00ff88',
        'neon-red': '#ff3b5c',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-red': '0 0 20px rgba(255, 59, 92, 0.4)',
        'glow-cyan-sm': '0 0 10px rgba(0, 229, 255, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0f;
  --cyan: #00e5ff;
  --green: #00ff88;
  --red: #ff3b5c;
}

* { box-sizing: border-box; }

body {
  background-color: var(--bg);
  color: #f0f0f0;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.3); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0, 229, 255, 0.5); }
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "style: configure dark/tech design tokens and global styles"
```

---

### Task 3: Set up Jest testing

**Files:**
- Create: `jest.config.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Install Jest dependencies**

```bash
npm install -D jest jest-environment-node ts-jest @types/jest
```

- [ ] **Step 2: Create jest.config.ts**

```ts
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
}

export default config
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json` `scripts` object, add:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Verify Jest works**

Create `src/__tests__/smoke.test.ts`:
```ts
test('jest is configured', () => {
  expect(1 + 1).toBe(2)
})
```

Run: `npm test`
Expected: `PASS src/__tests__/smoke.test.ts`

Delete `src/__tests__/smoke.test.ts` after confirming it passes.

- [ ] **Step 5: Commit**

```bash
git add jest.config.ts package.json
git commit -m "chore: add Jest testing setup"
```

---

### Task 4: Define TypeScript types

**Files:**
- Create: `src/types/exam.ts`

- [ ] **Step 1: Create src/types/exam.ts**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/exam.ts
git commit -m "feat: add TypeScript types for exam domain"
```

---

### Task 5: CSV Parser (TDD)

**Files:**
- Create: `src/__tests__/csvParser.test.ts`
- Create: `src/lib/csvParser.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/csvParser.test.ts`:
```ts
import { parseCSV } from '@/lib/csvParser'

describe('parseCSV', () => {
  describe('full format (Category + Skill columns)', () => {
    const csv = `Category,Skill,Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation
Version Control,Basics,"What is Git?",A VCS,A database,A browser,A server,A,"Git is a VCS."
Version Control,Advanced,"What is a branch?",A pointer,A file,A user,A server,B,`

    it('parses questions with correct structure', () => {
      const questions = parseCSV(csv, 'test-exam')
      expect(questions).toHaveLength(2)
      expect(questions[0]).toMatchObject({
        id: 'test-exam-0',
        category: 'Version Control',
        skill: 'Basics',
        question: 'What is Git?',
        options: { A: 'A VCS', B: 'A database', C: 'A browser', D: 'A server' },
        correctAnswer: 'A',
        explanation: 'Git is a VCS.',
      })
    })

    it('sets explanation to undefined when empty', () => {
      const questions = parseCSV(csv, 'test-exam')
      expect(questions[1].explanation).toBeUndefined()
    })

    it('assigns sequential ids with examId prefix', () => {
      const questions = parseCSV(csv, 'my-exam')
      expect(questions[0].id).toBe('my-exam-0')
      expect(questions[1].id).toBe('my-exam-1')
    })
  })

  describe('simple format (no Category/Skill)', () => {
    const csv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer
"What does CPU stand for?","Central Processing Unit","Computer Personal","Central Power","Control Process",A`

    it('parses without category and skill', () => {
      const questions = parseCSV(csv, 'simple')
      expect(questions).toHaveLength(1)
      expect(questions[0].category).toBeUndefined()
      expect(questions[0].skill).toBeUndefined()
      expect(questions[0].options.A).toBe('Central Processing Unit')
    })
  })

  describe('answer normalization', () => {
    it('accepts A B C D as valid answers', () => {
      const csv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer\nQ1,Opt A,Opt B,Opt C,Opt D,B`
      const [q] = parseCSV(csv, 'test')
      expect(q.correctAnswer).toBe('B')
    })

    it('maps option text to letter when CorrectAnswer is full text', () => {
      const csv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer\nQ1,Alpha,Beta,Gamma,Delta,Beta`
      const [q] = parseCSV(csv, 'test')
      expect(q.correctAnswer).toBe('B')
    })

    it('skips questions with invalid CorrectAnswer', () => {
      const csv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer\nQ1,A,B,C,D,X\nQ2,A,B,C,D,A`
      const questions = parseCSV(csv, 'test')
      expect(questions).toHaveLength(1)
      expect(questions[0].correctAnswer).toBe('A')
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty CSV', () => {
      expect(parseCSV('', 'test')).toEqual([])
    })

    it('handles commas inside quoted fields', () => {
      const csv = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer\n"What is 1,000?","One thousand","One million","One billion","One trillion",A`
      const [q] = parseCSV(csv, 'test')
      expect(q.question).toBe('What is 1,000?')
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- csvParser
```
Expected: FAIL with `Cannot find module '@/lib/csvParser'`

- [ ] **Step 3: Implement src/lib/csvParser.ts**

```ts
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- csvParser
```
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/csvParser.ts src/__tests__/csvParser.test.ts
git commit -m "feat: add CSV parser with full and simple format support"
```

---

### Task 6: Scoring lib (TDD)

**Files:**
- Create: `src/__tests__/scoring.test.ts`
- Create: `src/lib/scoring.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/scoring.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- scoring
```
Expected: FAIL with `Cannot find module '@/lib/scoring'`

- [ ] **Step 3: Implement src/lib/scoring.ts**

```ts
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- scoring
```
Expected: PASS — all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts src/__tests__/scoring.test.ts
git commit -m "feat: add scoring utilities with category aggregation"
```

---

### Task 7: Exams lib (server-side CSV loader)

**Files:**
- Create: `src/lib/exams.ts`

This file uses Node.js `fs`. Import it only from Server Components or Route Handlers — never from Client Components.

- [ ] **Step 1: Create src/lib/exams.ts**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/exams.ts
git commit -m "feat: add server-side exam loader with fs and React cache"
```

---

### Task 8: ExamSessionContext

**Files:**
- Create: `src/context/ExamSessionContext.tsx`

- [ ] **Step 1: Create src/context/ExamSessionContext.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ExamSessionContext.tsx
git commit -m "feat: add exam session context with sessionStorage persistence"
```

---

### Task 9: AnimatedBackground and root layout

**Files:**
- Create: `src/components/AnimatedBackground.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create AnimatedBackground**

Create `src/components/AnimatedBackground.tsx`:
```tsx
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,255,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Update src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AnimatedBackground } from '@/components/AnimatedBackground'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CertExam Trainer',
  description: 'Practice certification exams with instant feedback',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AnimatedBackground.tsx src/app/layout.tsx
git commit -m "feat: add animated dark background and root layout"
```

---

### Task 10: Landing page (ExamCard, ExamGrid, page.tsx)

**Files:**
- Create: `src/components/ExamCard.tsx`
- Create: `src/components/ExamGrid.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create ExamCard**

Create `src/components/ExamCard.tsx`:
```tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ExamMeta } from '@/types/exam'

export function ExamCard({ exam }: { exam: ExamMeta }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-neon-cyan/40 hover:shadow-glow-cyan transition-all duration-300"
    >
      <div className="mb-5 flex-1">
        <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{exam.displayName}</h3>
        <p className="text-sm text-gray-400">{exam.questionCount} questions</p>
        {exam.categories.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{exam.categories.length} categories</p>
        )}
      </div>
      <Link
        href={`/exam/${exam.id}`}
        className="block w-full text-center py-2.5 px-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
      >
        Start Exam →
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create ExamGrid**

Create `src/components/ExamGrid.tsx`:
```tsx
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
```

- [ ] **Step 3: Update src/app/page.tsx**

```tsx
import { listExams } from '@/lib/exams'
import { ExamGrid } from '@/components/ExamGrid'

export default async function HomePage() {
  const exams = await listExams()

  return (
    <main className="min-h-screen px-4 py-16 max-w-6xl mx-auto">
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1.5 text-xs text-neon-cyan mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          Certification Exam Trainer
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Master Your <span className="text-neon-cyan">Certification</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Practice with real exam questions, get instant feedback, and track your progress by category.
        </p>
      </div>
      <ExamGrid exams={exams} />
    </main>
  )
}
```

- [ ] **Step 4: Verify landing page**

Run `npm run dev` and visit `http://localhost:3000`. Confirm:
- Dark background with cyan grid
- GitHub Foundations exam card appears
- Hover effect scales the card and adds cyan glow

Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExamCard.tsx src/components/ExamGrid.tsx src/app/page.tsx
git commit -m "feat: add landing page with animated exam cards"
```

---

### Task 11: CategoryFilter component

**Files:**
- Create: `src/components/CategoryFilter.tsx`

- [ ] **Step 1: Create CategoryFilter**

Create `src/components/CategoryFilter.tsx`:
```tsx
'use client'

import { useState, useMemo } from 'react'
import type { Question } from '@/types/exam'

interface CategoryFilterProps {
  questions: Question[]
  onFilterChange: (selectedSkills: string[]) => void
}

function groupByCategory(questions: Question[]) {
  const map = new Map<string, Map<string, number>>()
  for (const q of questions) {
    const cat = q.category ?? 'Uncategorized'
    const skill = q.skill ?? 'General'
    if (!map.has(cat)) map.set(cat, new Map())
    const skillMap = map.get(cat)!
    skillMap.set(skill, (skillMap.get(skill) ?? 0) + 1)
  }
  return map
}

export function CategoryFilter({ questions, onFilterChange }: CategoryFilterProps) {
  const grouped = useMemo(() => groupByCategory(questions), [questions])

  const allSkills = useMemo(() => {
    const skills: string[] = []
    grouped.forEach(skillMap => skillMap.forEach((_, s) => skills.push(s)))
    return skills
  }, [grouped])

  const [selected, setSelected] = useState<Set<string>>(new Set(allSkills))

  const toggle = (skill: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(skill) ? next.delete(skill) : next.add(skill)
      onFilterChange([...next])
      return next
    })
  }

  const toggleCategory = (skills: string[]) => {
    setSelected(prev => {
      const next = new Set(prev)
      const allSelected = skills.every(s => next.has(s))
      skills.forEach(s => allSelected ? next.delete(s) : next.add(s))
      onFilterChange([...next])
      return next
    })
  }

  const selectedCount = useMemo(
    () => questions.filter(q => selected.has(q.skill ?? 'General')).length,
    [questions, selected]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">Filter by Category &amp; Skill</h3>
        <span className="text-xs text-neon-cyan">{selectedCount} questions selected</span>
      </div>

      {Array.from(grouped.entries()).map(([category, skillMap]) => {
        const skillList = [...skillMap.keys()]
        const allCatSelected = skillList.every(s => selected.has(s))

        return (
          <div key={category} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">{category}</span>
              <button
                onClick={() => toggleCategory(skillList)}
                className="text-xs text-neon-cyan hover:text-white transition-colors"
              >
                {allCatSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-2">
              {skillList.map(skill => (
                <label key={skill} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggle(skill)}>
                  <div
                    className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      selected.has(skill)
                        ? 'bg-neon-cyan border-neon-cyan'
                        : 'border-white/20 group-hover:border-neon-cyan/50'
                    }`}
                  >
                    {selected.has(skill) && (
                      <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">{skill}</span>
                  <span className="text-xs text-gray-500">{skillMap.get(skill)}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CategoryFilter.tsx
git commit -m "feat: add category/skill filter component"
```

---

### Task 12: Setup page

**Files:**
- Create: `src/app/exam/[examId]/page.tsx`
- Create: `src/components/ExamSetup.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p "src/app/exam/[examId]"
```

- [ ] **Step 2: Create src/components/ExamSetup.tsx**

```tsx
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
```

- [ ] **Step 3: Create src/app/exam/[examId]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamSetup } from '@/components/ExamSetup'

export default async function ExamSetupPage({ params }: { params: { examId: string } }) {
  let exam
  try {
    exam = await loadExam(params.examId)
  } catch {
    notFound()
  }

  return <ExamSetup exam={exam} />
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/exam/[examId]/page.tsx" src/components/ExamSetup.tsx
git commit -m "feat: add exam setup page with category/skill filter"
```

---

### Task 13: QuestionCard component

**Files:**
- Create: `src/components/QuestionCard.tsx`

- [ ] **Step 1: Create src/components/QuestionCard.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'
import type { Question, AnswerLetter, PageMode } from '@/types/exam'

const LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D']

interface QuestionCardProps {
  question: Question
  index: number
  selectedAnswer?: AnswerLetter
  mode: PageMode
  onSelect: (letter: AnswerLetter) => void
}

function getOptionStyle(
  letter: AnswerLetter,
  question: Question,
  selected: AnswerLetter | undefined,
  mode: PageMode
): string {
  const base =
    'flex items-start gap-3 w-full rounded-lg border px-4 py-3 text-sm text-left transition-all duration-200'

  if (mode === 'answering') {
    return selected === letter
      ? `${base} border-neon-cyan bg-neon-cyan/10 text-white shadow-glow-cyan-sm`
      : `${base} border-white/10 bg-white/5 text-gray-300 hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white cursor-pointer`
  }

  if (letter === question.correctAnswer) {
    return `${base} border-neon-green bg-neon-green/10 text-neon-green shadow-glow-green`
  }
  if (selected === letter) {
    return `${base} border-neon-red bg-neon-red/10 text-neon-red shadow-glow-red`
  }
  if (mode === 'retrying') {
    return `${base} border-white/10 bg-white/5 text-gray-300 hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white cursor-pointer opacity-60`
  }
  return `${base} border-white/5 bg-white/[0.02] text-gray-500 opacity-50`
}

export function QuestionCard({ question, index, selectedAnswer, mode, onSelect }: QuestionCardProps) {
  const isReviewing = mode === 'reviewing'
  const isRetrying = mode === 'retrying'
  const wasWrong = selectedAnswer !== undefined && selectedAnswer !== question.correctAnswer

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 10) * 0.04, duration: 0.3 }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
    >
      {(question.category || question.skill) && (
        <div className="flex gap-2 mb-3">
          {question.category && (
            <span className="text-xs text-gray-500 bg-white/5 rounded px-2 py-0.5">{question.category}</span>
          )}
          {question.skill && (
            <span className="text-xs text-neon-cyan/60 bg-neon-cyan/5 rounded px-2 py-0.5">{question.skill}</span>
          )}
        </div>
      )}

      <p className="text-white font-medium mb-4 leading-relaxed">
        <span className="text-gray-500 mr-2">Q{index + 1}.</span>
        {question.question}
      </p>

      <div className="space-y-2">
        {LETTERS.map(letter => {
          const canClick =
            mode === 'answering' ||
            (isRetrying && letter !== question.correctAnswer && !(wasWrong && letter === selectedAnswer))

          return (
            <button
              key={letter}
              className={getOptionStyle(letter, question, selectedAnswer, mode)}
              onClick={() => canClick && onSelect(letter)}
              disabled={isReviewing || (isRetrying && !canClick)}
            >
              <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                {letter}
              </span>
              <span>{question.options[letter]}</span>
            </button>
          )
        })}
      </div>

      {(isReviewing || isRetrying) && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-3 overflow-hidden"
        >
          <p className="text-xs text-gray-400">
            <span className="text-neon-cyan font-medium">Explanation: </span>
            {question.explanation}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QuestionCard.tsx
git commit -m "feat: add QuestionCard with answering/reviewing/retrying states"
```

---

### Task 14: ProgressBar and PageScore components

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/PageScore.tsx`

- [ ] **Step 1: Create src/components/ProgressBar.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-gray-400">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-cyan-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px rgba(0, 229, 255, 0.6)' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/PageScore.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'

interface PageScoreProps {
  correct: number
  total: number
  onRetry?: () => void
}

export function PageScore({ correct, total, onRetry }: PageScoreProps) {
  const allCorrect = correct === total
  const pct = Math.round((correct / total) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 flex items-center justify-between ${
        allCorrect ? 'border-neon-green/40 bg-neon-green/10' : 'border-neon-cyan/20 bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${allCorrect ? 'text-neon-green' : 'text-white'}`}>
          {correct}/{total}
        </span>
        <div>
          <p className="text-sm text-gray-400">correct on this page</p>
          <p className={`text-xs font-medium ${
            allCorrect ? 'text-neon-green' : pct >= 70 ? 'text-neon-cyan' : 'text-neon-red'
          }`}>
            {pct}% — {allCorrect ? '🎉 Perfect!' : pct >= 70 ? 'Good job!' : 'Keep practicing'}
          </p>
        </div>
      </div>
      {!allCorrect && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg border border-neon-cyan/40 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/10 transition-colors"
        >
          Retry Incorrect
        </button>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressBar.tsx src/components/PageScore.tsx
git commit -m "feat: add ProgressBar and PageScore components"
```

---

### Task 15: Confetti component

**Files:**
- Create: `src/components/Confetti.tsx`

- [ ] **Step 1: Create src/components/Confetti.tsx**

```tsx
'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function Confetti({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return

    const end = Date.now() + 1500
    const colors = ['#00e5ff', '#00ff88', '#ffffff']

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }

    frame()
  }, [trigger])

  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Confetti.tsx
git commit -m "feat: add confetti animation for perfect page scores"
```

---

### Task 16: Active exam page

**Files:**
- Create: `src/app/exam/[examId]/session/page.tsx`
- Create: `src/components/ExamSession.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p "src/app/exam/[examId]/session"
```

- [ ] **Step 2: Create src/app/exam/[examId]/session/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamSession } from '@/components/ExamSession'

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: { examId: string }
  searchParams: { skills?: string }
}) {
  let exam
  try {
    exam = await loadExam(params.examId)
  } catch {
    notFound()
  }

  const selectedSkills = searchParams.skills
    ? searchParams.skills.split(',').map(s => s.trim())
    : null

  const filteredQuestions =
    selectedSkills && selectedSkills.length > 0
      ? exam.questions.filter(q => selectedSkills.includes(q.skill ?? 'General'))
      : exam.questions

  return (
    <ExamSession
      examId={exam.id}
      examDisplayName={exam.displayName}
      filteredQuestions={filteredQuestions}
    />
  )
}
```

- [ ] **Step 3: Create src/components/ExamSession.tsx**

```tsx
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
                ? () => setPageMode(currentPage, 'retrying')
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
          onClick={() => goToPage(currentPage - 1)}
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
              onClick={() => isLastPage ? router.push(`/exam/${examId}/results`) : goToPage(currentPage + 1)}
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
```

- [ ] **Step 4: Verify exam session flow**

Run `npm run dev`. Complete the flow:
1. Landing → click exam card
2. Setup → select a subset of skills → Start Exam
3. Answer all 10 questions → Submit
4. Confirm green/red highlights and score banner
5. Click "Retry Incorrect" → change answers → Resubmit
6. Click "Next 10 Questions" — confirm navigation works

Stop the server.

- [ ] **Step 5: Commit**

```bash
git add "src/app/exam/[examId]/session/page.tsx" src/components/ExamSession.tsx
git commit -m "feat: add active exam session page with submit/retry/navigation"
```

---

### Task 17: MistakeReview and FinalResults components

**Files:**
- Create: `src/components/MistakeReview.tsx`
- Create: `src/components/FinalResults.tsx`

- [ ] **Step 1: Create src/components/MistakeReview.tsx**

```tsx
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Question, AnswerLetter } from '@/types/exam'

interface MistakeReviewProps {
  questions: Question[]
  answers: Record<string, AnswerLetter>
  wrongIds: string[]
}

export function MistakeReview({ questions, answers, wrongIds }: MistakeReviewProps) {
  const [open, setOpen] = useState<string | null>(null)
  const wrongQuestions = questions.filter(q => wrongIds.includes(q.id))

  if (wrongQuestions.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-white mb-4">Review Mistakes ({wrongQuestions.length})</h3>
      <div className="space-y-2">
        {wrongQuestions.map((q, i) => (
          <div key={q.id} className="rounded-lg border border-neon-red/20 bg-neon-red/5 overflow-hidden">
            <button
              onClick={() => setOpen(open === q.id ? null : q.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm text-gray-300 truncate pr-4">
                <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                {q.question}
              </span>
              <span className="text-gray-400 text-xs flex-shrink-0">{open === q.id ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {open === q.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-neon-red font-medium mt-0.5 flex-shrink-0">Your answer:</span>
                      <span className="text-sm text-neon-red">
                        {answers[q.id] ? `${answers[q.id]}: ${q.options[answers[q.id]]}` : 'Not answered'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-neon-green font-medium mt-0.5 flex-shrink-0">Correct:</span>
                      <span className="text-sm text-neon-green">
                        {q.correctAnswer}: {q.options[q.correctAnswer]}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">{q.explanation}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/FinalResults.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'
import { ProgressBar } from './ProgressBar'
import { MistakeReview } from './MistakeReview'
import type { Question, AnswerLetter, CategoryScore } from '@/types/exam'

interface FinalResultsProps {
  examDisplayName: string
  questions: Question[]
  answers: Record<string, AnswerLetter>
  totalCorrect: number
  totalQuestions: number
  percentage: number
  categoryScores: CategoryScore[]
  wrongQuestionIds: string[]
  onRestart: () => void
  onBackToExams: () => void
}

export function FinalResults({
  examDisplayName,
  questions,
  answers,
  totalCorrect,
  totalQuestions,
  percentage,
  categoryScores,
  wrongQuestionIds,
  onRestart,
  onBackToExams,
}: FinalResultsProps) {
  const passed = percentage >= 70

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div
          className={`rounded-2xl border p-8 text-center mb-8 ${
            passed ? 'border-neon-green/40 bg-neon-green/5' : 'border-neon-red/30 bg-neon-red/5'
          }`}
        >
          <p className="text-gray-400 mb-2">{examDisplayName}</p>
          <div className={`text-7xl font-bold mb-2 ${passed ? 'text-neon-green' : 'text-neon-red'}`}>
            {percentage}%
          </div>
          <p className="text-gray-300 mb-4">{totalCorrect} / {totalQuestions} correct</p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            passed ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'
          }`}>
            {passed ? '✓ PASS' : '✗ FAIL'}
          </span>
          {!passed && <p className="text-xs text-gray-500 mt-3">Passing score: 70%</p>}
        </div>

        {categoryScores.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Score by Category</h3>
            <div className="space-y-4">
              {categoryScores.map(cs => (
                <div key={cs.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{cs.category}</span>
                    <span className="text-gray-400">{cs.correct}/{cs.total}</span>
                  </div>
                  <ProgressBar current={cs.correct} total={cs.total} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:bg-neon-cyan/90 transition-all hover:shadow-glow-cyan"
          >
            Restart Exam
          </button>
          <button
            onClick={onBackToExams}
            className="flex-1 py-3 rounded-lg border border-white/10 text-gray-300 text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            Back to Exams
          </button>
        </div>

        <MistakeReview questions={questions} answers={answers} wrongIds={wrongQuestionIds} />
      </motion.div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MistakeReview.tsx src/components/FinalResults.tsx
git commit -m "feat: add MistakeReview and FinalResults components"
```

---

### Task 18: Results page

**Files:**
- Create: `src/app/exam/[examId]/results/page.tsx`
- Create: `src/components/ExamResultsLoader.tsx`

- [ ] **Step 1: Create directory**

```bash
mkdir -p "src/app/exam/[examId]/results"
```

- [ ] **Step 2: Create src/components/ExamResultsLoader.tsx**

```tsx
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
```

- [ ] **Step 3: Create src/app/exam/[examId]/results/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamResultsLoader } from '@/components/ExamResultsLoader'

export default async function ResultsPage({ params }: { params: { examId: string } }) {
  let exam
  try {
    exam = await loadExam(params.examId)
  } catch {
    notFound()
  }

  return <ExamResultsLoader examId={exam.id} examDisplayName={exam.displayName} />
}
```

- [ ] **Step 4: Verify full end-to-end flow**

Run `npm run dev`. Complete the entire flow:
1. Landing → select exam → filter categories → Start
2. Answer all questions across multiple pages
3. Navigate to results — confirm score, category breakdown, mistake review
4. Click "Restart Exam" — confirm session clears and returns to setup
5. Click "Back to Exams" — confirm returns to landing

Stop the server.

- [ ] **Step 5: Commit**

```bash
git add "src/app/exam/[examId]/results/page.tsx" src/components/ExamResultsLoader.tsx
git commit -m "feat: add results page with category breakdown and mistake review"
```

---

### Task 19: Sample CSV (20 questions)

**Files:**
- Create: `data/exams/sample-exam.csv`

- [ ] **Step 1: Create data/exams/sample-exam.csv**

```csv
Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation
"What does HTML stand for?","HyperText Markup Language","High Tech Modern Language","HyperText Modern Links","High Transfer Markup Language",A,"HTML stands for HyperText Markup Language — the standard markup language for web pages."
"Which of the following is NOT a JavaScript data type?","String","Integer","Boolean","Undefined",B,"JavaScript has String, Number, Boolean, Undefined, Null, Symbol, and BigInt — but no Integer type."
"What does CSS stand for?","Computer Style Sheets","Cascading Style Sheets","Creative Style System","Content Styling Standard",B,"CSS stands for Cascading Style Sheets and is used to style HTML elements."
"Which HTTP method is used to retrieve data?","POST","DELETE","GET","PUT",C,"GET is the HTTP method for requesting and retrieving data from a server."
"What is the output of typeof null in JavaScript?","null","undefined","object","string",C,"typeof null returns 'object' — a well-known historical quirk of JavaScript."
"Which tag links an external CSS file in HTML?","<style>","<css>","<link>","<script>",C,"The <link> tag with rel=""stylesheet"" links an external CSS file."
"What does API stand for?","Application Programming Interface","Automated Program Integration","Application Process Interaction","Advanced Programming Interface",A,"API stands for Application Programming Interface."
"Which command installs packages in a Node.js project?","node install","npm install","pkg add","node add",B,"npm install (or npm i) installs packages from package.json."
"What does JSON stand for?","JavaScript Object Notation","JavaScript Output Network","Java Syntax Object Network","JavaScript Online Notation",A,"JSON stands for JavaScript Object Notation — a lightweight data interchange format."
"Which symbol is used for single-line comments in JavaScript?","//","#","--","/* */",A,"In JavaScript, // starts a single-line comment."
"What is a REST API?","A database type","An architectural style for networked applications","A JavaScript framework","A CSS layout system",B,"REST is an architectural style for networked applications using HTTP."
"Which HTML element is used for the largest heading?","<h6>","<h3>","<h1>","<heading>",C,"<h1> represents the largest heading in HTML."
"What is the purpose of the git commit command?","Delete files","Push changes to remote","Save a snapshot of changes","Merge branches",C,"git commit saves a snapshot of staged changes to the local repository."
"Which CSS property controls text size?","font-weight","text-align","font-size","text-size",C,"font-size controls the size of text in CSS."
"What does === do in JavaScript?","Assigns a value","Checks value only","Checks value and type","Checks type only",C,"=== is the strict equality operator — checks both value and type without coercion."
"Which port does HTTPS typically use?","80","21","443","8080",C,"HTTPS uses port 443 by default; HTTP uses port 80."
"What is a closure in JavaScript?","A type of loop","A function with access to its outer scope","A CSS animation","A database transaction",B,"A closure retains access to its lexical scope even when called outside of it."
"Which Git command shows the commit history?","git status","git show","git log","git diff",C,"git log displays the commit history of the current branch."
"What does npm stand for?","Node Package Manager","New Programming Module","Node Program Manager","Network Package Manager",A,"npm stands for Node Package Manager."
"What is the purpose of a .gitignore file?","Track all files","Specify files Git should ignore","Delete files from the repo","List collaborators",B,".gitignore tells Git which files and directories to exclude from version control."
```

- [ ] **Step 2: Verify it appears on landing page**

Run `npm run dev`. Visit `http://localhost:3000`. Confirm:
- Two exam cards: GitHub Foundations and Sample Exam
- Sample Exam shows 20 questions
- No category filter on Sample Exam setup page (simple format)
- Questions paginate into 2 pages of 10

Stop the server.

- [ ] **Step 3: Commit**

```bash
git add data/exams/sample-exam.csv
git commit -m "feat: add 20-question sample exam CSV for demo and pagination testing"
```

---

### Task 20: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Replace README.md**

```markdown
# CertExam Trainer

A modern, animated certification exam practice web app built with Next.js 14.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding New Exams

Drop a CSV file into `data/exams/`. The app auto-discovers all `.csv` files on next load.

**Simple format:**
```
Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer[,Explanation]
```

**Extended format (enables category/skill filtering):**
```
Category,Skill,Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer[,Explanation]
```

- `CorrectAnswer`: `A`, `B`, `C`, or `D` (or the full option text — auto-mapped)
- `Explanation`: optional; shown after the user submits
- File name → exam title: `azure-fundamentals.csv` → **Azure Fundamentals**

## How Scoring Works

- Each question is 1 point
- **Pass threshold: 70%**
- Retry incorrect answers on each page before moving to the next
- Final results show total score, percentage, pass/fail, and per-category breakdown

## Running Tests

```bash
npm test
```

## Project Structure

```
data/exams/          ← drop CSV files here
src/
  app/               ← Next.js App Router pages
  components/        ← UI components
  context/           ← ExamSessionContext (answer state + sessionStorage)
  lib/               ← csvParser, exams loader, scoring utilities
  types/             ← TypeScript types
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup, CSV format, and scoring instructions"
```

---

### Task 21: GitHub repo and Vercel deployment

Prerequisites: `gh` CLI installed and authenticated, `vercel` CLI installed.

- [ ] **Step 1: Verify gh CLI is authenticated**

```bash
gh auth status
```
Expected: `✓ Logged in to github.com as <your-username>`

If not logged in: run `gh auth login` and follow prompts.

- [ ] **Step 2: Create GitHub repo and push**

```bash
gh repo create certsexams --public --source=. --remote=origin --push
```
Expected: repository created at `https://github.com/<username>/certsexams` and all commits pushed.

- [ ] **Step 3: Verify Vercel CLI is available**

```bash
vercel --version
```
If missing: `npm install -g vercel`

- [ ] **Step 4: Log in to Vercel**

```bash
vercel login
```
Follow prompts.

- [ ] **Step 5: Deploy preview**

```bash
vercel
```
Accept defaults: new project, name `certsexams`, root directory `./`, no overrides.

Expected: preview URL printed (e.g., `https://certsexams-abc123.vercel.app`). Visit it and confirm the app loads.

- [ ] **Step 6: Promote to production**

```bash
vercel --prod
```
Expected: production URL printed. Visit it and confirm full exam flow works end-to-end.
