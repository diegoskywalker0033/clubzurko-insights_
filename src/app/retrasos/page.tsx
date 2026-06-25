'use client'
import {useMemo,useState} from 'react'
import {useDashboardStore} from '@/lib/store'
import {DEMO_DATA} from '@/lib/demoData'
import {fmtNum,fmtPct,safe} from '@/lib/kpis'
import type {ProyectoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import {AlertTriangle,Download} from 'lucide-react'

function Div({t,color='amber'}:{t:string;color?:string}){
  return <div className="flex items-center gap-3 mb-3 mt-7"><div className={`w-1 h-5 rounded-full ${color==='red'?'bg-red-500':'bg-amber-500'}`}/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>
}

export default function RetrasosPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[sedeFilter,setSedeFilter]=useState('todas')
  const[deptFilter,setDeptFilter]=useState('todos')
  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  const retrasados=useMemo(()=>src.filter(r=>r.retraso===1),[src])
  const sedes=['todas',...Array.from(new Set(retrasados.map(r=>r.sede))).sort()]
  const depts=['todos',...Array.from(new Set(retrasados.map(r=>r.departamento).filter(Boolean))).sort()]
  const filtered=useMemo(()=>retrasados.filter(r=>{
    if(sedeFilter!=='todas'&&r.sede!==sedeFilter) return false
    if(deptFilter!=='todos'&&r.departamento!==deptFilter) return false
    return true
  }),[retrasados,sedeFilter,deptFilter])

  const byEstudio=useMemo(()=>{
    const map=new Map<string,ProyectoSemanal[]>()
    for(const r of filtered){const k=r.presupuesto.startsWith('S0')?r.presupuesto:r.nombre;if(!map.has(k))map.set(k,[]);map.get(k)!.push(r)}
    return Array.from(map.entries()).map(([estudio,ps])=>({
      estudio,n:ps.length,
      sede:Array.from(new Set(ps.map(p=>p.sede))).join(', '),
      dept:Array.from(new Set(ps.map(p=>p.departamento))).join(', '),
      tipo:Array.from(new Set(ps.map(p=>p.tipo_estudio))).join(', '),
      cliente:Array.from(new Set(ps.map(p=>p.cliente))).join(', '),
      reclutados:ps.reduce((s,p)=>s+p.reclutados,0),
      iniciados:ps.reduce((s,p)=>s+p.iniciados,0),
      sol_n:ps.reduce((s,p)=>s+p.sol_sin_extra,0),
      proy_n:ps.reduce((s,p)=>s+p.proyectoen_n,0),
      semanas:Array.from(new Set(ps.map(p=>p.week))).sort((a,b)=>a-b),
    })).sort((a,b)=>b.n-a.n)
  },[filtered])

  const exportCSV=()=>{
    const h=['Estudio','Cliente','Dpto','Tipo','Sede','N Proyectos','Semanas','Reclutados','Iniciados','N Sol.','% sobre N']
    const rows=byEstudio.map(e=>[e.estudio,e.cliente,e.dept,e.tipo,e.sede,e.n,e.semanas.map(s=>`W${s}`).join(' '),e.reclutados,e.iniciados,e.sol_n,fmtPct(safe(e.iniciados,e.sol_n))])
    const csv=[h,...rows].map(r=>r.join(';')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='retrasos.csv';a.click()
  }

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Retrasos" subtitle={`${filtered.length} proyectos · ${byEstudio.length} estudios afectados`}>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 bg-white"><Download size={12}/> CSV</button>
      </PageHeader>
      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div><label className="filter-label">Sede</label>
          <select value={sedeFilter} onChange={e=>setSedeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {sedes.map(s=><option key={s} value={s}>{s==='todas'?'Todas':s}</option>)}</select></div>
        <div><label className="filter-label">Departamento</label>
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {depts.map(d=><option key={d} value={d}>{d==='todos'?'Todos':d}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="kpi-card border-l-4 border-l-amber-500"><p className="kpi-label mb-1">Proyectos con retraso</p><p className="text-3xl font-bold text-amber-600">{fmtNum(filtered.length)}</p><p className="text-xs text-zurko-dark mt-1">de {fmtNum(src.length)} totales ({fmtPct(safe(filtered.length,src.length))})</p></div>
        <div className="kpi-card border-l-4 border-l-red-500"><p className="kpi-label mb-1">Estudios afectados</p><p className="text-3xl font-bold text-red-600">{fmtNum(byEstudio.length)}</p><p className="text-xs text-zurko-dark mt-1">identificador S00XXX</p></div>
        <div className="kpi-card"><p className="kpi-label mb-1">Reclutados (retraso)</p><p className="text-2xl font-bold">{fmtNum(filtered.reduce((s,r)=>s+r.reclutados,0))}</p></div>
        <div className="kpi-card"><p className="kpi-label mb-1">Sobre N (retraso)</p><p className="text-2xl font-bold text-brand-red">{fmtPct(safe(filtered.reduce((s,r)=>s+r.iniciados,0),filtered.reduce((s,r)=>s+r.sol_sin_extra,0)))}</p></div>
      </div>
      <Div t="Estudios con retraso (S00XXX)"/>
      <div className="kpi-card p-0 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr><th>Estudio</th><th>Cliente</th><th>Dpto.</th><th>Tipo</th><th>Sede</th><th>N Proy.</th><th>Semanas</th><th>Reclut.</th><th>Inician</th><th>N Sol.</th><th>% sobre N</th><th>En N</th></tr></thead>
            <tbody>{byEstudio.map((e,i)=>(
              <tr key={i}>
                <td><span className="font-bold text-brand-red">{e.estudio}</span></td>
                <td className="text-xs max-w-[130px] truncate" title={e.cliente}>{e.cliente||'—'}</td>
                <td><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{e.dept}</span></td>
                <td className="text-xs">{e.tipo}</td>
                <td>{e.sede}</td>
                <td className="font-medium text-amber-600">{e.n}</td>
                <td className="text-xs text-zurko-dark">{e.semanas.map(s=>`W${s}`).join(' ')}</td>
                <td>{fmtNum(e.reclutados)}</td>
                <td>{fmtNum(e.iniciados)}</td>
                <td>{fmtNum(e.sol_n)}</td>
                <td className={`font-bold ${(safe(e.iniciados,e.sol_n)??0)<1?'text-red-600':'text-green-600'}`}>{fmtPct(safe(e.iniciados,e.sol_n))}</td>
                <td>{e.proy_n}/{e.n}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <Div t="Proyectos individuales" color="red"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr><th>Sem.</th><th>Estudio</th><th>Proyecto</th><th>Sede</th><th>Dpto.</th><th>Cliente</th><th>Reclut.</th><th>Inician</th><th>N Sol.</th><th>En N</th></tr></thead>
            <tbody>{filtered.map((r,i)=>(
              <tr key={i}>
                <td className="font-medium">W{r.week}</td>
                <td><span className="text-xs font-medium text-brand-red">{r.presupuesto}</span></td>
                <td className="text-xs max-w-[180px] truncate" title={r.nombre}>{r.nombre}</td>
                <td>{r.sede}</td>
                <td><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{r.departamento}</span></td>
                <td className="text-xs max-w-[110px] truncate" title={r.cliente}>{r.cliente||'—'}</td>
                <td>{fmtNum(r.reclutados)}</td>
                <td>{fmtNum(r.iniciados)}</td>
                <td>{fmtNum(r.sol_sin_extra)}</td>
                <td><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.proyectoen_n?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.proyectoen_n?'✓':'✗'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={14} className="text-amber-600 shrink-0"/>
        <p className="text-xs text-amber-700">Un estudio (S00XXX) aparece como afectado si alguno de sus proyectos tiene <strong>Retraso proyecto = 1</strong> en el Excel.</p>
      </div>
    </div>
  )
}
