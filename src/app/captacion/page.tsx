'use client'
import { useMemo, useState } from 'react'
import { CAPTACION_DATA } from '@/lib/demoData2'
import type { AccionCaptacion } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import { fmtNum, fmtEur, safe } from '@/lib/kpis'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, createColumnHelper, type SortingState } from '@tanstack/react-table'
import { Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

const MESES_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Divider({title}:{title:string}) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <div className="w-1 h-5 bg-brand-red rounded-full"/>
      <h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{title}</h2>
    </div>
  )
}

function fmtCpa(v: number | null) {
  return v === null || !isFinite(v) ? '—' : `${v.toFixed(2)} €`
}

const col = createColumnHelper<AccionCaptacion>()

export default function CaptacionPage() {
  const [mesFiltro, setMesFiltro] = useState('todos')
  const [catFiltro, setCatFiltro] = useState('todas')
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const data = CAPTACION_DATA as AccionCaptacion[]

  const meses = ['todos', ...MESES_ORDER.filter(m=>data.some(d=>d.mes===m))]
  const categorias = ['todas', ...Array.from(new Set(data.map(d=>d.categoria))).sort()]

  const filtered = useMemo(() => data.filter(d => {
    if (mesFiltro !== 'todos' && d.mes !== mesFiltro) return false
    if (catFiltro !== 'todas' && d.categoria !== catFiltro) return false
    return true
  }), [data, mesFiltro, catFiltro])

  const totals = useMemo(() => {
    const leads = filtered.reduce((s,d)=>s+(Number(d.leads)||0),0)
    const altas = filtered.reduce((s,d)=>s+(Number(d.altas)||0),0)
    const gasto = filtered.reduce((s,d)=>s+(Number(d.gasto)||0),0)
    const acciones = filtered.length
    return { leads, altas, gasto, acciones,
      cpa: safe(gasto, altas), coste_lead: safe(gasto, leads), coste_accion: safe(gasto, acciones) }
  }, [filtered])

  const byMes = useMemo(() => {
    const map: Record<string,{mes:string;acciones:number;leads:number;altas:number;gasto:number}> = {}
    for (const d of data) {
      if (!map[d.mes]) map[d.mes] = {mes:d.mes,acciones:0,leads:0,altas:0,gasto:0}
      map[d.mes].acciones++
      map[d.mes].leads += Number(d.leads)||0
      map[d.mes].altas += Number(d.altas)||0
      map[d.mes].gasto += Number(d.gasto)||0
    }
    return MESES_ORDER.filter(m=>map[m]).map(m=>({...map[m], cpa: safe(map[m].gasto, map[m].altas)??0}))
  }, [data])

  const columns = useMemo(() => [
    col.accessor('mes', { header: 'Mes' }),
    col.accessor('responsable', { header: 'Responsable' }),
    col.accessor('categoria', { header: 'Categoría', cell: i => <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{i.getValue()}</span> }),
    col.accessor('fuente', { header: 'Fuente', cell: i => <span className="text-xs max-w-[150px] block truncate" title={i.getValue()}>{i.getValue()}</span> }),
    col.accessor('sede', { header: 'Sede' }),
    col.accessor('leads', { header: 'Leads', cell: i => fmtNum(Number(i.getValue())||0) }),
    col.accessor('altas', { header: 'Altas', cell: i => <span className="font-medium text-brand-red">{fmtNum(Number(i.getValue())||0)}</span> }),
    col.accessor('gasto', { header: 'Gasto', cell: i => fmtEur(Number(i.getValue())||0) }),
    col.accessor(row => safe(Number(row.gasto)||0, Number(row.altas)||0), { id:'cpa', header: 'CPA', cell: i => fmtCpa(i.getValue()) }),
    col.accessor(row => safe(Number(row.gasto)||0, Number(row.leads)||0), { id:'coste_lead', header: 'C/Lead', cell: i => fmtCpa(i.getValue()) }),
  ], [])

  const table = useReactTable({
    data: filtered, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const exportCSV = () => {
    const h = ['Mes','Responsable','Categoría','Fuente','Sede','Leads','Altas','Gasto','CPA','C/Lead']
    const rows = filtered.map(d => [d.mes,d.responsable,d.categoria,d.fuente,d.sede,d.leads,d.altas,d.gasto,
      fmtCpa(safe(Number(d.gasto)||0,Number(d.altas)||0)),fmtCpa(safe(Number(d.gasto)||0,Number(d.leads)||0))])
    const csv = [h,...rows].map(r=>r.join(';')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}))
    a.download='captacion.csv'; a.click()
  }

  return (
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Captación y Marketing" subtitle="Acciones, leads, altas y costes · Fuente: DATA_CAPTACION">
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 hover:border-gray-300 bg-white">
          <Download size={12}/> Exportar CSV
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div>
          <label className="filter-label">Mes</label>
          <select value={mesFiltro} onChange={e=>setMesFiltro(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {meses.map(m=><option key={m} value={m}>{m==='todos'?'Todos los meses':m}</option>)}
          </select>
        </div>
        <div>
          <label className="filter-label">Categoría</label>
          <select value={catFiltro} onChange={e=>setCatFiltro(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {categorias.map(c=><option key={c} value={c}>{c==='todas'?'Todas':c}</option>)}
          </select>
        </div>
      </div>

      <Divider title="KPIs del período"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-2">
        <KpiCard label="N Acciones" value={fmtNum(totals.acciones)}/>
        <KpiCard label="Leads" value={fmtNum(totals.leads)}/>
        <KpiCard label="Altas" value={fmtNum(totals.altas)} accent/>
        <KpiCard label="Gasto total" value={fmtEur(totals.gasto)}/>
        <KpiCard label="CPA" value={fmtCpa(totals.cpa)} sub="Gasto / Altas"/>
        <KpiCard label="Coste por lead" value={fmtCpa(totals.coste_lead)} sub="Gasto / Leads"/>
        <KpiCard label="Coste por acción" value={fmtCpa(totals.coste_accion)} sub="Gasto / Acciones"/>
      </div>

      <Divider title="Resumen por mes"/>
      <div className="kpi-card p-0 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead>
              <tr><th>Mes</th><th>Acciones</th><th>Leads</th><th>Altas</th><th>Gasto</th><th>CPA</th><th>C/Lead</th><th>C/Acción</th></tr>
            </thead>
            <tbody>
              {byMes.map((m,i) => (
                <tr key={i}>
                  <td className="font-medium">{m.mes}</td>
                  <td>{fmtNum(m.acciones)}</td>
                  <td>{fmtNum(m.leads)}</td>
                  <td className="font-bold text-brand-red">{fmtNum(m.altas)}</td>
                  <td>{fmtEur(m.gasto)}</td>
                  <td className="font-medium">{fmtCpa(safe(m.gasto,m.altas))}</td>
                  <td>{fmtCpa(safe(m.gasto,m.leads))}</td>
                  <td>{fmtCpa(safe(m.gasto,m.acciones))}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td>TOTAL</td>
                <td>{fmtNum(data.length)}</td>
                <td>{fmtNum(data.reduce((s,d)=>s+(Number(d.leads)||0),0))}</td>
                <td className="text-brand-red">{fmtNum(data.reduce((s,d)=>s+(Number(d.altas)||0),0))}</td>
                <td>{fmtEur(data.reduce((s,d)=>s+(Number(d.gasto)||0),0))}</td>
                <td>{fmtCpa(safe(data.reduce((s,d)=>s+(Number(d.gasto)||0),0),data.reduce((s,d)=>s+(Number(d.altas)||0),0)))}</td>
                <td>{fmtCpa(safe(data.reduce((s,d)=>s+(Number(d.gasto)||0),0),data.reduce((s,d)=>s+(Number(d.leads)||0),0)))}</td>
                <td>{fmtCpa(safe(data.reduce((s,d)=>s+(Number(d.gasto)||0),0),data.length))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Divider title="Evolución mensual"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">Leads y Altas por mes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byMes} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="leads" name="Leads" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-4">Gasto y CPA por mes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byMes} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v:number)=>`${v.toFixed(2)} €`}/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="gasto" name="Gasto" fill="#505050" radius={[2,2,0,0]}/>
              <Bar dataKey="cpa" name="CPA" fill="#B11C1F" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Divider title="Detalle de acciones"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-xs text-zurko-dark">{fmtNum(table.getFilteredRowModel().rows.length)} acciones</p>
          <input type="text" placeholder="Buscar..." value={globalFilter} onChange={e=>setGlobalFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-3 py-1.5 w-52 focus:outline-none focus:border-brand-red"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead>
              {table.getHeaderGroups().map(hg=>(
                <tr key={hg.id}>
                  {hg.headers.map(h=>(
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className={h.column.getCanSort()?'cursor-pointer select-none':''}>
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header,h.getContext())}
                        {h.column.getCanSort()&&<ArrowUpDown size={10} className="text-zurko-light"/>}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row=>(
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell=>(
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-zurko-dark">
            Página {table.getState().pagination.pageIndex+1} de {table.getPageCount()} · {fmtNum(table.getFilteredRowModel().rows.length)} acciones
          </p>
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
