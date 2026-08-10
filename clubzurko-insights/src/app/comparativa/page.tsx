'use client'
import{useMemo,useState}from'react'
import{DEMO_DATA}from'@/lib/demoData'
import{SPLY_2025,AGENDA_2025,CRECIMIENTO_DATA}from'@/lib/demoData2'
import{useDashboardStore}from'@/lib/store'
import{fmtNum,fmtPct,safe,calcularStats}from'@/lib/kpis'
import PageHeader from'@/components/PageHeader'
import KpiCard from'@/components/KpiCard'
import StatCard from'@/components/StatCard'
import type{CrecimientoSemanal}from'@/lib/types'
import{ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ReferenceLine}from'recharts'
function Div({t}:{t:string}){return<div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

export default function ComparativaPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[sf,setSf]=useState('todas')
  const[dept,setDept]=useState('TODOS')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d26=(isUploaded?rawData:DEMO_DATA) as any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sply=SPLY_2025 as any[]
  const crec26=CRECIMIENTO_DATA as CrecimientoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ag25=AGENDA_2025 as any[]

  const maxW=useMemo(()=>Math.max(...d26.map((r:any)=>Number(r.week)||0),0),[d26])

  // Map 2026 dept → comparison group
  const DEPT_GROUP:Record<string,string>={SKINCARE:'EFICACIA',HAIRCARE:'EFICACIA',EFICACIA:'EFICACIA','IN VITRO+IN VIVO':'EFICACIA',TOLERANCIA:'TOLERANCIA',SOLAR:'SOLAR'}

  // Filter 2026
  const f26=useMemo(()=>d26.filter((r:any)=>{
    if(sf!=='todas'&&r.sede!==sf) return false
    if(dept!=='TODOS'&&DEPT_GROUP[r.departamento]!==dept) return false
    return true
  }),[d26,sf,dept])

  // Filter SPLY — use 'Total' when sede=todas
  const splyF=useMemo(()=>sply.filter((r:any)=>{
    const targetSede=sf==='todas'?'Total':sf
    if(r.sede!==targetSede) return false
    if(dept!=='TODOS'&&r.dept!==dept) return false
    return true
  }),[sply,sf,dept])

  // KPI totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sum26=(k:string)=>f26.reduce((s:number,r:any)=>s+(Number(r[k])||0),0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sumSply=(k:string)=>splyF.reduce((s:number,r:any)=>s+(Number(r[k])||0),0)

  const kpi26={sol_n:sum26('sol_sin_extra'),ini:sum26('iniciados'),reclu:sum26('reclutados'),asis:sum26('asistencia')}
  const kpi25={sol_n:sumSply('total_n'),ini:sumSply('total_ini'),reclu:sumSply('total_reclu')}

  // Weekly chart — 2026 from raw, 2025 from SPLY weekly arrays
  const weeklyChart=useMemo(()=>{
    const w26s=new Map<number,number>(),w26r=new Map<number,number>(),w26i=new Map<number,number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for(const r of f26){const w=Number(r.week);w26s.set(w,(w26s.get(w)||0)+(Number(r.sol_sin_extra)||0));w26r.set(w,(w26r.get(w)||0)+(Number(r.reclutados)||0));w26i.set(w,(w26i.get(w)||0)+(Number(r.iniciados)||0))}
    const w25s=new Map<number,number>(),w25r=new Map<number,number>(),w25i=new Map<number,number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for(const s of splyF){for(const w of (s.weekly||[]) as any[]){w25s.set(w.week,(w25s.get(w.week)||0)+(w.sol_n||0));w25r.set(w.week,(w25r.get(w.week)||0)+(w.reclutados||0));w25i.set(w.week,(w25i.get(w.week)||0)+(w.iniciados||0))}}
    const allW=Array.from(new Set([...Array.from(w26r.keys()),...Array.from(w25r.keys())])).sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Sol. 2026':w26s.get(w)??0,'Sol. 2025':w25s.get(w)??0,'Reclu. 2026':w26r.get(w)??0,'Reclu. 2025':w25r.get(w)??0,'Inic. 2026':w26i.get(w)??0,'Inic. 2025':w25i.get(w)??0}))
  },[f26,splyF])

  // Altas BDD
  const altasChart=useMemo(()=>{
    const a25f=sf==='todas'?ag25:ag25.filter((r:any)=>r.sede===sf)
    const a26f=sf==='todas'?crec26:crec26.filter(r=>r.sede===sf)
    const m25=new Map<number,number>(),m26=new Map<number,number>()
    for(const r of a25f){if(r.week<=maxW)m25.set(r.week,(m25.get(r.week)||0)+r.altas)}
    for(const r of a26f){m26.set(r.week,(m26.get(r.week)||0)+r.altas)}
    const allW=Array.from(new Set([...Array.from(m25.keys()),...Array.from(m26.keys())])).sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Altas 2026':m26.get(w)??0,'Altas 2025':m25.get(w)??0}))
  },[sf,crec26,ag25,maxW])
  const totalAltas26=altasChart.reduce((s,r)=>s+r['Altas 2026'],0)
  const totalAltas25=altasChart.reduce((s,r)=>s+r['Altas 2025'],0)

  // Stats per semana
  const statsReclu26=useMemo(()=>calcularStats(weeklyChart.map(w=>w['Reclu. 2026'])),[weeklyChart])
  const statsReclu25=useMemo(()=>calcularStats(weeklyChart.map(w=>w['Reclu. 2025'])),[weeklyChart])

  function DB({v26,v25}:{v26:number|null;v25:number|null}){
    if(!v26||!v25||v25===0) return null
    const delta=(v26-v25)/v25,pos=delta>=0
    return<span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${pos?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{pos?'+':''}{(delta*100).toFixed(1)}% vs 2025</span>
  }

  return(<div className="p-6 max-w-[1400px]">
    <PageHeader title="Comparativa 2025 vs 2026" subtitle={`SPLY · W1–W${maxW} · Hoja Total del Excel 2025`}/>
    <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
      <div><label className="filter-label">Sede</label><select value={sf} onChange={e=>setSf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{['todas','Madrid','Albacete','Barcelona'].map(s=><option key={s} value={s}>{s==='todas'?'Todas (usa hoja Total)':s}</option>)}</select></div>
      <div><label className="filter-label">Departamento</label><select value={dept} onChange={e=>setDept(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red"><option value="TODOS">Todos</option><option value="EFICACIA">EFICACIA</option><option value="TOLERANCIA">TOLERANCIA</option><option value="SOLAR">SOLAR</option></select></div>
    </div>

    <Div t="KPIs totales W1–W{maxW}"/>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {([['N Solicitada','sol_n'],['Reclutados','reclu'],['Iniciados','ini']] as [string,string][]).map(([label,key])=>{
        const v26=kpi26[key as keyof typeof kpi26] as number
        const v25=kpi25[key as keyof typeof kpi25] as number
        return(<div key={label} className="kpi-card">
          <p className="kpi-label mb-2">{label}</p>
          <div className="flex gap-2 items-end mb-1">
            <div><p className="text-[10px] text-brand-red font-medium">2026</p><p className="text-xl font-bold text-brand-red">{fmtNum(v26)}</p></div>
            <div className="mb-0.5"><p className="text-[10px] text-zurko-dark font-medium">2025</p><p className="text-lg font-bold text-zurko-dark">{fmtNum(v25)}</p></div>
          </div>
          <DB v26={v26} v25={v25}/>
        </div>)
      })}
      {([['% sobre N',safe(kpi26.ini,kpi26.sol_n),safe(kpi25.ini,kpi25.sol_n)],['T. Asistencia',safe(kpi26.asis,kpi26.reclu),null],['T. Inicios',safe(kpi26.ini,kpi26.reclu),safe(kpi25.ini,kpi25.reclu)]] as [string,number|null,number|null][]).map(([label,v26,v25])=>(
        <div key={label} className="kpi-card">
          <p className="kpi-label mb-2">{label}</p>
          <div className="flex gap-2 items-end mb-1">
            <div><p className="text-[10px] text-brand-red font-medium">2026</p><p className="text-xl font-bold text-brand-red">{fmtPct(v26)}</p></div>
            {v25!==null&&<div className="mb-0.5"><p className="text-[10px] text-zurko-dark font-medium">2025</p><p className="text-lg font-bold text-zurko-dark">{fmtPct(v25)}</p></div>}
          </div>
          {v25!==null&&<DB v26={v26||0} v25={v25||0}/>}
        </div>
      ))}
    </div>

    <Div t="Estadísticos descriptivos — reclutados por semana"/>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <StatCard label="Reclutados/semana 2026" stats={statsReclu26}/>
      <StatCard label="Reclutados/semana 2025" stats={statsReclu25}/>
    </div>

    <Div t="N Solicitada semanal — 2026 vs 2025"/>
    <div className="kpi-card mb-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={weeklyChart} barGap={1} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
          <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
          <Bar dataKey="Sol. 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
          <Bar dataKey="Sol. 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <Div t="Reclutados semanales — 2026 vs 2025"/>
    <div className="kpi-card mb-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={weeklyChart} barGap={1} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
          <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
          <Bar dataKey="Reclu. 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
          <Bar dataKey="Reclu. 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    <Div t="Iniciados semanales — 2026 vs 2025"/>
    <div className="kpi-card mb-6">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={weeklyChart}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
          <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
          <Line dataKey="Inic. 2026" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
          <Line dataKey="Inic. 2025" stroke="#505050" strokeWidth={2} strokeDasharray="4 2" dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="border-t-2 border-gray-100 pt-6">
      <h3 className="text-base font-bold text-zurko-black mb-1">Altas BDD — nuevos voluntarios</h3>
      <p className="text-xs text-zurko-dark mb-4">Agenda 2025 vs Crecimiento BDD 2026 · mismo período W1–W{maxW}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="kpi-card border-l-4 border-l-brand-red"><p className="kpi-label mb-1">Altas 2026</p><p className="text-3xl font-bold text-brand-red">{fmtNum(totalAltas26)}</p></div>
        <div className="kpi-card border-l-4 border-l-zurko-dark"><p className="kpi-label mb-1">Altas 2025</p><p className="text-3xl font-bold text-zurko-dark">{fmtNum(totalAltas25)}</p>{totalAltas25>0&&<p className={`text-xs font-semibold mt-1 ${totalAltas26>=totalAltas25?'text-green-600':'text-red-600'}`}>{totalAltas26>=totalAltas25?'+':''}{(((totalAltas26-totalAltas25)/totalAltas25)*100).toFixed(1)}% vs 2025</p>}</div>
      </div>
      <div className="kpi-card"><ResponsiveContainer width="100%" height={200}><BarChart data={altasChart} barGap={2} barCategoryGap="25%"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="Altas 2026" fill="#B11C1F" radius={[2,2,0,0]}/><Bar dataKey="Altas 2025" fill="#C6C6C6" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div>
    </div>
  </div>)
}
