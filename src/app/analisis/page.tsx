'use client'
import {useMemo,useState} from 'react'
import {useDashboardStore} from '@/lib/store'
import {DEMO_DATA} from '@/lib/demoData'
import {DATA_2025} from '@/lib/demoData2'
import {fmtNum,fmtPct,safe} from '@/lib/kpis'
import type {ProyectoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
type Dim='departamento'|'tipo_estudio'|'cliente'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calcDim(data:ProyectoSemanal[],key:Dim):any[]{
  const map=new Map<string,ProyectoSemanal[]>()
  for(const r of data){const rec=r as unknown as Record<string,string>;const k=(rec[key]||'Sin datos').toString().trim()||'Sin datos';if(!map.has(k))map.set(k,[]);map.get(k)!.push(r)}
  return Array.from(map.entries()).map(([dim,rows])=>{
    const s=(f:keyof ProyectoSemanal)=>rows.reduce((a,r)=>a+(Number(r[f])||0),0)
    const reclutados=s('reclutados'),iniciados=s('iniciados'),sol_n=s('sol_sin_extra'),sol_nx=s('sol_con_extra'),pn=s('proyectoen_n'),n=rows.length
    return{dim,n,reclutados,iniciados,sol_n,sol_nx,pn,sobre_n:safe(iniciados,sol_n),sobre_nx:safe(iniciados,sol_nx),cumpl_n:safe(pn,n),tasa_inicios:safe(iniciados,reclutados)}
  }).sort((a,b)=>b.n-a.n)
}

// 2025 dept comparison mapping
const DEPT_MAP_2025:Record<string,string>={'EFI':'EFI','SOLAR':'SOLAR','TOL':'TOL'}
const DEPT_MAP_2026:Record<string,string>={'SKINCARE':'EFI','HAIRCARE':'EFI','EFICACIA':'EFI','IN VITRO+IN VIVO':'EFI','TOLERANCIA':'TOL','SOLAR':'SOLAR'}

export default function AnalisisPage(){
  const{rawData,isUploaded}=useDashboardStore()
  const[dim,setDim]=useState<Dim>('departamento')
  const[sedeFilter,setSedeFilter]=useState('todas')
  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d2025=DATA_2025 as any[]
  const filtered=useMemo(()=>sedeFilter==='todas'?src:src.filter(r=>r.sede===sedeFilter),[src,sedeFilter])
  const sedes=['todas',...Array.from(new Set(src.map(r=>r.sede))).sort()]
  const rows=useMemo(()=>calcDim(filtered,dim),[filtered,dim])

  // Dept comparison 2025 vs 2026
  const deptComp=useMemo(()=>{
    if(dim!=='departamento') return []
    const g26:Record<string,{n:number;iniciados:number;sol_n:number}>={};
    for(const r of filtered){const g=DEPT_MAP_2026[r.departamento]||'OTRO';if(!g26[g])g26[g]={n:0,iniciados:0,sol_n:0};g26[g].n++;g26[g].iniciados+=r.iniciados;g26[g].sol_n+=r.sol_sin_extra}
    const g25:Record<string,{n:number;iniciados:number;sol_n:number}>={};
    const f25=sedeFilter==='todas'?d2025:d2025.filter((r:any)=>r.sede===sedeFilter)
    for(const r of f25){const g=DEPT_MAP_2025[r.dept_group]||'OTRO';if(!g25[g])g25[g]={n:0,iniciados:0,sol_n:0};g25[g].n++;g25[g].iniciados+=Number(r.iniciados)||0;g25[g].sol_n+=Number(r.sol_sin_extra)||0}
    const groups=Array.from(new Set([...Object.keys(g26),...Object.keys(g25)])).filter(g=>g!=='OTRO')
    return groups.map(g=>({
      grupo:g,
      n_2026:g26[g]?.n??0,sobre_n_2026:(safe(g26[g]?.iniciados??0,g26[g]?.sol_n??0)??0)*100,
      n_2025:g25[g]?.n??0,sobre_n_2025:(safe(g25[g]?.iniciados??0,g25[g]?.sol_n??0)??0)*100,
    }))
  },[filtered,dim,d2025,sedeFilter])

  const chartData=useMemo(()=>rows.slice(0,15).map(r=>({
    name:r.dim.length>18?r.dim.substring(0,18)+'…':r.dim,
    Reclutados:r.reclutados,Iniciados:r.iniciados,'N Sol.':r.sol_n,
  })),[rows])

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Análisis por dimensión" subtitle="Rendimiento por departamento, tipo de estudio y cliente"/>
      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div><label className="filter-label">Ver por</label>
          <select value={dim} onChange={e=>setDim(e.target.value as Dim)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            <option value="departamento">Departamento</option>
            <option value="tipo_estudio">Tipo de estudio</option>
            <option value="cliente">Cliente</option>
          </select></div>
        <div><label className="filter-label">Sede</label>
          <select value={sedeFilter} onChange={e=>setSedeFilter(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
            {sedes.map(s=><option key={s} value={s}>{s==='todas'?'Todas':s}</option>)}</select></div>
      </div>

      <Div t="Volúmenes por dimensión (top 15)"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} interval={0} angle={-10} textAnchor="end" height={45}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="N Sol." fill="#C6C6C6" radius={[2,2,0,0]}/>
            <Bar dataKey="Reclutados" fill="#B11C1F" radius={[2,2,0,0]}/>
            <Bar dataKey="Iniciados" fill="#505050" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {dim==='departamento'&&deptComp.length>0&&(<>
        <Div t="Comparativa 2025 vs 2026 por departamento (% sobre N)"/>
        <div className="kpi-card mb-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptComp} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="grupo" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>`${v.toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v:number)=>`${v.toFixed(1)}%`}/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="sobre_n_2026" name="% sobre N 2026" fill="#B11C1F" radius={[2,2,0,0]}/>
              <Bar dataKey="sobre_n_2025" name="% sobre N 2025" fill="#C6C6C6" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-zurko-dark mt-2">Grupos: EFI = Skincare+Haircare+Eficacia / TOL = Tolerancia / SOLAR = Solar</p>
        </div>
      </>)}

      <Div t="Tabla de rendimiento"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr>
              <th>{dim==='departamento'?'Departamento':dim==='tipo_estudio'?'Tipo de estudio':'Cliente'}</th>
              <th>N Proy.</th><th>Reclutados</th><th>Iniciados</th><th>N Sol.</th>
              <th>% sobre N</th><th>% sobre N+x</th><th>T. inicios</th><th>% Proy en N</th>
            </tr></thead>
            <tbody>{rows.map((r,i)=>(
              <tr key={i}>
                <td className="font-medium max-w-[200px] truncate" title={r.dim}>{r.dim}</td>
                <td>{fmtNum(r.n)}</td>
                <td className="font-bold text-brand-red">{fmtNum(r.reclutados)}</td>
                <td className="font-bold">{fmtNum(r.iniciados)}</td>
                <td>{fmtNum(r.sol_n)}</td>
                <td className={`font-bold ${(r.sobre_n??0)>=1?'text-green-600':'text-red-600'}`}>{fmtPct(r.sobre_n)}</td>
                <td className={`font-bold ${(r.sobre_nx??0)>=1?'text-green-600':'text-amber-600'}`}>{fmtPct(r.sobre_nx)}</td>
                <td>{fmtPct(r.tasa_inicios)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-brand-red rounded-full" style={{width:`${Math.min((r.cumpl_n??0)*100,100)}%`}}/></div>
                    <span>{fmtPct(r.cumpl_n)}</span>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {dim!=='departamento'&&(
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">La comparativa 2025 vs 2026 solo está disponible para <strong>Departamento</strong>, ya que el archivo 2025 incluye el código de departamento (EFI/TOL/SOLAR).</p>
        </div>
      )}
    </div>
  )
}
