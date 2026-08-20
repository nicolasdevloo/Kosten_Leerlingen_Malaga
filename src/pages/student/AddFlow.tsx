import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { useStore, studentReceipts } from '@/data/store'
import { checkNewReceipt, totalSpent } from '@/data/selectors'
import { formatCents, parseCentsInput } from '@/lib/money'
import { todayIso } from '@/lib/date'
import type { Categorie } from '@/types'
import { CATEGORIEEN } from '@/types'
import { Chip } from '@/components/ui/Chip'

type Step = 'choice' | 'review' | 'warn' | 'blocked' | 'saved'

export function AddFlow() {
  const navigate = useNavigate()
  const { student, stage } = useSession()
  const receipts = useStore((s) => (student ? studentReceipts(s, student.id) : []))
  const addReceipt = useStore((s) => s.addReceipt)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('choice')
  const [photo, setPhoto] = useState<string | null>(null)
  const [ocrLine, setOcrLine] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [categorie, setCategorie] = useState<Categorie | null>(null)
  const [note, setNote] = useState('')
  const [savedLine, setSavedLine] = useState('')

  if (!student || !stage) return null

  const amountCents = parseCentsInput(amountInput)
  const goDash = () => navigate('/app')

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result))
      // Simulatie van OCR: een plausibel bedrag wordt voorgesteld, de leerling corrigeert het zo nodig.
      const guessed = Math.round((3 + Math.random() * 15) * 100)
      setAmountInput((guessed / 100).toFixed(2).replace('.', ','))
      setOcrLine(`Ik las ${formatCents(guessed)} op de foto. Klopt dat?`)
      setStep('review')
    }
    reader.readAsDataURL(file)
  }

  const manual = () => {
    setPhoto(null)
    setOcrLine('')
    setAmountInput('')
    setStep('review')
  }

  const doSave = (pendingOverride?: boolean) => {
    const pending = pendingOverride ?? !navigator.onLine
    addReceipt(student.id, {
      titel: note.trim() || (categorie ? categorie : 'Bonnetje'),
      omschrijving: note.trim(),
      bedragCents: amountCents,
      categorie,
      datum: todayIso(),
      tijdstip: new Date().toISOString(),
      fotoDataUrl: photo,
      pending
    })
  }

  const onSave = () => {
    const check = checkNewReceipt(stage, receipts, amountCents)
    if (check.kind === 'blocked') {
      setStep('blocked')
      return
    }
    if (check.kind === 'warn') {
      setStep('warn')
      return
    }
    doSave()
    const dayLeftAfter = check.dayLeftAfterCents
    setSavedLine(
      `Bewaard${categorie ? ` bij ${categorie}` : ''}. Je hebt vandaag nog ${formatCents(Math.max(0, dayLeftAfter))} van je toelage.`
    )
    setStep('saved')
  }

  const confirmWarn = () => {
    doSave()
    setSavedLine('Bewaard. Deze uitgave ging over je dagtoelage — dat mag, het ging van je totaalbudget af.')
    setStep('saved')
  }

  const reset = () => {
    setStep('choice')
    setPhoto(null)
    setOcrLine('')
    setAmountInput('')
    setCategorie(null)
    setNote('')
  }

  const check = step === 'warn' || step === 'blocked' ? checkNewReceipt(stage, receipts, amountCents) : null

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-[#0F1017] px-5 pt-14 pb-16 flex flex-col gap-4">
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPickFile} />
      <div className="flex justify-between items-center">
        <div className="text-[17px] font-bold text-white">Bonnetje toevoegen</div>
        <button
          onClick={() => {
            reset()
            goDash()
          }}
          className="text-sm font-semibold text-white/60 p-2"
        >
          Sluiten
        </button>
      </div>

      {step === 'choice' && (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl border border-white/[.14] h-[400px] flex flex-col items-center justify-center gap-3"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 6px, transparent 6px 12px)' }}
          >
            <div className="w-[150px] h-[190px] rounded-[10px] border-2 border-dashed border-white/35" />
            <div className="font-mono text-xs text-white/50 text-center">
              camerabeeld
              <br />
              leg het bonnetje in het kader
            </div>
          </div>
          <div className="text-[12.5px] leading-[1.5] text-white/45 text-center">
            Elke uitgave heeft een bonnetje nodig. Zonder foto kan je niets opslaan.
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-full py-[17px] text-center text-base font-bold text-[#0F1017]"
          >
            Foto maken
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white/10 rounded-full py-[15px] text-center text-sm font-semibold text-white"
            >
              Uit galerij
            </button>
            <button onClick={manual} className="flex-1 bg-white/10 rounded-full py-[15px] text-center text-sm font-semibold text-white">
              Bedrag zelf typen
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="flex flex-col gap-4">
          {ocrLine && (
            <div className="bg-accent-lightest rounded-xl px-4 py-3.5 flex gap-[11px] items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-accent flex-none" />
              <div className="text-[13px] leading-[1.45] text-accent-darker">{ocrLine}</div>
            </div>
          )}
          <div className="bg-white rounded-[22px] p-[18px] flex flex-col gap-4">
            <div className="flex gap-3.5 items-start">
              {photo ? (
                <img src={photo} alt="" className="w-[74px] h-24 rounded-lg object-cover border border-black/[.12] flex-none" />
              ) : (
                <div
                  className="w-[74px] h-24 rounded-lg border border-black/[.12] flex-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(20,21,26,.1) 0 4px, transparent 4px 8px)' }}
                />
              )}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="text-[11.5px] font-semibold tracking-[.5px] uppercase text-black/45">bedrag in euro</div>
                <input
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0,00"
                  inputMode="decimal"
                  className="text-[30px] font-extrabold tracking-[-1px] border-none outline-none w-full p-0 bg-transparent tabular-nums"
                  autoFocus={!photo}
                />
                <div className="text-xs text-black/45">tik om te corrigeren</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[11.5px] font-semibold tracking-[.5px] uppercase text-black/45">categorie</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIEEN.map((c) => (
                  <Chip key={c} active={categorie === c} onClick={() => setCategorie(c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[11.5px] font-semibold tracking-[.5px] uppercase text-black/45">omschrijving</div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="bv. Café Central — koffie"
                className="rounded-md bg-black/[.05] px-[15px] py-[13px] text-sm text-black/75 outline-none"
              />
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={amountCents <= 0}
            className="bg-accent rounded-full py-[17px] text-center text-base font-bold text-white disabled:opacity-40"
          >
            Opslaan
          </button>
        </div>
      )}

      {step === 'warn' && check && (
        <div className="flex flex-col gap-4 pt-10 animate-pop">
          <div className="w-[66px] h-[66px] rounded-xl bg-warn-bar" />
          <div className="text-2xl font-extrabold tracking-[-0.6px] text-white">Je gaat over je dagtoelage</div>
          <div className="text-[14.5px] leading-[1.6] text-white/70">
            Met deze {formatCents(amountCents)} kom je {formatCents(check.overDayCents)} boven je dagtoelage van €30. Dat mag — het gaat
            wel van je totaal van €420 af.
          </div>
          <div className="bg-white/[.07] rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex justify-between text-[13.5px] text-white/70">
              <span>Deze uitgave</span>
              <span className="font-bold text-white tabular-nums">{formatCents(amountCents)}</span>
            </div>
            <div className="flex justify-between text-[13.5px] text-white/70">
              <span>Daarna nog beschikbaar</span>
              <span className="font-bold text-white tabular-nums">{formatCents(check.totalLeftAfterCents)}</span>
            </div>
          </div>
          <button onClick={confirmWarn} className="bg-white rounded-full py-[17px] text-center text-base font-bold text-[#0F1017]">
            Toch opslaan
          </button>
          <button onClick={() => setStep('review')} className="rounded-full py-[15px] text-center text-sm font-semibold text-white/65">
            Bedrag aanpassen
          </button>
        </div>
      )}

      {step === 'blocked' && check && (
        <div className="flex flex-col gap-4 pt-10 animate-pop">
          <div className="w-[66px] h-[66px] rounded-xl bg-danger" />
          <div className="text-2xl font-extrabold tracking-[-0.6px] text-white">Dit past niet in je totaalbudget</div>
          <div className="text-[14.5px] leading-[1.6] text-white/70">
            Je hebt nog {formatCents(stage.totaalBudgetCents - totalSpent(receipts))} van je totaalbudget. Deze{' '}
            {formatCents(amountCents)} past er niet meer in. Spreek {stage.begeleider} aan voor je dit betaalt.
          </div>
          <button onClick={() => setStep('review')} className="bg-white rounded-full py-[17px] text-center text-base font-bold text-[#0F1017]">
            Bedrag aanpassen
          </button>
          <button
            onClick={() => {
              reset()
              goDash()
            }}
            className="rounded-full py-[15px] text-center text-sm font-semibold text-white/65"
          >
            Annuleren
          </button>
        </div>
      )}

      {step === 'saved' && (
        <div className="flex flex-col items-center gap-[18px] pt-[70px] animate-pop">
          <div className="w-24 h-24 rounded-full bg-good-bar" />
          <div className="text-2xl font-extrabold text-white tracking-[-0.6px] text-center">Opgeslagen</div>
          <div className="text-[14.5px] leading-[1.55] text-white/65 text-center max-w-[290px]">{savedLine}</div>
          <div className="font-mono text-[11.5px] text-white/40 text-center">bewaard op je toestel · wordt verstuurd bij verbinding</div>
          <button
            onClick={() => {
              reset()
              goDash()
            }}
            className="mt-1.5 bg-white rounded-full py-4 px-[30px] text-[15.5px] font-bold text-[#0F1017]"
          >
            Terug naar overzicht
          </button>
        </div>
      )}
    </div>
  )
}
