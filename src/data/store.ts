import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Bonnetje, Categorie, KlasCode, Stage, Student } from '@/types'
import { buildSeed } from '@/data/seed'
import { idbStorage } from '@/data/idbStorage'
import { generateId, generateToken } from '@/lib/token'
import { todayIso } from '@/lib/date'
import type { LinkPayload } from '@/lib/linkPayload'
import type { DossierExport } from '@/lib/dossierExport'

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
  updateReceipt: (receiptId: string, data: Partial<Pick<Bonnetje, 'bedragCents' | 'categorie' | 'titel' | 'omschrijving'>>) => void
  deleteReceipt: (receiptId: string) => void
  syncPending: (studentId: string) => void

  submitDossier: (studentId: string) => void
  renameStudent: (studentId: string, naam: string) => void

  updateStagePeriod: (stageId: string, startDatum: string | null, aantalDagen: number) => void
  importStudents: (stageId: string, klas: KlasCode, namen: string[]) => Student[]
  regenerateToken: (studentId: string) => string
  deleteStudent: (studentId: string) => void

  provisionFromLink: (payload: LinkPayload) => void
  importDossier: (data: DossierExport) => void
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

      updateReceipt: (receiptId, data) => {
        set((state) => {
          const existing = state.receipts[receiptId]
          if (!existing) return state
          return { receipts: { ...state.receipts, [receiptId]: { ...existing, ...data } } }
        })
      },

      deleteReceipt: (receiptId) => {
        set((state) => {
          const receipts = { ...state.receipts }
          delete receipts[receiptId]
          return { receipts }
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

      // Zet enkel de status op "ingediend" — bewerken blijft altijd mogelijk. De leerling kan
      // zo vaak als nodig een nieuw dossierbestand doorsturen; de leerkracht gebruikt gewoon de
      // laatst ontvangen versie als definitief.
      submitDossier: (studentId) => {
        set((state) => {
          const s = state.students[studentId]
          if (!s) return state
          return { students: { ...state.students, [studentId]: { ...s, ingediend: true } } }
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
          return {
            stages: {
              ...state.stages,
              [stageId]: { ...stage, startDatum, aantalDagen, totaalBudgetCents: stage.dagToelageCents * aantalDagen }
            }
          }
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
            ingediend: false
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
      },

      provisionFromLink: (payload) => {
        // Bootstrap voor een vers toestel: de link zelf bevat alles wat nodig is, er is geen
        // server om het bij op te vragen. Bestaat het lokaal al (zelfde link nogmaals geopend),
        // dan blijven de eigen bonnetjes en indieningsstatus van de leerling gewoon staan.
        const studentId = `student_${payload.token}`
        set((state) => {
          const existing = state.students[studentId]
          const student: Student = existing
            ? { ...existing, naam: payload.naam, klas: payload.klas }
            : {
                id: studentId,
                stageId: payload.stage.id,
                naam: payload.naam,
                klas: payload.klas,
                token: payload.token,
                linkGeopend: false,
                ingediend: false
              }
          return {
            stages: { ...state.stages, [payload.stage.id]: payload.stage },
            students: { ...state.students, [studentId]: student }
          }
        })
      },

      importDossier: (data) => {
        set((state) => {
          const existing = Object.values(state.students).find((s) => s.token === data.student.token)
          const studentId = existing?.id ?? data.student.id
          const student: Student = {
            ...data.student,
            id: studentId,
            ingediend: true,
            linkGeopend: true
          }
          const receipts = Object.fromEntries(Object.entries(state.receipts).filter(([, r]) => r.studentId !== studentId))
          for (const r of data.receipts) {
            receipts[r.id] = { ...r, studentId }
          }
          return { students: { ...state.students, [studentId]: student }, receipts }
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
