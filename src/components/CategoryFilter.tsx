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
