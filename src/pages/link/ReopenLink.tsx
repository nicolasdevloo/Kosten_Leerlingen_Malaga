import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/data/store'

export function ReopenLink() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const reopenByToken = useStore((s) => s.reopenByToken)
  const [result, setResult] = useState<'pending' | 'done' | 'not-found'>('pending')

  useEffect(() => {
    if (!token) return
    setResult(reopenByToken(token) ? 'done' : 'not-found')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (result === 'not-found') {
    return (
      <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 flex flex-col gap-4 items-center text-center">
        <div className="text-xl font-bold">Niet gevonden op dit toestel</div>
        <div className="text-sm text-black/55 leading-[1.6]">
          Open deze link op het toestel waarmee je ook je dossier indiende — daar staat je dossier lokaal bewaard.
        </div>
      </div>
    )
  }

  if (result === 'pending') return null

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 pb-8 flex flex-col gap-5 items-center text-center">
      <div className="w-[66px] h-[66px] rounded-full bg-good-bar flex-none animate-pop" />
      <div className="text-xl font-bold">Dossier heropend</div>
      <div className="text-sm text-black/55 leading-[1.6]">
        Je kan je bonnetjes weer aanvullen of aanpassen. Dien opnieuw in als je klaar bent.
      </div>
      <button onClick={() => navigate('/app')} className="mt-2 bg-accent rounded-xl py-4 px-8 text-[15.5px] font-bold text-white">
        Naar de app
      </button>
    </div>
  )
}
