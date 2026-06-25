'use client'
import {GASTO_DATA} from '@/lib/demoData2'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtEur} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'
function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
interface P{categoria:string;presupuesto_total:number;gastado:number;restante:number}
interface G{nombre:string;presupuesto_total:number;gastado:number;partidas:P[]}
interface GD{grupos:G[];total_presupuesto:number;total_gastado:number;total_restante:number}
export default function PresupuestoPage(){
  const d=GASTO_DATA as GD
  const all:(P&{grupo:string})[]=[]
  for(const g of d.grupos){if(g.partidas.length>0)g.partidas.forEach(p=>all.push({...p,grupo:g.nombre}));else all.push({categoria:g.nombre,presupuesto_total:g.presupuesto_total,gastado:g.gastado,restante:g.presupuesto_total-g.gastado,grupo:g.nombre})}
  const chart=all.map(p=>({name:p.categoria.length>22?p.categoria.substring(0,22)+'…':p.categoria,Presupuesto:p.presupuesto_total,Gastado:p.gastado}))
  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Presupuesto 2026" subtitle="Gasto real vs presupuesto"/>
      <Div t="Global"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Presupuesto total" value={fmtEur(d.total_presupuesto)}/><KpiCard label="Gastado" value={fmtEur(d.total_gastado)} accent/><KpiCard label="Disponible" value={fmtEur(d.total_restante)}/><KpiCard label="% Ejecución" value={`${(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%`}/>
      </div>
      <div className="kpi-card mb-6">
        <div className="flex justify-between text-xs mb-2"><span className="font-medium">Ejecución global</span><span className="text-brand-red font-bold">{(d.total_gastado/d.total_presupuesto*100).toFixed(1)}%</span></div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min(d.total_gastado/d.total_presupuesto*100,100)}%`}}/></div>
      </div>
      {d.grupos.map((g,gi)=>(
        <div key={gi}>
          <Div t={g.nombre}/>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <KpiCard label="Presupuesto" value={fmtEur(g.presupuesto_total)} accent/><KpiCard label="Gastado" value={fmtEur(g.gastado)}/><KpiCard label="Disponible" value={fmtEur(g.presupuesto_total-g.gastado)}/><KpiCard label="% Ejec." value={g.presupuesto_total>0?`${(g.gastado/g.presupuesto_total*100).toFixed(1)}%`:g.gastado>0?'∞':'0%'}/>
          </div>
          {g.partidas.length>0&&<div className="kpi-card p-0 overflow-hidden mb-2"><div className="overflow-x-auto"><table className="w-full data-table">
            <thead><tr><th>Partida</th><th>Presupuesto</th><th>Gastado</th><th>Balance</th><th>% Ejec.</th></tr></thead>
            <tbody>
              {g.partidas.map((p,pi)=>{const bal=p.presupuesto_total-p.gastado,over=bal<0,pct=p.presupuesto_total>0?p.gastado/p.presupuesto_total:(p.gastado>0?1:0);return(
                <tr key={pi}><td className="font-medium text-xs">{p.categoria}</td><td>{fmtEur(p.presupuesto_total)}</td><td className="font-bold">{fmtEur(p.gastado)}</td>
                  <td><span className={`font-bold ${over?'text-red-600':'text-green-600'}`}>{over?'':'+' }{fmtEur(bal)}</span></td>
                  <td><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${over?'bg-red-500':'bg-brand-red'}`} style={{width:`${Math.min(pct*100,100)}%`}}/></div><span className="text-xs">{(pct*100).toFixed(1)}%</span></div></td>
                </tr>
              )})}
              <tr className="bg-gray-50 font-bold text-xs"><td>Subtotal</td><td>{fmtEur(g.presupuesto_total)}</td><td className="text-brand-red">{fmtEur(g.gastado)}</td><td><span className={`font-bold ${g.presupuesto_total-g.gastado<0?'text-red-600':'text-green-600'}`}>{g.presupuesto_total-g.gastado>=0?'+':''}{fmtEur(g.presupuesto_total-g.gastado)}</span></td><td>{g.presupuesto_total>0?`${(g.gastado/g.presupuesto_total*100).toFixed(1)}%`:'—'}</td></tr>
            </tbody>
          </table></div></div>}
        </div>
      ))}
      <Div t="Presupuesto vs gasto por partida"/>
      <div className="kpi-card"><ResponsiveContainer width="100%" height={300}><BarChart data={chart.filter(x=>x.Presupuesto>0||x.Gastado>0)} barGap={2} barCategoryGap="25%"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={55}/><YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip formatter={(v:number,n:string)=>[fmtEur(v),n]}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/><Bar dataKey="Gastado" fill="#B11C1F" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div>
    </div>
  )
}
