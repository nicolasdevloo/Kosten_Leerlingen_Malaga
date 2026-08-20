import type { Bonnetje, Stage, Student } from '@/types'

export interface SeedResult {
  stage: Stage
  students: Student[]
  receipts: Bonnetje[]
}

/**
 * Startpunt bij de eerste keer opstarten: enkel de stage-configuratie voor Málaga 2027,
 * zonder leerlingen. De leerkracht voegt de echte leerlingen toe via "Leerlingen uitnodigen".
 */
export function buildSeed(): SeedResult {
  const stage: Stage = {
    id: 'stage_malaga2027',
    naam: 'Málaga 2027',
    bestemming: 'Málaga',
    school: 'Sint-Jozefinstituut',
    begeleider: 'meneer Devloo',
    totaalBudgetCents: 42000,
    dagToelageCents: 3000,
    startDatum: null,
    aantalDagen: 6
  }

  return { stage, students: [], receipts: [] }
}
