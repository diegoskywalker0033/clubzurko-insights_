'use client'
import {useMemo,useState} from 'react'
import {useDashboardStore} from '@/lib/store'
import {DEMO_DATA} from '@/lib/demoData'
import {SPLY_2025,AGENDA_2025,CRECIMIENTO_DATA} from '@/lib/demoData2'
import {fmtNum,fmtPct,safe} from '@/lib/kpis'
import type {ProyectoSemanal,CrecimientoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

type DimKey='tipo_estudio'|'cliente'
const DEPT_GROUP:Record<string,string>={SKINCARE:'EFICACIA',HAIRCARE:'EFICACIA',EFICACIA:'EFICACIA','IN VITRO+IN VIVO':'EFICACIA',TOLERANCIA:'TOLERANCIA',SOLAR:'SOLAR'}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcByDim(data:ProyectoSemanal[],key:DimKey):any[]{
  const map=new Map<string,ProyectoSemanal[]>()
  for(const r of data){const rec=r as unknown as Record<string,string>;const k=(rec[key]||'Sin datos').trim()||'Sin datos';if(!map.has(k))map.set(k,[]);map.get(k)!.push(r)}
  return Array.from(map.entries()).map(([dim,rows])=>{
    const s=(f:keyof ProyectoSemanal)=>rows.reduce((a,r)=>a+(Number(r[f])||0),0)
    const reclutados=s('reclutados'),iniciados=s('iniciados'),sol_n=s('sol_sin_extra'),sol_nx=s('sol_con_extra'),asistencia=s('asistencia'),pn=s('proyectoen_n'),n=rows.length
    return{dim,n,reclutados,iniciados,sol_n,sol_nx,sobre_n:safe(iniciados,sol_n),sobre_nx:safe(iniciados,sol_nx),cumpl_n:safe(pn,n),tasa_asistencia:safe(asistencia,reclutados),tasa_inicios:safe(iniciados,reclutados)}
  }).sort((a:any,b:any)=>b.n-a.n)
}

export default function AnalisisPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[deptFilter,setDeptFilter]=useState('TODOS')
  const[dim,setDim]=useState<DimKey>('tipo_estudio')
  const[compSede,setCompSede]=useState('todas')
  const[compDept,setCompDept]=useState('TODOS')

  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sply=SPLY_2025 as any[]
  const crec2026=CRECIMIENTO_DATA as CrecimientoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agenda25=AGENDA_2025 as any[]

  const depts=useMemo(()=>['TODOS',...Array.from(new Set(src.map(r=>r.departamento).filter(d=>d&&d!=='NAN'))).sort()],[src])
  const filtered=useMemo(()=>deptFilter==='TODOS'?src:src.filter(r=>r.departamento===deptFilter),[src,deptFilter])
  const dimRows=useMemo(()=>calcByDim(filtered,dim),[filtered,dim])
  const maxW=useMemo(()=>Math.max(...src.map(r=>r.week),0),[src])

  const totals=useMemo(()=>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sr=(key:string)=>dimRows.reduce((a:number,r:any)=>a+(Number(r[key])||0),0)
    const reclutados=sr('reclutados'),iniciados=sr('iniciados'),sol_n=sr('sol_n'),n=dimRows.reduce((a:number,r:any)=>a+(Number(r.n)||0),0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asistencia=dimRows.reduce((a:number,r:any)=>a+(Number(r.tasa_asistencia||0)*Number(r.reclutados||0)),0)
    return{n,reclutados,iniciados,sol_n,sobre_n:safe(iniciados,sol_n),tasa_asistencia:safe(asistencia,reclutados),tasa_inicios:safe(iniciados,reclutados)}
  },[dimRows])

  // SPLY comparison
  const splyFiltered=useMemo(()=>sply.filter((r:any)=>{
    if(compSede!=='todas'&&r.sede!==compSede) return false
    if(compDept!=='TODOS'&&r.dept!==compDept) return false
    return true
  }),[sply,compSede,compDept])

  const f26=useMemo(()=>src.filter(r=>{
    if(compSede!=='todas'&&r.sede!==compSede) return false
    if(compDept!=='TODOS'&&DEPT_GROUP[r.departamento]!==compDept) return false
    return true
  }),[src,compSede,compDept])

  const kpi26=useMemo(()=>{
    const s=(k:keyof ProyectoSemanal)=>f26.reduce((a,r)=>a+(Number(r[k])||0),0)
    const sol=s('sol_sin_extra'),ini=s('iniciados'),rec=s('reclutados'),asis=s('asistencia')
    return{sol_n:sol,iniciados:ini,reclutados:rec,sobre_n:safe(ini,sol),tasa_asis:safe(asis,rec),tasa_ini:safe(ini,rec)}
  },[f26])

  const kpi25=useMemo(()=>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s=(k:string)=>splyFiltered.reduce((a:number,r:any)=>a+(Number(r[k])||0),0)
    const sol=s('total_n'),ini=s('total_ini'),rec=s('total_reclu')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasa_avg=splyFiltered.length>0?splyFiltered.reduce((a:number,r:any)=>a+r.tasa_asistencia,0)/splyFiltered.length:0
    return{sol_n:sol,iniciados:ini,reclutados:rec,sobre_n:safe(ini,sol),tasa_asis:tasa_avg,tasa_ini:safe(ini,rec)}
  },[splyFiltered])

  const weeklyChart=useMemo(()=>{
    const w26r=new Map<number,number>(),w26i=new Map<number,number>()
    for(const r of f26){w26r.set(r.week,(w26r.get(r.week)||0)+r.reclutados);w26i.set(r.week,(w26i.get(r.week)||0)+r.iniciados)}
    const w25r=new Map<number,number>(),w25i=new Map<number,number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for(const s of splyFiltered){for(const w of (s.weekly||[]) as any[]){if(w.week>maxW)continue;w25r.set(w.week,(w25r.get(w.week)||0)+(w.reclutados||0));w25i.set(w.week,(w25i.get(w.week)||0)+(w.iniciados||0))}}
    const allW=Array.from(new Set([...Array.from(w26r.keys()),...Array.from(w25r.keys())])).sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Reclut. 2026':w26r.get(w)??0,'Reclut. 2025':w25r.get(w)??0,'Inic. 2026':w26i.get(w)??0,'Inic. 2025':w25i.get(w)??0}))
  },[f26,splyFiltered,maxW])

  const altasChart=useMemo(()=>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a25f=compSede==='todas'?agenda25:agenda25.filter((r:any)=>r.sede===compSede)
    const a26f=compSede==='todas'?crec2026:crec2026.filter(r=>r.sede===compSede)
    const m25=new Map<number,number>(),m26=new Map<number,number>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for(const r of a25f){if(r.week<=maxW)m25.set(r.week,(m25.get(r.week)||0)+r.altas)}
    for(const r of a26f){m26.set(r.week,(m26.get(r.week)||0)+r.altas)}
    const allW=Array.from(new Set([...Array.from(m25.keys()),...Array.from(m26.keys())])).sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,'Altas 2026':m26.get(w)??0,'Altas 2025':m25.get(w)??0}))
  },[compSede,crec2026,agenda25,maxW])

  const totalAltas26=altasChart.reduce((s,r)=>s+r['Altas 2026'],0)
  const totalAltas25=altasChart.reduce((s,r)=>s+r['Altas 2025'],0)

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Rendimiento por dimensión" subtitle="Análisis interno 2026 · Comparativa SPLY con datos reales de Métricas Mad/AB"/>

      {/* ANÁLISIS INTERNO */}
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label mb-2 block">Filtrar por departamento</label>
        <div className="flex flex-wrap gap-2">
          {depts.map(d=>(
            <button key={d} onClick={()=>setDeptFilter(d)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-colors ${deptFilter===d?'bg-brand-red text-white border-brand-red':'bg-white text-zurko-dark border-gray-200 hover:border-brand-red hover:text-brand-red'}`}>
              {d==='TODOS'?'Todos':d}
            </button>
          ))}
        </div>
        {deptFilter!=='TODOS'&&<p className="text-[11px] text-zurko-dark mt-2">{filtered.length} proyectos en {deptFilter}</p>}
      </div>
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label">Desagregar por</label>
        <select value={dim} onChange={e=>setDim(e.target.value as DimKey)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red ml-2">
          <option value="tipo_estudio">Tipo de estudio</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      <Div t={`Tabla 2026 — por ${dim==='tipo_estudio'?'tipo de estudio':'cliente'}${deptFilter!=='TODOS'?` · ${deptFilter}`:''}`}/>
      <div className="kpi-card p-0 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr><th>{dim==='tipo_estudio'?'Tipo de estudio':'Cliente'}</th><th>N Proy.</th><th>N Sol.</th><th>Reclutados</th><th>Iniciados</th><th>% sobre N</th><th>% sobre N+x</th><th>T. asistencia</th><th>T. inicios</th><th>% Proy en N</th></tr></thead>
            <tbody>
              {dimRows.map((r:any,i:number)=>(
                <tr key={i}>
                  <td className="font-medium max-w-[200px] truncate" title={r.dim}>{r.dim}</td>
                  <td>{fmtNum(r.n)}</td><td>{fmtNum(r.sol_n)}</td>
                  <td className="font-bold text-brand-red">{fmtNum(r.reclutados)}</td>
                  <td className="font-bold">{fmtNum(r.iniciados)}</td>
                  <td className={`font-bold ${(r.sobre_n??0)>=1?'text-green-600':'text-red-600'}`}>{fmtPct(r.sobre_n)}</td>
                  <td className={`font-bold ${(r.sobre_nx??0)>=1?'text-green-600':'text-amber-600'}`}>{fmtPct(r.sobre_nx)}</td>
                  <td>{fmtPct(r.tasa_asistencia)}</td><td>{fmtPct(r.tasa_inicios)}</td>
                  <td><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min((r.cumpl_n??0)*100,100)}%`}}/></div><span>{fmtPct(r.cumpl_n)}</span></div></td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                <td className="font-bold">TOTAL</td><td>{fmtNum(totals.n)}</td><td>{fmtNum(totals.sol_n)}</td>
                <td className="text-brand-red">{fmtNum(totals.reclutados)}</td><td>{fmtNum(totals.iniciados)}</td>
                <td className={`${(totals.sobre_n??0)>=1?'text-green-600':'text-red-600'}`}>{fmtPct(totals.sobre_n)}</td>
                <td>—</td><td>{fmtPct(totals.tasa_asistencia)}</td><td>{fmtPct(totals.tasa_inicios)}</td><td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARATIVA 2025 vs 2026 */}
      <div className="border-t-4 border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-zurko-black mb-1">Comparativa 2025 vs 2026</h2>
        <p className="text-xs text-zurko-dark mb-5">Datos 2025 de Métricas Mad y Métricas AB · Período: W1–W{maxW} · BCN sin datos 2025</p>

        <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
          <div><label className="filter-label">Sede</label>
            <select value={compSede} onChange={e=>setCompSede(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              <option value="todas">Madrid + Albacete</option>
              <option value="Madrid">Madrid</option>
              <option value="Albacete">Albacete</option>
            </select></div>
          <div><label className="filter-label">Departamento</label>
            <select value={compDept} onChange={e=>setCompDept(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              <option value="TODOS">Todos</option>
              <option value="EFICACIA">EFICACIA (Skincare+Haircare)</option>
              <option value="TOLERANCIA">TOLERANCIA</option>
              <option value="SOLAR">SOLAR (solo Madrid 2025)</option>
            </select></div>
        </div>

        {/* KPI comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {([['N Solicitada','sol_n',false],['Reclutados','reclutados',false],['Iniciados','iniciados',false],['% sobre N','sobre_n',true],['T. Asistencia','tasa_asis',true],['T. Inicios','tasa_ini',true]] as [string,string,boolean][]).map(([label,key,isPct])=>{
            const v26=kpi26[key as keyof typeof kpi26] as number|null
            const v25=kpi25[key as keyof typeof kpi25] as number|null
            const fmt=(v:number|null)=>v===null?'—':isPct?fmtPct(v):fmtNum(v)
            const delta=typeof v26==='number'&&typeof v25==='number'&&v25!==0?(v26-v25)/v25:null
            return(
              <div key={label} className="kpi-card">
                <p className="kpi-label mb-2">{label}</p>
                <div className="flex gap-2 items-end mb-1">
                  <div><p className="text-[10px] text-brand-red font-medium">2026</p><p className="text-xl font-bold text-brand-red">{fmt(v26)}</p></div>
                  <div className="mb-0.5"><p className="text-[10px] text-zurko-dark font-medium">2025</p><p className="text-lg font-bold text-zurko-dark">{fmt(v25)}</p></div>
                </div>
                {delta!==null&&<p className={`text-[10px] font-semibold ${delta>=0?'text-green-600':'text-red-600'}`}>{delta>=0?'+':''}{(delta*100).toFixed(1)}% vs 2025</p>}
              </div>
            )
          })}
        </div>

        {/* Desglose por sede+dept */}
        {splyFiltered.length>0&&(
          <div className="kpi-card p-0 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50"><p className="text-xs font-bold text-zurko-dark uppercase tracking-wider">Detalle 2025 por sede y departamento — fuente: Métricas Mad / Métricas AB</p></div>
            <div className="overflow-x-auto">
              <table className="w-full data-table whitespace-nowrap">
                <thead><tr><th>Sede</th><th>Dpto.</th><th>N Sol.</th><th>Reclutados</th><th>Iniciados</th><th>% sobre N</th><th>T. Reclu</th><th>T. Asist.</th><th>Sem. sobre N</th><th>% Cumpl. N</th></tr></thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {splyFiltered.map((r:any,i:number)=>(
                    <tr key={i}>
                      <td className="font-medium">{r.sede}</td>
                      <td><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-medium">{r.dept}</span></td>
                      <td>{fmtNum(r.total_n)}</td>
                      <td className="font-bold text-brand-red">{fmtNum(r.total_reclu)}</td>
                      <td className="font-bold">{fmtNum(r.total_ini)}</td>
                      <td className={`font-bold ${r.sobre_n>=1?'text-green-600':'text-red-600'}`}>{fmtPct(r.sobre_n)}</td>
                      <td>{fmtPct(r.tasa_reclu)}</td>
                      <td>{fmtPct(r.tasa_asistencia)}</td>
                      <td><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.semanas_sobre_n>0?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{r.semanas_sobre_n} sem.</span></td>
                      <td>{r.cumpl_n_pct>0?`${r.cumpl_n_pct.toFixed(1)}%`:'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly line charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Reclutados semanales</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyChart} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Reclut. 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
                <Bar dataKey="Reclut. 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Iniciados semanales</h3>
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
        </div>

        {/* ALTAS BDD */}
        <div className="border-t-2 border-gray-100 pt-6">
          <h3 className="text-base font-bold text-zurko-black mb-1">Nuevos voluntarios — Altas BDD</h3>
          <p className="text-xs text-zurko-dark mb-4">Agenda 2025 vs Crecimiento BDD 2026 · W1–W{maxW} · filtrado por sede arriba</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="kpi-card border-l-4 border-l-brand-red">
              <p className="kpi-label mb-1">Total altas 2026</p>
              <p className="text-3xl font-bold text-brand-red">{fmtNum(totalAltas26)}</p>
              <p className="text-xs text-zurko-dark mt-1">W1–W{maxW} · {compSede==='todas'?'todas las sedes':compSede}</p>
            </div>
            <div className="kpi-card border-l-4 border-l-zurko-dark">
              <p className="kpi-label mb-1">Total altas 2025</p>
              <p className="text-3xl font-bold text-zurko-dark">{fmtNum(totalAltas25)}</p>
              <p className="text-xs text-zurko-dark mt-1">Mismo período</p>
              {totalAltas25>0&&<p className={`text-xs font-semibold mt-1 ${totalAltas26>=totalAltas25?'text-green-600':'text-red-600'}`}>{totalAltas26>=totalAltas25?'+':''}{(((totalAltas26-totalAltas25)/totalAltas25)*100).toFixed(1)}% vs 2025</p>}
            </div>
          </div>
          <div className="kpi-card">
            <ResponsiveContainer width="100%" height={200}>
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
      </div>
    </div>
  )
}
