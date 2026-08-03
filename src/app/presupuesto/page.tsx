'use client'
import { useMemo, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { GASTO_2026, TOTAL_2026, OBJETIVOS } from '@/lib/presupuestoData'

function fmtEUR(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

export default function PresupuestoPage() {
  const [sort, setSort] = useState<'presupuesto' | 'desviacion'>('presupuesto')

  const pctEjecutado = (TOTAL_2026.gastadoHastaHoy / TOTAL_2026.presupuestoTotal) * 100

  const filas = useMemo(() => {
    const arr = [...GASTO_2026]
    arr.sort((a, b) =>
      sort === 'presupuesto'
        ? b.presupuestoTotal - a.presupuestoTotal
        : a.desviacionTotal - b.desviacionTotal
    )
    return arr
  }, [sort])

  const enRiesgo = GASTO_2026.filter((c) => c.desviacionTotal < -5000)

  const chartData = GASTO_2026.map((c) => ({
    categoria: c.categoria.length > 18 ? c.categoria.slice(0, 16) + '…' : c.categoria,
    Desviación: Math.round(c.desviacionTotal),
  })).sort((a, b) => a.Desviación - b.Desviación)

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-red">Finanzas</span>
        <h1 className="text-2xl font-bold text-zurko-black mb-1" style={{ fontFamily: 'Sansation, sans-serif' }}>
          Presupuesto 2026
        </h1>
        <p className="text-sm text-zurko-dark max-w-2xl">
          Gasto real vs. presupuesto por categoría y objetivos de reclutamiento por sede.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label mb-1">Presupuesto total</div>
          <div className="text-xl font-bold text-zurko-black">{fmtEUR(TOTAL_2026.presupuestoTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label mb-1">Gastado hasta hoy</div>
          <div className="text-xl font-bold text-brand-red">{fmtEUR(TOTAL_2026.gastadoHastaHoy)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label mb-1">Disponible</div>
          <div className="text-xl font-bold text-green-600">{fmtEUR(TOTAL_2026.restante)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label mb-1">% ejecutado</div>
          <div className="text-xl font-bold text-zurko-black">{pctEjecutado.toFixed(1)}%</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-brand-red rounded-full" style={{ width: `${Math.min(pctEjecutado, 100)}%` }} />
          </div>
        </div>
      </div>

      {enRiesgo.length > 0 && (
        <div className="kpi-card mb-6 border-l-0 flex items-start gap-3 bg-amber-50 !border-amber-100">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-zurko-dark">
            <span className="font-semibold text-zurko-black">{enRiesgo.length} categorías con desviación negativa relevante (&gt; 5.000€): </span>
            {enRiesgo.map((c) => c.categoria).join(' · ')}
          </div>
        </div>
      )}

      {/* Gráfica de desviación por categoría */}
      <div className="kpi-card mb-6">
        <h3 className="text-sm font-bold text-zurko-black mb-4" style={{ fontFamily: 'Sansation, sans-serif' }}>
          Desviación acumulada por categoría
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#505050' }} />
            <YAxis type="category" dataKey="categoria" width={160} tick={{ fontSize: 11, fill: '#505050' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number) => fmtEUR(v)}
            />
            <Bar dataKey="Desviación" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d['Desviación'] < 0 ? '#B11C1F' : '#22c55e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla por categoría */}
      <div className="kpi-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-brand-red" />
            <h3 className="text-sm font-bold text-zurko-black" style={{ fontFamily: 'Sansation, sans-serif' }}>
              Gasto por categoría
            </h3>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setSort('presupuesto')}
              className={`px-2.5 py-1 rounded-md ${sort === 'presupuesto' ? 'bg-red-50 text-brand-red font-semibold' : 'text-zurko-dark'}`}
            >
              Por presupuesto
            </button>
            <button
              onClick={() => setSort('desviacion')}
              className={`px-2.5 py-1 rounded-md ${sort === 'desviacion' ? 'bg-red-50 text-brand-red font-semibold' : 'text-zurko-dark'}`}
            >
              Por desviación
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Presupuesto total</th>
              <th>Gastado</th>
              <th>Restante</th>
              <th>Desviación</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.categoria}>
                <td className="font-medium text-zurko-black">{c.categoria}</td>
                <td>{fmtEUR(c.presupuestoTotal)}</td>
                <td>{fmtEUR(c.gastadoHastaHoy)}</td>
                <td className={c.restante < 0 ? 'text-brand-red font-semibold' : ''}>{fmtEUR(c.restante)}</td>
                <td>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      c.desviacionTotal < 0 ? 'text-brand-red' : 'text-green-600'
                    }`}
                  >
                    {c.desviacionTotal < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {fmtEUR(c.desviacionTotal)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Objetivos por sede */}
      <div className="kpi-card">
        <h3 className="text-sm font-bold text-zurko-black mb-4" style={{ fontFamily: 'Sansation, sans-serif' }}>
          Objetivos de reclutamiento por sede
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Madrid</th>
              <th>Albacete</th>
              <th>Barcelona</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {OBJETIVOS.map((o) => (
              <tr key={o.indicador}>
                <td className="font-medium text-zurko-black">{o.indicador}</td>
                <td>{o.madrid}{o.unidad}</td>
                <td>{o.albacete}{o.unidad}</td>
                <td>{o.bcn}{o.unidad}</td>
                <td className="font-semibold">{o.total}{o.unidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
