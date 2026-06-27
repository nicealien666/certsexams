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
