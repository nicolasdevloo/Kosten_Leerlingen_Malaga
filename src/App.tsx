import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from '@/data/store'
import { Home } from '@/pages/Home'
import { LinkLanding } from '@/pages/link/LinkLanding'
import { ReopenLink } from '@/pages/link/ReopenLink'
import { StudentShell } from '@/pages/student/StudentShell'
import { Dashboard } from '@/pages/student/Dashboard'
import { ReceiptList } from '@/pages/student/ReceiptList'
import { ReceiptFix } from '@/pages/student/ReceiptFix'
import { AddFlow } from '@/pages/student/AddFlow'
import { Submit } from '@/pages/student/Submit'
import { Profile } from '@/pages/student/Profile'
import { TeacherShell } from '@/pages/teacher/TeacherShell'
import { ClassOverview } from '@/pages/teacher/ClassOverview'
import { InviteStudents } from '@/pages/teacher/InviteStudents'
import { Dossier } from '@/pages/dossier/Dossier'
import { DossierKlas } from '@/pages/dossier/DossierKlas'

export default function App() {
  const hydrated = useStore((s) => s.hydrated)

  useEffect(() => {
    document.title = 'Stagekosten Málaga'
  }, [])

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-black/40 text-sm">Laden…</div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/y/:token" element={<LinkLanding />} />
      <Route path="/heropen/:token" element={<ReopenLink />} />

      <Route path="/app" element={<StudentShell />}>
        <Route index element={<Dashboard />} />
        <Route path="bonnetjes" element={<ReceiptList />} />
        <Route path="bonnetjes/:id" element={<ReceiptFix />} />
        <Route path="indienen" element={<Submit />} />
        <Route path="profiel" element={<Profile />} />
      </Route>
      <Route path="/app/toevoegen" element={<AddFlow />} />

      <Route path="/leerkracht" element={<TeacherShell />}>
        <Route index element={<ClassOverview />} />
        <Route path="leerlingen" element={<InviteStudents />} />
      </Route>

      <Route path="/dossier/klas/:klas" element={<DossierKlas />} />
      <Route path="/dossier/:studentId" element={<Dossier />} />

      <Route path="*" element={<Home />} />
    </Routes>
  )
}
