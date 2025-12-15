import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { isUserAdmin } from '@/lib/admin-list'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user || !isUserAdmin(email)) {
     redirect('/')
  }

  // Просто виводимо контент, без бокової панелі
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        {children}
    </div>
  )
}