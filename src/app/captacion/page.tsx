'use client'
import {useMemo,useState} from 'react'
import {CAPTACION_DATA} from '@/lib/demoData2'
import type {AccionCaptacion} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtNum,fmtEur,safe} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'
import {Download} from 'lucide-react'

const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const fmtCpa=(v:number|null)=>v===null||!isFinite(v)?'—':`${v.toFixed(2)} €`
const PIE_COLORS=['#B11C1F','#505050','#C6C6C6','#8b5cf6','#3b82f6','#10b981','#f59e0b']

function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

export default function CaptacionPage(){
  const[mf,setMf]=useState('todos')
  const[cf,setCf]=useState('todas')
  const data=CAPTACION_DATA as AccionCaptacion[]
  const meses=['todos',...MESES.filter(m=>data.some(d=>d.mes===m))]
  const cats=['todas',...Array.from(new Set(data.map(d=>d.categoria))).sort()]

  const filtered=useMemo(()=>data.filter(d=>{if(mf!=='todos'&&d.mes!==mf)return false;if(cf!=='todas'&&d.categoria!==cf)return false;return true}),[data,mf,cf])

  const tot=useMemo(()=>{
    const leads=filtered.reduce((s,d)=>s+(Number(d.leads)||0),0)
    const altas=filtered.reduce((s,d)=>s+(Number(d.altas)||0),0)
    const gasto=filtered.reduce((s,d)=>s+(Number(d.gasto)||0),0)
    return{leads,altas,gasto,n:filtered.length,cpa:safe(gasto,altas),cpl:safe(gasto,leads),conversion:safe(altas,leads)}
  },[filtered])

  const byMes=useMemo(()=>{
    const m:Record<string,{mes:string;altas:number;gasto:number;leads:number}>={};
    for(const d of data){if(!m[d.mes])m[d.mes]={mes:d.mes,altas:0,gasto:0,leads:0};m[d.mes].altas+=Number(d.altas)||0;m[d.mes].gasto+=Number(d.gasto)||0;m[d.mes].leads+=Number(d.leads)||0}
    return MESES.filter(x=>m[x]).map(x=>({...m[x],cpa:safe(m[x].gasto,m[x].altas)??0,conversion:safe(m[x].altas,m[x].leads)??0}))
  },[data])

  const byCat=useMemo(()=>{
    const m:Record<string,{cat:string;altas:number;gasto:number;leads:number}>={};
    for(const d of filtered){if(!m[d.categoria])m[d.categoria]={cat:d.categoria,altas:0,gasto:0,leads:0};m[d.categoria].altas+=Number(d.altas)||0;m[d.categoria].gasto+=Number(d.gasto)||0;m[d.categoria].leads+=Number(d.leads)||0}
    return Object.values(m).sort((a,b)=>b.altas-a.altas)
  },[filtered])

  const byFuente=useMemo(()=>{
    const m:Record<string,{fuente:string;altas:number;leads:number;gasto:number}>={};
    for(const d of filtered){const k=d.fuente||'Sin fuente';if(!m[k])m[k]={fuente:k,altas:0,leads:0,gasto:0};m[k].altas+=Number(d.altas)||0;m[k].leads+=Number(d.leads)||0;m[k].gasto+=Number(d.gasto)||0}
    return Object.values(m).sort((a,b)=>b.altas-a.altas).slice(0,10)
  },[filtered])

  const bySede=useMemo(()=>{
    const m:Record<string,{sede:string;altas:number;leads:number}>={};
    for(const d of filtered){const k=d.sede||'Sin sede';if(!m[k])m[k]={sede:k,altas:0,leads:0};m[k].altas+=Number(d.altas)||0;m[k].leads+=Number(d.leads)||0}
    return Object.values(m).sort((a,b)=>b.altas-a.altas)
  },[filtered])

  const pieCat=byCat.map(c=>({name:c.cat,value:c.altas}))
  const pieSede=bySede.map(s=>({name:s.sede,value:s.altas}))

  const exportCSV=()=>{const h=['Mes','Responsable','Categoría','Fuente','Sede','Leads','Altas','Gasto','CPA'];const rows=filtered.map(d=>[d.mes,d.responsable,d.categoria,d.fuente,d.sede,d.leads,d.altas,d.gasto,fmtCpa(safe(Number(d.gasto)||0,Number(d.altas)||0))]);const csv=[h,...rows].map(r=>r.join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='captacion.csv';a.click()}

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Captación y Marketing" subtitle="Acciones, leads, altas, costes y eficiencia por canal">
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 bg-white"><Download size={12}/> CSV</button>
      </PageHeader>
      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div><label className="filter-label">Mes</label><select value={mf} onChange={e=>setMf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{meses.map(m=><option key={m} value={m}>{m==='todos'?'Todos':m}</option>)}</select></div>
        <div><label className="filter-label">Categoría</label><select value={cf} onChange={e=>setCf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{cats.map(c=><option key={c} value={c}>{c==='todas'?'Todas':c}</option>)}</select></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <KpiCard label="Acciones" value={fmtNum(tot.n)}/>
        <KpiCard label="Leads" value={fmtNum(tot.leads)}/>
        <KpiCard label="Altas" value={fmtNum(tot.altas)} accent/>
        <KpiCard label="Gasto total" value={fmtEur(tot.gasto)}/>
        <KpiCard label="CPA" value={fmtCpa(tot.cpa)} sub="€ por alta"/>
        <KpiCard label="C/Lead" value={fmtCpa(tot.cpl)} sub="€ por lead"/>
        <KpiCard label="Conversión" value={tot.conversion?`${(tot.conversion*100).toFixed(1)}%`:'—'} sub="Leads → Altas"/>
      </div>

      {/* Distribución por categoría y sede (tartas) */}
      <Div t="Distribución de altas"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Altas por categoría</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart><Pie data={pieCat} cx={65} cy={65} innerRadius={35} outerRadius={60} dataKey="value">
                {pieCat.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie><Tooltip formatter={(v:number,n:string)=>[`${v} altas`,n]}/></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieCat.map((c,i)=>(
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/><span className="text-zurko-dark truncate max-w-[130px]">{c.name}</span></div>
                  <span className="font-medium ml-2">{fmtNum(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Altas por sede</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart><Pie data={pieSede} cx={65} cy={65} innerRadius={35} outerRadius={60} dataKey="value">
                {pieSede.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie><Tooltip formatter={(v:number,n:string)=>[`${v} altas`,n]}/></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pieSede.map((s,i)=>(
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/><span className="text-zurko-dark">{s.name}</span></div>
                  <span className="font-medium ml-2">{fmtNum(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolución mensual */}
      <Div t="Evolución mensual"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Leads y Altas por mes</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byMes} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={35}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="leads" name="Leads" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">CPA y tasa de conversión por mes</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={byMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={35}/>
              <YAxis yAxisId="left" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(0)} €`}/>
              <YAxis yAxisId="right" orientation="right" tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Line yAxisId="left" dataKey="cpa" name="CPA (€)" stroke="#B11C1F" strokeWidth={2.5} dot={false}/>
              <Line yAxisId="right" dataKey="conversion" name="Conversión %" stroke="#505050" strokeWidth={2} dot={false} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Eficiencia por fuente */}
      <Div t="Altas por fuente (top 10)"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byFuente} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis dataKey="fuente" type="category" width={140} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[0,2,2,0]}/>
            <Bar dataKey="leads" name="Leads" fill="#C6C6C6" radius={[0,2,2,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen mensual table */}
      <Div t="Resumen mensual"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full data-table whitespace-nowrap">
          <thead><tr><th>Mes</th><th>Leads</th><th>Altas</th><th>Gasto</th><th>CPA</th><th>C/Lead</th><th>Conversión</th></tr></thead>
          <tbody>{byMes.map((m,i)=><tr key={i}><td className="font-medium">{m.mes}</td><td>{fmtNum(m.leads)}</td><td className="font-bold text-brand-red">{fmtNum(m.altas)}</td><td>{fmtEur(m.gasto)}</td><td className="font-medium">{fmtCpa(safe(m.gasto,m.altas))}</td><td>{fmtCpa(safe(m.gasto,m.leads))}</td><td>{m.conversion?(m.conversion*100).toFixed(1)+'%':'—'}</td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
  )
}
