'use client'
import {useMemo,useState} from 'react'
import {useDashboardStore} from '@/lib/store'
import {filtrarDatos,calcularKPIResumen,calcularAnalisisTemporal,fmtNum,fmtPct,fmtDec,safe} from '@/lib/kpis'
import {DEMO_DATA} from '@/lib/demoData'
import type {ProyectoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import FiltrosBar from '@/components/FiltrosBar'
import FileUploader from '@/components/FileUploader'
import KpiCard from '@/components/KpiCard'
import RateCard from '@/components/RateCard'
import RiskBadge from '@/components/RiskBadge'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,Tooltip as RTooltip,Legend,XAxis,YAxis,CartesianGrid} from 'recharts'
import {useReactTable,getCoreRowModel,getSortedRowModel,getFilteredRowModel,getPaginationRowModel,flexRender,createColumnHelper,type SortingState} from '@tanstack/react-table'
import {ArrowUpDown,Download,ChevronLeft,ChevronRight,AlertTriangle} from 'lucide-react'

const ch=createColumnHelper<ProyectoSemanal>()
function Div({t,color='red'}:{t:string;color?:string}){
  return <div className="flex items-center gap-3 mb-3 mt-7"><div className={`w-1 h-5 rounded-full ${color==='amber'?'bg-amber-500':'bg-brand-red'}`}/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>
}

const PIE_COLORS=['#B11C1F','#C6C6C6']

export default function ReclutamientoPage(){
  const{rawData,filtros,isUploaded}=useDashboardStore()
  const[sorting,setSorting]=useState<SortingState>([])
  const[gf,setGf]=useState('')
  const[deptFilter,setDeptFilter]=useState('todos')
  const[tipoFilter,setTipoFilter]=useState('todos')
  const[clienteFilter,setClienteFilter]=useState('todos')
  const[showRetrasos,setShowRetrasos]=useState(false)

  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]

  // Base filter (sede/riesgo/semana)
  const baseFiltered=useMemo(()=>filtrarDatos(src,filtros),[src,filtros])

  // Extra filters options
  const depts=useMemo(()=>['todos',...Array.from(new Set(baseFiltered.map(r=>r.departamento).filter(Boolean))).sort()],[baseFiltered])
  const tipos=useMemo(()=>['todos',...Array.from(new Set(baseFiltered.map(r=>r.tipo_estudio).filter(Boolean))).sort()],[baseFiltered])
  const clientes=useMemo(()=>['todos',...Array.from(new Set(baseFiltered.map(r=>r.cliente).filter(Boolean))).sort()],[baseFiltered])

  // Apply extra filters
  const filtered=useMemo(()=>baseFiltered.filter(r=>{
    if(deptFilter!=='todos'&&r.departamento!==deptFilter) return false
    if(tipoFilter!=='todos'&&r.tipo_estudio!==tipoFilter) return false
    if(clienteFilter!=='todos'&&r.cliente!==clienteFilter) return false
    return true
  }),[baseFiltered,deptFilter,tipoFilter,clienteFilter])

  const kpis=useMemo(()=>calcularKPIResumen(filtered),[filtered])
  const weekly=useMemo(()=>calcularAnalisisTemporal(filtered).map(w=>({
    week:`W${w.week}`,'N Sol.':w.sol_sin_extra,Reclutados:w.reclutados,Inicios:w.inicios,
    sobre_n:w.semanas_sobre_n??0,sobre_nx:w.semanas_sobre_nx??0,
  })),[filtered])

  // Retraso stats (always from baseFiltered for context)
  const retrasosData=useMemo(()=>{
    const proyRetrasados=filtered.filter(r=>r.retraso===1)
    const totalProy=filtered.length
    const estudiosConRetraso=Array.from(new Set(proyRetrasados.filter(r=>r.presupuesto.startsWith('S0')).map(r=>r.presupuesto)))
    const totalEstudios=Array.from(new Set(filtered.filter(r=>r.presupuesto.startsWith('S0')).map(r=>r.presupuesto)))
    return{
      proyRetrasados:proyRetrasados.length,totalProy,
      estudiosConRetraso:estudiosConRetraso.length,totalEstudios:totalEstudios.length,
      pctProy:safe(proyRetrasados.length,totalProy),
      pctEstudios:safe(estudiosConRetraso.length,totalEstudios.length),
      listaEstudios:estudiosConRetraso.sort(),
      detalleProy:proyRetrasados,
    }
  },[filtered])

  // Pie chart data
  const pieEstudios=[
    {name:'Con retraso',value:retrasosData.estudiosConRetraso},
    {name:'Sin retraso',value:retrasosData.totalEstudios-retrasosData.estudiosConRetraso},
  ]
  const pieProy=[
    {name:'Con retraso',value:retrasosData.proyRetrasados},
    {name:'Sin retraso',value:retrasosData.totalProy-retrasosData.proyRetrasados},
  ]

  const columns=useMemo(()=>[
    ch.accessor('week',{header:'Sem.',cell:i=><span className="font-medium">W{i.getValue()}</span>}),
    ch.accessor('presupuesto',{header:'Estudio',cell:i=><span className="text-xs font-medium text-brand-red">{i.getValue()}</span>}),
    ch.accessor('nombre',{header:'Proyecto',cell:i=><span className="text-xs max-w-[150px] block truncate" title={i.getValue()}>{i.getValue()}</span>}),
    ch.accessor('sede',{header:'Sede'}),
    ch.accessor('departamento',{header:'Dpto.',cell:i=><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{i.getValue()}</span>}),
    ch.accessor('tipo_estudio',{header:'Tipo',cell:i=><span className="text-xs">{i.getValue()}</span>}),
    ch.accessor('cliente',{header:'Cliente',cell:i=><span className="text-xs max-w-[120px] block truncate" title={i.getValue()}>{i.getValue()||'—'}</span>}),
    ch.accessor('riesgo',{header:'Riesgo',cell:i=><RiskBadge riesgo={i.getValue()}/>}),
    ch.accessor('retraso',{header:'Retraso',cell:i=>i.getValue()===1?<span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚠ Sí</span>:<span className="text-[10px] text-gray-300">—</span>}),
    ch.accessor('sol_sin_extra',{header:'Sol.N',cell:i=>fmtNum(i.getValue())}),
    ch.accessor('reclutados',{header:'Reclut.',cell:i=><span className="font-medium text-brand-red">{fmtNum(i.getValue())}</span>}),
    ch.accessor('iniciados',{header:'Inician',cell:i=><span className="font-medium">{fmtNum(i.getValue())}</span>}),
    ch.accessor('abandonos',{header:'Aband.',cell:i=><span className="text-red-500">{fmtNum(i.getValue())}</span>}),
    ch.accessor('proyectoen_n',{header:'En N',cell:i=><span className={i.getValue()?'text-green-600 font-medium':'text-gray-400'}>{i.getValue()?'✓':'✗'}</span>}),
  ],[])

  const table=useReactTable({data:showRetrasos?retrasosData.detalleProy:filtered,columns,state:{sorting,globalFilter:gf},onSortingChange:setSorting,onGlobalFilterChange:setGf,getCoreRowModel:getCoreRowModel(),getSortedRowModel:getSortedRowModel(),getFilteredRowModel:getFilteredRowModel(),getPaginationRowModel:getPaginationRowModel(),initialState:{pagination:{pageSize:50}}})

  const exportCSV=()=>{
    const data=showRetrasos?retrasosData.detalleProy:filtered
    const h=['Semana','Estudio','Proyecto','Sede','Dpto','Tipo','Cliente','Retraso','Reclutados','Iniciados','Sol_N','En_N']
    const rows=data.map(r=>[r.week,r.presupuesto,r.nombre,r.sede,r.departamento,r.tipo_estudio,r.cliente,r.retraso,r.reclutados,r.iniciados,r.sol_sin_extra,r.proyectoen_n])
    const csv=[h,...rows].map(r=>r.join(';')).join('\n')
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='reclutamiento.csv';a.click()
  }

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Rendimiento de Reclutamiento" subtitle={`${fmtNum(filtered.length)} proyectos`}>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 bg-white"><Download size={12}/> CSV</button>
      </PageHeader>
      <div className="mb-5"><FileUploader/></div>
      <div className="mb-4"><FiltrosBar/></div>

      {/* Extra filters: departamento, tipo, cliente */}
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="filter-label">Departamento</label>
            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              {depts.map(d=><option key={d} value={d}>{d==='todos'?'Todos los departamentos':d}</option>)}
            </select>
          </div>
          <div>
            <label className="filter-label">Tipo de estudio</label>
            <select value={tipoFilter} onChange={e=>setTipoFilter(e.target.value)} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              {tipos.map(t=><option key={t} value={t}>{t==='todos'?'Todos los tipos':t}</option>)}
            </select>
          </div>
          <div>
            <label className="filter-label">Cliente</label>
            <select value={clienteFilter} onChange={e=>setClienteFilter(e.target.value)} className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
              {clientes.map(c=><option key={c} value={c}>{c==='todos'?'Todos los clientes':c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs globales */}
      <Div t="Semanas sobre objetivo"/>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="kpi-card border-l-4 border-l-brand-red"><p className="kpi-label mb-1">Sobre objetivo N</p><p className="text-4xl font-bold text-brand-red">{fmtPct(kpis.semanas_sobre_n)}</p><p className="text-xs text-zurko-dark mt-1">{fmtNum(kpis.inicios)} inicios / {fmtNum(kpis.sol_sin_extra)} sol.</p></div>
        <div className="kpi-card border-l-4 border-l-zurko-dark"><p className="kpi-label mb-1">Sobre objetivo N+Extra</p><p className="text-4xl font-bold text-zurko-dark">{fmtPct(kpis.semanas_sobre_nx)}</p><p className="text-xs text-zurko-dark mt-1">{fmtNum(kpis.inicios)} inicios / {fmtNum(kpis.sol_con_extra)} sol. extra</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Reclutados" value={fmtNum(kpis.reclutados)} accent/>
        <KpiCard label="Inicios" value={fmtNum(kpis.inicios)}/>
        <KpiCard label="Proyectos en N" value={`${fmtNum(kpis.proyectoen_n)} / ${fmtNum(kpis.n_proyectos)}`}/>
        <KpiCard label="% Proyectos en N" value={fmtPct(kpis.cumplimiento_n)} accent/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Reclutados vs Sol." value={fmtPct(kpis.rendimiento_reclu_pct)} sub={`Δ ${kpis.rendimiento_reclu_abs>=0?'+':''}${fmtNum(kpis.rendimiento_reclu_abs)}`}/>
        <KpiCard label="Conversión reclu→inicio" value={fmtPct(kpis.tasa_reclu_vs_inicios)}/>
        <KpiCard label="Avg reclutados/sem." value={fmtDec(kpis.avg_reclutados_semana)}/>
        <KpiCard label="Avg inicios/proyecto" value={fmtDec(kpis.avg_iniciados)}/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-2">
        <RateCard label="Tasa asistencia" value={kpis.tasa_asistencia} color="blue"/>
        <RateCard label="Tasa inicios" value={kpis.tasa_inicios} color="green"/>
        <RateCard label="Tasa abandono" value={kpis.tasa_abandono} color="red"/>
        <RateCard label="Tasa exclusión" value={kpis.tasa_exclusion} color="amber"/>
        <RateCard label="No válidos" value={kpis.tasa_no_validos} color="purple"/>
      </div>

      {/* ── RETRASOS ─────────────────────────────────────────── */}
      <Div t="Retrasos" color="amber"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
        {/* Pie estudios */}
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-1">Estudios con retraso vs total</h3>
          <p className="text-xs text-zurko-dark mb-3">{retrasosData.estudiosConRetraso} de {retrasosData.totalEstudios} estudios (S00XXX únicos)</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieEstudios} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieEstudios.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                </Pie>
                <RTooltip formatter={(v:number,n:string)=>[`${v} estudios`,n]}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-brand-red shrink-0"/>
                <div><p className="text-xs font-medium">Con retraso</p><p className="text-xl font-bold text-brand-red">{retrasosData.estudiosConRetraso} <span className="text-sm font-normal text-zurko-dark">({fmtPct(retrasosData.pctEstudios)})</span></p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zurko-light shrink-0"/>
                <div><p className="text-xs font-medium">Sin retraso</p><p className="text-xl font-bold text-zurko-dark">{retrasosData.totalEstudios-retrasosData.estudiosConRetraso}</p></div>
              </div>
            </div>
          </div>
        </div>
        {/* Pie proyectos */}
        <div className="kpi-card">
          <h3 className="text-sm font-bold mb-1">Proyectos con retraso vs total</h3>
          <p className="text-xs text-zurko-dark mb-3">{retrasosData.proyRetrasados} de {retrasosData.totalProy} proyectos</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieProy} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieProy.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                </Pie>
                <RTooltip formatter={(v:number,n:string)=>[`${v} proyectos`,n]}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-brand-red shrink-0"/>
                <div><p className="text-xs font-medium">Con retraso</p><p className="text-xl font-bold text-brand-red">{retrasosData.proyRetrasados} <span className="text-sm font-normal text-zurko-dark">({fmtPct(retrasosData.pctProy)})</span></p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zurko-light shrink-0"/>
                <div><p className="text-xs font-medium">Sin retraso</p><p className="text-xl font-bold text-zurko-dark">{retrasosData.totalProy-retrasosData.proyRetrasados}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Estudios con retraso list */}
      {retrasosData.listaEstudios.length>0&&(
        <div className="kpi-card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-500"/>
            <h3 className="text-sm font-bold">Estudios afectados por retraso</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {retrasosData.listaEstudios.map(s=>(
              <span key={s} className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Evolución semanal */}
      <Div t="Evolución semanal"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="kpi-card"><h3 className="text-sm font-bold mb-4">Volúmenes semanales</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barGap={1} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <RTooltip/><Legend wrapperStyle={{fontSize:10}}/>
              <Bar dataKey="N Sol." fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="Reclutados" fill="#B11C1F" radius={[2,2,0,0]}/>
              <Bar dataKey="Inicios" fill="#505050" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card"><h3 className="text-sm font-bold mb-4">% sobre objetivo N y N+Extra</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <RTooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Line dataKey="sobre_n" name="Sobre N" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
              <Line dataKey="sobre_nx" name="Sobre N+Extra" stroke="#505050" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detalle */}
      <Div t="Detalle de proyectos"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-zurko-dark">{fmtNum(table.getFilteredRowModel().rows.length)} proyectos</p>
            <button
              onClick={()=>setShowRetrasos(!showRetrasos)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${showRetrasos?'bg-amber-100 text-amber-700 border-amber-300':'bg-white text-zurko-dark border-gray-200 hover:border-amber-300'}`}>
              <AlertTriangle size={11}/> {showRetrasos?'Mostrando retrasos':'Ver solo retrasos'}
            </button>
          </div>
          <input type="text" placeholder="Buscar..." value={gf} onChange={e=>setGf(e.target.value)} className="text-xs border border-gray-200 rounded-md px-3 py-1.5 w-48 focus:outline-none focus:border-brand-red"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead>{table.getHeaderGroups().map(hg=><tr key={hg.id}>{hg.headers.map(h=><th key={h.id} onClick={h.column.getToggleSortingHandler()} className={h.column.getCanSort()?'cursor-pointer select-none':''}><div className="flex items-center gap-1">{flexRender(h.column.columnDef.header,h.getContext())}{h.column.getCanSort()&&<ArrowUpDown size={10} className="text-zurko-light"/>}</div></th>)}</tr>)}</thead>
            <tbody>{table.getRowModel().rows.map(row=><tr key={row.id} className={row.original.retraso===1?'bg-amber-50/50':undefined}>{row.getVisibleCells().map(cell=><td key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-zurko-dark">Página {table.getState().pagination.pageIndex+1} de {table.getPageCount()}</p>
          <div className="flex items-center gap-2">
            <button onClick={()=>table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 rounded border border-gray-200 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button onClick={()=>table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 rounded border border-gray-200 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
      <span className="hidden">{fmtDec(safe(0,1))}</span>
    </div>
  )
}
