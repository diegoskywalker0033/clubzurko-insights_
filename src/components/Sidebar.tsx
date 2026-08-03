'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, LayoutDashboard, Users, Megaphone, Database, Wallet,
  Upload, ChevronRight, X, TrendingUp, BarChart2, UserCircle2,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import clsx from 'clsx'

const navItems = [
  { href: '/inicio',        label: 'ClubZurko Insights', icon: Home },
  { href: '/resumen',       label: 'Resumen Ejecutivo',  icon: LayoutDashboard },
  { href: '/reclutamiento', label: 'Reclutamiento',      icon: Users },
  { href: '/base-datos',    label: 'Base de Datos',      icon: Database },
  { href: '/captacion',     label: 'Captación',          icon: Megaphone },
  { href: '/perfiles',      label: 'Buyer Persona',      icon: UserCircle2 },
  { href: '/presupuesto',   label: 'Presupuesto',        icon: Wallet },
  { href: '/comparativa',   label: 'Comparativa SPLY',   icon: TrendingUp },
  { href: '/analisis',      label: 'Análisis',           icon: BarChart2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isUploaded, fileName } = useDashboardStore()
  const [open, setOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-red rounded-md flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontFamily: 'Sansation, sans-serif' }}>Z</span>
          </div>
          <div>
            <p className="text-sm font-bold text-zurko-black leading-none" style={{ fontFamily: 'Sansation, sans-serif' }}>
              ClubZurko
            </p>
            <p className="text-[10px] text-zurko-dark mt-0.5 leading-none uppercase tracking-wider">Insights</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="md:hidden p-1 text-zurko-dark">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx('nav-link group', active && 'active')}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
              <span className="flex-1 text-xs">{label}</span>
              {active && <ChevronRight size={12} strokeWidth={2} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className={clsx('rounded-md p-3 border', isUploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')}>
          <div className="flex items-center gap-2 mb-1">
            <Upload size={12} className={isUploaded ? 'text-green-600' : 'text-zurko-dark'} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zurko-dark">
              {isUploaded ? 'Datos cargados' : 'Demo mode'}
            </span>
          </div>
          <p className="text-[10px] text-zurko-dark leading-relaxed truncate">
            {isUploaded ? fileName : 'Datos de demo. Sube tu Excel.'}
          </p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-card border border-gray-100"
      >
        <Users size={18} className="text-zurko-dark" />
      </button>
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}
      <aside
        className={clsx(
          'w-56 shrink-0 bg-white border-r border-gray-100 flex-col min-h-screen fixed md:sticky top-0 z-50 transition-transform md:translate-x-0',
          open ? 'translate-x-0 flex' : '-translate-x-full flex md:flex'
        )}
      >
        <NavContent />
      </aside>
    </>
  )
}
