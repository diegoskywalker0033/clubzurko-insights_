import type { ProyectoSemanal, Filtros } from './types'

export const safe = (n:number, d:number): number|null => d===0 ? null : n/d
export const fmtPct = (v:number|null, d=1): string => v===null ? '—' : `${(v*100).toFixed(d)}%`
export const fmtNum = (v:number): string => Math.round(v).toLocaleString('es-ES')
export const fmtDec = (v:number|null, d=1): string => v===null ? '—' : v.toFixed(d)
export const fmtEur = (v:number): string => v.toLocaleString('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0})

export function filtrarDatos(data:ProyectoSemanal[], f:Filtros): ProyectoSemanal[] {
  return data.filter(r => {
    if (f.sede && f.sede!=='todas' && r.sede!==f.sede) return false
    if (f.riesgo && f.riesgo!=='todos' && r.riesgo!==f.riesgo) return false
    if (f.presupuesto && f.presupuesto!=='todos' && r.presupuesto!==f.presupuesto) return false
    if (r.week < f.semana_desde || r.week > f.semana_hasta) return false
    return true
  })
}

export function calcularAnalisisTemporal(data:ProyectoSemanal[]) {
  const byWeek = new Map<number,ProyectoSemanal[]>()
  for (const row of data) { if(!byWeek.has(row.week)) byWeek.set(row.week,[]); byWeek.get(row.week)!.push(row) }
  return Array.from(byWeek.entries()).sort(([a],[b])=>a-b).map(([week,rows]) => {
    const s = (k:keyof ProyectoSemanal) => rows.reduce((a,r)=>a+(Number(r[k])||0),0)
    const reclutados=s('reclutados'),asistentes=s('asistencia'),inicios=s('iniciados')
    const abandonos=s('abandonos'),exclusiones=s('exclusiones'),no_validos=s('no_validos')
    const sol_sin_extra=s('sol_sin_extra'),sol_con_extra=s('sol_con_extra')
    const proyectoen_n=s('proyectoen_n'),proyectoen_nextra=s('proyectoen_nextra'),n=rows.length
    return { week, sol_sin_extra, sol_con_extra, reclutados, asistentes, inicios, abandonos, no_validos, exclusiones,
      n_proyectos:n, proyectoen_n, proyectoen_nextra,
      tasa_asistencia:safe(asistentes,reclutados), tasa_inicios:safe(inicios,reclutados),
      tasa_abandono:safe(abandonos,reclutados), tasa_exclusion:safe(exclusiones,reclutados),
      tasa_no_validos:safe(no_validos,reclutados), cumplimiento_n:safe(proyectoen_n,n),
      cumplimiento_nx:safe(proyectoen_nextra,n), semanas_sobre_n:safe(inicios,sol_sin_extra),
      semanas_sobre_nx:safe(inicios,sol_con_extra) }
  })
}

export function calcularKPIResumen(data:ProyectoSemanal[]) {
  const s = (k:keyof ProyectoSemanal) => data.reduce((a,r)=>a+(Number(r[k])||0),0)
  const reclutados=s('reclutados'),asistentes=s('asistencia'),inicios=s('iniciados')
  const abandonos=s('abandonos'),exclusiones=s('exclusiones'),no_validos=s('no_validos')
  const sol_sin_extra=s('sol_sin_extra'),sol_con_extra=s('sol_con_extra')
  const proyectoen_n=s('proyectoen_n'),proyectoen_nextra=s('proyectoen_nextra'),n=data.length
  const weeks=Array.from(new Set(data.map(r=>r.week))),nw=weeks.length
  const aw = (k:keyof ProyectoSemanal) => nw>0 ? weeks.reduce((t,w)=>t+data.filter(r=>r.week===w).reduce((a,r)=>a+(Number(r[k])||0),0),0)/nw : null
  return { reclutados,asistentes,inicios,abandonos,exclusiones,no_validos,sol_sin_extra,sol_con_extra,
    n_proyectos:n,proyectoen_n,proyectoen_nextra,
    tasa_asistencia:safe(asistentes,reclutados),tasa_inicios:safe(inicios,reclutados),
    tasa_abandono:safe(abandonos,reclutados),tasa_exclusion:safe(exclusiones,reclutados),
    tasa_no_validos:safe(no_validos,reclutados),cumplimiento_n:safe(proyectoen_n,n),
    cumplimiento_nx:safe(proyectoen_nextra,n),semanas_sobre_n:safe(inicios,sol_sin_extra),
    semanas_sobre_nx:safe(inicios,sol_con_extra),
    avg_sol_sin_extra_semana:aw('sol_sin_extra'),avg_sol_con_extra_semana:aw('sol_con_extra'),
    avg_reclutados_semana:aw('reclutados'),avg_iniciados_semana:aw('iniciados'),
    avg_sol_sin_extra:n>0?sol_sin_extra/n:null,avg_sol_con_extra:n>0?sol_con_extra/n:null,
    avg_reclutados:n>0?reclutados/n:null,avg_iniciados:n>0?inicios/n:null,
    rendimiento_reclu_abs:reclutados-sol_sin_extra,rendimiento_reclu_pct:safe(reclutados,sol_sin_extra),
    tasa_reclu_vs_inicios:safe(inicios,reclutados) }
}

export async function parseExcelReclutamiento(file:File): Promise<ProyectoSemanal[]> {
  const {read,utils} = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = read(buf,{type:'array'})
  const ws = wb.Sheets['SEGUIMIENTO SEMANAL PROYECTOS']
  if (!ws) throw new Error('No se encontró la hoja: SEGUIMIENTO SEMANAL PROYECTOS')
  const raw = utils.sheet_to_json<Record<string,unknown>>(ws,{defval:0})
  return raw.filter(r=>{const w=Number(r['Week']);return !isNaN(w)&&w>0&&w<100})
    .map(r=>({
      week:Number(r['Week']),presupuesto:String(r['Presupuesto']??''),
      nombre:String(r['Nombre']??''),sede:String(r['Sede']??''),
      riesgo:String(r['Nivel de Riesgo']??'low'),
      sol_sin_extra:Number(r['Solicitados sin extra'])||0,
      sol_con_extra:Number(r['Solicitados con extra'])||0,
      reclutados:Number(r['Reclutados'])||0,asistencia:Number(r['Asistencia'])||0,
      iniciados:Number(r['Iniciados'])||0,abandonos:Number(r['Abandonos'])||0,
      exclusiones:Number(r['Exclusiones'])||0,no_validos:Number(r['No validos'])||0,
      proyectoen_n:Number(r['Proyectoen_N'])||0,proyectoen_nextra:Number(r['Proyectoen_Nextra'])||0,
      departamento:String(r['DEPARTAMENTO']??'').trim().toUpperCase(),
      tipo_estudio:String(r['TIPO DE ESTUDIO']??'').trim().toUpperCase(),
      cliente:String(r['Cliente']??'').trim(),
      retraso:String(r['Retraso proyecto']).trim()==='1'?1:0,
      estado:String(r['Estado']??''),
    }))
}
