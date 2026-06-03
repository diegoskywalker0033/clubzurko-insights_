import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'ClubZurko Insights',
  description: 'Dashboard de Reclutamiento y Marketing — Zurko Research',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen bg-[#F7F7F7]">
          <Sidebar />
          {/* pt-14 on mobile to offset fixed top bar */}
          <main className="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
