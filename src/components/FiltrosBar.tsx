'use client'
import {useDashboardStore} from '@/lib/store'
import {DEMO_DATA} from '@/lib/demoData'
import type {ProyectoSemanal} from '@/lib/types'
export default function FiltrosBar(){
  const{filtros,setFiltros,rawData,isUploaded}=useDashboardStore()
  const data=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  const sedes=['todas',...Array.from(new Set(data.map(r=>r.sede))).sort()]
  const weeks=data.map(r=>r.week).filter(Boolean)
  const minW=weeks.length?Math.min(...weeks):1,maxW=weeks.length?Math.max(...weeks):52
  return(<div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div><label className="filter-label">Sede</label><select value={filtros.sede} onChange={e=>setFiltros({sede:e.target.value})} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{sedes.map(s=><option key={s} value={s}>{s==='todas'?'Todas las sedes':s}</option>)}</select></div>
      <div><label className="filter-label">Riesgo</label><select value={filtros.riesgo} onChange={e=>setFiltros({riesgo:e.target.value})} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{['todos','low','medium','high','very_high'].map(r=><option key={r} value={r}>{r==='todos'?'Todos':r}</option>)}</select></div>
      <div><label className="filter-label">Semana desde</label><input type="number" min={minW} max={maxW} value={filtros.semana_desde} onChange={e=>setFiltros({semana_desde:Number(e.target.value)})} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-red"/></div>
      <div><label className="filter-label">Semana hasta</label><input type="number" min={minW} max={maxW} value={filtros.semana_hasta} onChange={e=>setFiltros({semana_hasta:Number(e.target.value)})} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-brand-red"/></div>
    </div>
  </div>)
}
