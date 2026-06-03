import type { ProyectoSemanal, AnalisisTemporal, KPIResumen, Filtros } from './types'

export const safe = (n: number, d: number): number | null =>
  d === 0 ? null : n / d

export const fmtPct = (v: number | null, decimals = 1): string =>
  v === null ? '—' : `${(v * 100).toFixed(decimals)}%`

export const fmtNum = (v: number): string =>
  Math.round(v).toLocaleString('es-ES')

export const fmtDec = (v: number | null, d = 1): string =>
  v === null ? '—' : v.toFixed(d)

export const fmtEur = (v: number): string =>
  v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export function filtrarDatos(data: ProyectoSemanal[], filtros: Filtros): ProyectoSemanal[] {
  return data.filter(r => {
    if (filtros.sede && filtros.sede !== 'todas' && r.sede !== filtros.sede) return false
    if (filtros.riesgo && filtros.riesgo !== 'todos' && r.riesgo !== filtros.riesgo) return false
    if (filtros.presupuesto && filtros.presupuesto !== 'todos' && r.presupuesto !== filtros.presupuesto) return false
    if (r.week < filtros.semana_desde || r.week > filtros.semana_hasta) return false
    return true
  })
}

export function calcularAnalisisTemporal(data: ProyectoSemanal[]): AnalisisTemporal[] {
  const byWeek = new Map<number, ProyectoSemanal[]>()
  for (const row of data) {
    if (!byWeek.has(row.week)) byWeek.set(row.week, [])
    byWeek.get(row.week)!.push(row)
  }
  return Array.from(byWeek.entries()).sort(([a],[b])=>a-b).map(([week,rows]) => {
    const sum = (key: keyof ProyectoSemanal) => rows.reduce((acc,r)=>acc+(Number(r[key])||0),0)
    const reclutados = sum('reclutados')
    const asistentes = sum('asistencia')
    const inicios = sum('iniciados')
    const abandonos = sum('abandonos')
    const exclusiones = sum('exclusiones')
    const no_validos = sum('no_validos')
    const sol_sin_extra = sum('sol_sin_extra')
    const sol_con_extra = sum('sol_con_extra')
    const proyectoen_n = sum('proyectoen_n')
    const proyectoen_nextra = sum('proyectoen_nextra')
    const n_proyectos = rows.length
    return {
      week, sol_sin_extra, sol_con_extra, reclutados, asistentes, inicios,
      abandonos, no_validos, exclusiones, n_proyectos, proyectoen_n, proyectoen_nextra,
      tasa_asistencia: safe(asistentes, reclutados),
      tasa_inicios: safe(inicios, reclutados),
      tasa_abandono: safe(abandonos, reclutados),
      tasa_exclusion: safe(exclusiones, reclutados),
      tasa_no_validos: safe(no_validos, reclutados),
      cumplimiento_n: safe(proyectoen_n, n_proyectos),
      cumplimiento_nx: safe(proyectoen_nextra, n_proyectos),
      semanas_sobre_n: safe(inicios, sol_sin_extra),
      semanas_sobre_nx: safe(inicios, sol_con_extra),
    }
  })
}

export function calcularKPIResumen(data: ProyectoSemanal[]): KPIResumen {
  const sum = (key: keyof ProyectoSemanal) => data.reduce((acc,r)=>acc+(Number(r[key])||0),0)
  const reclutados = sum('reclutados')
  const asistentes = sum('asistencia')
  const inicios = sum('iniciados')
  const abandonos = sum('abandonos')
  const exclusiones = sum('exclusiones')
  const no_validos = sum('no_validos')
  const sol_sin_extra = sum('sol_sin_extra')
  const sol_con_extra = sum('sol_con_extra')
  const proyectoen_n = sum('proyectoen_n')
  const proyectoen_nextra = sum('proyectoen_nextra')
  const n_proyectos = data.length

  // Promedios por semana (unique weeks)
  const weeks = [...new Set(data.map(r=>r.week))]
  const n_weeks = weeks.length
  const avg_week = (key: keyof ProyectoSemanal) => n_weeks > 0
    ? weeks.reduce((s,w) => s + data.filter(r=>r.week===w).reduce((a,r)=>a+(Number(r[key])||0),0), 0) / n_weeks
    : null

  return {
    reclutados, asistentes, inicios, abandonos, exclusiones, no_validos,
    sol_sin_extra, sol_con_extra, n_proyectos, proyectoen_n, proyectoen_nextra,
    tasa_asistencia: safe(asistentes, reclutados),
    tasa_inicios: safe(inicios, reclutados),
    tasa_abandono: safe(abandonos, reclutados),
    tasa_exclusion: safe(exclusiones, reclutados),
    tasa_no_validos: safe(no_validos, reclutados),
    cumplimiento_n: safe(proyectoen_n, n_proyectos),
    cumplimiento_nx: safe(proyectoen_nextra, n_proyectos),
    semanas_sobre_n: safe(inicios, sol_sin_extra),
    semanas_sobre_nx: safe(inicios, sol_con_extra),
    // Promedios por semana
    avg_sol_sin_extra_semana: avg_week('sol_sin_extra'),
    avg_sol_con_extra_semana: avg_week('sol_con_extra'),
    avg_reclutados_semana: avg_week('reclutados'),
    avg_iniciados_semana: avg_week('iniciados'),
    // Promedios por proyecto
    avg_sol_sin_extra: n_proyectos > 0 ? sol_sin_extra/n_proyectos : null,
    avg_sol_con_extra: n_proyectos > 0 ? sol_con_extra/n_proyectos : null,
    avg_reclutados: n_proyectos > 0 ? reclutados/n_proyectos : null,
    avg_iniciados: n_proyectos > 0 ? inicios/n_proyectos : null,
    // Rendimiento
    rendimiento_reclu_abs: reclutados - sol_sin_extra,
    rendimiento_reclu_pct: safe(reclutados, sol_sin_extra),
    // Reclutados vs inicios
    tasa_reclu_vs_inicios: safe(inicios, reclutados),
  }
}

export async function parseExcelReclutamiento(file: File): Promise<ProyectoSemanal[]> {
  const { read, utils } = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = read(buffer, { type: 'array' })
  const sheetName = 'SEGUIMIENTO SEMANAL PROYECTOS'
  const ws = wb.Sheets[sheetName]
  if (!ws) throw new Error(`No se encontró la hoja: ${sheetName}`)
  const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: 0 })
  return raw
    .filter(r => { const w = Number(r['Week']); return !isNaN(w) && w > 0 && w < 100 })
    .map(r => ({
      week: Number(r['Week']),
      presupuesto: String(r['Presupuesto'] ?? ''),
      nombre: String(r['Nombre'] ?? ''),
      sede: String(r['Sede'] ?? ''),
      riesgo: (String(r['Nivel de Riesgo'] ?? 'low')) as ProyectoSemanal['riesgo'],
      sol_sin_extra: Number(r['Solicitados sin extra']) || 0,
      sol_con_extra: Number(r['Solicitados con extra']) || 0,
      reclutados: Number(r['Reclutados']) || 0,
      asistencia: Number(r['Asistencia']) || 0,
      iniciados: Number(r['Iniciados']) || 0,
      abandonos: Number(r['Abandonos']) || 0,
      exclusiones: Number(r['Exclusiones']) || 0,
      no_validos: Number(r['No validos']) || 0,
      proyectoen_n: Number(r['Proyectoen_N']) || 0,
      proyectoen_nextra: Number(r['Proyectoen_Nextra']) || 0,
    }))
}
