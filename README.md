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
