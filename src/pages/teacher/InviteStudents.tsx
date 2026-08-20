import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, classStudents, primaryStage } from '@/data/store'
import { formatShortDate, formatShortDateYear, stageEndDate } from '@/lib/date'
import { KLASSEN } from '@/types'
import type { KlasCode } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { QrCode } from '@/components/ui/QrCode'

function parseNamesFromFile(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/[,;\t]/)[0]?.trim())
    .filter((n): n is string => Boolean(n) && n.toLowerCase() !== 'naam')
}

export function InviteStudents() {
  const stage = useStore(primaryStage)
  const updateStagePeriod = useStore((s) => s.updateStagePeriod)
  const importStudents = useStore((s) => s.importStudents)
  const regenerateToken = useStore((s) => s.regenerateToken)
  const allInStage = useStore((s) => classStudents(s, stage?.id ?? ''))

  const [klas, setKlas] = useState<KlasCode>('6AD')
  const [paste, setPaste] = useState('')
  const [forceForm, setForceForm] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const klasStudents = useMemo(() => allInStage.filter((s) => s.klas === klas), [allInStage, klas])
  const showTable = klasStudents.length > 0 && !forceForm

  if (!stage) return null

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    file.text().then((text) => {
      const names = parseNamesFromFile(text)
      setPaste((prev) => (prev ? prev + '\n' : '') + names.join('\n'))
    })
  }

  const namesToImport = paste
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean)

  const doImport = () => {
    if (namesToImport.length === 0) return
    importStudents(stage.id, klas, namesToImport)
    setPaste('')
    setForceForm(false)
  }

  const end = stage.startDatum ? stageEndDate(stage.startDatum, stage.aantalDagen) : null
  const periodNote = stage.startDatum
    ? `${stage.aantalDagen} stagedagen, van ${formatShortDate(stage.startDatum)} tot ${formatShortDateYear(end!)}. De app rekent de dagtoelage van €30 per dag af binnen deze periode; bonnetjes van buiten de periode worden apart gemarkeerd.`
    : 'Kies de eerste stagedag zodra die vastligt. Zolang er geen datum staat, kunnen leerlingen al bonnetjes toevoegen — die krijgen de datum van de foto en schuiven mee zodra jij de periode invult.'

  const opened = klasStudents.filter((s) => s.linkGeopend).length

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="px-8 pt-6 pb-4 bg-white border-b border-black/[.08] flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold tracking-[.4px] uppercase text-black/[.42]">{stage.naam} · leerlingen</div>
          <div className="text-[22px] font-bold tracking-[-0.4px]">Leerlingen uitnodigen</div>
        </div>
        <div className="text-[13px] text-black/50">{stage.begeleider}</div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-[26px] flex gap-7">
        <div className={showTable ? 'flex-1 min-w-0 flex flex-col gap-3.5' : 'flex-[1.3] min-w-0 flex flex-col gap-3.5'}>
          <div className="text-[15px] font-bold">1 · Zet de stageperiode vast</div>
          <div className="bg-white rounded-md border border-black/[.12] px-[18px] py-4 flex flex-col gap-3.5">
            <div className="flex gap-[18px] flex-wrap items-end">
              <div className="flex flex-col gap-1.5">
                <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">eerste stagedag</div>
                <input
                  type="date"
                  value={stage.startDatum ?? ''}
                  onChange={(e) => updateStagePeriod(stage.id, e.target.value || null, stage.aantalDagen)}
                  className="text-sm font-semibold border border-black/[.16] rounded-[9px] px-2.5 py-2 bg-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">aantal dagen</div>
                <div className="flex items-center gap-0.5 border border-black/[.16] rounded-[9px] overflow-hidden">
                  <button
                    onClick={() => updateStagePeriod(stage.id, stage.startDatum, Math.max(1, stage.aantalDagen - 1))}
                    className="px-3.5 py-2 text-[15px] font-bold text-black/55"
                  >
                    −
                  </button>
                  <div className="min-w-[34px] text-center text-sm font-bold">{stage.aantalDagen}</div>
                  <button
                    onClick={() => updateStagePeriod(stage.id, stage.startDatum, Math.min(21, stage.aantalDagen + 1))}
                    className="px-3.5 py-2 text-[15px] font-bold text-black/55"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-[11.5px] font-semibold tracking-[.4px] uppercase text-black/45">laatste stagedag</div>
                <div className="text-sm font-semibold py-2">{end ? formatShortDateYear(end) : '—'}</div>
              </div>
            </div>
            <div className="text-[12.5px] leading-[1.55] text-black/50">{periodNote}</div>
          </div>

          <div className="text-[15px] font-bold mt-2">2 · Kies de klas</div>
          <div className="flex gap-1.5 flex-wrap">
            {KLASSEN.map((k) => (
              <Chip key={k} active={klas === k} onClick={() => setKlas(k)}>
                {k}
              </Chip>
            ))}
          </div>

          {showTable ? (
            <>
              <div className="flex gap-2.5 items-center flex-wrap mt-2">
                <div className="text-[13px] text-black/55">
                  {opened} van de {klasStudents.length} leerlingen hebben hun link al geopend. {klasStudents.length - opened} nog niet.
                  {stage.startDatum ? ` Periode: ${formatShortDate(stage.startDatum)} – ${end ? formatShortDateYear(end) : ''}.` : ' Periode nog niet vastgelegd.'}
                </div>
                <div className="flex-1" />
                <button
                  onClick={() => setForceForm(true)}
                  className="border border-black/[.14] bg-white rounded-[11px] px-4 py-2.5 text-[13px] font-semibold"
                >
                  Periode of klas aanpassen
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-card overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="flex px-5 py-3 text-xs font-semibold tracking-[.4px] uppercase text-black/[.42] border-b border-black/[.08]">
                    <div className="flex-[2] min-w-[140px]">Leerling</div>
                    <div className="w-16 flex-none">Klas</div>
                    <div className="flex-[1.6] min-w-[110px]">Persoonlijke link</div>
                    <div className="w-[140px] flex-none">Status</div>
                    <div className="w-[70px] flex-none text-right">Actie</div>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {klasStudents.map((s) => (
                      <div key={s.id} className="flex items-center px-5 py-3 border-b border-black/[.06] last:border-0 text-[13.5px]">
                        <div className="flex-[2] min-w-[140px] font-semibold">{s.naam}</div>
                        <div className="w-16 flex-none text-black/55">{s.klas}</div>
                        <div className="flex-[1.6] min-w-[110px] font-mono text-[11.5px] text-black/50 whitespace-nowrap overflow-hidden text-ellipsis">
                          stagekosten.school/y/{s.token}
                        </div>
                        <div className="w-[140px] flex-none">
                          <Badge tone={s.linkGeopend ? 'good' : 'neutral'}>{s.linkGeopend ? 'link geopend' : 'nog niet geopend'}</Badge>
                        </div>
                        <div className="w-[70px] flex-none text-right text-[12.5px] font-semibold text-accent-dark whitespace-nowrap">
                          {s.ingediend ? (
                            <Link to={`/dossier/${s.id}`} target="_blank" rel="noreferrer">
                              Dossier
                            </Link>
                          ) : (
                            <button onClick={() => regenerateToken(s.id)}>Opnieuw</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[12.5px] leading-[1.55] text-black/50 max-w-[820px]">
                Een link die nog niet geopend is, kan je opnieuw aanmaken; de oude werkt dan niet meer. Verandert er een naam of klas, dan
                pas je die hier aan en verhuizen de bonnetjes van die leerling mee.
              </div>
            </>
          ) : (
            <>
              <div className="text-[15px] font-bold mt-2">3 · Plak de namen, één per lijn</div>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFiles(e.dataTransfer.files)
                }}
                placeholder={'Yasmine Bakkali\nNoah Verlinden\nLotte Peeters'}
                className={`min-h-[180px] bg-white border rounded-md px-[18px] py-4 text-[13.5px] leading-[1.75] text-black/75 outline-none resize-y ${
                  dragOver ? 'border-accent' : 'border-black/[.12]'
                }`}
              />
              <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="text-[12.5px] leading-[1.55] text-black/50">
                Of{' '}
                <button onClick={() => fileInputRef.current?.click()} className="underline text-accent-dark">
                  sleep de klaslijst hierin
                </button>{' '}
                (CSV of Excel). Alleen naam en klas worden overgenomen; e-mailadressen zijn niet nodig.
              </div>
              <div className="flex gap-2.5 items-center">
                <button
                  onClick={doImport}
                  disabled={namesToImport.length === 0}
                  className="bg-accent text-white rounded-[11px] px-5 py-3 text-[13.5px] font-bold disabled:opacity-40"
                >
                  {klas} aanmaken ({namesToImport.length} leerlingen)
                </button>
                <div className="text-[12.5px] text-black/50">elk met €420 totaal en €30 per dag</div>
                {klasStudents.length > 0 && (
                  <button onClick={() => setForceForm(false)} className="text-[12.5px] text-black/45 underline ml-2">
                    annuleren
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {!showTable && (
          <div className="w-[330px] flex-none bg-white rounded-lg p-[22px] flex flex-col gap-3.5 shadow-card self-start">
            <div className="text-[14.5px] font-bold">Wat de leerling krijgt</div>
            <div className="text-[13px] leading-[1.6] text-black/60">
              Voor elke naam maakt de app één persoonlijke link met een QR-code. Geen account, geen wachtwoord. Naam en klas zitten in de
              link en kunnen alleen door jou aangepast worden.
            </div>
            <div className="border border-dashed border-black/[.18] rounded-md p-4 flex gap-4 items-center">
              <QrCode value={`https://stagekosten.school/y/${klasStudents[0]?.token ?? '8QF2-M'}`} />
              <div className="flex flex-col gap-1 min-w-0">
                <div className="text-[13.5px] font-bold">{klasStudents[0]?.naam ?? 'Naam leerling'}</div>
                <div className="text-xs text-black/50">{klas}</div>
                <div className="text-[11px] font-mono text-black/45 break-all">
                  stagekosten.school/y/{klasStudents[0]?.token ?? '8QF2-M'}
                </div>
              </div>
            </div>
            <div className="text-[12.5px] leading-[1.55] text-black/50">Print de strookjes en geef ze mee, of mail de links naar de leerlingen.</div>
          </div>
        )}
      </div>
    </div>
  )
}
