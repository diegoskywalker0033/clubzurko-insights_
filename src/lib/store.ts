import { create } from 'zustand'
import type { ProyectoSemanal, Filtros } from '@/lib/types'

interface DashboardStore {
  // Raw data
  rawData: ProyectoSemanal[]
  setRawData: (data: ProyectoSemanal[]) => void

  // Upload state
  isUploaded: boolean
  fileName: string
  setUploaded: (name: string) => void

  // Global filters
  filtros: Filtros
  setFiltro: <K extends keyof Filtros>(key: K, value: Filtros[K]) => void
  resetFiltros: () => void
}

const defaultFiltros: Filtros = {
  sede: 'todas',
  riesgo: 'todos',
  semana_desde: 1,
  semana_hasta: 53,
  presupuesto: 'todos',
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  rawData: [],
  isUploaded: false,
  fileName: '',

  setRawData: (data) => set({ rawData: data }),

  setUploaded: (name) => set({ isUploaded: true, fileName: name }),

  filtros: defaultFiltros,

  setFiltro: (key, value) =>
    set((state) => ({
      filtros: { ...state.filtros, [key]: value },
    })),

  resetFiltros: () => set({ filtros: defaultFiltros }),
}))
