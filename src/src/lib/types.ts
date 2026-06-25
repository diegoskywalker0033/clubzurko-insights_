export interface ProyectoSemanal {
  week: number; presupuesto: string; nombre: string; sede: string
  riesgo: string; sol_sin_extra: number; sol_con_extra: number
  reclutados: number; asistencia: number; iniciados: number
  abandonos: number; exclusiones: number; no_validos: number
  proyectoen_n: number; proyectoen_nextra: number
  departamento: string; tipo_estudio: string; cliente: string
  retraso: number; estado: string
}
export interface Filtros {
  sede: string; riesgo: string; semana_desde: number; semana_hasta: number; presupuesto: string
}
export interface PerfilMes {
  mes: string; sede: string; asiaticos: number; afros: number; arabe: number
  caucasico: number; latino: number; ft1:number; ft2:number; ft3:number
  ft4:number; ft5:number; ft6:number; bebes:number; hijos:number; total_bdd:number
}
export interface CrecimientoSemanal { week:number; citas:number; altas:number; no_asistencia:number; sede:string }
export interface AccionCaptacion {
  mes:string; responsable:string; categoria:string; fuente:string; perfil:string; sede:string
  leads:number; citas:number; altas:number; gasto:number
}
