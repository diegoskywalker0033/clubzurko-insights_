'use client'
import { useMemo, useState } from 'react'
import { DEMO_DATA } from '@/lib/demoData'
import { DATA_2025, AGENDA_2025, CRECIMIENTO_DATA } from '@/lib/demoData2'
import { useDashboardStore } from '@/lib/store'
import { fmtNum, fmtPct, safe } from '@/lib/kpis'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

function DeltaBadge({v2026, v2025}:{v2026:number; v2025:number}) {
  if (v2025 === 0) return null
  const pct = (v2026 - v2025) / v2025
  const pos = pct >= 0
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${pos?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
      {pos?'+':''}{(pct*100).toFixed(1)}% vs 2025
    </span>
  )
}

const SEDES = ['todas','Madrid','Albacete','Barcelona']

export default function ComparativaPage() {
  const { rawData, isUploaded } = useDashboardStore()
  const [sedeFiltro, setSedeFiltro] = useState('todas')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data2026 = (isUploaded ? rawData : DEMO_DATA) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data2025 = DATA_2025 as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agenda2025 = AGENDA_2025 as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crec2026 = CRECIMIENTO_DATA as any[]

  // Max week in 2026 — used to limit 2025 to same period
  const maxWeek2026 = useMemo(() =>
    Math.max(...data2026.map((r:any) => Number(r.week)||0), 0),
    [data2026]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterSede = (data: any[]) =>
    sedeFiltro === 'todas' ? data : data.filter((r:any) => r.sede === sedeFiltro)

  // 2026: all available weeks
  const d26 = useMemo(() => filterSede(data2026), [data2026, sedeFiltro])
  // 2025 reclutamiento: same period (W1-maxWeek2026)
  const d25 = useMemo(() =>
    filterSede(data2025).filter((r:any) => r.week <= maxWeek2026),
    [data2025, sedeFiltro, maxWeek2026]
  )
  // 2025 agenda altas: same period
  const ag25 = useMemo(() =>
    filterSede(agenda2025).filter((r:any) => r.week <= maxWeek2026),
    [agenda2025, sedeFiltro, maxWeek2026]
  )
  // 2026 altas BDD
  const cr26 = useMemo(() => filterSede(crec2026), [crec2026, sedeFiltro])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sum = (data: any[], key: string) => data.reduce((s:number,r:any)=>s+(Number(r[key])||0),0)

  const reclu26=sum(d26,'reclutados'), ini26=sum(d26,'iniciados'), sol26=sum(d26,'sol_sin_extra')
  const proy26=d26.length, pn26=sum(d26,'proyectoen_n'), altas26=sum(cr26,'altas')
  const reclu25=sum(d25,'reclutados'), ini25=sum(d25,'iniciados'), sol25=sum(d25,'sol_sin_extra')
  const proy25=d25.length, altas25=sum(ag25,'altas')
  const sn26=safe(ini26,sol26), sn25=safe(ini25,sol25)

  const weeklyChart = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg = (data:any[], key:string) => {
      const m=new Map<number,number>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((r:any)=>{const w=Number(r.week); m.set(w,(m.get(w)||0)+(Number(r[key])||0))})
      return m
    }
    const r26=agg(d26,'reclutados'), i26=agg(d26,'iniciados')
    const r25=agg(d25,'reclutados'), i25=agg(d25,'iniciados')
    const allW=[...new Set([...r26.keys(),...r25.keys()])].sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Reclutados 2026':r26.get(w)??0,'Reclutados 2025':r25.get(w)??0,'Inicios 2026':i26.get(w)??0,'Inicios 2025':i25.get(w)??0}))
  }, [d26,d25])

  const altasChart = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg = (data:any[]) => {
      const m=new Map<number,number>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((r:any)=>m.set(Number(r.week),(m.get(Number(r.week))||0)+(Number(r.altas)||0)))
      return m
    }
    const m25=agg(ag25), m26=agg(cr26)
    const allW=[...new Set([...m25.keys(),...m26.keys()])].sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Altas 2026':m26.get(w)??0,'Altas 2025':m25.get(w)??0}))
  }, [ag25,cr26])

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader
        title="Comparativa 2025 vs 2026"
        subtitle={`Same Period Last Year · W1–W${maxWeek2026} · Reclutamiento y Altas BDD`}
      />

      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label">Sede</label>
        <select value={sedeFiltro} onChange={e=>setSedeFiltro(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
          {SEDES.map(s=><option key={s} value={s}>{s==='todas'?'Todas las sedes':s}</option>)}
        </select>
      </div>

      {/* KPIs lado a lado */}
      <Divider title={`Reclutamiento — mismo período W1–W${maxWeek2026}`}/>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="kpi-card border-t-4 border-t-brand-red">
          <p className="text-xs font-bold text-brand-red uppercase tracking-wider mb-3">2026</p>
          <div className="space-y-2 text-sm">
            {([['Reclutados',reclu26],['Inicios',ini26],['Solicitados',sol26],['N proyectos',proy26],['Proyectos en N',pn26]] as [string,number][]).map(([l,v])=>(
              <div key={l} className="flex justify-between"><span className="text-zurko-dark">{l}</span><span className="font-bold">{fmtNum(v)}</span></div>
            ))}
            <div className="flex justify-between"><span className="text-zurko-dark">Sobre objetivo N</span><span className="font-bold text-brand-red">{fmtPct(sn26)}</span></div>
          </div>
        </div>
        <div className="kpi-card border-t-4 border-t-zurko-dark">
          <p className="text-xs font-bold text-zurko-dark uppercase tracking-wider mb-3">2025</p>
          <div className="space-y-2 text-sm">
            {([['Reclutados',reclu25],['Inicios',ini25],['Solicitados',sol25],['N proyectos',proy25]] as [string,number][]).map(([l,v])=>(
              <div key={l} className="flex justify-between"><span className="text-zurko-dark">{l}</span><span className="font-bold">{fmtNum(v)}</span></div>
            ))}
            <div className="flex justify-between"><span className="text-zurko-dark">Proyectos en N</span><span className="font-bold">—</span></div>
            <div className="flex justify-between"><span className="text-zurko-dark">Sobre objetivo N</span><span className="font-bold">{fmtPct(sn25)}</span></div>
          </div>
        </div>
      </div>

      {/* Deltas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {([['Δ Reclutados',reclu26,reclu25],['Δ Inicios',ini26,ini25],['Δ Altas BDD',altas26,altas25]] as [string,number,number][]).map(([l,v26,v25])=>(
          <div key={l} className="kpi-card">
            <p className="kpi-label mb-1">{l}</p>
            <p className={`text-2xl font-bold ${v26-v25>=0?'text-green-600':'text-red-600'}`} style={{fontFamily:'Sansation,sans-serif'}}>
              {v26-v25>=0?'+':''}{fmtNum(v26-v25)}
            </p>
            <DeltaBadge v2026={v26} v2025={v25}/>
          </div>
        ))}
      </div>

      {/* Reclutados chart */}
      <Divider title="Reclutados semanales 2025 vs 2026"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={weeklyChart} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="Reclutados 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
            <Bar dataKey="Reclutados 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inicios chart */}
      <Divider title="Inicios semanales 2025 vs 2026"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Line dataKey="Inicios 2026" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
            <Line dataKey="Inicios 2025" stroke="#505050" strokeWidth={2} strokeDasharray="4 2" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Altas BDD */}
      <Divider title={`Altas BDD semanales 2025 vs 2026 (W1–W${maxWeek2026})`}/>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <KpiCard label="Altas BDD 2026" value={fmtNum(altas26)} accent sub={`W1–W${maxWeek2026}`}/>
        <div className="kpi-card">
          <p className="kpi-label mb-1">Altas BDD 2025</p>
          <p className="text-2xl font-bold" style={{fontFamily:'Sansation,sans-serif'}}>{fmtNum(altas25)}</p>
          <p className="text-[11px] text-zurko-dark">W1–W{maxWeek2026} mismo período</p>
          <DeltaBadge v2026={altas26} v2025={altas25}/>
        </div>
      </div>
      <div className="kpi-card">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={altasChart} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="Altas 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
            <Bar dataKey="Altas 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
