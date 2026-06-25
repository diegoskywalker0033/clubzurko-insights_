'use client'
import {GASTO_DATA} from '@/lib/demoData2'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtEur} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

function Div({t,color='red'}:{t:string;color?:string}){
  return <div className="flex items-center gap-3 mb-3 mt-7"><div className={`w-1 h-5 rounded-full ${color==='blue'?'bg-blue-500':'bg-brand-red'}`}/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>
}

interface P{categoria:string;presupuesto_total:number;gastado:number;restante:number}
interface G{nombre:string;presupuesto_total:number;gastado:number;partidas:P[]}
interface GD{grupos:G[];total_presupuesto:number;total_gastado:number;total_restante:number}

function PartidaTable({grupo}:{grupo:G}){
  if(grupo.partidas.length===0) return null
  return(
    <div className="kpi-card p-0 overflow-hidden mb-2">
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead><tr><th>Partida</th><th>Presupuesto</th><th>Gastado</th><th>Balance</th><th>% Ejecución</th></tr></thead>
          <tbody>
            {grupo.partidas.map((p,pi)=>{
              const bal=p.presupuesto_total-p.gastado
              const over=bal<0
              const pct=p.presupuesto_total>0?p.gastado/p.presupuesto_total:(p.gastado>0?1:0)
              return(
                <tr key={pi}>
                  <td className="font-medium text-xs">{p.categoria}</td>
                  <td>{fmtEur(p.presupuesto_total)}</td>
                  <td className="font-bold">{fmtEur(p.gastado)}</td>
                  <td><span className={`font-bold ${over?'text-red-600':'text-green-600'}`}>{over?'':'+' }{fmtEur(bal)}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${over?'bg-red-500':'bg-brand-red'}`} style={{width:`${Math.min(pct*100,100)}%`}}/>
                      </div>
                      <span className="text-xs font-medium">{(pct*100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            <tr className="bg-gray-50 font-bold text-xs">
              <td>Subtotal</td>
              <td>{fmtEur(grupo.presupuesto_total)}</td>
              <td className="text-brand-red">{fmtEur(grupo.gastado)}</td>
              <td><span className={`font-bold ${grupo.presupuesto_total-grupo.gastado<0?'text-red-600':'text-green-600'}`}>{grupo.presupuesto_total-grupo.gastado>=0?'+':''}{fmtEur(grupo.presupuesto_total-grupo.gastado)}</span></td>
              <td>{grupo.presupuesto_total>0?`${(grupo.gastado/grupo.presupuesto_total*100).toFixed(1)}%`:'—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PresupuestoPage(){
  const d=GASTO_DATA as GD

  const pagos=d.grupos.find(g=>g.nombre==='PAGO VOLUNTARIOS')!
  const merch=d.grupos.find(g=>g.nombre==='MERCHANDISING')!
  const captacion=d.grupos.find(g=>g.nombre==='CAPTACIÓN DE VOLUNTARIOS')!

  // Chart pago voluntarios
  const chartPagos=pagos.partidas.map(p=>({
    name:p.categoria.replace('IN VIVO - ',''),
    Presupuesto:p.presupuesto_total,
    Gastado:p.gastado,
  }))

  // Chart captacion
  const chartCap=[...captacion.partidas,{categoria:merch.nombre,presupuesto_total:merch.presupuesto_total,gastado:merch.gastado,restante:merch.presupuesto_total-merch.gastado}].map(p=>({
    name:p.categoria.length>22?p.categoria.substring(0,22)+'…':p.categoria,
    Presupuesto:p.presupuesto_total,
    Gastado:p.gastado,
  }))

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Presupuesto 2026" subtitle="Gasto real vs presupuesto · Datos actualizados del Excel"/>

      {/* Global summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Presupuesto total" value={fmtEur(d.total_presupuesto)}/>
        <KpiCard label="Gastado hasta hoy" value={fmtEur(d.total_gastado)} accent/>
        <KpiCard label="Disponible" value={fmtEur(d.total_restante)}/>
        <KpiCard label="% Ejecución" value={`${(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%`}/>
      </div>
      <div className="kpi-card mb-8">
        <div className="flex justify-between text-xs mb-2"><span className="font-medium">Ejecución global</span><span className="text-brand-red font-bold">{(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%</span></div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min(d.total_gastado/d.total_presupuesto*100,100)}%`}}/></div>
        <p className="text-[10px] text-zurko-dark mt-2">{fmtEur(d.total_gastado)} gastado de {fmtEur(d.total_presupuesto)} presupuestados · Resta {fmtEur(d.total_restante)}</p>
      </div>

      {/* ── SECCIÓN 1: PAGO A VOLUNTARIOS ──────────────────────── */}
      <div className="border-t-4 border-t-brand-red pt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zurko-black">Pago a Voluntarios</h2>
            <p className="text-xs text-zurko-dark mt-0.5">Remuneraciones directas por estudios IN VIVO</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-red">{fmtEur(pagos.gastado)}</p>
            <p className="text-xs text-zurko-dark">{(pagos.gastado/pagos.presupuesto_total*100).toFixed(1)}% de {fmtEur(pagos.presupuesto_total)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {pagos.partidas.map((p,i)=>(
            <div key={i} className="kpi-card">
              <p className="kpi-label mb-1">{p.categoria.replace('IN VIVO - ','')}</p>
              <p className="text-xl font-bold text-brand-red">{fmtEur(p.gastado)}</p>
              <p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(p.presupuesto_total)}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full ${p.presupuesto_total-p.gastado<0?'bg-red-500':'bg-brand-red'}`} style={{width:`${Math.min(p.gastado/p.presupuesto_total*100,100)}%`}}/>
              </div>
            </div>
          ))}
        </div>
        <PartidaTable grupo={pagos}/>
        <div className="kpi-card mt-3">
          <h3 className="text-sm font-bold mb-3">Presupuesto vs Gasto — Pago Voluntarios</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartPagos} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="Gastado" fill="#B11C1F" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── SECCIÓN 2: CAPTACIÓN Y MARKETING ───────────────────── */}
      <div className="border-t-4 border-t-blue-500 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-zurko-black">Captación y Marketing</h2>
            <p className="text-xs text-zurko-dark mt-0.5">Acciones de captación de voluntarios y merchandising</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{fmtEur(captacion.gastado+merch.gastado)}</p>
            <p className="text-xs text-zurko-dark">{((captacion.gastado+merch.gastado)/(captacion.presupuesto_total+merch.presupuesto_total)*100).toFixed(1)}% de {fmtEur(captacion.presupuesto_total+merch.presupuesto_total)}</p>
          </div>
        </div>

        {/* Merchandising inline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="kpi-card border-l-4 border-l-zurko-dark">
            <p className="kpi-label mb-1">Merchandising</p>
            <p className="text-xl font-bold text-zurko-dark">{fmtEur(merch.gastado)}</p>
            <p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(merch.presupuesto_total)}</p>
          </div>
          {captacion.partidas.slice(0,3).map((p,i)=>(
            <div key={i} className="kpi-card">
              <p className="kpi-label mb-1">{p.categoria}</p>
              <p className={`text-xl font-bold ${p.restante<0?'text-red-600':'text-zurko-dark'}`}>{fmtEur(p.gastado)}</p>
              <p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(p.presupuesto_total)}</p>
              {p.restante<0&&<p className="text-[10px] text-red-600 font-medium mt-0.5">⚠ Desviado {fmtEur(Math.abs(p.restante))}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {captacion.partidas.slice(3).map((p,i)=>(
            <div key={i} className="kpi-card">
              <p className="kpi-label mb-1">{p.categoria}</p>
              <p className={`text-xl font-bold ${p.restante<0?'text-red-600':'text-zurko-dark'}`}>{fmtEur(p.gastado)}</p>
              <p className="text-[10px] text-zurko-dark mt-1">de {fmtEur(p.presupuesto_total)}</p>
              {p.restante<0&&<p className="text-[10px] text-red-600 font-medium mt-0.5">⚠ Desviado</p>}
            </div>
          ))}
        </div>
        <PartidaTable grupo={captacion}/>
        <div className="kpi-card mt-3">
          <h3 className="text-sm font-bold mb-3">Presupuesto vs Gasto — Captación y Marketing</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartCap} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={45}/>
              <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="Gastado" fill="#3b82f6" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
