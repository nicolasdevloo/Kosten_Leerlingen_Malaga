import { useState } from 'react'
import { useStore } from '@/data/store'

export function TeacherGate({ children }: { children: React.ReactNode }) {
  const teacherUnlocked = useStore((s) => s.teacherUnlocked)
  const unlockTeacher = useStore((s) => s.unlockTeacher)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (teacherUnlocked) return <>{children}</>

  const submit = () => {
    if (unlockTeacher(pin)) {
      setError(false)
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-6">
      <div className="max-w-[360px] w-full flex flex-col gap-4 items-center text-center">
        <div className="text-xl font-bold">Leerkrachtendashboard</div>
        <div className="text-sm text-black/55 leading-[1.6]">Dit onderdeel is enkel voor de begeleider. Vul de toegangscode in.</div>
        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          inputMode="numeric"
          type="password"
          autoFocus
          placeholder="Toegangscode"
          className={`w-full text-center text-lg font-bold tracking-[4px] border rounded-xl px-4 py-3.5 outline-none ${
            error ? 'border-red-500' : 'border-black/[.16]'
          }`}
        />
        {error && <div className="text-sm text-red-600">Onjuiste code, probeer opnieuw.</div>}
        <button onClick={submit} className="bg-accent text-white rounded-xl px-5 py-3.5 text-sm font-bold w-full">
          Bevestigen
        </button>
      </div>
    </div>
  )
}
