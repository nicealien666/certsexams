# Certification Exam Trainer — Design Spec
_Date: 2026-06-26_

## Overview

A modern, animated certification exam practice web app built with Next.js 14 App Router + TypeScript. Users select an exam CSV, optionally filter by category/skill, answer questions 10 at a time, get immediate feedback, retry wrong answers, and see a final score with per-category breakdown. Deployed to Vercel from a new GitHub repository.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| CSV parsing | papaparse |
| Hosting | Vercel (linked to new GitHub repo via `gh` CLI) |

---

## CSV Format

The parser auto-detects and supports two column layouts:

**Full format (existing exam file):**
```
Category, Skill, Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation
```

**Simple format (spec default):**
```
Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer[, Explanation]
```

- `CorrectAnswer` values: `A`, `B`, `C`, `D` (or full option text — mapped to letter)
- `Explanation` is optional; shown after submission if present
- Quoted fields with internal commas are handled correctly by papaparse
- Missing `Category`/`Skill` columns: questions treated as uncategorized, filter UI is hidden

**Error handling:**
- No CSVs found → friendly empty-state on landing page
- Empty CSV / missing required columns → error shown on setup page
- Invalid `CorrectAnswer` value → question skipped with a warning logged

---

## Routes

```
/                              Landing page — exam card grid
/exam/[examId]                 Setup page — category/skill filter + Start Exam
/exam/[examId]/session         Active exam — 10 questions per page
/exam/[examId]/results         Final results — score, pass/fail, category breakdown
```

`examId` is the CSV filename slug (e.g. `github-foundations-certification-exam-jan-2026`).

---

## Data Layer

### `lib/csvParser.ts`
- Wraps papaparse with `header: true`, `skipEmptyLines: true`
- Normalizes column names (trims whitespace, handles case variations)
- Returns typed `Question[]`
- Exported: `parseCSV(content: string): Question[]`

### `lib/exams.ts`
- Runs server-side only (imported exclusively from Server Components and Route Handlers — never from Client Components)
- `listExams(): ExamMeta[]` — scans `/data/exams/*.csv`, returns id + display name + question count
- `loadExam(id: string): Exam` — reads and parses a single CSV; throws `ExamNotFoundError` if id doesn't match any file
- `examId` is the CSV filename with extension stripped and lowercased, e.g. `github-foundations-certification-exam-jan-2026`
- Display name derived from filename: hyphens → spaces, title-cased: `github-fundamentals.csv` → `"Github Fundamentals"`
- Caches with `cache()` from React to avoid re-reading on the same request

### `lib/scoring.ts`
- `checkAnswer(question: Question, selected: string): boolean`
- `scoreAnswers(questions: Question[], answers: Record<string, string>): ScoreResult`
- `aggregateByCategory(questions: Question[], answers: Record<string, string>): CategoryScore[]`

---

## State Management

### `context/ExamSessionContext.tsx`
Client-side React Context with `sessionStorage` persistence.

Tracks:
```ts
{
  examId: string
  filteredQuestions: Question[]       // questions after category/skill filter
  currentPage: number                 // 0-indexed, 10 questions per page
  answers: Record<string, string>     // questionId → selected option letter
  submitted: Record<number, boolean>  // page index → has been submitted
  pageMode: Record<number, 'answering' | 'reviewing' | 'retrying'>
}
```

Syncs to `sessionStorage` on every state change. Rehydrates on mount to survive refresh.

---

## Page-by-Page Design

### Landing Page (`/`)
- Server Component — calls `listExams()`
- `AnimatedBackground` fills the viewport (dark grid/circuit CSS pattern)
- Header: app title + tagline
- Grid of `ExamCard` components — stagger entrance animation
- If no CSVs: centered empty-state message with instructions

### `ExamCard.tsx`
- Dark glass card (`bg-white/5 backdrop-blur border border-white/10`)
- Shows: exam name, question count, category count (if available)
- Cyan glow border on hover (Framer Motion `whileHover`)
- "Start Exam" button navigates to `/exam/[examId]`

### Setup Page (`/exam/[examId]`)
- Server Component — calls `loadExam(id)`
- If CSV has Category/Skill columns: renders `CategoryFilter` (client component)
- If no Category/Skill columns: filter UI hidden, "Start Exam" goes straight in
- "Start Exam" encodes selected skills as URL search param (comma-separated):
  `?skills=Version+control+fundamentals,Working+with+GitHub`
- No skills selected = all questions included (full exam)

### `CategoryFilter.tsx`
- Grouped checkboxes: outer group = Category, inner = Skills within that category
- "Select All / Deselect All" toggle per category
- Shows question count per skill
- Live preview: "X questions selected"

### Active Exam Page (`/exam/[examId]/session`)
- Client Component — reads `searchParams`, initializes `ExamSessionContext`
- Shows current page of 10 questions
- Header: exam name, "Questions 11–20 of 73", animated `ProgressBar`
- Each question rendered in a `QuestionCard`
- "Submit" button disabled until all 10 on current page have a selection

#### `QuestionCard.tsx`
States:
- **Answering:** 4 clickable option buttons, radio-style selection (selected = cyan outline + glow)
- **Reviewing (correct):** selected option locked green with glow, others dimmed
- **Reviewing (wrong):** selected option locked red, correct option highlighted green, others dimmed
- Explanation shown below options after submission (if present in CSV)

#### Submit Flow
1. User clicks Submit → answers validated for current page
2. `PageScore` banner slides in: "7 / 10 correct"
3. All questions enter reviewing state
4. If all 10 correct → `Confetti` burst
5. If any wrong → "Retry Incorrect Answers" button appears

#### Retry Flow
1. "Retry Incorrect Answers" → wrong questions unlock (enter answering state), correct stay locked
2. "Resubmit" validates again, updates colors, updates page score
3. Can retry unlimited times

#### Navigation (post-submit)
- Previous — go to previous page (answers preserved)
- Next 10 Questions — go to next page
- Restart Exam — clears session, returns to `/exam/[examId]`
- On last page: "Next" replaced by "See Results" → navigates to `/exam/[examId]/results`

### Results Page (`/exam/[examId]/results`)
- Client Component — reads full answer state from `ExamSessionContext`
- **Score card:** total correct / total questions, percentage, Pass (≥70%) or Fail badge
- **Category breakdown table:** per-category rows showing X/Y correct + mini progress bar
- **Mistake review:** expandable accordion — each wrong answer shows question, your answer (red), correct answer (green), explanation
- Buttons: Restart Exam, Back to Exams

---

## Visual Design System

| Token | Value |
|---|---|
| Background | `#0a0a0f` |
| Surface | `rgba(255,255,255,0.05)` (glass) |
| Border | `rgba(255,255,255,0.1)` |
| Accent (cyan) | `#00e5ff` |
| Correct (green) | `#00ff88` |
| Wrong (red) | `#ff3b5c` |
| Text primary | `#f0f0f0` |
| Text muted | `#6b7280` |

Background pattern: subtle CSS grid lines (`#ffffff08`) on `#0a0a0f` — no JS, pure CSS.

Glow effect: `box-shadow: 0 0 20px <color>40` on hover/active states.

Animations (Framer Motion):
- Page transitions: fade + slight upward slide
- Card grid: stagger entrance (0.05s delay per card)
- Option select: quick scale pulse
- Submit banner: slide in from top
- Confetti: `canvas-confetti` npm package, burst on 10/10

---

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          ← landing
│   │   └── exam/
│   │       └── [examId]/
│   │           ├── page.tsx                  ← setup + filter
│   │           ├── session/
│   │           │   └── page.tsx              ← active exam
│   │           └── results/
│   │               └── page.tsx              ← final results
│   ├── components/
│   │   ├── AnimatedBackground.tsx
│   │   ├── ExamCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── PageScore.tsx
│   │   ├── FinalResults.tsx
│   │   ├── MistakeReview.tsx
│   │   └── Confetti.tsx
│   ├── context/
│   │   └── ExamSessionContext.tsx
│   ├── lib/
│   │   ├── csvParser.ts
│   │   ├── exams.ts
│   │   └── scoring.ts
│   └── types/
│       └── exam.ts
├── data/
│   └── exams/
│       ├── github-foundations-certification-exam-jan-2026.csv
│       └── sample-exam.csv
├── public/
├── docs/
│   └── superpowers/specs/
│       └── 2026-06-26-cert-exam-trainer-design.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Deployment

1. `npx create-next-app` scaffolds the project in `/C:/Projects/Claude/CertsExams`
2. `gh repo create` creates new GitHub repo and pushes initial commit
3. Vercel CLI (`vercel --prod`) links and deploys
4. No environment variables required — all data is local CSV files

---

## Pass/Fail Threshold

≥70% correct = Pass. Displayed on results page with color-coded badge (green = pass, red = fail).

---

## Sample CSV

A `sample-exam.csv` with 20 questions will be created (uses simple 6-column format without Category/Skill) to test pagination and verify the parser's column auto-detection.

---

## Out of Scope

- User accounts / authentication
- Server-side answer persistence (database)
- Timed exams
- Randomized question order (questions shown in CSV order)
