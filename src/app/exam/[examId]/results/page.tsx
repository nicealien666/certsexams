import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamResultsLoader } from '@/components/ExamResultsLoader'

export default async function ResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  let exam
  try {
    exam = await loadExam(examId)
  } catch {
    notFound()
  }

  return <ExamResultsLoader examId={exam.id} examDisplayName={exam.displayName} />
}
