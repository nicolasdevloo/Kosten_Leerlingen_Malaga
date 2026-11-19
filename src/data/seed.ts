import type { Bonnetje, Stage, Student } from '@/types'

// Er is maar één stage (Málaga 2027) en de instellingen liggen vast — leerlinglinks hoeven deze
// gegevens dus niet zelf mee te dragen, enkel te verwijzen naar deze ene, altijd-aanwezige stage.
export const STAGE_ID = 'stage_malaga2027'

export interface SeedResult {
  stage: Stage
  students: Student[]
  receipts: Bonnetje[]
}

/**
 * Startpunt bij de eerste keer opstarten: de echte stage-configuratie voor Málaga 2027
 * (24/01/2027 t.e.m. 6/02/2027, €390 totaal, €15 op de twee reisdagen en €30 op de 12 dagen
 * ertussen), zonder leerlingen. De leerkracht voegt de echte leerlingen toe via
 * "Leerlingen uitnodigen", en kan deze bedragen nog altijd aanpassen in het dashboard.
 */
export function buildSeed(): SeedResult {
  const dagToelageCents = 3000
  const reisdagToelageCents = 1500
  const aantalDagen = 14
  const stage: Stage = {
    id: STAGE_ID,
    naam: 'Málaga 2027',
    bestemming: 'Málaga',
    school: 'Burgerschool Roeselare',
    begeleider: 'meneer Devloo',
    totaalBudgetCents: reisdagToelageCents * 2 + dagToelageCents * (aantalDagen - 2),
    dagToelageCents,
    reisdagToelageCents,
    startDatum: '2027-01-24',
    aantalDagen
  }

  return { stage, students: [], receipts: [] }
}
