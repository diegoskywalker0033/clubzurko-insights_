'use client'
import { useMemo, useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { filtrarDatos, calcularKPIResumen, calcularAnalisisTemporal, fmtNum, fmtPct, fmtDec, safe } from '@/lib/kpis'
import { DEMO_DATA } from '@/lib/demoData'
import type { ProyectoSemanal } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import FiltrosBar from '@/components/FiltrosBar'
import FileUploader from '@/components/FileUploader'
import KpiCard from '@/components/KpiCard'
import RateCard from '@/components/RateCard'
import RiskBadge from '@/components/RiskBadge'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, type SortingState } from '@tanstack/react-table'
import { ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const col = createColumnHelper<ProyectoSemanal>()

function CT({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-card-hover text-xs">
      <p className="font-medium mb-2">Semana {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor:p.color}}/>
          <span className="text-zurko-dark">{p.name}:</span>
          <span className="font-medium">{fmtNum(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function RT({ active, payload, label }: { active?: boolean; payload?: {name:string;value:number;color:string}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-card-hover text-xs">
      <p className="font-medium mb-2">Semana {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor:p.color}}/>
          <span className="text-zurko-dark">{p.name}:</span>
          <span className="font-medium">{(p.value*100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

// Small inline percentage badge
function PctBadge({value, label}:{value:number|null;label:string}) {
  if (value === null) return null
  return (
    <div className="text-center mt-1">
      <span className="text-[10px] text-zurko-dark">{label}</span>
      <span className="block text-xs font-bold text-zurko-dark">{fmtPct(value)}</span>
    </div>
  )
}

export default function ReclutamientoPage() {
  const { rawData, filtros, isUploaded } = useDashboardStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const sourceData = (isUploaded ? rawData : DEMO_DATA) as ProyectoSemanal[]
  const filtered = useMemo(() => filtrarDatos(sourceData, filtros), [sourceData, filtros])
  const kpis = useMemo(() => calcularKPIResumen(filtered), [filtered])

  const weekly = useMemo(() => calcularAnalisisTemporal(filtered).map(w => ({
    week: `W${w.week}`,
    'N Solicitada': w.sol_sin_extra,
    Reclutados: w.reclutados,
    Asistentes: w.asistentes,
    Inicios: w.inicios,
    Abandonos: w.abandonos,
    tasa_asistencia: w.tasa_asistencia??0,
    tasa_inicios: w.tasa_inicios??0,
    tasa_abandono: w.tasa_abandono??0,
    cumplimiento_n: w.cumplimiento_n??0,
    semanas_n: w.semanas_sobre_n??0,
    semanas_nx: w.semanas_sobre_nx??0,
    n_proyectos: w.n_proyectos,
    proy_n: w.proyectoen_n,
    proy_nx: w.proyectoen_nextra,
  })), [filtered])

  const columns = useMemo(() => [
    col.accessor('week', { header: 'Semana', cell: i => <span className="font-medium">W{i.getValue()}</span> }),
    col.accessor('nombre', { header: 'Proyecto', cell: i => <span className="text-xs max-w-[180px] block truncate" title={i.getValue()}>{i.getValue()}</span> }),
    col.accessor('sede', { header: 'Sede' }),
    col.accessor('riesgo', { header: 'Riesgo', cell: i => <RiskBadge riesgo={i.getValue()} /> }),
    col.accessor('sol_sin_extra', { header: 'Sol. sin extra', cell: i => fmtNum(i.getValue()) }),
    col.accessor('sol_con_extra', { header: 'Sol. con extra', cell: i => fmtNum(i.getValue()) }),
    col.accessor('reclutados', { header: 'Reclutados', cell: i => <span className="font-medium text-brand-red">{fmtNum(i.getValue())}</span> }),
    col.accessor('asistencia', { header: 'Asistentes', cell: i => fmtNum(i.getValue()) }),
    col.accessor('iniciados', { header: 'Inicios', cell: i => <span className="font-medium">{fmtNum(i.getValue())}</span> }),
    col.accessor('abandonos', { header: 'Abandonos', cell: i => <span className="text-red-600">{fmtNum(i.getValue())}</span> }),
    col.accessor('no_validos', { header: 'No válidos', cell: i => fmtNum(i.getValue()) }),
    col.accessor('exclusiones', { header: 'Exclusiones', cell: i => fmtNum(i.getValue()) }),
    col.accessor('proyectoen_n', { header: 'Cumple N', cell: i => <span className={i.getValue()?'text-green-600 font-medium':'text-gray-400'}>{i.getValue()?'✓':'✗'}</span> }),
    col.accessor('proyectoen_nextra', { header: 'Cumple N+x', cell: i => <span className={i.getValue()?'text-green-600 font-medium':'text-gray-400'}>{i.getValue()?'✓':'✗'}</span> }),
  ], [])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const exportCSV = () => {
    const h = ['Semana','Proyecto','Sede','Riesgo','Sol_sin_extra','Sol_con_extra','Reclutados','Asistentes','Inicios','Abandonos','No_validos','Exclusiones','CumpleN','CumpleNx']
    const rows = filtered.map(r => [r.week,r.nombre,r.sede,r.riesgo,r.sol_sin_extra,r.sol_con_extra,r.reclutados,r.asistencia,r.iniciados,r.abandonos,r.no_validos,r.exclusiones,r.proyectoen_n,r.proyectoen_nextra])
    const csv = [h,...rows].map(r=>r.join(';')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}))
    a.download='reclutamiento.csv'; a.click()
  }

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Rendimiento de Reclutamiento" subtitle={`${fmtNum(filtered.length)} proyectos analizados`}>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 hover:border-gray-300 bg-white">
          <Download size={12}/> Exportar CSV
        </button>
      </PageHeader>

      <div className="mb-5"><FileUploader/></div>
      <div className="mb-6"><FiltrosBar/></div>

      {/* SEMANAS SOBRE OBJETIVO */}
      <Divider title="Semanas por encima de objetivo" />
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="kpi-card border-l-4 border-l-brand-red">
          <p className="kpi-label mb-1">Semanas por encima de objetivo N</p>
          <p className="text-4xl font-bold text-brand-red" style={{fontFamily:'Sansation,sans-serif'}}>{fmtPct(kpis.semanas_sobre_n)}</p>
          <p className="text-xs text-zurko-dark mt-1">Inicios / Solicitados sin extra · {fmtNum(kpis.inicios)} / {fmtNum(kpis.sol_sin_extra)}</p>
        </div>
        <div className="kpi-card border-l-4 border-l-zurko-dark">
          <p className="kpi-label mb-1">Semanas por encima de objetivo N+Extra</p>
          <p className="text-4xl font-bold text-zurko-dark" style={{fontFamily:'Sansation,sans-serif'}}>{fmtPct(kpis.semanas_sobre_nx)}</p>
          <p className="text-xs text-zurko-dark mt-1">Inicios / Solicitados con extra · {fmtNum(kpis.inicios)} / {fmtNum(kpis.sol_con_extra)}</p>
        </div>
      </div>

      {/* RENDIMIENTO */}
      <Divider title="Rendimiento de reclutamiento" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Reclutados vs Solicitados" value={fmtPct(kpis.rendimiento_reclu_pct)} accent
          sub={`${fmtNum(kpis.reclutados)} / ${fmtNum(kpis.sol_sin_extra)}`}/>
        <KpiCard label="Diferencia absoluta"
          value={kpis.rendimiento_reclu_abs >= 0 ? `+${fmtNum(kpis.rendimiento_reclu_abs)}` : fmtNum(kpis.rendimiento_reclu_abs)}
          sub="Reclutados − Solicitados"/>
        <KpiCard label="Reclutados que inician" value={fmtPct(kpis.tasa_reclu_vs_inicios)}
          sub={`${fmtNum(kpis.inicios)} inician de ${fmtNum(kpis.reclutados)} reclutados`}/>
        <KpiCard label="Conversión total" value={fmtPct(safe(kpis.inicios, kpis.sol_sin_extra))}
          sub="Inicios / Solicitados sin extra"/>
      </div>

      {/* VOLÚMENES con % inline */}
      <Divider title="Volúmenes totales" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-2">
        <KpiCard label="Sol. sin extra" value={fmtNum(kpis.sol_sin_extra)}/>
        <KpiCard label="Sol. con extra" value={fmtNum(kpis.sol_con_extra)}/>
        <KpiCard label="Reclutados" value={fmtNum(kpis.reclutados)} accent/>
        <KpiCard label="Asistentes" value={fmtNum(kpis.asistentes)}/>
        <div className="kpi-card">
          <p className="kpi-label mb-1.5">Inicios</p>
          <p className="text-2xl font-bold text-zurko-black" style={{fontFamily:'Sansation,sans-serif'}}>{fmtNum(kpis.inicios)}</p>
          <PctBadge value={safe(kpis.inicios, kpis.asistentes)} label="vs Asistentes"/>
        </div>
        <div className="kpi-card">
          <p className="kpi-label mb-1.5">Abandonos</p>
          <p className="text-2xl font-bold text-zurko-black" style={{fontFamily:'Sansation,sans-serif'}}>{fmtNum(kpis.abandonos)}</p>
          <PctBadge value={safe(kpis.abandonos, kpis.reclutados)} label="vs Reclutados"/>
        </div>
        <div className="kpi-card">
          <p className="kpi-label mb-1.5">No válidos</p>
          <p className="text-2xl font-bold text-zurko-black" style={{fontFamily:'Sansation,sans-serif'}}>{fmtNum(kpis.no_validos)}</p>
          <PctBadge value={safe(kpis.no_validos, kpis.asistentes)} label="vs Asistentes"/>
        </div>
        <div className="kpi-card">
          <p className="kpi-label mb-1.5">Exclusiones</p>
          <p className="text-2xl font-bold text-zurko-black" style={{fontFamily:'Sansation,sans-serif'}}>{fmtNum(kpis.exclusiones)}</p>
          <PctBadge value={safe(kpis.exclusiones, kpis.asistentes)} label="vs Asistentes"/>
        </div>
      </div>

      {/* PROMEDIOS */}
      <Divider title="Promedios" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
        <p className="col-span-full text-xs font-medium text-zurko-dark uppercase tracking-wider">Por semana</p>
        <KpiCard label="Sol. sin extra / semana" value={fmtDec(kpis.avg_sol_sin_extra_semana)} sub="media semanal"/>
        <KpiCard label="Sol. con extra / semana" value={fmtDec(kpis.avg_sol_con_extra_semana)} sub="media semanal"/>
        <KpiCard label="Reclutados / semana" value={fmtDec(kpis.avg_reclutados_semana)} accent sub="media semanal"/>
        <KpiCard label="Iniciados / semana" value={fmtDec(kpis.avg_iniciados_semana)} sub="media semanal"/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 mt-3">
        <p className="col-span-full text-xs font-medium text-zurko-dark uppercase tracking-wider">Por proyecto</p>
        <KpiCard label="Sol. sin extra / proyecto" value={fmtDec(kpis.avg_sol_sin_extra)} sub="media por proyecto"/>
        <KpiCard label="Sol. con extra / proyecto" value={fmtDec(kpis.avg_sol_con_extra)} sub="media por proyecto"/>
        <KpiCard label="Reclutados / proyecto" value={fmtDec(kpis.avg_reclutados)} sub="media por proyecto"/>
        <KpiCard label="Iniciados / proyecto" value={fmtDec(kpis.avg_iniciados)} sub="media por proyecto"/>
      </div>

      {/* PROYECTOS */}
      <Divider title="Proyectos que cumplen objetivo" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
        <KpiCard label="N Proyectos" value={fmtNum(kpis.n_proyectos)} sub="en el período"/>
        <KpiCard label="Proyectoen_N" value={fmtNum(kpis.proyectoen_n)} sub="inician ≥ N"/>
        <KpiCard label="Proyectoen_Nextra" value={fmtNum(kpis.proyectoen_nextra)} sub="inician ≥ N+extra"/>
        <KpiCard label="% Proyectos en N" value={fmtPct(kpis.cumplimiento_n)} sub={`${fmtNum(kpis.proyectoen_n)} de ${fmtNum(kpis.n_proyectos)}`} accent/>
        <KpiCard label="% Proyectos N+Extra" value={fmtPct(kpis.cumplimiento_nx)} sub={`${fmtNum(kpis.proyectoen_nextra)} de ${fmtNum(kpis.n_proyectos)}`}/>
      </div>

      {/* TASAS */}
      <Divider title="Tasas de conversión" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
        <RateCard label="Tasa de asistencia" value={kpis.tasa_asistencia} color="blue"/>
        <RateCard label="Tasa de inicios" value={kpis.tasa_inicios} color="green"/>
        <RateCard label="Tasa de abandono" value={kpis.tasa_abandono} color="red"/>
        <RateCard label="Tasa de exclusión" value={kpis.tasa_exclusion} color="amber"/>
        <RateCard label="Tasa no válidos" value={kpis.tasa_no_validos} color="purple"/>
      </div>

      {/* GRÁFICAS */}
      <Divider title="Evolución semanal" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">N Solicitada · Reclutados · Asistentes · Inicios</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barGap={1} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:10}}/>
              <Bar dataKey="N Solicitada" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="Reclutados" fill="#B11C1F" radius={[2,2,0,0]}/>
              <Bar dataKey="Asistentes" fill="#505050" radius={[2,2,0,0]}/>
              <Bar dataKey="Inicios" fill="#8b5cf6" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">Semanas sobre objetivo N y N+Extra</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<RT/>}/><Legend wrapperStyle={{fontSize:11}}/>
              <Line dataKey="semanas_n" name="Sobre N" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
              <Line dataKey="semanas_nx" name="Sobre N+Extra" stroke="#505050" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">Tasas semanales</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} domain={[0,1]}/>
              <Tooltip content={<RT/>}/><Legend wrapperStyle={{fontSize:11}}/>
              <Line dataKey="tasa_asistencia" name="Asistencia" stroke="#3b82f6" strokeWidth={2} dot={false}/>
              <Line dataKey="tasa_inicios" name="Inicios" stroke="#22c55e" strokeWidth={2} dot={false}/>
              <Line dataKey="tasa_abandono" name="Abandono" stroke="#B11C1F" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">Proyectos en N por semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT/>}/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="n_proyectos" name="Total" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="proy_n" name="En N" fill="#22c55e" radius={[2,2,0,0]}/>
              <Bar dataKey="proy_nx" name="En N+Extra" fill="#3b82f6" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA */}
      <Divider title="Detalle de proyectos" />
      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-zurko-dark">{fmtNum(table.getFilteredRowModel().rows.length)} proyectos</p>
          <input type="text" placeholder="Buscar..." value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-3 py-1.5 w-52 focus:outline-none focus:border-brand-red"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className={h.column.getCanSort()?'cursor-pointer select-none':''}>
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && <ArrowUpDown size={10} className="text-zurko-light"/>}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-zurko-dark">
            Página {table.getState().pagination.pageIndex+1} de {table.getPageCount()} · {fmtNum(table.getFilteredRowModel().rows.length)} proyectos
          </p>
          <div className="flex items-center gap-2">
            <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="p-1 rounded border border-gray-200 disabled:opacity-30 hover:border-gray-300">
              <ChevronLeft size={14}/>
            </button>
            <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}
              className="p-1 rounded border border-gray-200 disabled:opacity-30 hover:border-gray-300">
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
