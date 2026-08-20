import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Bonnetje, Categorie, KlasCode, Stage, Student } from '@/types'
import { buildSeed } from '@/data/seed'
import { idbStorage } from '@/data/idbStorage'
import { generateId, generateToken } from '@/lib/token'
import { todayIso } from '@/lib/date'

interface AppState {
  stages: Record<string, Stage>
  students: Record<string, Student>
  receipts: Record<string, Bonnetje>
  /** token van de leerling die op dit toestel is aangemeld (de "sessie": geen wachtwoord, de link is de sessie). */
  sessionToken: string | null
  hydrated: boolean

  setHydrated: () => void
  confirmSession: (token: string) => void
  clearSession: () => void

  addReceipt: (studentId: string, data: Omit<Bonnetje, 'id' | 'studentId'>) => Bonnetje
  setReceiptCategory: (receiptId: string, categorie: Categorie) => void
  syncPending: (studentId: string) => void

  submitDossier: (studentId: string) => void
  reopenDossier: (studentId: string) => void
  renameStudent: (studentId: string, naam: string) => void

  updateStagePeriod: (stageId: string, startDatum: string | null, aantalDagen: number) => void
  importStudents: (stageId: string, klas: KlasCode, namen: string[]) => Student[]
  regenerateToken: (studentId: string) => string
  deleteStudent: (studentId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      stages: {},
      students: {},
      receipts: {},
      sessionToken: null,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      confirmSession: (token) => {
        const student = Object.values(get().students).find((s) => s.token === token)
        if (!student) return
        set((state) => ({
          sessionToken: token,
          students: { ...state.students, [student.id]: { ...student, linkGeopend: true } }
        }))
      },

      clearSession: () => set({ sessionToken: null }),

      addReceipt: (studentId, data) => {
        const receipt: Bonnetje = { id: generateId('receipt'), studentId, ...data }
        set((state) => ({ receipts: { ...state.receipts, [receipt.id]: receipt } }))
        return receipt
      },

      setReceiptCategory: (receiptId, categorie) => {
        set((state) => {
          const existing = state.receipts[receiptId]
          if (!existing) return state
          return { receipts: { ...state.receipts, [receiptId]: { ...existing, categorie } } }
        })
      },

      syncPending: (studentId) => {
        set((state) => {
          const receipts = { ...state.receipts }
          for (const r of Object.values(receipts)) {
            if (r.studentId === studentId && r.pending) {
              receipts[r.id] = { ...r, pending: false }
            }
          }
          return { receipts }
        })
      },

      submitDossier: (studentId) => {
        set((state) => {
          const s = state.students[studentId]
          if (!s) return state
          return { students: { ...state.students, [studentId]: { ...s, ingediend: true, heropend: false } } }
        })
      },

      reopenDossier: (studentId) => {
        set((state) => {
          const s = state.students[studentId]
          if (!s) return state
          return { students: { ...state.students, [studentId]: { ...s, ingediend: false, heropend: true } } }
        })
      },

      renameStudent: (studentId, naam) => {
        set((state) => {
          const s = state.students[studentId]
          if (!s) return state
          return { students: { ...state.students, [studentId]: { ...s, naam } } }
        })
      },

      updateStagePeriod: (stageId, startDatum, aantalDagen) => {
        set((state) => {
          const stage = state.stages[stageId]
          if (!stage) return state
          return { stages: { ...state.stages, [stageId]: { ...stage, startDatum, aantalDagen } } }
        })
      },

      importStudents: (stageId, klas, namen) => {
        const created: Student[] = namen
          .map((n) => n.trim())
          .filter(Boolean)
          .map((naam) => ({
            id: generateId('student'),
            stageId,
            naam,
            klas,
            token: generateToken(),
            linkGeopend: false,
            ingediend: false,
            heropend: false
          }))
        set((state) => {
          const students = { ...state.students }
          for (const s of created) students[s.id] = s
          return { students }
        })
        return created
      },

      regenerateToken: (studentId) => {
        const token = generateToken()
        set((state) => {
          const s = state.students[studentId]
          if (!s) return state
          return { students: { ...state.students, [studentId]: { ...s, token, linkGeopend: false } } }
        })
        return token
      },

      deleteStudent: (studentId) => {
        set((state) => {
          const deletedStudent = state.students[studentId]
          if (!deletedStudent) return state
          const students = { ...state.students }
          delete students[studentId]
          const receipts = Object.fromEntries(
            Object.entries(state.receipts).filter(([, r]) => r.studentId !== studentId)
          )
          const sessionToken = state.sessionToken === deletedStudent.token ? null : state.sessionToken
          return { students, receipts, sessionToken }
        })
      }
    }),
    {
      name: 'stagekosten-store-v1',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state && Object.keys(state.stages).length === 0) {
          const seed = buildSeed()
          const stages: Record<string, Stage> = { [seed.stage.id]: seed.stage }
          const students: Record<string, Student> = {}
          for (const s of seed.students) students[s.id] = s
          const receipts: Record<string, Bonnetje> = {}
          for (const r of seed.receipts) receipts[r.id] = r
          Object.assign(state, { stages, students, receipts })
        }
        state?.setHydrated()
      }
    }
  )
)

export function studentReceipts(state: AppState, studentId: string): Bonnetje[] {
  return Object.values(state.receipts)
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => (a.tijdstip < b.tijdstip ? 1 : -1))
}

export function classStudents(state: AppState, stageId: string, klas?: KlasCode | 'alle'): Student[] {
  return Object.values(state.students)
    .filter((s) => s.stageId === stageId && (!klas || klas === 'alle' || s.klas === klas))
    .sort((a, b) => a.naam.localeCompare(b.naam))
}

export function primaryStage(state: AppState): Stage | undefined {
  return Object.values(state.stages)[0]
}

export const isToday = (iso: string) => iso.slice(0, 10) === todayIso()
