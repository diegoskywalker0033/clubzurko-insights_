'use client'
import {useMemo,useState} from 'react'
import {DEMO_DATA} from '@/lib/demoData'
import {DATA_2025,AGENDA_2025,CRECIMIENTO_DATA} from '@/lib/demoData2'
import {useDashboardStore} from '@/lib/store'
import {fmtNum,fmtPct,safe} from '@/lib/kpis'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'
function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
function DB({v26,v25}:{v26:number;v25:number}){if(v25===0)return null;const p=(v26-v25)/v25,pos=p>=0;return<span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${pos?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{pos?'+':''}{(p*100).toFixed(1)}% vs 2025</span>}
export default function ComparativaPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[sf,setSf]=useState('todas')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d26=(isUploaded?rawData:DEMO_DATA) as any[], d25=DATA_2025 as any[], ag25=AGENDA_2025 as any[], cr26=CRECIMIENTO_DATA as any[]
  const mw=useMemo(()=>Math.max(...d26.map((r:any)=>Number(r.week)||0),0),[d26])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fs=(d:any[])=>sf==='todas'?d:d.filter((r:any)=>r.sede===sf)
  const D26=useMemo(()=>fs(d26),[d26,sf])
  const D25=useMemo(()=>fs(d25).filter((r:any)=>r.week<=mw),[d25,sf,mw])
  const AG=useMemo(()=>fs(ag25).filter((r:any)=>r.week<=mw),[ag25,sf,mw])
  const CR=useMemo(()=>fs(cr26),[cr26,sf])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sum=(d:any[],k:string)=>d.reduce((s:number,r:any)=>s+(Number(r[k])||0),0)
  const r26=sum(D26,'reclutados'),i26=sum(D26,'iniciados'),s26=sum(D26,'sol_sin_extra'),a26=sum(CR,'altas')
  const r25=sum(D25,'reclutados'),i25=sum(D25,'iniciados'),s25=sum(D25,'sol_sin_extra'),a25=sum(AG,'altas')
  const wc=useMemo(()=>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg=(d:any[],k:string)=>{const m=new Map<number,number>();d.forEach((r:any)=>{const w=Number(r.week);m.set(w,(m.get(w)||0)+(Number(r[k])||0))});return m}
    const rr26=agg(D26,'reclutados'),ii26=agg(D26,'iniciados'),rr25=agg(D25,'reclutados'),ii25=agg(D25,'iniciados')
    return Array.from(new Set([...Array.from(rr26.keys()),...Array.from(rr25.keys())])).sort((a,b)=>a-b).map(w=>({'week':`W${w}`,'Reclut 2026':rr26.get(w)??0,'Reclut 2025':rr25.get(w)??0,'Inic 2026':ii26.get(w)??0,'Inic 2025':ii25.get(w)??0}))
  },[D26,D25])
  const ac=useMemo(()=>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg=(d:any[])=>{const m=new Map<number,number>();d.forEach((r:any)=>m.set(Number(r.week),(m.get(Number(r.week))||0)+(Number(r.altas)||0)));return m}
    const m25=agg(AG),m26=agg(CR)
    return Array.from(new Set([...Array.from(m25.keys()),...Array.from(m26.keys())])).sort((a,b)=>a-b).map(w=>({'week':`W${w}`,'Altas 2026':m26.get(w)??0,'Altas 2025':m25.get(w)??0}))
  },[AG,CR])
  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Comparativa 2025 vs 2026" subtitle={`Same Period Last Year · W1–W${mw}`}/>
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6"><label className="filter-label">Sede</label><select value={sf} onChange={e=>setSf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{['todas','Madrid','Albacete','Barcelona'].map(s=><option key={s} value={s}>{s==='todas'?'Todas las sedes':s}</option>)}</select></div>
      <Div t={`Reclutamiento W1–W${mw}`}/>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="kpi-card border-t-4 border-t-brand-red"><p className="text-xs font-bold text-brand-red uppercase tracking-wider mb-3">2026</p><div className="space-y-2 text-sm">{([['Reclutados',r26],['Inicios',i26],['Sol.',s26]] as [string,number][]).map(([l,v])=><div key={l} className="flex justify-between"><span className="text-zurko-dark">{l}</span><span className="font-bold">{fmtNum(v)}</span></div>)}<div className="flex justify-between"><span className="text-zurko-dark">Sobre N</span><span className="font-bold text-brand-red">{fmtPct(safe(i26,s26))}</span></div></div></div>
        <div className="kpi-card border-t-4 border-t-zurko-dark"><p className="text-xs font-bold text-zurko-dark uppercase tracking-wider mb-3">2025</p><div className="space-y-2 text-sm">{([['Reclutados',r25],['Inicios',i25],['Sol.',s25]] as [string,number][]).map(([l,v])=><div key={l} className="flex justify-between"><span className="text-zurko-dark">{l}</span><span className="font-bold">{fmtNum(v)}</span></div>)}<div className="flex justify-between"><span className="text-zurko-dark">Sobre N</span><span className="font-bold">{fmtPct(safe(i25,s25))}</span></div></div></div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">{([['Δ Reclutados',r26,r25],['Δ Inicios',i26,i25],['Δ Altas BDD',a26,a25]] as [string,number,number][]).map(([l,v6,v5])=><div key={l} className="kpi-card"><p className="kpi-label mb-1">{l}</p><p className={`text-2xl font-bold ${v6-v5>=0?'text-green-600':'text-red-600'}`}>{v6-v5>=0?'+':''}{fmtNum(v6-v5)}</p><DB v26={v6} v25={v5}/></div>)}</div>
      <Div t="Reclutados semanales"/>
      <div className="kpi-card mb-6"><ResponsiveContainer width="100%" height={220}><BarChart data={wc} barGap={2} barCategoryGap="20%"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="Reclut 2026" fill="#B11C1F" radius={[2,2,0,0]}/><Bar dataKey="Reclut 2025" fill="#C6C6C6" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div>
      <Div t="Inicios semanales"/>
      <div className="kpi-card mb-6"><ResponsiveContainer width="100%" height={200}><LineChart data={wc}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Line dataKey="Inic 2026" stroke="#B11C1F" strokeWidth={2.5} dot={false}/><Line dataKey="Inic 2025" stroke="#505050" strokeWidth={2} strokeDasharray="4 2" dot={false}/></LineChart></ResponsiveContainer></div>
      <Div t={`Altas BDD semanales W1–W${mw}`}/>
      <div className="grid grid-cols-2 gap-3 mb-4"><KpiCard label="Altas BDD 2026" value={fmtNum(a26)} accent/><div className="kpi-card"><p className="kpi-label mb-1">Altas BDD 2025</p><p className="text-2xl font-bold">{fmtNum(a25)}</p><p className="text-[11px] text-zurko-dark">Mismo período W1–W{mw}</p><DB v26={a26} v25={a25}/></div></div>
      <div className="kpi-card"><ResponsiveContainer width="100%" height={200}><BarChart data={ac} barGap={2} barCategoryGap="25%"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="Altas 2026" fill="#B11C1F" radius={[2,2,0,0]}/><Bar dataKey="Altas 2025" fill="#C6C6C6" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div>
    </div>
  )
}
