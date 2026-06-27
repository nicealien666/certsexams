import { notFound } from 'next/navigation'
import { loadExam } from '@/lib/exams'
import { ExamSession } from '@/components/ExamSession'

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>
  searchParams: Promise<{ skills?: string }>
}) {
  const { examId } = await params
  const { skills } = await searchParams

  let exam
  try {
    exam = await loadExam(examId)
  } catch {
    notFound()
  }

  const selectedSkills = skills
    ? skills.split(',').map((s: string) => s.trim())
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
