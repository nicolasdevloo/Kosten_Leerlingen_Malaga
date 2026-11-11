import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/data/store'
import { Home } from '@/pages/Home'
import { LinkLanding } from '@/pages/link/LinkLanding'
import { StudentShell } from '@/pages/student/StudentShell'
import { Dashboard } from '@/pages/student/Dashboard'
import { ReceiptList } from '@/pages/student/ReceiptList'
import { ReceiptFix } from '@/pages/student/ReceiptFix'
import { AddFlow } from '@/pages/student/AddFlow'
import { Submit } from '@/pages/student/Submit'
import { Profile } from '@/pages/student/Profile'
import { TeacherShell } from '@/pages/teacher/TeacherShell'
import { TeacherGate } from '@/pages/teacher/TeacherGate'
import { ClassOverview } from '@/pages/teacher/ClassOverview'
import { InviteStudents } from '@/pages/teacher/InviteStudents'
import { Dossier } from '@/pages/dossier/Dossier'
import { DossierKlas } from '@/pages/dossier/DossierKlas'

export default function App() {
  const hydrated = useStore((s) => s.hydrated)
  const sessionToken = useStore((s) => s.sessionToken)

  useEffect(() => {
    document.title = 'Stagekosten Málaga'
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-black/40 text-sm">Laden…</div>
    )
  }

  // Een leerling zet de app op zijn beginscherm; dat icoon negeert welke pagina er open was en
  // start altijd op de kale rootlink. Een leerling die al eens bevestigde, moet daar meteen
  // naar zijn eigen dashboard gaan — niet naar de leerkrachtenlauncher of de PIN-vraag.
  const rootElement = sessionToken ? (
    <Navigate to="/app" replace />
  ) : (
    <TeacherGate>
      <Home />
    </TeacherGate>
  )

  return (
    <Routes>
      <Route path="/" element={rootElement} />
      <Route path="/y/:token" element={<LinkLanding />} />

      <Route path="/app" element={<StudentShell />}>
        <Route index element={<Dashboard />} />
        <Route path="bonnetjes" element={<ReceiptList />} />
        <Route path="bonnetjes/:id" element={<ReceiptFix />} />
        <Route path="indienen" element={<Submit />} />
        <Route path="profiel" element={<Profile />} />
      </Route>
      <Route path="/app/toevoegen" element={<AddFlow />} />

      <Route
        path="/leerkracht"
        element={
          <TeacherGate>
            <TeacherShell />
          </TeacherGate>
        }
      >
        <Route index element={<ClassOverview />} />
        <Route path="leerlingen" element={<InviteStudents />} />
      </Route>

      <Route
        path="/dossier/klas/:klas"
        element={
          <TeacherGate>
            <DossierKlas />
          </TeacherGate>
        }
      />
      <Route path="/dossier/:studentId" element={<Dossier />} />

      <Route path="*" element={rootElement} />
    </Routes>
  )
}
