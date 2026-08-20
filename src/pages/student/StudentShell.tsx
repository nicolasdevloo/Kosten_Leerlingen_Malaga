import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { TabBar } from '@/pages/student/TabBar'

export function StudentShell() {
  const { student } = useSession()
  if (!student) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen max-w-[480px] mx-auto bg-app relative">
      <div className="pb-[190px]">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
