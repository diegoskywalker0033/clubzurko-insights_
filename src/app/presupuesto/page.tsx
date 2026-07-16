'use client'
import {useMemo,useState} from 'react'
import {GASTO_DATA} from '@/lib/demoData2'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtEur} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

const MESES_ORDER=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Div({t,color='red'}:{t:string;color?:string}){
  return <div className="flex items-center gap-3 mb-3 mt-7"><div className={`w-1 h-5 rounded-full ${color==='blue'?'bg-blue-500':'bg-brand-red'}`}/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>
}

interface Partida{categoria:string;presupuesto_total:number;gastado:number;restante:number;monthly:Record<string,number>}
interface Grupo{nombre:string;presupuesto_total:number;gastado:number;restante:number;monthly:Record<string,number>;partidas:Partida[]}
interface GD{grupos:Grupo[];total_presupuesto:number;total_gastado:number;total_restante:number}

function PartidaTable({grupo,mesFiltro}:{grupo:Grupo;mesFiltro:string}){
  if(grupo.partidas.length===0) return null
  const gastado=(p:Partida)=>mesFiltro==='todos'?p.gastado:(p.monthly[mesFiltro]||0)
  return(
    <div className="kpi-card p-0 overflow-hidden mb-2">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead><tr><th>Partida</th><th>Presupuesto</th><th>Gastado{mesFiltro!=='todos'?` (${mesFiltro})`:''}</th><th>Balance total</th><th>% Ejec.</th></tr></thead>
          <tbody>
            {grupo.partidas.map((p,pi)=>{
              const g=gastado(p),bal=p.presupuesto_total-p.gastado,over=bal<0,pct=p.presupuesto_total>0?p.gastado/p.presupuesto_total:(p.gastado>0?1:0)
              return(<tr key={pi}>
                <td className="font-medium text-xs">{p.categoria}</td>
                <td>{fmtEur(p.presupuesto_total)}</td>
                <td className="font-bold">{fmtEur(g)}</td>
                <td><span className={`font-bold ${over?'text-red-600':'text-green-600'}`}>{over?'':'+' }{fmtEur(bal)}</span></td>
                <td><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${over?'bg-red-500':'bg-brand-red'}`} style={{width:`${Math.min(pct*100,100)}%`}}/></div><span className="text-xs font-medium">{(pct*100).toFixed(1)}%</span></div></td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PresupuestoPage(){
  const d=GASTO_DATA as GD
  const[mesFiltro,setMesFiltro]=useState('todos')
  const[grupoFiltro,setGrupoFiltro]=useState('todos')

  const pagos=d.grupos.find(g=>g.nombre==='PAGO VOLUNTARIOS')!
  const merch=d.grupos.find(g=>g.nombre==='MERCHANDISING')!
  const cap=d.grupos.find(g=>g.nombre==='CAPTACIÓN DE VOLUNTARIOS')!

  const gastadoGrupo=(g:Grupo)=>mesFiltro==='todos'?g.gastado:(g.monthly[mesFiltro]||0)
  const gastadoPartida=(p:Partida)=>mesFiltro==='todos'?p.gastado:(p.monthly[mesFiltro]||0)

  const totalGastadoFiltro=useMemo(()=>{
    if(mesFiltro==='todos') return d.total_gastado
    return d.grupos.reduce((s,g)=>s+(g.monthly[mesFiltro]||0),0)
  },[mesFiltro,d])

  // Monthly evolution for each group
  const monthlyEvol=useMemo(()=>MESES_ORDER.map(m=>({
    mes:m.substring(0,3),
    'Pago Vol.':(pagos.monthly[m]||0),
    'Captación':(cap.monthly[m]||0),
    'Merchandising':(merch.monthly[m]||0),
  })),[pagos,cap,merch])

  // Chart for pagos partidas
  const chartPagos=pagos.partidas.map(p=>({
    name:p.categoria.replace('IN VIVO - ',''),
    Presupuesto:p.presupuesto_total,
    Gastado:gastadoPartida(p),
  }))

  const chartCap=[...cap.partidas,{categoria:'Merchandising',presupuesto_total:merch.presupuesto_total,gastado:merch.gastado,restante:merch.restante,monthly:merch.monthly}].map(p=>({
    name:p.categoria.length>22?p.categoria.substring(0,22)+'…':p.categoria,
    Presupuesto:p.presupuesto_total,
    Gastado:gastadoPartida(p),
  }))

  const showPagos=grupoFiltro==='todos'||grupoFiltro==='pagos'
  const showCap=grupoFiltro==='todos'||grupoFiltro==='captacion'

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Presupuesto 2026" subtitle="Gasto real vs presupuesto · datos del Excel"/>

      {/* Filtros */}
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6 flex flex-wrap gap-4">
        <div><label className="filter-label">Mes</label>
          <select value={mesFiltro} onChange={e=>setMesFiltro(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            <option value="todos">Todo el año</option>
            {MESES_ORDER.map(m=><option key={m} value={m}>{m}</option>)}
          </select></div>
        <div><label className="filter-label">Categoría</label>
          <select value={grupoFiltro} onChange={e=>setGrupoFiltro(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            <option value="todos">Todas las categorías</option>
            <option value="pagos">Pago a Voluntarios</option>
            <option value="captacion">Captación y Marketing</option>
          </select></div>
        {mesFiltro!=='todos'&&<div className="flex items-end"><p className="text-xs text-zurko-dark">Mostrando gasto de <strong>{mesFiltro}</strong> · Total: <strong>{fmtEur(totalGastadoFiltro)}</strong></p></div>}
      </div>

      {/* Global */}
      {grupoFiltro==='todos'&&(<>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Presupuesto total" value={fmtEur(d.total_presupuesto)}/>
          <KpiCard label={mesFiltro==='todos'?'Gastado hasta hoy':`Gastado ${mesFiltro}`} value={fmtEur(totalGastadoFiltro)} accent/>
          <KpiCard label="Disponible (total)" value={fmtEur(d.total_restante)}/>
          <KpiCard label="% Ejecución global" value={`${(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%`}/>
        </div>
        <div className="kpi-card mb-6">
          <div className="flex justify-between text-xs mb-2"><span className="font-medium">Ejecución global</span><span className="text-brand-red font-bold">{(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%</span></div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min(d.total_gastado/d.total_presupuesto*100,100)}%`}}/></div>
        </div>
        <Div t="Evolución mensual del gasto"/>
        <div className="kpi-card mb-8">
          <h3 className="text-sm font-bold mb-4">Gasto por categoría y mes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyEvol}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} width={85}/>
              <Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Line dataKey="Pago Vol." stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
              <Line dataKey="Captación" stroke="#3b82f6" strokeWidth={2} dot={false}/>
              <Line dataKey="Merchandising" stroke="#C6C6C6" strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>)}

      {/* PAGO VOLUNTARIOS */}
      {showPagos&&(
        <div className="border-t-4 border-t-brand-red pt-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-lg font-bold text-zurko-black">Pago a Voluntarios</h2><p className="text-xs text-zurko-dark mt-0.5">Remuneraciones directas por estudios IN VIVO</p></div>
            <div className="text-right"><p className="text-2xl font-bold text-brand-red">{fmtEur(gastadoGrupo(pagos))}</p><p className="text-xs text-zurko-dark">{(pagos.gastado/pagos.presupuesto_total*100).toFixed(1)}% de {fmtEur(pagos.presupuesto_total)}</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {pagos.partidas.map((p,i)=>(
              <div key={i} className="kpi-card">
                <p className="kpi-label mb-1">{p.categoria.replace('IN VIVO - ','')}</p>
                <p className="text-xl font-bold text-brand-red">{fmtEur(gastadoPartida(p))}</p>
                <p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(p.presupuesto_total)}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2"><div className={`h-full rounded-full ${p.presupuesto_total-p.gastado<0?'bg-red-500':'bg-brand-red'}`} style={{width:`${Math.min(p.gastado/p.presupuesto_total*100,100)}%`}}/></div>
              </div>
            ))}
          </div>
          <PartidaTable grupo={pagos} mesFiltro={mesFiltro}/>
          <div className="kpi-card mt-3"><h3 className="text-sm font-bold mb-3">Presupuesto vs Gasto{mesFiltro!=='todos'?` · ${mesFiltro}`:''}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartPagos} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} width={90}/>
                <Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/>
                <Bar dataKey="Gastado" fill="#B11C1F" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CAPTACIÓN */}
      {showCap&&(
        <div className="border-t-4 border-t-blue-500 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-lg font-bold text-zurko-black">Captación y Marketing</h2><p className="text-xs text-zurko-dark mt-0.5">Acciones de captación de voluntarios y merchandising</p></div>
            <div className="text-right"><p className="text-2xl font-bold text-blue-600">{fmtEur(gastadoGrupo(cap)+gastadoGrupo(merch))}</p><p className="text-xs text-zurko-dark">{((cap.gastado+merch.gastado)/(cap.presupuesto_total+merch.presupuesto_total)*100).toFixed(1)}% de {fmtEur(cap.presupuesto_total+merch.presupuesto_total)}</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="kpi-card border-l-4 border-l-zurko-dark"><p className="kpi-label mb-1">Merchandising</p><p className="text-xl font-bold text-zurko-dark">{fmtEur(gastadoGrupo(merch))}</p><p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(merch.presupuesto_total)}</p></div>
            {cap.partidas.slice(0,5).map((p,i)=>(
              <div key={i} className="kpi-card"><p className="kpi-label mb-1">{p.categoria}</p><p className={`text-xl font-bold ${p.restante<0?'text-red-600':'text-zurko-dark'}`}>{fmtEur(gastadoPartida(p))}</p><p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(p.presupuesto_total)}</p>{p.restante<0&&<p className="text-[10px] text-red-600 font-medium mt-0.5">⚠ Desviado {fmtEur(Math.abs(p.restante))}</p>}</div>
            ))}
          </div>
          <PartidaTable grupo={cap} mesFiltro={mesFiltro}/>
          <div className="kpi-card mt-3"><h3 className="text-sm font-bold mb-3">Presupuesto vs Gasto{mesFiltro!=='todos'?` · ${mesFiltro}`:''}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartCap} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={45}/>
                <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/>
                <Bar dataKey="Gastado" fill="#3b82f6" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
