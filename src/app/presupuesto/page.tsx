'use client'
import { GASTO_DATA } from '@/lib/demoData2'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import { fmtEur } from '@/lib/kpis'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

interface Partida { categoria: string; presupuesto_total: number; gastado: number; restante: number }
interface Grupo { nombre: string; presupuesto_total: number; gastado: number; partidas: Partida[] }
interface GastoData { grupos: Grupo[]; total_presupuesto: number; total_gastado: number; total_restante: number }

export default function PresupuestoPage() {
  const data = GASTO_DATA as GastoData

  const todasPartidas: (Partida & {grupo: string})[] = []
  for (const g of data.grupos) {
    if (g.partidas.length > 0) {
      g.partidas.forEach(p => todasPartidas.push({...p, grupo: g.nombre}))
    } else {
      todasPartidas.push({categoria: g.nombre, presupuesto_total: g.presupuesto_total, gastado: g.gastado, restante: g.presupuesto_total - g.gastado, grupo: g.nombre})
    }
  }

  const chartData = todasPartidas.map(p => ({
    name: p.categoria.length > 22 ? p.categoria.substring(0,22)+'…' : p.categoria,
    Presupuesto: p.presupuesto_total,
    Gastado: p.gastado,
  }))

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Presupuesto 2026" subtitle="Gasto real vs presupuesto por partida"/>

      <Divider title="Resumen global"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Presupuesto total" value={fmtEur(data.total_presupuesto)}/>
        <KpiCard label="Gastado hasta hoy" value={fmtEur(data.total_gastado)} accent/>
        <KpiCard label="Disponible" value={fmtEur(data.total_restante)}/>
        <KpiCard label="% Ejecución" value={`${(data.total_gastado/data.total_presupuesto*100).toFixed(1)}%`}/>
      </div>
      <div className="kpi-card mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium">Ejecución presupuestaria global</span>
          <span className="text-brand-red font-bold">{(data.total_gastado/data.total_presupuesto*100).toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min(data.total_gastado/data.total_presupuesto*100,100)}%`}}/>
        </div>
      </div>

      {/* Grupos con partidas */}
      {data.grupos.map((grupo, gi) => (
        <div key={gi}>
          <Divider title={grupo.nombre}/>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <KpiCard label="Presupuesto grupo" value={fmtEur(grupo.presupuesto_total)} accent/>
            <KpiCard label="Gastado" value={fmtEur(grupo.gastado)}/>
            <KpiCard label="Disponible" value={fmtEur(grupo.presupuesto_total - grupo.gastado)}/>
            <KpiCard label="% Ejecución" value={grupo.presupuesto_total > 0 ? `${(grupo.gastado/grupo.presupuesto_total*100).toFixed(1)}%` : grupo.gastado > 0 ? '∞' : '0%'}/>
          </div>

          {grupo.partidas.length > 0 && (
            <div className="kpi-card p-0 overflow-hidden mb-2">
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Partida</th>
                      <th>Presupuesto</th>
                      <th>Gastado</th>
                      <th>Balance</th>
                      <th>% Ejecución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.partidas.map((p, pi) => {
                      const balance = p.presupuesto_total - p.gastado
                      const pct = p.presupuesto_total > 0 ? p.gastado/p.presupuesto_total : (p.gastado > 0 ? 1 : 0)
                      const over = balance < 0
                      return (
                        <tr key={pi}>
                          <td className="font-medium text-xs">{p.categoria}</td>
                          <td>{fmtEur(p.presupuesto_total)}</td>
                          <td className="font-bold">{fmtEur(p.gastado)}</td>
                          <td>
                            <span className={`font-bold ${over ? 'text-red-600' : 'text-green-600'}`}>
                              {over ? '' : '+'}{fmtEur(balance)}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                      <td>
                        <span className={`font-bold ${grupo.presupuesto_total-grupo.gastado < 0 ? 'text-red-600':'text-green-600'}`}>
                          {grupo.presupuesto_total-grupo.gastado >= 0 ? '+':''}{fmtEur(grupo.presupuesto_total-grupo.gastado)}
                        </span>
                      </td>
                      <td>{grupo.presupuesto_total > 0 ? `${(grupo.gastado/grupo.presupuesto_total*100).toFixed(1)}%` : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Total global */}
      <div className="kpi-card bg-gray-50 border-2 border-gray-200 mt-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <span className="text-sm font-bold" style={{fontFamily:'Sansation,sans-serif'}}>TOTAL 2026</span>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-zurko-dark text-xs">Presupuesto: </span><span className="font-bold">{fmtEur(data.total_presupuesto)}</span></div>
            <div><span className="text-zurko-dark text-xs">Gastado: </span><span className="font-bold text-brand-red">{fmtEur(data.total_gastado)}</span></div>
            <div><span className="text-zurko-dark text-xs">Balance: </span><span className="font-bold text-green-600">+{fmtEur(data.total_restante)}</span></div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <Divider title="Presupuesto vs gasto por partida"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.filter(d=>d.Presupuesto>0||d.Gastado>0)} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={55}/>
            <YAxis tickFormatter={v=>fmtEur(v)} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v:number,name:string)=>[fmtEur(v),name]}/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="Presupuesto" fill="#C6C6C6" radius={[2,2,0,0]}/>
            <Bar dataKey="Gastado" fill="#B11C1F" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
