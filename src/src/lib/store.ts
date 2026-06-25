import { create } from 'zustand'
import type { ProyectoSemanal, Filtros } from './types'

interface DashboardStore {
  rawData: ProyectoSemanal[]; filtros: Filtros; isUploaded: boolean; fileName: string
  setRawData: (data:ProyectoSemanal[], fileName:string) => void
  setFiltros: (f:Partial<Filtros>) => void
}

export const useDashboardStore = create<DashboardStore>(set => ({
  rawData: [], filtros: {sede:'todas',riesgo:'todos',semana_desde:1,semana_hasta:52,presupuesto:'todos'},
  isUploaded: false, fileName: '',
  setRawData: (data,fileName) => set({rawData:data,isUploaded:true,fileName}),
  setFiltros: f => set(s=>({filtros:{...s.filtros,...f}})),
}))
