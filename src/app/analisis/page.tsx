'use client'
import{useMemo,useState}from'react'
import{useDashboardStore}from'@/lib/store'
import{filtrarDatos,calcularKPIResumen,calcularStats,fmtNum,fmtPct,safe}from'@/lib/kpis'
import{DEMO_DATA}from'@/lib/demoData'
import{SPLY_2025,AGENDA_2025,CRECIMIENTO_DATA}from'@/lib/demoData2'
import type{ProyectoSemanal,CrecimientoSemanal}from'@/lib/types'
import PageHeader from'@/components/PageHeader'
import StatCard from'@/components/StatCard'
import{ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,LabelList}from'recharts'
function Div({t}:{t:string}){return<div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
const DEPT_GROUP:Record<string,string>={SKINCARE:'EFICACIA',HAIRCARE:'EFICACIA',EFICACIA:'EFICACIA','IN VITRO+IN VIVO':'EFICACIA',TOLERANCIA:'TOLERANCIA',SOLAR:'SOLAR'}
export default function AnalisisPage(){
  const{rawData,filtros,isUploaded}=useDashboardStore()
  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  const filtered=useMemo(()=>filtrarDatos(src,filtros),[src,filtros])
  const[agg,setAgg]=useState<'departamento'|'tipo_estudio'|'cliente'>('departamento')
  const[sf,setSf]=useState('todas')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sply=SPLY_2025 as any[]
  const crec26=CRECIMIENTO_DATA as CrecimientoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ag25=AGENDA_2025 as any[]
  const maxW=useMemo(()=>Math.max(...filtered.map(r=>r.week),0),[filtered])
  const groupedData=useMemo(()=>{
    const m=new Map<string,ProyectoSemanal[]>()
    for(const r of filtered){const k=r[agg]||'Sin categoría';if(!m.has(k))m.set(k,[]);m.get(k)!.push(r)}
    const rows=Array.from(m.entries()).map(([key,rows])=>{
      const k=calcularKPIResumen(rows)
      return{key,n:rows.length,sol_n:k.sol_sin_extra,reclutados:k.reclutados,iniciados:k.inicios,sobre_n:k.semanas_sobre_n,t_asis:k.tasa_asistencia,t_ini:k.tasa_inicios,t_aband:k.tasa_abandono,retrasos:rows.filter(r=>r.retraso===1).length}
    })
    const totales={key:'TOTAL',n:filtered.length,...(()=>{const k=calcularKPIResumen(filtered);return{sol_n:k.sol_sin_extra,reclutados:k.reclutados,iniciados:k.inicios,sobre_n:k.semanas_sobre_n,t_asis:k.tasa_asistencia,t_ini:k.tasa_inicios,t_aband:k.tasa_abandono,retrasos:filtered.filter(r=>r.retraso===1).length}})()}
    return{rows:rows.sort((a,b)=>b.iniciados-a.iniciados),totales}
  },[filtered,agg])
  const chartData=groupedData.rows.map(r=>({name:r.key.length>18?r.key.slice(0,18)+'…':r.key,Reclutados:r.reclutados,Iniciados:r.iniciados,'N Sol.':r.sol_n}))
  const statsReclu=useMemo(()=>calcularStats(groupedData.rows.map(r=>r.reclutados)),[groupedData])
  const statsIni=useMemo(()=>calcularStats(groupedData.rows.map(r=>r.iniciados)),[groupedData])
  // SPLY
  const deptMap2026=(dept26:string)=>DEPT_GROUP[dept26]||''
  const splyAgg=useMemo(()=>{
    const targetSede=sf==='todas'?'Total':sf
    const src25=sply.filter((s:any)=>s.sede===targetSede)
    return{n:src25.reduce((a:number,s:any)=>a+s.total_n,0),ini:src25.reduce((a:number,s:any)=>a+s.total_ini,0),reclu:src25.reduce((a:number,s:any)=>a+s.total_reclu,0)}
  },[sply,sf])
  const kpi26=useMemo(()=>{const f=sf==='todas'?filtered:filtered.filter(r=>r.sede===sf);const k=calcularKPIResumen(f);return{n:k.sol_sin_extra,ini:k.inicios,reclu:k.reclutados}},[filtered,sf])
  // Altas
  const altasComp=useMemo(()=>{
    const a25f=sf==='todas'?ag25:ag25.filter((r:any)=>r.sede===sf)
    const a26f=sf==='todas'?crec26:crec26.filter(r=>r.sede===sf)
    const tot25=a25f.filter((r:any)=>r.week<=maxW).reduce((s:number,r:any)=>s+r.altas,0)
    const tot26=a26f.reduce((s,r)=>s+r.altas,0)
    return{tot25,tot26}
  },[sf,crec26,ag25,maxW])
  return(<div className="p-6 max-w-[1400px]">
    <PageHeader title="Análisis de Rendimiento" subtitle="Desglose por departamento, tipo de estudio y cliente"/>
    <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6 flex flex-wrap gap-6">
      <div><label className="filter-label">Desagregar por</label><div className="flex gap-2">{(['departamento','tipo_estudio','cliente'] as const).map(v=><button key={v} onClick={()=>setAgg(v)} className={`text-xs px-3 py-1.5 rounded-md border font-medium ${agg===v?'bg-brand-red text-white border-brand-red':'bg-white text-zurko-dark border-gray-200 hover:border-brand-red'}`}>{v==='departamento'?'Departamento':v==='tipo_estudio'?'Tipo de estudio':'Cliente'}</button>)}</div></div>
      <div><label className="filter-label">Sede</label><select value={sf} onChange={e=>setSf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{['todas','Madrid','Albacete','Barcelona'].map(s=><option key={s} value={s}>{s==='todas'?'Todas':s}</option>)}</select></div>
    </div>
    <Div t={`Por ${agg==='departamento'?'departamento':agg==='tipo_estudio'?'tipo de estudio':'cliente'}`}/>
    <div className="kpi-card mb-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={2} barCategoryGap="25%" margin={{top:16}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
          <XAxis dataKey="name" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={40}/>
          <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
          <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
          <Bar dataKey="N Sol." fill="#C6C6C6" radius={[2,2,0,0]}><LabelList dataKey="N Sol." position="top" style={{fontSize:8,fill:'#505050'}}/></Bar>
          <Bar dataKey="Reclutados" fill="#B11C1F" radius={[2,2,0,0]}><LabelList dataKey="Reclutados" position="top" style={{fontSize:8,fill:'#B11C1F',fontWeight:600}}/></Bar>
          <Bar dataKey="Iniciados" fill="#505050" radius={[2,2,0,0]}><LabelList dataKey="Iniciados" position="top" style={{fontSize:8,fill:'#505050'}}/></Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <Div t="Estadísticos descriptivos"/>
    <div className="grid grid-cols-2 gap-3 mb-4"><StatCard label="Reclutados por grupo" stats={statsReclu}/><StatCard label="Iniciados por grupo" stats={statsIni}/></div>
    <div className="kpi-card p-0 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full data-table whitespace-nowrap">
          <thead><tr><th>Grupo</th><th>Proyectos</th><th>N Sol.</th><th>Reclutados</th><th>Iniciados</th><th>% sobre N</th><th>T. Asistencia</th><th>T. Inicios</th><th>T. Abandono</th><th>Retrasos</th></tr></thead>
          <tbody>
            {groupedData.rows.map((r,i)=><tr key={i}><td className="font-medium max-w-[180px]"><span className="truncate block" title={r.key}>{r.key}</span></td><td>{fmtNum(r.n)}</td><td>{fmtNum(r.sol_n)}</td><td className="font-bold text-brand-red">{fmtNum(r.reclutados)}</td><td className="font-bold">{fmtNum(r.iniciados)}</td><td className={r.sobre_n&&r.sobre_n>=1?'text-green-600 font-bold':'text-red-600 font-bold'}>{fmtPct(r.sobre_n)}</td><td>{fmtPct(r.t_asis)}</td><td>{fmtPct(r.t_ini)}</td><td className={r.t_aband&&r.t_aband>0.05?'text-red-600':''}>{fmtPct(r.t_aband)}</td><td>{r.retrasos>0?<span className="text-amber-600 font-medium">{r.retrasos}</span>:'—'}</td></tr>)}
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-300"><td>TOTAL</td><td>{fmtNum(groupedData.totales.n)}</td><td>{fmtNum(groupedData.totales.sol_n)}</td><td className="text-brand-red">{fmtNum(groupedData.totales.reclutados)}</td><td>{fmtNum(groupedData.totales.iniciados)}</td><td className={groupedData.totales.sobre_n&&groupedData.totales.sobre_n>=1?'text-green-600':'text-red-600'}>{fmtPct(groupedData.totales.sobre_n)}</td><td>{fmtPct(groupedData.totales.t_asis)}</td><td>{fmtPct(groupedData.totales.t_ini)}</td><td>{fmtPct(groupedData.totales.t_aband)}</td><td className="text-amber-600">{groupedData.totales.retrasos}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <Div t="Comparativa SPLY — totales acumulados"/>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      {([['N Solicitada',kpi26.n,splyAgg.n],['Reclutados',kpi26.reclu,splyAgg.reclu],['Iniciados',kpi26.ini,splyAgg.ini]] as [string,number,number][]).map(([label,v26,v25])=>{
        const delta=v25>0?(v26-v25)/v25:null
        return(<div key={label} className="kpi-card"><p className="kpi-label mb-2">{label}</p>
          <div className="flex gap-3 items-end"><div><p className="text-[10px] text-brand-red">2026</p><p className="text-xl font-bold text-brand-red">{fmtNum(v26)}</p></div><div><p className="text-[10px] text-zurko-dark">2025</p><p className="text-lg font-bold text-zurko-dark">{fmtNum(v25)}</p></div></div>
          {delta!==null&&<p className={`text-xs font-semibold mt-1 ${delta>=0?'text-green-600':'text-red-600'}`}>{delta>=0?'+':''}{(delta*100).toFixed(1)}% vs 2025</p>}
        </div>)
      })}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="kpi-card border-l-4 border-l-brand-red"><p className="kpi-label mb-1">Altas BDD 2026</p><p className="text-3xl font-bold text-brand-red">{fmtNum(altasComp.tot26)}</p></div>
      <div className="kpi-card border-l-4 border-l-zurko-dark"><p className="kpi-label mb-1">Altas BDD 2025</p><p className="text-3xl font-bold text-zurko-dark">{fmtNum(altasComp.tot25)}</p>{altasComp.tot25>0&&<p className={`text-xs font-semibold mt-1 ${altasComp.tot26>=altasComp.tot25?'text-green-600':'text-red-600'}`}>{altasComp.tot26>=altasComp.tot25?'+':''}{(((altasComp.tot26-altasComp.tot25)/altasComp.tot25)*100).toFixed(1)}% vs 2025</p>}</div>
    </div>
  </div>)
}
