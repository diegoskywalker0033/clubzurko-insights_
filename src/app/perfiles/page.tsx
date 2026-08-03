'use client'
import { useState, useMemo } from 'react'
import { Users, TrendingUp, TrendingDown, Target, MessageSquareQuote, Sparkles, Info } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts'
import { BUYER_PERSONAS, METODOLOGIA, type BuyerPersona } from '@/lib/buyerPersonaData'

function fmtNum(n: number) {
  return n.toLocaleString('es-ES')
}

export default function PerfilesPage() {
  const [selectedId, setSelectedId] = useState<number>(0)
  const selected = useMemo(
    () => BUYER_PERSONAS.find((p) => p.id === selectedId) as BuyerPersona,
    [selectedId]
  )

  const totalPersonas = BUYER_PERSONAS.reduce((a, p) => a + p.personas, 0)

  const chartData = BUYER_PERSONAS.map((p) => ({
    nombre: p.nombre,
    Personas: p.personas,
    'Activación %': p.activacion,
  }))

  const radarData = selected.necesidades.map((n) => ({ necesidad: n.label, valor: n.valor }))

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-red">Panel de Voluntarios</span>
        </div>
        <h1
          className="text-2xl font-bold text-zurko-black mb-1"
          style={{ fontFamily: 'Sansation, sans-serif' }}
        >
          Buyer Persona del Panel
        </h1>
        <p className="text-sm text-zurko-dark max-w-2xl">
          Seis segmentos de voluntarios definidos por sus necesidades cosméticas y dermatológicas (modelo K-Means),
          para orientar captación, selección de estudios y comunicación.
        </p>
      </div>

      {/* Metodología banner */}
      <div className="kpi-card mb-6 flex items-start gap-3 !py-4">
        <Info size={18} className="text-brand-red flex-shrink-0 mt-0.5" />
        <div className="text-xs text-zurko-dark leading-relaxed">
          <span className="font-semibold text-zurko-black">{METODOLOGIA.poblacion}</span> · {METODOLOGIA.tecnica}.{' '}
          {METODOLOGIA.nota}
        </div>
      </div>

      {/* Selector de personas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {BUYER_PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`text-left rounded-xl p-4 border transition-all ${
              p.id === selectedId
                ? 'border-brand-red bg-red-50 shadow-card'
                : 'border-gray-100 bg-white hover:border-gray-200 shadow-card'
            }`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
              style={{ backgroundColor: p.color, fontFamily: 'Sansation, sans-serif' }}
            >
              {p.nombre[0]}
            </div>
            <div className="font-bold text-sm text-zurko-black" style={{ fontFamily: 'Sansation, sans-serif' }}>
              {p.nombre}
            </div>
            <div className="text-[11px] text-zurko-dark leading-tight mt-0.5">{p.segmento}</div>
            <div className="text-[11px] font-semibold text-brand-red mt-1.5">
              {fmtNum(p.personas)} <span className="font-normal text-zurko-dark">personas</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ficha detallada */}
        <div className="lg:col-span-2 space-y-5">
          <div className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-red mb-1">
                  {String(selected.id + 1).padStart(2, '0')} / 06 · {selected.segmento}
                </div>
                <h2 className="text-xl font-bold text-zurko-black" style={{ fontFamily: 'Sansation, sans-serif' }}>
                  {selected.nombre}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: selected.color, fontFamily: 'Sansation, sans-serif' }}
              >
                {selected.nombre[0]}
              </div>
            </div>

            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mb-4">
              <MessageSquareQuote size={16} className="text-zurko-light flex-shrink-0 mt-0.5" />
              <p className="text-sm italic text-zurko-dark">&ldquo;{selected.cita}&rdquo;</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-gray-50 rounded-lg py-3">
                <div className="text-lg font-bold text-zurko-black">{fmtNum(selected.personas)}</div>
                <div className="text-[10px] uppercase tracking-wider text-zurko-dark mt-0.5">Personas</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg py-3">
                <div className="text-lg font-bold text-brand-red">{selected.activacion.toFixed(1)}%</div>
                <div className="text-[10px] uppercase tracking-wider text-zurko-dark mt-0.5">Activación</div>
              </div>
              <div className="text-center bg-gray-50 rounded-lg py-3">
                <div className="text-lg font-bold text-zurko-black">{selected.finalizacionGlobal.toFixed(1)}%</div>
                <div className="text-[10px] uppercase tracking-wider text-zurko-dark mt-0.5">Finalización</div>
              </div>
            </div>

            <p className="text-sm text-zurko-dark leading-relaxed mb-4">{selected.interpretacion}</p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold text-zurko-black mb-0.5">Edad</div>
                <div className="text-zurko-dark mb-2">{selected.quienEs.edad}</div>
                <div className="font-semibold text-zurko-black mb-0.5">Sexo</div>
                <div className="text-zurko-dark">{selected.quienEs.sexo}</div>
              </div>
              <div>
                <div className="font-semibold text-zurko-black mb-0.5">Dónde</div>
                <div className="text-zurko-dark mb-2">{selected.quienEs.donde}</div>
                <div className="font-semibold text-zurko-black mb-0.5">Piel</div>
                <div className="text-zurko-dark">{selected.quienEs.piel}</div>
              </div>
            </div>
          </div>

          {/* Cómo trabajarlo / argumentos de captación */}
          <div className="kpi-card">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-brand-red" />
              <h3 className="text-sm font-bold text-zurko-black" style={{ fontFamily: 'Sansation, sans-serif' }}>
                Cómo trabajarlo — argumentos para captar
              </h3>
            </div>
            <ul className="space-y-2 mb-4">
              {selected.comoTrabajarlo.map((linea, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zurko-dark">
                  <span className="text-brand-red font-bold flex-shrink-0">—</span>
                  {linea}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-brand-red" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zurko-dark">Ideal para</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.idealPara.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium bg-red-50 text-brand-red px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Panel lateral: necesidades + comportamiento */}
        <div className="space-y-5">
          <div className="kpi-card">
            <h3 className="text-sm font-bold text-zurko-black mb-3" style={{ fontFamily: 'Sansation, sans-serif' }}>
              Necesidades predominantes
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="necesidad" tick={{ fontSize: 9, fill: '#505050' }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                <Radar dataKey="valor" stroke={selected.color} fill={selected.color} fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-card">
            <h3 className="text-sm font-bold text-zurko-black mb-3" style={{ fontFamily: 'Sansation, sans-serif' }}>
              Comportamiento de participación
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zurko-dark">Finalización individual</span>
                  <span className="font-semibold text-zurko-black">{selected.finalizacionIndividual.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${selected.finalizacionIndividual}%`, backgroundColor: '#22c55e' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zurko-dark">Abandono individual</span>
                  <span className="font-semibold text-zurko-black">{selected.abandonoIndividual.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-red"
                    style={{ width: `${selected.abandonoIndividual}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-zurko-dark">Necesidades medias / persona</span>
                <span className="text-sm font-bold text-zurko-black">{selected.necesidadesMedia}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zurko-dark">Scoring medio</span>
                <span
                  className={`text-sm font-bold flex items-center gap-1 ${
                    selected.scoring > -2 ? 'text-green-600' : 'text-brand-red'
                  }`}
                >
                  {selected.scoring > -2 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {selected.scoring.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativa global */}
      <div className="kpi-card">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-brand-red" />
          <h3 className="text-sm font-bold text-zurko-black" style={{ fontFamily: 'Sansation, sans-serif' }}>
            Comparativa entre los seis segmentos · {fmtNum(totalPersonas)} voluntarios en total
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#505050' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#505050' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#505050' }} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="Personas" fill="#C6C6C6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="Activación %" fill="#B11C1F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-zurko-dark mt-3">
          Marta (Cuidado esencial) aporta el mayor volumen; Lucía (Imperfecciones y manchas) es la que mejor se
          activa pero la que más abandona; Carmen (Firmeza corporal) rinde mejor una vez activada aunque parte de
          menos volumen — el margen de mejora está en la captación, no en el cumplimiento.
        </p>
      </div>
    </div>
  )
}
