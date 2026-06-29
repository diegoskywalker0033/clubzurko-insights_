'use client'
import {useState} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Home,LayoutDashboard,Users,Megaphone,Database,Wallet,Upload,ChevronRight,Menu,X,TrendingUp,BarChart2} from 'lucide-react'
import {useDashboardStore} from '@/lib/store'
import clsx from 'clsx'

const navItems=[
  {href:'/inicio',      label:'ClubZurko Insights', icon:Home},
  {href:'/resumen',     label:'Resumen Ejecutivo',   icon:LayoutDashboard},
  {href:'/reclutamiento',label:'Reclutamiento',      icon:Users},
  {href:'/base-datos',  label:'Base de Datos',       icon:Database},
  {href:'/captacion',   label:'Captación',           icon:Megaphone},
  {href:'/presupuesto', label:'Presupuesto',         icon:Wallet},
  {href:'/comparativa', label:'Comparativa SPLY',    icon:TrendingUp},
  {href:'/analisis',    label:'Análisis',            icon:BarChart2},
]

export default function Sidebar(){
  const pathname=usePathname()
  const{isUploaded,fileName}=useDashboardStore()
  const[open,setOpen]=useState(false)
  const NavContent=()=>(<>
    <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-brand-red rounded-md flex items-center justify-center shrink-0"><span className="text-white text-xs font-bold">Z</span></div>
        <div><p className="text-sm font-bold text-zurko-black leading-none">ClubZurko</p><p className="text-[10px] text-zurko-dark mt-0.5 leading-none uppercase tracking-wider">Insights</p></div>
      </div>
      <button onClick={()=>setOpen(false)} className="md:hidden p-1 text-zurko-dark"><X size={18}/></button>
    </div>
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {navItems.map(({href,label,icon:Icon})=>{const active=pathname===href;return(
        <Link key={href} href={href} onClick={()=>setOpen(false)} className={clsx('nav-link group',active&&'active')}>
          <Icon size={15} strokeWidth={active?2.5:1.75}/><span className="flex-1 text-xs">{label}</span>
          {active&&<ChevronRight size={12} strokeWidth={2} className="opacity-60"/>}
        </Link>
      )})}
    </nav>
    <div className="px-3 pb-4">
      <div className={clsx('rounded-md p-3 border',isUploaded?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200')}>
        <div className="flex items-center gap-2 mb-1"><Upload size={12} className={isUploaded?'text-green-600':'text-zurko-dark'}/><span className="text-[10px] font-medium uppercase tracking-wider text-zurko-dark">{isUploaded?'Datos cargados':'Demo mode'}</span></div>
        <p className="text-[10px] text-zurko-dark leading-relaxed truncate">{isUploaded?fileName:'Datos de demo. Sube tu Excel.'}</p>
      </div>
    </div>
    <div className="px-5 py-3 border-t border-gray-100"><p className="text-[9px] text-zurko-light uppercase tracking-widest">Zurko Research © 2026</p></div>
  </>)
  return(<>
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3 shadow-sm">
      <button onClick={()=>setOpen(true)} className="p-1 text-zurko-dark"><Menu size={20}/></button>
      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-brand-red rounded-md flex items-center justify-center"><span className="text-white text-[10px] font-bold">Z</span></div><span className="text-sm font-bold text-zurko-black">ClubZurko Insights</span></div>
    </div>
    {open&&(<div className="md:hidden fixed inset-0 z-50 flex"><div className="fixed inset-0 bg-black/30" onClick={()=>setOpen(false)}/><aside className="relative w-64 bg-white flex flex-col h-full shadow-xl z-50"><NavContent/></aside></div>)}
    <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-gray-100 flex-col min-h-screen sticky top-0"><NavContent/></aside>
  </>)
}
