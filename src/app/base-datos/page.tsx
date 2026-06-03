'use client'
import { useMemo, useState } from 'react'
import { PERFILES_DATA, CRECIMIENTO_DATA } from '@/lib/demoData2'
import type { PerfilMes, CrecimientoSemanal } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import { fmtNum } from '@/lib/kpis'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, type SortingState } from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

const MESES_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const SEDES = ['todas','Madrid','Barcelona','Albacete']

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

// Delta badge: show change vs previous month
function Delta({value}:{value:number|null}) {
  if (value === null) return <span className="text-xs text-gray-300">—</span>
  const pos = value >= 0
  return (
    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${pos?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
      {pos?'+':''}{fmtNum(value)}
    </span>
  )
}

function PctDelta({value}:{value:number|null}) {
  if (value === null) return <span className="text-xs text-gray-300">—</span>
  const pos = value >= 0
  return (
    <span className={`text-[11px] font-medium ${pos?'text-green-600':'text-red-600'}`}>
      {pos?'+':''}{(value*100).toFixed(1)}%
    </span>
  )
}

// Build incremental table: for each month show value + delta vs previous
function buildIncrementalData(perfiles: PerfilMes[], sedeFilter: string) {
  const filtered = sedeFilter === 'todas' ? perfiles : perfiles.filter(p=>p.sede===sedeFilter)
  
  // Group by mes, sum across sedes
  const byMes: Record<string, Partial<PerfilMes>> = {}
  for (const p of filtered) {
    if (!byMes[p.mes]) byMes[p.mes] = {mes:p.mes,asiaticos:0,afros:0,arabe:0,caucasico:0,latino:0,ft1:0,ft2:0,ft3:0,ft4:0,ft5:0,ft6:0,bebes:0,hijos:0,total_bdd:0}
    const b = byMes[p.mes] as Record<string,number|string>
    const fields = ['asiaticos','afros','arabe','caucasico','latino','ft1','ft2','ft3','ft4','ft5','ft6','bebes','hijos','total_bdd']
    fields.forEach(f => { b[f] = (Number(b[f])||0) + (Number((p as unknown as Record<string,unknown>)[f])||0) })
  }

  const mesesPresentes = MESES_ORDER.filter(m => byMes[m])
  return mesesPresentes.map((mes, i) => {
    const cur = byMes[mes] as Record<string,number>
    const prev = i > 0 ? byMes[mesesPresentes[i-1]] as Record<string,number> : null
    const delta = (field: string): number|null => prev ? cur[field] - prev[field] : null
    const pctDelta = (field: string): number|null => prev && prev[field] > 0 ? (cur[field]-prev[field])/prev[field] : null
    return { mes, cur, delta, pctDelta }
  })
}

interface IncrRow {
  mes: string
  cur: Record<string,number>
  delta: (field:string)=>number|null
  pctDelta: (field:string)=>number|null
}

const colHelper = createColumnHelper<IncrRow>()

export default function BaseDatosPage() {
  const [sedeFiltro, setSedeFiltro] = useState('todas')
  const [sorting, setSorting] = useState<SortingState>([])

  const perfiles = PERFILES_DATA as PerfilMes[]
  const crecimiento = CRECIMIENTO_DATA as CrecimientoSemanal[]

  const perfilesFilt = useMemo(() =>
    sedeFiltro === 'todas' ? perfiles : perfiles.filter(p=>p.sede===sedeFiltro), [perfiles, sedeFiltro])

  const crecFilt = useMemo(() =>
    sedeFiltro === 'todas' ? crecimiento : crecimiento.filter(c=>c.sede===sedeFiltro), [crecimiento, sedeFiltro])

  const latestBySede = useMemo(() => {
    const result: Record<string,PerfilMes> = {}
    for (const p of perfiles) {
      const key = p.sede
      const cur = result[key]
      if (!cur || MESES_ORDER.indexOf(p.mes)>MESES_ORDER.indexOf(cur.mes)) result[key] = p
    }
    return result
  }, [perfiles])

  const bddByMes = useMemo(() => {
    const byMes: Record<string,number> = {}
    for (const p of perfilesFilt) byMes[p.mes] = (byMes[p.mes]||0) + p.total_bdd
    return MESES_ORDER.filter(m=>byMes[m]).map(m=>({mes:m,total:byMes[m]}))
  }, [perfilesFilt])

  const crecByWeek = useMemo(() => {
    const byW: Record<number,{week:number;citas:number;altas:number}> = {}
    for (const c of crecFilt) {
      if (!byW[c.week]) byW[c.week] = {week:c.week,citas:0,altas:0}
      byW[c.week].citas += c.citas; byW[c.week].altas += c.altas
    }
    return Object.values(byW).sort((a,b)=>a.week-b.week)
  }, [crecFilt])

  const totalAltas = crecFilt.reduce((s,c)=>s+c.altas,0)
  const ultimoBDD = bddByMes.at(-1)?.total ?? 0

  const incrementalData = useMemo(() => buildIncrementalData(perfiles, sedeFiltro), [perfiles, sedeFiltro])

  const FIELDS = [
    {key:'total_bdd',label:'Total BDD'},
    {key:'asiaticos',label:'Asiáticos'},
    {key:'afros',label:'Afros'},
    {key:'arabe',label:'Árabe'},
    {key:'ft5',label:'Ft V'},
    {key:'ft6',label:'Ft VI'},
    {key:'bebes',label:'Bebés'},
    {key:'hijos',label:'Hijos'},
  ]

  const columns = useMemo(() => [
    colHelper.accessor('mes', { header: 'Mes', cell: i => <span className="font-medium">{i.getValue()}</span> }),
    ...FIELDS.map(f => colHelper.accessor(
      row => row.cur[f.key] || 0,
      {
        id: f.key,
        header: f.label,
        cell: info => {
          const row = info.row.original
          const val = row.cur[f.key] || 0
          const d = row.delta(f.key)
          const p = row.pctDelta(f.key)
          return (
            <div>
              <span className="font-medium">{fmtNum(val)}</span>
              {d !== null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Delta value={d}/>
                  <PctDelta value={p}/>
                </div>
              )}
            </div>
          )
        }
      }
    ))
  ], [])

  const table = useReactTable({
    data: incrementalData, columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Base de Datos" subtitle="Crecimiento, perfiles y distribución por sede"/>

      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label">Sede</label>
        <select value={sedeFiltro} onChange={e=>setSedeFiltro(e.target.value)}
          className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
          {SEDES.map(s=><option key={s} value={s}>{s==='todas'?'Todas las sedes':s}</option>)}
        </select>
      </div>

      {/* KPIs resumen */}
      <Divider title="Resumen BDD"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Total BDD activa" value={fmtNum(ultimoBDD)} accent sub="último mes"/>
        <KpiCard label="Total altas período" value={fmtNum(totalAltas)}/>
        {['Madrid','Albacete','Barcelona'].map(sede => (
          <KpiCard key={sede} label={sede} value={fmtNum(latestBySede[sede]?.total_bdd||0)} sub="voluntarios activos"/>
        ))}
      </div>

      {/* Evolución BDD */}
      <Divider title="Evolución BDD por mes"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={bddByMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="mes" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/>
            <Line dataKey="total" name="BDD Activa" stroke="#B11C1F" strokeWidth={2.5} dot={{fill:'#B11C1F',r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Altas semanales */}
      <Divider title="Altas semanales"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={crecByWeek} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tickFormatter={v=>`W${v}`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="citas" name="Citas" fill="#C6C6C6" radius={[2,2,0,0]}/>
            <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla incremental por mes con deltas */}
      <Divider title="Incremento mensual por perfil"/>
      <p className="text-xs text-zurko-dark mb-3">Cada celda muestra el valor del mes + variación respecto al mes anterior (en verde/rojo)</p>
      <div className="kpi-card p-0 overflow-hidden">
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
          <p className="text-xs text-zurko-dark">{incrementalData.length} meses</p>
          <div className="flex items-center gap-2">
            <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="p-1 rounded border border-gray-200 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()}
              className="p-1 rounded border border-gray-200 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}
