export interface ProyectoSemanal {
  week: number
  presupuesto: string
  nombre: string
  sede: string
  riesgo: 'low' | 'medium' | 'high' | 'very_high'
  sol_sin_extra: number
  sol_con_extra: number
  reclutados: number
  asistencia: number
  iniciados: number
  abandonos: number
  exclusiones: number
  no_validos: number
  proyectoen_n: number
  proyectoen_nextra: number
}

export interface AnalisisTemporal {
  week: number
  sol_sin_extra: number
  sol_con_extra: number
  reclutados: number
  asistentes: number
  inicios: number
  abandonos: number
  no_validos: number
  exclusiones: number
  n_proyectos: number
  proyectoen_n: number
  proyectoen_nextra: number
  tasa_asistencia: number | null
  tasa_inicios: number | null
  tasa_abandono: number | null
  tasa_exclusion: number | null
  tasa_no_validos: number | null
  cumplimiento_n: number | null
  cumplimiento_nx: number | null
  semanas_sobre_n: number | null
  semanas_sobre_nx: number | null
}

export interface KPIResumen {
  reclutados: number
  asistentes: number
  inicios: number
  abandonos: number
  exclusiones: number
  no_validos: number
  sol_sin_extra: number
  sol_con_extra: number
  n_proyectos: number
  proyectoen_n: number
  proyectoen_nextra: number
  tasa_asistencia: number | null
  tasa_inicios: number | null
  tasa_abandono: number | null
  tasa_exclusion: number | null
  tasa_no_validos: number | null
  cumplimiento_n: number | null
  cumplimiento_nx: number | null
  semanas_sobre_n: number | null
  semanas_sobre_nx: number | null
  avg_sol_sin_extra_semana: number | null
  avg_sol_con_extra_semana: number | null
  avg_reclutados_semana: number | null
  avg_iniciados_semana: number | null
  avg_sol_sin_extra: number | null
  avg_sol_con_extra: number | null
  avg_reclutados: number | null
  avg_iniciados: number | null
  rendimiento_reclu_abs: number
  rendimiento_reclu_pct: number | null
  tasa_reclu_vs_inicios: number | null
}

export interface Filtros {
  sede: string
  riesgo: string
  semana_desde: number
  semana_hasta: number
  presupuesto: string
}

export interface PerfilMes {
  mes: string
  sede: string
  asiaticos: number
  afros: number
  arabe: number
  caucasico: number
  latino: number
  ft1: number
  ft2: number
  ft3: number
  ft4: number
  ft5: number
  ft6: number
  bebes: number
  hijos: number
  total_bdd: number
}

export interface CrecimientoSemanal {
  week: number
  citas: number
  altas: number
  no_asistencia: number
  sede: string
}

export interface AccionCaptacion {
  mes: string
  responsable: string
  categoria: string
  fuente: string
  perfil: string
  sede: string
  leads: number
  citas: number
  altas: number
  gasto: number
}
