import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamSetup } from '@/components/ExamSetup'

export default async function ExamSetupPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params
  let exam
  try {
    exam = await loadExam(examId)
  } catch {
    notFound()
  }

  return <ExamSetup exam={exam} />
}
