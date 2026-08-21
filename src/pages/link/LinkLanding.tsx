import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/data/store'
import { formatCents } from '@/lib/money'
import { formatShortDate, formatShortDateYear, stageEndDate } from '@/lib/date'
import { capitalizeFirst } from '@/lib/text'
import { decodeLinkPayload } from '@/lib/linkPayload'

type Step = 'confirm' | 'wrong' | 'addHome'

export function LinkLanding() {
  const { token: routeParam } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const students = useStore((s) => s.students)
  const stages = useStore((s) => s.stages)
  const confirmSession = useStore((s) => s.confirmSession)
  const provisionFromLink = useStore((s) => s.provisionFromLink)
  const [step, setStep] = useState<Step>('confirm')

  // Echte leerlinglinks bevatten naam, klas en de stage-instellingen rechtstreeks (geen server nodig).
  // Oudere/interne links (bv. de demo-startpagina) geven gewoon het kale token door.
  const payload = routeParam ? decodeLinkPayload(routeParam) : null
  const lookupToken = payload?.token ?? routeParam

  useEffect(() => {
    if (payload) provisionFromLink(payload)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParam])

  // Val meteen terug op de gegevens uit de link zelf (i.p.v. te wachten op de effect hierboven),
  // zodat een geldige link nooit eerst even "ongeldig" flitst voor hij verwerkt is.
  const storedStudent = Object.values(students).find((s) => s.token === lookupToken)
  const student =
    storedStudent ??
    (payload
      ? {
          id: `student_${payload.token}`,
          stageId: payload.stage.id,
          naam: payload.naam,
          klas: payload.klas,
          token: payload.token,
          linkGeopend: false,
          ingediend: false
        }
      : undefined)
  const stage = student ? stages[student.stageId] ?? payload?.stage : undefined

  if (!student || !stage) {
    return (
      <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 flex flex-col gap-4 items-center text-center">
        <div className="text-xl font-bold">Deze link is niet geldig</div>
        <div className="text-sm text-black/55 leading-[1.6]">
          Controleer de link of vraag je begeleider om een nieuwe. Een oude link kan vervangen zijn door een nieuwe.
        </div>
      </div>
    )
  }

  const firstName = student.naam.split(' ')[0]
  const periode = stage.startDatum
    ? `${formatShortDate(stage.startDatum)} – ${formatShortDateYear(stageEndDate(stage.startDatum, stage.aantalDagen))}`
    : 'nog niet vastgelegd'

  const confirm = () => {
    confirmSession(student.token)
    setStep('addHome')
  }

  if (step === 'wrong') {
    return (
      <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 pb-8 flex flex-col gap-5">
        <div className="w-[46px] h-[46px] rounded-[14px] bg-warn-soft flex items-center justify-center text-[21px] font-bold text-warn-text">
          !
        </div>
        <div className="text-2xl font-bold tracking-[-0.5px]">Dan is dit niet jouw link</div>
        <div className="text-sm leading-[1.6] text-black/60">
          Elke leerling heeft een eigen link, zodat bonnetjes niet door elkaar lopen. Vraag {stage.begeleider} om jouw link of QR-code.
          Gebruik in geen geval de link van een klasgenoot: dan komen jouw kosten op zijn dossier terecht.
        </div>
        <button
          onClick={() => setStep('confirm')}
          className="mt-auto border-[1.5px] border-black/15 rounded-xl py-4 text-center text-[15px] font-bold"
        >
          Terug
        </button>
      </div>
    )
  }

  if (step === 'addHome') {
    const steps = [
      { n: 1, text: 'Tik op het deelicoon onderaan je browser' },
      { n: 2, text: <>Kies <strong>Zet op beginscherm</strong></> },
      { n: 3, text: <>Klaar — het icoon heet <strong>Stagekosten</strong></> }
    ]
    return (
      <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 pb-8 flex flex-col gap-[22px]">
        <div className="text-2xl font-bold tracking-[-0.5px]">Zet de app op je beginscherm</div>
        <div className="text-[13.5px] leading-[1.55] text-black/60">
          Dan hoef je de link niet elke keer terug te zoeken. Je blijft aangemeld, ook zonder internet in Spanje.
        </div>
        <div className="bg-white rounded-2xl px-[18px] py-1.5 shadow-card">
          {steps.map((s, i) => (
            <div key={s.n} className={`flex gap-3.5 items-start py-4 ${i < steps.length - 1 ? 'border-b border-black/[.07]' : ''}`}>
              <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-lighter flex-none flex items-center justify-center text-[13px] font-bold text-accent-darker">
                {s.n}
              </div>
              <div className="text-sm leading-[1.5]">{s.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2.5">
          <button onClick={() => navigate('/app')} className="bg-accent rounded-xl py-4 text-center text-[15.5px] font-bold text-white">
            Beginnen
          </button>
          <button onClick={() => navigate('/app')} className="rounded-xl py-3.5 text-center text-sm font-semibold text-black/50">
            Later doen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 pb-8 flex flex-col gap-[22px]">
      <div className="text-[11.5px] font-semibold tracking-[.5px] uppercase text-black/45">persoonlijke link van je school</div>
      <div className="text-[28px] font-bold tracking-[-0.7px] leading-tight">
        Stagekosten
        <br />
        {stage.naam}
      </div>
      <div className="bg-white rounded-[22px] p-5 flex flex-col gap-4 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-full bg-accent-light flex-none" />
          <div className="flex flex-col gap-0.5">
            <div className="text-lg font-bold">{student.naam}</div>
            <div className="text-[13px] text-black/50">{student.klas} · Erasmus+ stage</div>
          </div>
        </div>
        <div className="h-px bg-black/[.08]" />
        <div className="flex justify-between text-[13px]">
          <div className="text-black/50">Totaalbudget</div>
          <div className="font-bold">{formatCents(stage.totaalBudgetCents)}</div>
        </div>
        <div className="flex justify-between text-[13px]">
          <div className="text-black/50">Dagtoelage</div>
          <div className="font-bold">{formatCents(stage.dagToelageCents)}</div>
        </div>
        <div className="flex justify-between text-[13px]">
          <div className="text-black/50">Periode</div>
          <div className="font-bold text-right">{periode}</div>
        </div>
      </div>
      <div className="text-[13.5px] leading-[1.55] text-black/60">
        {capitalizeFirst(stage.begeleider)} heeft deze link voor jou gemaakt. Er is geen wachtwoord: je naam en klas zitten al in de
        link. Bevestig alleen dat de link bij jou hoort.
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <button onClick={confirm} className="bg-accent rounded-xl py-4 text-center text-[15.5px] font-bold text-white">
          Ja, ik ben {firstName}
        </button>
        <button onClick={() => setStep('wrong')} className="rounded-xl py-4 text-center text-sm font-semibold text-black/55">
          Dit ben ik niet
        </button>
      </div>
    </div>
  )
}
