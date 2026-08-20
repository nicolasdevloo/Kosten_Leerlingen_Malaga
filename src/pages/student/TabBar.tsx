import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/app', end: true, label: 'Overzicht' },
  { to: '/app/bonnetjes', end: false, label: 'Bonnetjes' }
]
const TABS_RIGHT = [
  { to: '/app/indienen', label: 'Indienen' },
  { to: '/app/profiel', label: 'Profiel' }
]

function TabIcon({ active }: { active: boolean }) {
  return (
    <div
      className="w-[22px] h-[22px] rounded-[7px]"
      style={{ background: active ? 'oklch(0.55 0.15 255)' : 'rgba(20,21,26,.3)' }}
    />
  )
}

export function TabBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] px-3 pt-2.5 pb-[max(env(safe-area-inset-bottom),18px)] border-t border-black/[.08] flex items-center gap-1 z-20"
      style={{ background: 'rgba(247,246,243,.88)', backdropFilter: 'blur(18px)' }}
    >
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="flex-1 flex flex-col items-center gap-[5px] py-1.5">
          {({ isActive }) => (
            <>
              <TabIcon active={isActive} />
              <span
                className="text-[10.5px] font-semibold"
                style={{ color: isActive ? 'oklch(0.55 0.15 255)' : 'rgba(20,21,26,.3)' }}
              >
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
      <NavLink
        to="/app/toevoegen"
        className="w-[58px] h-[58px] rounded-full bg-accent flex items-center justify-center flex-none relative"
        style={{ boxShadow: '0 8px 20px oklch(0.55 0.15 255 / 0.35)' }}
        aria-label="Bonnetje toevoegen"
      >
        <div className="w-[22px] h-[2.5px] bg-white rounded-full absolute" />
        <div className="w-[2.5px] h-[22px] bg-white rounded-full" />
      </NavLink>
      {TABS_RIGHT.map((t) => (
        <NavLink key={t.to} to={t.to} className="flex-1 flex flex-col items-center gap-[5px] py-1.5">
          {({ isActive }) => (
            <>
              <TabIcon active={isActive} />
              <span
                className="text-[10.5px] font-semibold"
                style={{ color: isActive ? 'oklch(0.55 0.15 255)' : 'rgba(20,21,26,.3)' }}
              >
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}
