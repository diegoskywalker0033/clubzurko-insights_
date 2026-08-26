'use client'
import{useMemo,useState}from'react'
import{useDashboardStore}from'@/lib/store'
import{filtrarDatos,calcularKPIResumen,calcularStats,fmtNum,fmtPct}from'@/lib/kpis'
import{DEMO_DATA}from'@/lib/demoData'
import type{ProyectoSemanal}from'@/lib/types'
import PageHeader from'@/components/PageHeader'
import StatCard from'@/components/StatCard'
import{ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,LabelList,Cell}from'recharts'
function Div({t}:{t:string}){return<div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
const COLORS=['#B11C1F','#505050','#C6C6C6','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16','#f97316','#ec4899','#14b8a6','#a855f7']
export default function AnalisisPage(){
  const{rawData,filtros,isUploaded}=useDashboardStore()
  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  const filtered=useMemo(()=>filtrarDatos(src,filtros),[src,filtros])
  const[agg,setAgg]=useState<'departamento'|'tipo_estudio'|'cliente'>('departamento')
  const groupedData=useMemo(()=>{
    const m=new Map<string,ProyectoSemanal[]>()
    for(const r of filtered){const k=(r[agg]||'Sin categoría').toString();if(!m.has(k))m.set(k,[]);m.get(k)!.push(r)}
    const rows=Array.from(m.entries()).map(([key,rows])=>{const k=calcularKPIResumen(rows);return{key,n:rows.length,sol_n:k.sol_sin_extra,reclutados:k.reclutados,iniciados:k.inicios,sobre_n:k.semanas_sobre_n,t_asis:k.tasa_asistencia,t_ini:k.tasa_inicios,t_aband:k.tasa_abandono,retrasos:rows.filter(r=>r.retraso===1).length}}).sort((a,b)=>b.iniciados-a.iniciados)
    const totales={key:'TOTAL',n:filtered.length,...(()=>{const k=calcularKPIResumen(filtered);return{sol_n:k.sol_sin_extra,reclutados:k.reclutados,iniciados:k.inicios,sobre_n:k.semanas_sobre_n,t_asis:k.tasa_asistencia,t_ini:k.tasa_inicios,t_aband:k.tasa_abandono,retrasos:filtered.filter(r=>r.retraso===1).length}})()}
    return{rows,totales}
  },[filtered,agg])
  const statsReclu=useMemo(()=>calcularStats(groupedData.rows.map(r=>r.reclutados)),[groupedData])
  const statsIni=useMemo(()=>calcularStats(groupedData.rows.map(r=>r.iniciados)),[groupedData])
  const chartDataDept=groupedData.rows.map(r=>({name:r.key.length>18?r.key.slice(0,18)+'…':r.key,Reclutados:r.reclutados,Iniciados:r.iniciados,'N Sol.':r.sol_n}))
  const[metric,setMetric]=useState<'iniciados'|'reclutados'|'sol_n'>('iniciados')
  const metricLabel:Record<string,string>={iniciados:'Iniciados',reclutados:'Reclutados',sol_n:'N Solicitada'}
  const chartDataHoriz=groupedData.rows.map((r,i)=>({name:r.key,val:r[metric],color:COLORS[i%COLORS.length]}))
  const horizHeight=Math.max(260,chartDataHoriz.length*28)
  const isDept=agg==='departamento'
  return(<div className="p-6 max-w-[1400px]">
    <PageHeader title="Análisis de rendimiento" subtitle="Desglose por departamento, tipo de estudio y cliente"/>
    <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6 flex flex-wrap gap-6 items-end">
      <div><label className="filter-label">Desagregar por</label><div className="flex gap-2">{(['departamento','tipo_estudio','cliente'] as const).map(v=><button key={v} onClick={()=>setAgg(v)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${agg===v?'bg-brand-red text-white border-brand-red':'bg-white text-zurko-dark border-gray-200 hover:border-brand-red'}`}>{v==='departamento'?'Departamento':v==='tipo_estudio'?'Tipo de estudio':'Cliente'}</button>)}</div></div>
      {!isDept&&(<div><label className="filter-label">Métrica</label><div className="flex gap-2">{(['iniciados','reclutados','sol_n'] as const).map(v=><button key={v} onClick={()=>setMetric(v)} className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${metric===v?'bg-zurko-dark text-white border-zurko-dark':'bg-white text-zurko-dark border-gray-200'}`}>{metricLabel[v]}</button>)}</div></div>)}
    </div>
    <Div t={`Por ${agg==='departamento'?'departamento':agg==='tipo_estudio'?'tipo de estudio':'cliente'}`}/>
    {isDept?(
      <div className="kpi-card mb-4"><ResponsiveContainer width="100%" height={240}><BarChart data={chartDataDept} barGap={2} barCategoryGap="25%" margin={{top:20}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={44}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="N Sol." fill="#C6C6C6" radius={[2,2,0,0]}><LabelList dataKey="N Sol." position="top" style={{fontSize:8,fill:'#505050'}}/></Bar><Bar dataKey="Reclutados" fill="#B11C1F" radius={[2,2,0,0]}><LabelList dataKey="Reclutados" position="top" style={{fontSize:8,fill:'#B11C1F',fontWeight:600}}/></Bar><Bar dataKey="Iniciados" fill="#505050" radius={[2,2,0,0]}><LabelList dataKey="Iniciados" position="top" style={{fontSize:8,fill:'#505050'}}/></Bar></BarChart></ResponsiveContainer></div>
    ):(
      <div className="kpi-card mb-4 overflow-hidden"><p className="text-xs text-zurko-dark mb-3">{groupedData.rows.length} categorías · <strong>{metricLabel[metric]}</strong></p>
        <div style={{overflowY:groupedData.rows.length>15?'auto':'visible',maxHeight:groupedData.rows.length>15?520:undefined}}>
          <ResponsiveContainer width="100%" height={horizHeight}>
            <BarChart data={chartDataHoriz} layout="vertical" barSize={18} margin={{left:8,right:52,top:4,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
              <XAxis type="number" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" width={180} tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/>
              <Bar dataKey="val" name={metricLabel[metric]} radius={[0,3,3,0]}>
                {chartDataHoriz.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                <LabelList dataKey="val" position="right" style={{fontSize:9,fill:'#505050',fontWeight:600}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}
    <Div t="Estadísticos descriptivos"/>
    <div className="grid grid-cols-2 gap-3 mb-4"><StatCard label="Reclutados por grupo" stats={statsReclu}/><StatCard label="Iniciados por grupo" stats={statsIni}/></div>
    <Div t="Tabla detallada"/>
    <div className="kpi-card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full data-table whitespace-nowrap"><thead><tr><th>Grupo</th><th>Proyectos</th><th>N Sol.</th><th>Reclutados</th><th>Iniciados</th><th>% sobre N</th><th>T. Asistencia</th><th>T. Inicios</th><th>T. Abandono</th><th>Retrasos</th></tr></thead><tbody>
      {groupedData.rows.map((r,i)=><tr key={i}><td className="font-medium max-w-[200px]"><span className="truncate block" title={r.key}>{r.key}</span></td><td>{fmtNum(r.n)}</td><td>{fmtNum(r.sol_n)}</td><td className="font-bold text-brand-red">{fmtNum(r.reclutados)}</td><td className="font-bold">{fmtNum(r.iniciados)}</td><td className={r.sobre_n&&r.sobre_n>=1?'text-green-600 font-bold':'text-red-600 font-bold'}>{fmtPct(r.sobre_n)}</td><td>{fmtPct(r.t_asis)}</td><td>{fmtPct(r.t_ini)}</td><td className={r.t_aband&&r.t_aband>0.05?'text-red-600':''}>{fmtPct(r.t_aband)}</td><td>{r.retrasos>0?<span className="text-amber-600 font-medium">{r.retrasos}</span>:'—'}</td></tr>)}
      <tr className="bg-gray-50 font-bold border-t-2 border-gray-300"><td>TOTAL</td><td>{fmtNum(groupedData.totales.n)}</td><td>{fmtNum(groupedData.totales.sol_n)}</td><td className="text-brand-red">{fmtNum(groupedData.totales.reclutados)}</td><td>{fmtNum(groupedData.totales.iniciados)}</td><td className={groupedData.totales.sobre_n&&groupedData.totales.sobre_n>=1?'text-green-600':'text-red-600'}>{fmtPct(groupedData.totales.sobre_n)}</td><td>{fmtPct(groupedData.totales.t_asis)}</td><td>{fmtPct(groupedData.totales.t_ini)}</td><td>{fmtPct(groupedData.totales.t_aband)}</td><td className="text-amber-600">{groupedData.totales.retrasos}</td></tr>
    </tbody></table></div></div>
  </div>)
}
