import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, classStudents, primaryStage } from '@/data/store'
import { formatCents } from '@/lib/money'
import { formatShortDate, formatShortDateYear, stageEndDate } from '@/lib/date'
import { KLASSEN } from '@/types'
import type { KlasCode } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { QrCode } from '@/components/ui/QrCode'
import { buildStudentLink } from '@/lib/linkPayload'

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
  const deleteStudent = useStore((s) => s.deleteStudent)
  const allInStage = useStore((s) => classStudents(s, stage?.id ?? ''))

  const [klas, setKlas] = useState<KlasCode>('6AD')
  const [quickName, setQuickName] = useState('')
  const [paste, setPaste] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrStudent, setQrStudent] = useState<{ naam: string; klas: KlasCode; token: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const klasStudents = useMemo(() => allInStage.filter((s) => s.klas === klas), [allInStage, klas])
  const hasStudents = klasStudents.length > 0

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
    setShowPaste(false)
  }

  const addOne = () => {
    const naam = quickName.trim()
    if (!naam) return
    importStudents(stage.id, klas, [naam])
    setQuickName('')
  }

  const remove = (studentId: string, naam: string) => {
    if (window.confirm(`${naam} verwijderen? Zijn bonnetjes en link verdwijnen mee. Dit kan niet ongedaan gemaakt worden.`)) {
      deleteStudent(studentId)
    }
  }

  const copyLink = (s: (typeof klasStudents)[number]) => {
    navigator.clipboard.writeText(buildStudentLink(s.token, s.naam, s.klas, stage)).then(() => {
      setCopiedId(s.id)
      setTimeout(() => setCopiedId((id) => (id === s.id ? null : id)), 1500)
    })
  }

  const dagToelage = formatCents(stage.dagToelageCents)
  const end = stage.startDatum ? stageEndDate(stage.startDatum, stage.aantalDagen) : null
  const periodNote = stage.startDatum
    ? `${stage.aantalDagen} stagedagen, van ${formatShortDate(stage.startDatum)} tot ${formatShortDateYear(end!)}. De app rekent de dagtoelage van ${dagToelage} per dag af binnen deze periode; bonnetjes van buiten de periode worden apart gemarkeerd.`
    : `Aantal dagen staat op ${stage.aantalDagen} (totaalbudget ${formatCents(stage.totaalBudgetCents)}), maar er is nog geen eerste stagedag gekozen — vul hierboven ook een datum in om de periode vast te leggen. Zolang die ontbreekt, kunnen leerlingen al bonnetjes toevoegen — die krijgen de datum van de foto en schuiven mee zodra jij de periode invult.`

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
        <div className={hasStudents ? 'flex-1 min-w-0 flex flex-col gap-3.5' : 'flex-[1.3] min-w-0 flex flex-col gap-3.5'}>
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

          <div className="text-[15px] font-bold mt-2">3 · Leerling toevoegen aan {klas}</div>
          <div className="flex gap-2.5 items-center flex-wrap">
            <input
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addOne()}
              placeholder="Voornaam Achternaam"
              className="bg-white border border-black/[.16] rounded-[9px] px-3.5 py-2.5 text-sm min-w-[220px] outline-none"
            />
            <button
              onClick={addOne}
              disabled={!quickName.trim()}
              className="bg-accent text-white rounded-[9px] px-4 py-2.5 text-[13.5px] font-bold disabled:opacity-40"
            >
              + Toevoegen
            </button>
            <button onClick={() => setShowPaste((v) => !v)} className="text-[12.5px] text-accent-dark underline">
              {showPaste ? 'lijst plakken verbergen' : 'of plak meteen een hele lijst'}
            </button>
          </div>

          {showPaste && (
            <div className="flex flex-col gap-2.5 bg-white border border-black/[.12] rounded-md p-4">
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
                className={`min-h-[140px] border rounded-md px-[14px] py-3 text-[13.5px] leading-[1.75] text-black/75 outline-none resize-y ${
                  dragOver ? 'border-accent' : 'border-black/[.12]'
                }`}
              />
              <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="text-[12.5px] leading-[1.55] text-black/50">
                Eén naam per lijn, of{' '}
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
                  {namesToImport.length} leerlingen toevoegen aan {klas}
                </button>
                <div className="text-[12.5px] text-black/50">
                  elk met {formatCents(stage.totaalBudgetCents)} totaal en {dagToelage} per dag
                </div>
              </div>
            </div>
          )}

          {hasStudents ? (
            <>
              <div className="flex gap-2.5 items-center flex-wrap mt-2">
                <div className="text-[13px] text-black/55">
                  {opened} van de {klasStudents.length} leerlingen hebben hun link al geopend. {klasStudents.length - opened} nog niet.
                  {stage.startDatum ? ` Periode: ${formatShortDate(stage.startDatum)} – ${end ? formatShortDateYear(end) : ''}.` : ' Periode nog niet vastgelegd.'}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-card overflow-x-auto">
                <div className="min-w-[680px]">
                  <div className="flex px-5 py-3 text-xs font-semibold tracking-[.4px] uppercase text-black/[.42] border-b border-black/[.08]">
                    <div className="flex-[2] min-w-[140px]">Leerling</div>
                    <div className="w-16 flex-none">Klas</div>
                    <div className="flex-[1.6] min-w-[110px]">Persoonlijke link</div>
                    <div className="w-[140px] flex-none">Status</div>
                    <div className="w-[190px] flex-none text-right">Actie</div>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto">
                    {klasStudents.map((s) => (
                      <div key={s.id} className="flex items-center px-5 py-3 border-b border-black/[.06] last:border-0 text-[13.5px]">
                        <div className="flex-[2] min-w-[140px] font-semibold">{s.naam}</div>
                        <div className="w-16 flex-none text-black/55">{s.klas}</div>
                        <div className="flex-[1.6] min-w-[110px]">
                          <button
                            onClick={() => copyLink(s)}
                            className="font-mono text-[11.5px] text-accent-dark underline decoration-dotted whitespace-nowrap"
                          >
                            {copiedId === s.id ? 'gekopieerd ✓' : 'kopieer link'}
                          </button>
                        </div>
                        <div className="w-[140px] flex-none">
                          <Badge tone={s.linkGeopend ? 'good' : 'neutral'}>{s.linkGeopend ? 'link geopend' : 'nog niet geopend'}</Badge>
                        </div>
                        <div className="w-[190px] flex-none flex justify-end gap-3 text-[12.5px] font-semibold whitespace-nowrap">
                          <button onClick={() => setQrStudent(s)} className="text-accent-dark">
                            QR
                          </button>
                          {s.ingediend ? (
                            <Link to={`/dossier/${s.id}`} target="_blank" rel="noreferrer" className="text-accent-dark">
                              Dossier
                            </Link>
                          ) : (
                            <button onClick={() => regenerateToken(s.id)} className="text-accent-dark">
                              Opnieuw
                            </button>
                          )}
                          <button onClick={() => remove(s.id, s.naam)} className="text-black/40 hover:text-red-600">
                            Verwijderen
                          </button>
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
            !showPaste && <div className="text-[13px] text-black/45">Nog geen leerlingen in {klas}. Voeg er een toe hierboven.</div>
          )}
        </div>

        {!hasStudents && (
          <div className="w-[330px] flex-none bg-white rounded-lg p-[22px] flex flex-col gap-3.5 shadow-card self-start">
            <div className="text-[14.5px] font-bold">Wat de leerling krijgt</div>
            <div className="text-[13px] leading-[1.6] text-black/60">
              Voor elke naam maakt de app één persoonlijke link met een QR-code. Geen account, geen wachtwoord. Naam en klas zitten in de
              link en kunnen alleen door jou aangepast worden.
            </div>
            <div className="text-[12.5px] leading-[1.55] text-black/50">
              Voeg hierboven een leerling toe om zijn echte link en QR-code te zien.
            </div>
          </div>
        )}
      </div>

      {qrStudent && stage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setQrStudent(null)}>
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <QrCode value={buildStudentLink(qrStudent.token, qrStudent.naam, qrStudent.klas, stage)} size={220} />
            <div className="text-base font-bold">{qrStudent.naam}</div>
            <div className="text-sm text-black/50">{qrStudent.klas}</div>
            <button onClick={() => setQrStudent(null)} className="mt-2 text-sm font-semibold text-accent-dark">
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
