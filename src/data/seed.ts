import type { Bonnetje, Categorie, KlasCode, Stage, Student } from '@/types'
import { addDays, todayIso } from '@/lib/date'
import { generateId, generateToken } from '@/lib/token'

// Kleine seeded RNG zodat de voorbeelddata bij elke eerste run consistent aanvoelt.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260824)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const randInt = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1))

const VOORNAMEN = [
  'Yasmine', 'Noah', 'Lotte', 'Amir', 'Fien', 'Jonas', 'Elif', 'Wout', 'Marie', 'Cem',
  'Sara', 'Lucas', 'Zoë', 'Ibrahim', 'Emma', 'Milan', 'Aya', 'Senne', 'Nour', 'Vince',
  'Liesa', 'Rayan', 'Febe', 'Thibo', 'Meryem'
]
const ACHTERNAMEN = [
  'Bakkali', 'Verlinden', 'Peeters', 'El Amrani', 'Claes', 'De Smet', 'Yilmaz', 'Janssens', 'Vermeulen', 'Aksoy',
  'Willems', 'Mertens', 'Haddad', 'De Groote', 'Peeters', 'Yalçın', 'Van Damme', 'Michiels', 'El Idrissi', 'Lambert',
  'Goossens', 'Benali', 'Wouters', 'De Backer', 'Idrissi'
]

const KLAS_COUNTS: [KlasCode, number][] = [
  ['6AD', 5],
  ['6BO', 6],
  ['6CO', 6],
  ['6OOS', 5],
  ['6TC', 3]
]

interface ReceiptTemplate {
  titel: string
  omschrijving: string
  categorie: Categorie
  bedrag: [number, number]
}

const TEMPLATES: ReceiptTemplate[] = [
  { titel: 'Ontbijt hostel', omschrijving: 'Ontbijtbuffet hostel', categorie: 'Eten', bedrag: [450, 850] },
  { titel: 'Lunch Mercado', omschrijving: 'Lunch op de Mercado Central', categorie: 'Eten', bedrag: [800, 1400] },
  { titel: 'Avondeten tapas', omschrijving: 'Tapas met de groep', categorie: 'Eten', bedrag: [1100, 1900] },
  { titel: 'Koffie en tostada', omschrijving: 'Café Central — koffie en tostada', categorie: 'Eten', bedrag: [250, 550] },
  { titel: 'Broodjes', omschrijving: 'Broodjes voor onderweg', categorie: 'Eten', bedrag: [400, 900] },
  { titel: 'Metro dagpas', omschrijving: 'Dagpas metro Málaga', categorie: 'Vervoer', bedrag: [350, 550] },
  { titel: 'Bus naar Nerja', omschrijving: 'Bustocket Málaga–Nerja', categorie: 'Vervoer', bedrag: [1500, 2100] },
  { titel: 'Trein Torremolinos', omschrijving: 'Cercanías naar Torremolinos', categorie: 'Vervoer', bedrag: [350, 650] },
  { titel: 'Taxi hostel', omschrijving: 'Taxi terug naar hostel', categorie: 'Vervoer', bedrag: [600, 1200] },
  { titel: 'Museum Picasso', omschrijving: 'Toegangsticket Museo Picasso', categorie: 'Ontspanning', bedrag: [700, 1100] },
  { titel: 'Kajak huren', omschrijving: 'Kajak huren aan het strand', categorie: 'Ontspanning', bedrag: [1600, 2400] },
  { titel: 'Strandstoel', omschrijving: 'Ligstoel en parasol', categorie: 'Ontspanning', bedrag: [500, 900] },
  { titel: 'Alcazaba', omschrijving: 'Toegangsticket Alcazaba', categorie: 'Ontspanning', bedrag: [450, 700] }
]

export interface SeedResult {
  stage: Stage
  students: Student[]
  receipts: Bonnetje[]
}

export function buildSeed(): SeedResult {
  const stageId = 'stage_malaga2026'
  const start = addDays(todayIso(), -5) // "vandaag" valt op dag 6 van 14
  const stage: Stage = {
    id: stageId,
    naam: 'Málaga 2026',
    bestemming: 'Málaga',
    school: 'Sint-Jozefinstituut',
    begeleider: 'meneer Devloo',
    totaalBudgetCents: 42000,
    dagToelageCents: 3000,
    startDatum: start,
    aantalDagen: 14
  }

  const students: Student[] = []
  const receipts: Bonnetje[] = []

  let nameIdx = 0
  let submittedCount = 0

  for (const [klas, count] of KLAS_COUNTS) {
    for (let i = 0; i < count; i++) {
      const isYasmine = nameIdx === 0
      const naam = isYasmine ? 'Yasmine Bakkali' : `${VOORNAMEN[nameIdx % VOORNAMEN.length]} ${ACHTERNAMEN[nameIdx % ACHTERNAMEN.length]}`
      const studentKlas: KlasCode = isYasmine ? '6AD' : klas
      const studentId = generateId('student')
      const shouldSubmit = submittedCount < 2 && !isYasmine && rng() > 0.85
      const student: Student = {
        id: studentId,
        stageId,
        naam,
        klas: studentKlas,
        token: generateToken(),
        linkGeopend: rng() > 0.15,
        ingediend: shouldSubmit,
        heropend: false
      }
      if (shouldSubmit) submittedCount++
      students.push(student)

      const receiptCount = isYasmine ? 3 : randInt(6, 14)
      const usedDays = randInt(1, Math.min(6, stage.aantalDagen))
      for (let r = 0; r < receiptCount; r++) {
        let dayOffset: number
        let bedragCents: number
        let categorie: Categorie | null
        let template: ReceiptTemplate
        let missingCat = false
        let pending = false
        let time = '12:00'

        if (isYasmine) {
          // Vaste voorbeeldset die overeenkomt met de designmocks (screenshot 2a).
          if (r === 0) {
            template = TEMPLATES.find((t) => t.titel === 'Lunch Mercado')!
            bedragCents = 1230
            categorie = 'Eten'
            dayOffset = 5
            time = '12:40'
          } else if (r === 1) {
            template = TEMPLATES.find((t) => t.titel === 'Metro dagpas')!
            bedragCents = 420
            categorie = null
            missingCat = true
            dayOffset = 5
            time = '09:12'
            pending = true
          } else {
            template = TEMPLATES.find((t) => t.titel === 'Ontbijt hostel')!
            bedragCents = 650
            categorie = 'Eten'
            dayOffset = 4
            time = '08:05'
          }
        } else {
          template = pick(TEMPLATES)
          bedragCents = randInt(template.bedrag[0], template.bedrag[1])
          missingCat = rng() > 0.93
          categorie = missingCat ? null : template.categorie
          dayOffset = randInt(0, usedDays)
          pending = rng() > 0.9
          time = `${String(randInt(8, 21)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`
        }

        const datum = addDays(start, dayOffset)
        const tijdstip = `${datum}T${time}:00`
        receipts.push({
          id: generateId('receipt'),
          studentId,
          titel: template.titel,
          omschrijving: template.omschrijving,
          bedragCents,
          categorie,
          datum,
          tijdstip,
          fotoDataUrl: null,
          pending
        })
      }
      nameIdx++
    }
  }

  // Nog een tweede "wacht op upload"-bonnetje voor Yasmine, zodat de offlinestrook "2 bonnetjes" toont.
  const yasmine = students[0]
  receipts.push({
    id: generateId('receipt'),
    studentId: yasmine.id,
    titel: 'Ijsje aan de haven',
    omschrijving: 'Ijsje',
    bedragCents: 350,
    categorie: 'Eten',
    datum: addDays(start, 5),
    tijdstip: `${addDays(start, 5)}T17:30:00`,
    fotoDataUrl: null,
    pending: true
  })

  return { stage, students, receipts }
}
