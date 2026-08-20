export type Categorie = 'Eten' | 'Vervoer' | 'Ontspanning'

export const CATEGORIEEN: Categorie[] = ['Eten', 'Vervoer', 'Ontspanning']

export type KlasCode = '6AD' | '6BO' | '6CO' | '6OOS' | '6TC'

export const KLASSEN: KlasCode[] = ['6AD', '6BO', '6CO', '6OOS', '6TC']

/** Een stage-editie, bv. "Málaga 2027". De periode kan leeg zijn tot de leerkracht ze vastlegt. */
export interface Stage {
  id: string
  naam: string
  bestemming: string
  school: string
  begeleider: string
  totaalBudgetCents: number
  dagToelageCents: number
  /** ISO-datum (yyyy-mm-dd) van de eerste stagedag, of null zolang niet vastgelegd. */
  startDatum: string | null
  aantalDagen: number
}

export interface Student {
  id: string
  stageId: string
  naam: string
  klas: KlasCode
  /** Het token uit de persoonlijke link, bv. "8QF2-M". */
  token: string
  linkGeopend: boolean
  ingediend: boolean
  /** true als de leerkracht een ingediend dossier heropend heeft. */
  heropend: boolean
}

export interface Bonnetje {
  id: string
  studentId: string
  titel: string
  omschrijving: string
  bedragCents: number
  categorie: Categorie | null
  /** ISO-datum (yyyy-mm-dd), afgeleid van foto of invoermoment. */
  datum: string
  /** ISO-tijdstip, voor weergave van het tijdstip. */
  tijdstip: string
  /** data-URL van de foto, of null bij handmatige invoer zonder foto. */
  fotoDataUrl: string | null
  /** true zolang het bonnetje nog lokaal wacht op synchronisatie. */
  pending: boolean
}

export interface DemoLink {
  studentId: string
  token: string
  naam: string
  klas: KlasCode
}
