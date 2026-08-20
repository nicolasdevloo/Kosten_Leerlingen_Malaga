import { Link } from 'react-router-dom'
import { useStore, classStudents, primaryStage } from '@/data/store'
import { KLASSEN } from '@/types'
import { del } from 'idb-keyval'

export function Home() {
  const stage = useStore(primaryStage)
  const allInStage = useStore((s) => classStudents(s, stage?.id ?? ''))

  const resetDemo = async () => {
    await del('stagekosten-store-v1')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-app px-6 py-10 max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <div className="text-xs font-semibold tracking-[.4px] uppercase text-black/45 mb-1">Stagekosten</div>
        <h1 className="text-3xl font-bold tracking-[-0.6px]">{stage?.naam ?? 'Málaga'} — demo</h1>
        <p className="text-sm text-black/60 mt-2 leading-[1.6] max-w-xl">
          Leerlingen loggen normaal in via hun persoonlijke link (met QR-code), zonder account of wachtwoord. Deze pagina bestaat alleen
          voor deze demo-omgeving, zodat je meteen kan doorklikken zonder eerst een echte link te versturen.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/leerkracht" className="bg-ink text-white rounded-xl px-5 py-3 text-sm font-bold">
          Open het leerkrachtdashboard
        </Link>
        <Link to="/leerkracht/leerlingen" className="border border-black/[.15] rounded-xl px-5 py-3 text-sm font-bold">
          Leerlingen uitnodigen
        </Link>
        <button onClick={resetDemo} className="text-sm font-semibold text-black/45 underline px-2">
          demo-data resetten
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="text-sm font-bold text-black/70">Leerlinglinks (demo)</div>
        {KLASSEN.map((k) => {
          const students = allInStage.filter((s) => s.klas === k)
          if (students.length === 0) return null
          return (
            <div key={k} className="flex flex-col gap-2">
              <div className="text-xs font-semibold tracking-[.3px] uppercase text-black/40">{k}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {students.map((s) => (
                  <Link
                    key={s.id}
                    to={`/y/${s.token}`}
                    className="bg-white rounded-lg px-4 py-3 shadow-card flex justify-between items-center text-sm"
                  >
                    <span className="font-semibold">{s.naam}</span>
                    <span className="font-mono text-xs text-black/40">/y/{s.token}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
