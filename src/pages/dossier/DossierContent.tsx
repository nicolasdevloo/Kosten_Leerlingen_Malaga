import { Fragment } from 'react'
import type { Stage, Student } from '@/types'
import { CATEGORIEEN } from '@/types'
import { categoryTotals, groupByDay, totalSpent } from '@/data/selectors'
import { formatCents, formatCentsPlain } from '@/lib/money'
import { formatShortDate, formatShortDateYear, stageEndDate } from '@/lib/date'
import type { Bonnetje } from '@/types'

export function DossierContent({ student, stage, receipts }: { student: Student; stage: Stage; receipts: Bonnetje[] }) {
  const days = groupByDay(receipts, stage)
  const total = totalSpent(receipts)
  const rest = stage.totaalBudgetCents - total
  const totals = categoryTotals(receipts)
  const periode = stage.startDatum
    ? `${formatShortDate(stage.startDatum)} – ${formatShortDateYear(stageEndDate(stage.startDatum, stage.aantalDagen))}`
    : 'periode nog niet vastgelegd'

  let nr = 0
  const numbered = days.map((d) => ({ ...d, receipts: d.receipts.map((r) => ({ ...r, nr: ++nr })) }))

  return (
    <div className="dossier-page bg-white text-ink px-[0.7in] py-[0.7in] max-w-[8.5in] mx-auto">
      <div className="flex justify-between items-baseline gap-6 border-b border-black/[.18] pb-2 mb-1.5 text-[8.5pt] text-black/55">
        <span>Kostendossier buitenlandse stage · Erasmus+</span>
        <span>
          {student.naam} · {student.klas} · {stage.bestemming} {periode}
        </span>
      </div>

      <div className="flex justify-between items-end gap-6 mb-2">
        <div>
          <div className="text-[9pt] font-bold tracking-[1.2pt] uppercase text-black/45">Kostendossier</div>
          <h1 className="text-[24pt] font-extrabold tracking-[-0.7pt] mt-1">{student.naam}</h1>
        </div>
        <div className="text-right text-[9.5pt] leading-[1.5] text-black/60">
          {student.klas} · {stage.school}
          <br />
          Stage {stage.bestemming}, {periode}
          <br />
          Begeleider: {stage.begeleider}
        </div>
      </div>

      <table className="w-full border-collapse my-3.5 text-[10pt]">
        <tbody>
          <tr>
            {[
              ['Totaalbudget', formatCents(stage.totaalBudgetCents)],
              ['Uitgegeven', formatCents(total)],
              ['Restsaldo', formatCents(rest)],
              ['Bonnetjes', String(receipts.length)]
            ].map(([label, value]) => (
              <td key={label} className="border border-black/[.15] px-3 py-2.5 w-1/4">
                <div className="text-[8.5pt] font-bold tracking-[.8pt] uppercase text-black/45">{label}</div>
                <div className="text-[16pt] font-extrabold mt-0.5 tabular-nums">{value}</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className="text-[10pt] leading-[1.6] mb-3.5 text-black/70">
        Dagtoelage {formatCents(stage.dagToelageCents)}. Het dagbudget mag overschreden worden, het totaalbudget niet. Elke uitgave in
        dit dossier heeft een gefotografeerd bonnetje; de foto's staan in bijlage in dezelfde volgorde als de tabellen hieronder.
      </p>

      <h2 className="text-[12pt] font-bold mb-2">Uitgaven per dag</h2>
      <table className="w-full border-collapse text-[9.5pt] mb-4">
        <thead>
          <tr className="bg-black/[.05]">
            {['Datum', 'Omschrijving', 'Categorie', 'Bon', 'Bedrag'].map((h, i) => (
              <th key={h} className={`border border-black/[.15] px-2 py-1.5 font-bold ${i === 4 ? 'text-right' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {numbered.map((d) => (
            <Fragment key={d.datum}>
              {d.receipts.map((r) => (
                <tr key={r.id}>
                  <td className="border border-black/[.15] px-2 py-1.5">{formatShortDate(d.datum)}</td>
                  <td className="border border-black/[.15] px-2 py-1.5">{r.titel}</td>
                  <td className="border border-black/[.15] px-2 py-1.5">{r.categorie ?? 'onvolledig'}</td>
                  <td className="border border-black/[.15] px-2 py-1.5">B-{String(r.nr).padStart(2, '0')}</td>
                  <td className="border border-black/[.15] px-2 py-1.5 text-right tabular-nums">{formatCentsPlain(r.bedragCents)}</td>
                </tr>
              ))}
              <tr key={`${d.datum}-total`} className="bg-black/[.03]">
                <td colSpan={4} className="border border-black/[.15] px-2 py-1.5 font-bold">
                  Dagtotaal {formatShortDate(d.datum)}
                  {d.overToelageCents > 0 && (
                    <span className="font-normal text-black/55"> — {formatCents(d.overToelageCents)} boven de dagtoelage</span>
                  )}
                </td>
                <td className="border border-black/[.15] px-2 py-1.5 text-right font-bold tabular-nums">
                  {formatCentsPlain(d.totaalCents)}
                </td>
              </tr>
            </Fragment>
          ))}
          <tr>
            <td colSpan={4} className="border border-black/[.15] px-2.5 py-2 font-extrabold text-[10.5pt]">
              Totaal
            </td>
            <td className="border border-black/[.15] px-2.5 py-2 text-right font-extrabold text-[10.5pt] tabular-nums">
              {formatCentsPlain(total)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12pt] font-bold mb-2">Totalen per categorie</h2>
      <table className="border-collapse text-[9.5pt] mb-5 w-3/5">
        <tbody>
          {CATEGORIEEN.map((c) => (
            <tr key={c}>
              <td className="border border-black/[.15] px-2 py-1.5">{c}</td>
              <td className="border border-black/[.15] px-2 py-1.5 text-right tabular-nums">{formatCentsPlain(totals[c])}</td>
            </tr>
          ))}
          <tr>
            <td className="border border-black/[.15] px-2 py-1.5 font-bold">Totaal</td>
            <td className="border border-black/[.15] px-2 py-1.5 text-right font-bold tabular-nums">{formatCentsPlain(total)}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-[12pt] font-bold mb-2 break-before-page">Bijlage · foto's van de bonnetjes</h2>
      <p className="text-[9.5pt] leading-[1.6] mb-3 text-black/65">
        Elke foto draagt hetzelfde nummer als in de tabel hierboven, met datum, bedrag en categorie eronder.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {numbered.flatMap((d) =>
          d.receipts.map((r) => (
            <div key={r.id} className="break-inside-avoid">
              <div className="aspect-[3/4] border border-black/25 overflow-hidden flex items-center justify-center font-mono text-[8pt] text-black/50">
                {r.fotoDataUrl ? (
                  <img src={r.fotoDataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,21,26,.08) 0 5px, transparent 5px 10px)' }}
                  >
                    foto B-{String(r.nr).padStart(2, '0')}
                  </div>
                )}
              </div>
              <div className="text-[8.5pt] leading-[1.4] mt-1 text-black/65">
                B-{String(r.nr).padStart(2, '0')} · {formatShortDate(d.datum)} · {formatCents(r.bedragCents)} · {r.categorie ?? 'onvolledig'}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-8 mt-6 break-inside-avoid">
        <div className="flex-1">
          <div className="border-t border-black/40 pt-1.5 text-[9pt] text-black/60">Datum en handtekening leerling</div>
        </div>
        <div className="flex-1">
          <div className="border-t border-black/40 pt-1.5 text-[9pt] text-black/60">Datum en handtekening begeleider</div>
        </div>
      </div>

      <div className="flex justify-between pt-2 mt-4 border-t border-black/[.18] text-[8pt] text-black/50">
        <span>Opgemaakt in de app Stagekosten · begeleider {stage.begeleider}</span>
        <span>Alle bedragen in euro</span>
      </div>
    </div>
  )
}
