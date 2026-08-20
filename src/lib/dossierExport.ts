import type { Bonnetje, Stage, Student } from '@/types'

/** Het bestand dat een leerling na het indienen deelt, en dat de leerkracht kan importeren. */
export interface DossierExport {
  v: 1
  student: Student
  stage: Stage
  receipts: Bonnetje[]
}

export function buildDossierExport(student: Student, stage: Stage, receipts: Bonnetje[]): DossierExport {
  return { v: 1, student, stage, receipts }
}

function slugify(naam: string): string {
  return naam
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function dossierExportFilename(naam: string): string {
  return `stagekosten-${slugify(naam)}.json`
}

export function parseDossierExport(text: string): DossierExport | null {
  try {
    const data = JSON.parse(text)
    if (data && data.v === 1 && data.student?.id && data.stage?.id && Array.isArray(data.receipts)) {
      return data as DossierExport
    }
    return null
  } catch {
    return null
  }
}
