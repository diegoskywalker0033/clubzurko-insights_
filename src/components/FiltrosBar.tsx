'use client'

import { useDashboardStore } from '@/lib/store'
import { RotateCcw } from 'lucide-react'

const SEDES = ['todas', 'Madrid', 'Barcelona', 'Albacete']
const RIESGOS = ['todos', 'low', 'medium', 'high', 'very_high']
const RIESGO_LABELS: Record<string, string> = {
  todos: 'Todos', low: 'Bajo', medium: 'Medio', high: 'Alto', very_high: 'Muy alto',
}

export default function FiltrosBar() {
  const { filtros, setFiltro, resetFiltros } = useDashboardStore()

  return (
    <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-card">
      {/* Mobile: stack in 2 cols; Desktop: single row */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-3">
        <div>
          <label className="filter-label">Sede</label>
          <select value={filtros.sede} onChange={e=>setFiltro('sede',e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-zurko-black focus:outline-none focus:border-brand-red">
            {SEDES.map(s=><option key={s} value={s}>{s==='todas'?'Todas':s}</option>)}
          </select>
        </div>
        <div>
          <label className="filter-label">Riesgo</label>
          <select value={filtros.riesgo} onChange={e=>setFiltro('riesgo',e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-zurko-black focus:outline-none focus:border-brand-red">
            {RIESGOS.map(r=><option key={r} value={r}>{RIESGO_LABELS[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="filter-label">Semana desde</label>
          <input type="number" min={1} max={53} value={filtros.semana_desde}
            onChange={e=>setFiltro('semana_desde',Number(e.target.value))}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-brand-red"/>
        </div>
        <div>
          <label className="filter-label">Semana hasta</label>
          <input type="number" min={1} max={53} value={filtros.semana_hasta}
            onChange={e=>setFiltro('semana_hasta',Number(e.target.value))}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-brand-red"/>
        </div>
        <button onClick={resetFiltros}
          className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 text-xs text-zurko-dark hover:text-brand-red transition-colors py-1.5 border border-gray-200 rounded-md md:border-0 md:mt-5">
          <RotateCcw size={12}/> Resetear
        </button>
      </div>
    </div>
  )
}
