import { Link, NavLink, Outlet } from 'react-router-dom'
import { useStore, primaryStage } from '@/data/store'
import { downloadCsv, receiptsToCsv } from '@/lib/csv'

export function TeacherShell() {
  const stage = useStore(primaryStage)
  const receipts = useStore((s) => s.receipts)
  const students = useStore((s) => s.students)

  return (
    <div className="min-h-screen flex bg-app text-ink overflow-hidden">
      <div className="w-[230px] flex-none bg-white border-r border-black/[.08] px-[18px] py-6 flex flex-col gap-[22px]">
        <div className="flex flex-col gap-[3px]">
          <div className="text-[15px] font-bold">Stagekosten</div>
          <div className="text-xs text-black/50">{stage?.begeleider ?? 'leerkracht'}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <NavLink
            to="/leerkracht"
            end
            className={({ isActive }) =>
              `rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold ${
                isActive ? 'bg-accent-lightest text-accent-darker' : 'text-black/55 hover:bg-black/[.03]'
              }`
            }
          >
            {stage?.naam ?? 'Málaga 2027'}
          </NavLink>
        </div>
        <NavLink
          to="/leerkracht/leerlingen"
          className={({ isActive }) =>
            `rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold border ${
              isActive ? 'border-accent text-accent-darker' : 'border-black/[.14] text-ink hover:bg-black/[.03]'
            }`
          }
        >
          Leerlingen uitnodigen
        </NavLink>
        <div className="mt-auto flex flex-col gap-2">
          <div className="text-xs font-semibold tracking-[.4px] uppercase text-black/40">export</div>
          <Link
            to="/dossier/klas/alle"
            target="_blank"
            rel="noreferrer"
            className="border border-black/[.14] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-center cursor-pointer hover:bg-black/[.02]"
          >
            Erasmus+ PDF (klas)
          </Link>
          <button
            onClick={() => stage && downloadCsv(`bonnetjes-${stage.naam}.csv`, receiptsToCsv(Object.values(receipts), students))}
            className="border border-black/[.14] bg-white rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-center cursor-pointer hover:bg-black/[.02]"
          >
            Excel met alle bonnetjes
          </button>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
