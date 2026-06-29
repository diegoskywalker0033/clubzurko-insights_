'use client'
import {useMemo,useState} from 'react'
import {useDashboardStore} from '@/lib/store'
import {DEMO_DATA} from '@/lib/demoData'
import {DATA_2025} from '@/lib/demoData2'
import {fmtNum,fmtPct,safe} from '@/lib/kpis'
import type {ProyectoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

type DimKey='tipo_estudio'|'cliente'
type MetricKey='sobre_n'|'sobre_nx'|'sol_sin_extra'|'reclutados'|'iniciados'|'tasa_asistencia'|'cumpl_n'

const METRIC_OPTS:{key:MetricKey;label:string;pct:boolean}[]=[
  {key:'sobre_n',label:'% sobre N',pct:true},
  {key:'sobre_nx',label:'% sobre N+Extra',pct:true},
  {key:'sol_sin_extra',label:'Solicitados',pct:false},
  {key:'reclutados',label:'Reclutados',pct:false},
  {key:'iniciados',label:'Iniciados',pct:false},
  {key:'tasa_asistencia',label:'Tasa de asistencia',pct:true},
  {key:'cumpl_n',label:'% Proyectos en N',pct:true},
]

const DEPT_MAP_2026:Record<string,string>={SKINCARE:'EFI',HAIRCARE:'EFI',EFICACIA:'EFI','IN VITRO+IN VIVO':'EFI',TOLERANCIA:'TOL',SOLAR:'SOLAR'}
const DEPT_MAP_2025:Record<string,string>={EFI:'EFI',SOLAR:'SOLAR',TOL:'TOL'}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcByDim(data:ProyectoSemanal[],key:DimKey):any[]{
  const map=new Map<string,ProyectoSemanal[]>()
  for(const r of data){const rec=r as unknown as Record<string,string>;const k=(rec[key]||'Sin datos').trim()||'Sin datos';if(!map.has(k))map.set(k,[]);map.get(k)!.push(r)}
  return Array.from(map.entries()).map(([dim,rows])=>{
    const s=(f:keyof ProyectoSemanal)=>rows.reduce((a,r)=>a+(Number(r[f])||0),0)
    const reclutados=s('reclutados'),iniciados=s('iniciados'),sol_n=s('sol_sin_extra'),sol_nx=s('sol_con_extra'),asistencia=s('asistencia'),pn=s('proyectoen_n'),n=rows.length
    return{dim,n,reclutados,iniciados,sol_n,sol_nx,sobre_n:safe(iniciados,sol_n),sobre_nx:safe(iniciados,sol_nx),cumpl_n:safe(pn,n),tasa_asistencia:safe(asistencia,reclutados),tasa_inicios:safe(iniciados,reclutados)}
  }).sort((a,b)=>b.n-a.n)
}

export default function AnalisisPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[deptFilter,setDeptFilter]=useState('TODOS')
  const[dim,setDim]=useState<DimKey>('tipo_estudio')
  const[metric,setMetric]=useState<MetricKey>('sobre_n')
  const[compDept,setCompDept]=useState('TODOS')
  const[compTipo,setCompTipo]=useState('TODOS')

  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d2025=DATA_2025 as any[]

  const depts=useMemo(()=>['TODOS',...Array.from(new Set(src.map(r=>r.departamento).filter(d=>d&&d!=='NAN'&&d!=='UNDEFINED'))).sort()],[src])
  const tipos=useMemo(()=>['TODOS',...Array.from(new Set(src.map(r=>r.tipo_estudio).filter(t=>t&&t!=='NAN'&&t!=='UNDEFINED'))).sort()],[src])

  // Base filter: by dept
  const filtered=useMemo(()=>deptFilter==='TODOS'?src:src.filter(r=>r.departamento===deptFilter),[src,deptFilter])

  // Dim rows (tipo_estudio or cliente within selected dept)
  const dimRows=useMemo(()=>calcByDim(filtered,dim),[filtered,dim])

  const metaOpt=METRIC_OPTS.find(m=>m.key===metric)!
  const chartDim=useMemo(()=>dimRows.slice(0,15).map(r=>{
    const raw=r[metric]
    return{name:r.dim.length>18?r.dim.substring(0,18)+'…':r.dim,fullName:r.dim,value:metaOpt.pct?(raw??0)*100:raw??0}
  }),[dimRows,metric,metaOpt])

  // Comparison 2025 vs 2026 with filters
  const compData=useMemo(()=>{
    const f26=src.filter(r=>{
      if(compDept!=='TODOS'&&r.departamento!==compDept) return false
      if(compTipo!=='TODOS'&&r.tipo_estudio!==compTipo) return false
      return true
    })
    const f25=compDept==='TODOS'?d2025:d2025.filter((r:any)=>{const g=DEPT_MAP_2025[r.dept_group]||'';const g26=DEPT_MAP_2026[compDept]||compDept;return g===g26})

    const maxW26=Math.max(...f26.map((r:any)=>Number(r.week)||0),0)
    const f25limited=f25.filter((r:any)=>r.week<=maxW26)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg26=(key:string)=>f26.reduce((s:number,r:any)=>s+(Number(r[key])||0),0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agg25=(key:string)=>f25limited.reduce((s:number,r:any)=>s+(Number(r[key])||0),0)

    const r26={n:f26.length,reclutados:agg26('reclutados'),iniciados:agg26('iniciados'),sol_n:agg26('sol_sin_extra'),asistencia:agg26('asistencia'),pn:agg26('proyectoen_n')}
    const r25={n:f25limited.length,reclutados:agg25('reclutados'),iniciados:agg25('iniciados'),sol_n:agg25('sol_sin_extra')}

    // Weekly comparison
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wAgg=(data:any[],key:string)=>{const m=new Map<number,number>();data.forEach((r:any)=>{const w=Number(r.week);m.set(w,(m.get(w)||0)+(Number(r[key])||0))});return m}
    const w26r=wAgg(f26,'reclutados'),w26i=wAgg(f26,'iniciados')
    const w25r=wAgg(f25limited,'reclutados'),w25i=wAgg(f25limited,'iniciados')
    const allW=Array.from(new Set([...Array.from(w26r.keys()),...Array.from(w25r.keys())])).sort((a,b)=>a-b)
    const weekly=allW.map(w=>({'week':`W${w}`,'Reclut 2026':w26r.get(w)??0,'Reclut 2025':w25r.get(w)??0,'Inic 2026':w26i.get(w)??0,'Inic 2025':w25i.get(w)??0}))

    return{r26,r25,weekly,maxW26,f26len:f26.length,f25len:f25limited.length}
  },[src,d2025,compDept,compTipo])

  const metricLabel=(key:MetricKey,r:Record<string,number|null>)=>{
    const vals:Record<MetricKey,number|null>={
      sobre_n:safe(r.iniciados??0,r.sol_n??0),sobre_nx:null,sol_sin_extra:r.sol_n,reclutados:r.reclutados,
      iniciados:r.iniciados,tasa_asistencia:safe(r.asistencia??0,r.reclutados??0),cumpl_n:safe(r.pn??0,r.n??0)
    }
    const v=vals[key]
    if(v===null) return '—'
    const opt=METRIC_OPTS.find(m=>m.key===key)!
    return opt.pct?fmtPct(v):fmtNum(v)
  }

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Rendimiento por dimensión" subtitle="Análisis por departamento, tipo de estudio y cliente · Comparativa 2025 vs 2026"/>

      {/* ── FILTRO PRINCIPAL: DEPARTAMENTO ─────────────────── */}
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label mb-2 block">Filtrar por departamento</label>
        <div className="flex flex-wrap gap-2">
          {depts.map(d=>(
            <button key={d} onClick={()=>setDeptFilter(d)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-colors ${deptFilter===d?'bg-brand-red text-white border-brand-red':'bg-white text-zurko-dark border-gray-200 hover:border-brand-red hover:text-brand-red'}`}>
              {d==='TODOS'?'Todos los departamentos':d}
            </button>
          ))}
        </div>
        {deptFilter!=='TODOS'&&(
          <p className="text-[11px] text-zurko-dark mt-2">Mostrando {filtered.length} proyectos de {deptFilter}</p>
        )}
      </div>

      {/* ── VER POR: TIPO / CLIENTE + MÉTRICA ─────────────── */}
      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div><label className="filter-label">Desagregar por</label>
          <select value={dim} onChange={e=>setDim(e.target.value as DimKey)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            <option value="tipo_estudio">Tipo de estudio</option>
            <option value="cliente">Cliente</option>
          </select></div>
        <div><label className="filter-label">Métrica a mostrar</label>
          <select value={metric} onChange={e=>setMetric(e.target.value as MetricKey)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {METRIC_OPTS.map(m=><option key={m.key} value={m.key}>{m.label}</option>)}
          </select></div>
      </div>

      {/* Chart */}
      <Div t={`${metaOpt.label} por ${dim==='tipo_estudio'?'tipo de estudio':'cliente'}${deptFilter!=='TODOS'?` · ${deptFilter}`:''}`}/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartDim} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={45}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} tickFormatter={v=>metaOpt.pct?`${v.toFixed(0)}%`:fmtNum(v)}/>
            <Tooltip formatter={(v:number)=>metaOpt.pct?`${v.toFixed(1)}%`:fmtNum(v)}/>
            <Bar dataKey="value" name={metaOpt.label} fill="#B11C1F" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <Div t="Tabla completa"/>
      <div className="kpi-card p-0 overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr>
              <th>{dim==='tipo_estudio'?'Tipo de estudio':'Cliente'}</th>
              <th>N Proy.</th><th>Reclutados</th><th>Iniciados</th><th>Sol. N</th>
              <th>% sobre N</th><th>% sobre N+x</th><th>T. asistencia</th><th>T. inicios</th><th>% Proy en N</th>
            </tr></thead>
            <tbody>{dimRows.map((r,i)=>(
              <tr key={i}>
                <td className="font-medium max-w-[200px] truncate" title={r.dim}>{r.dim}</td>
                <td>{fmtNum(r.n)}</td>
                <td className="font-bold text-brand-red">{fmtNum(r.reclutados)}</td>
                <td className="font-bold">{fmtNum(r.iniciados)}</td>
                <td>{fmtNum(r.sol_n)}</td>
                <td className={`font-bold ${(r.sobre_n??0)>=1?'text-green-600':'text-red-600'}`}>{fmtPct(r.sobre_n)}</td>
                <td className={`font-bold ${(r.sobre_nx??0)>=1?'text-green-600':'text-amber-600'}`}>{fmtPct(r.sobre_nx)}</td>
                <td>{fmtPct(r.tasa_asistencia)}</td>
                <td>{fmtPct(r.tasa_inicios)}</td>
                <td><div className="flex items-center gap-2"><div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min((r.cumpl_n??0)*100,100)}%`}}/></div><span>{fmtPct(r.cumpl_n)}</span></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* ══ COMPARATIVA 2025 vs 2026 ══════════════════════════ */}
      <div className="border-t-2 border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-zurko-black mb-1">Comparativa 2025 vs 2026</h2>
        <p className="text-xs text-zurko-dark mb-5">Mismo período — filtrable por departamento y tipo de estudio</p>

        <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
          <div><label className="filter-label">Departamento</label>
            <select value={compDept} onChange={e=>setCompDept(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              <option value="TODOS">Todos</option>
              {['SKINCARE','HAIRCARE','TOLERANCIA','SOLAR'].map(d=><option key={d} value={d}>{d}</option>)}
            </select></div>
          <div><label className="filter-label">Tipo de estudio</label>
            <select value={compTipo} onChange={e=>setCompTipo(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              <option value="TODOS">Todos</option>
              {tipos.filter(t=>t!=='TODOS').map(t=><option key={t} value={t}>{t}</option>)}
            </select></div>
          <div className="flex items-end"><p className="text-xs text-zurko-dark">2026: <strong>{compData.f26len}</strong> proy · 2025: <strong>{compData.f25len}</strong> proy (W1–W{compData.maxW26}){compDept!=='TODOS'&&<span> · Nota: 2025 sin departamento exacto, se usa grupo EFI/TOL/SOLAR</span>}</p></div>
        </div>

        {/* KPI comparison cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {([
            ['Reclutados','reclutados','reclutados'],
            ['Iniciados','iniciados','iniciados'],
            ['% sobre N',null,null],
            ['Tasa asistencia',null,null],
          ] as [string,string|null,string|null][]).map(([label,k26,k25],i)=>{
            const v26=k26?compData.r26[k26 as keyof typeof compData.r26]:safe(compData.r26.iniciados,compData.r26.sol_n)
            const v25=k25?compData.r25[k25 as keyof typeof compData.r25]:safe(compData.r25.iniciados,compData.r25.sol_n)
            const isPct=i>=2
            const fmt=(v:number|null|undefined)=>v===null||v===undefined?'—':isPct?fmtPct(Number(v)):fmtNum(Number(v))
            const delta=(v26!==null&&v26!==undefined&&v25!==null&&v25!==undefined&&v25!==0)?(Number(v26)-Number(v25))/Number(v25):null
            return(
              <div key={label} className="kpi-card">
                <p className="kpi-label mb-2">{label}</p>
                <div className="flex gap-3">
                  <div><p className="text-[10px] text-brand-red font-medium mb-0.5">2026</p><p className="text-xl font-bold text-brand-red">{fmt(v26 as number|null)}</p></div>
                  <div><p className="text-[10px] text-zurko-dark font-medium mb-0.5">2025</p><p className="text-xl font-bold text-zurko-dark">{fmt(v25 as number|null)}</p></div>
                </div>
                {delta!==null&&<p className={`text-[11px] font-medium mt-2 ${delta>=0?'text-green-600':'text-red-600'}`}>{delta>=0?'+':''}{(delta*100).toFixed(1)}% vs 2025</p>}
              </div>
            )
          })}
        </div>

        {/* Weekly comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="kpi-card">
            <h3 className="text-sm font-bold mb-4">Reclutados semanales 2025 vs 2026</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={compData.weekly} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Reclut 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
                <Bar dataKey="Reclut 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="kpi-card">
            <h3 className="text-sm font-bold mb-4">Inicios semanales 2025 vs 2026</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={compData.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
                <Line dataKey="Inic 2026" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
                <Line dataKey="Inic 2025" stroke="#505050" strokeWidth={2} strokeDasharray="4 2" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
