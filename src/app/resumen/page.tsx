'use client'
import { useMemo } from 'react'
import { useDashboardStore } from '@/lib/store'
import { filtrarDatos, calcularKPIResumen, calcularAnalisisTemporal, fmtNum, fmtPct } from '@/lib/kpis'
import { DEMO_DATA } from '@/lib/demoData'
import { PERFILES_DATA } from '@/lib/demoData2'
import type { ProyectoSemanal, PerfilMes } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import FiltrosBar from '@/components/FiltrosBar'
import FileUploader from '@/components/FileUploader'
import KpiCard from '@/components/KpiCard'
import RateCard from '@/components/RateCard'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-6">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

const MESES_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function ResumenPage() {
  const { rawData, filtros, isUploaded } = useDashboardStore()
  const sourceData = (isUploaded ? rawData : DEMO_DATA) as ProyectoSemanal[]
  const filtered = useMemo(() => filtrarDatos(sourceData, filtros), [sourceData, filtros])
  const kpis = useMemo(() => calcularKPIResumen(filtered), [filtered])

  const weeklyData = useMemo(() =>
    calcularAnalisisTemporal(filtered).map(w => ({
      week: `W${w.week}`,
      'Solicitados': w.sol_sin_extra,
      'Reclutados': w.reclutados,
      'Inicios': w.inicios,
    })), [filtered])

  // BDD por sede — último mes disponible
  const perfiles = PERFILES_DATA as PerfilMes[]
  const latestBySede = useMemo(() => {
    const result: Record<string, PerfilMes> = {}
    for (const p of perfiles) {
      const key = p.sede
      const cur = result[key]
      if (!cur || MESES_ORDER.indexOf(p.mes) > MESES_ORDER.indexOf(cur.mes)) result[key] = p
    }
    return result
  }, [perfiles])
  const sedes = ['Madrid','Albacete','Barcelona']
  const totalBDD = sedes.reduce((s, sede) => s + (latestBySede[sede]?.total_bdd || 0), 0)

  const bySede = useMemo(() =>
    sedes.map(sede => ({ sede, ...calcularKPIResumen(filtered.filter(r => r.sede === sede)) })),
    [filtered]
  )

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Resumen Ejecutivo" subtitle="Vista consolidada · Reclutamiento y Base de Datos"/>
      <div className="mb-5"><FileUploader/></div>
      <div className="mb-6"><FiltrosBar/></div>

      {/* BDD PRIMERO */}
      <Divider title="Base de datos — voluntarios activos"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Total BDD" value={fmtNum(totalBDD)} accent sub="todas las sedes"/>
        {sedes.map(sede => (
          <KpiCard key={sede} label={sede} value={fmtNum(latestBySede[sede]?.total_bdd || 0)} sub="voluntarios activos"/>
        ))}
      </div>

      {/* KPIs RECLUTAMIENTO */}
      <Divider title="KPIs de reclutamiento"/>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Reclutados" value={fmtNum(kpis.reclutados)} accent/>
        <KpiCard label="Asistentes" value={fmtNum(kpis.asistentes)}/>
        <KpiCard label="Inicios" value={fmtNum(kpis.inicios)}/>
        <KpiCard label="Proyectos en N" value={fmtNum(kpis.proyectoen_n)}/>
        <KpiCard label="Sobre objetivo N" value={fmtPct(kpis.semanas_sobre_n)} accent/>
        <KpiCard label="Sobre objetivo N+x" value={fmtPct(kpis.semanas_sobre_nx)}/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <RateCard label="Tasa de asistencia" value={kpis.tasa_asistencia} color="blue"/>
        <RateCard label="Tasa de inicios" value={kpis.tasa_inicios} color="green"/>
        <RateCard label="Tasa de abandono" value={kpis.tasa_abandono} color="red"/>
        <RateCard label="Tasa de exclusión" value={kpis.tasa_exclusion} color="amber"/>
        <RateCard label="Tasa no válidos" value={kpis.tasa_no_validos} color="purple"/>
      </div>

      {/* GRÁFICA TENDENCIA */}
      <Divider title="Tendencia semanal"/>
      <div className="kpi-card mb-6">
        <h3 className="text-sm font-bold text-zurko-black mb-4">Solicitados · Reclutados · Inicios</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="gSol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6C6C6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#C6C6C6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gReclu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B11C1F" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#B11C1F" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gInic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#505050" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#505050" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Area type="monotone" dataKey="Solicitados" stroke="#C6C6C6" strokeWidth={2} fill="url(#gSol)"/>
            <Area type="monotone" dataKey="Reclutados" stroke="#B11C1F" strokeWidth={2} fill="url(#gReclu)"/>
            <Area type="monotone" dataKey="Inicios" stroke="#505050" strokeWidth={2} fill="url(#gInic)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* POR SEDE */}
      <Divider title="Rendimiento por sede"/>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bySede.map(s => (
          <div key={s.sede} className="kpi-card border-t-4 border-t-brand-red">
            <h3 className="text-sm font-bold mb-3" style={{fontFamily:'Sansation,sans-serif'}}>{s.sede}</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-zurko-dark">BDD activa</span><span className="font-bold text-brand-red">{fmtNum(latestBySede[s.sede]?.total_bdd||0)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Reclutados</span><span className="font-bold">{fmtNum(s.reclutados)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Inicios</span><span className="font-bold">{fmtNum(s.inicios)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">T. Asistencia</span><span className="font-bold text-brand-red">{fmtPct(s.tasa_asistencia)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Sobre objetivo N</span><span className="font-bold">{fmtPct(s.semanas_sobre_n)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
