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
