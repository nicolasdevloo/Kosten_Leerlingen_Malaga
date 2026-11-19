import { Outlet } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { TabBar } from '@/pages/student/TabBar'

export function StudentShell() {
  const { student } = useSession()

  // Dit toestel heeft geen bevestigde sessie (bv. bij een beginscherm-icoon waarvan het geheugen
  // leeg bleek, zoals soms gebeurt op iPhone). Vroeger stuurden we dan door naar de kale root, die
  // zonder sessie het leerkrachten-slot toont — zo kreeg een leerling of collega per ongeluk de
  // PIN-vraag te zien. Toon in plaats daarvan een duidelijke, geruststellende melding.
  if (!student) {
    return (
      <div className="min-h-screen max-w-[480px] mx-auto bg-app px-6 pt-16 flex flex-col gap-4 items-center text-center">
        <div className="text-xl font-bold">We herkennen dit toestel niet</div>
        <div className="text-sm text-black/55 leading-[1.6]">
          Je gegevens staan hier niet (meer) bewaard. Dat kan gebeuren net na het toevoegen van het icoon aan je
          beginscherm. Open je persoonlijke link nog eens — die kreeg je via WhatsApp of e-mail van je begeleider —
          en bevestig opnieuw.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-app relative">
      <div className="pb-[190px]">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
