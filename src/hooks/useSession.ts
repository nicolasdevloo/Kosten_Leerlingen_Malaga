import { useMemo } from 'react'
import { useStore } from '@/data/store'
import type { Stage, Student } from '@/types'

export function useSession(): { student: Student | null; stage: Stage | null } {
  const sessionToken = useStore((s) => s.sessionToken)
  const students = useStore((s) => s.students)
  const stages = useStore((s) => s.stages)

  return useMemo(() => {
    if (!sessionToken) return { student: null, stage: null }
    const student = Object.values(students).find((s) => s.token === sessionToken) ?? null
    const stage = student ? stages[student.stageId] ?? null : null
    return { student, stage }
  }, [sessionToken, students, stages])
}
