'use client'
import {useMemo,useState} from 'react'
import {CAPTACION_DATA} from '@/lib/demoData2'
import type {AccionCaptacion} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtNum,fmtEur,safe} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'
import {Download} from 'lucide-react'

const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const fmtCpa=(v:number|null)=>v===null||!isFinite(v)?'—':`${v.toFixed(2)} €`
function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

export default function CaptacionPage(){
  const[mf,setMf]=useState('todos')
  const[cf,setCf]=useState('todas')
  const data=CAPTACION_DATA as AccionCaptacion[]
  const meses=['todos',...MESES.filter(m=>data.some(d=>d.mes===m))]
  const cats=['todas',...Array.from(new Set(data.map(d=>d.categoria))).sort()]
  const filtered=useMemo(()=>data.filter(d=>{if(mf!=='todos'&&d.mes!==mf)return false;if(cf!=='todas'&&d.categoria!==cf)return false;return true}),[data,mf,cf])
  const tot=useMemo(()=>{const leads=filtered.reduce((s,d)=>s+(Number(d.leads)||0),0),altas=filtered.reduce((s,d)=>s+(Number(d.altas)||0),0),gasto=filtered.reduce((s,d)=>s+(Number(d.gasto)||0),0);return{leads,altas,gasto,n:filtered.length,cpa:safe(gasto,altas),cpl:safe(gasto,leads)}},[ filtered])
  const byMes=useMemo(()=>{const m:Record<string,{mes:string;altas:number;gasto:number;leads:number}>={}; for(const d of data){if(!m[d.mes])m[d.mes]={mes:d.mes,altas:0,gasto:0,leads:0};m[d.mes].altas+=Number(d.altas)||0;m[d.mes].gasto+=Number(d.gasto)||0;m[d.mes].leads+=Number(d.leads)||0};return MESES.filter(x=>m[x]).map(x=>({...m[x],cpa:safe(m[x].gasto,m[x].altas)??0}))},[data])
  const exportCSV=()=>{const h=['Mes','Responsable','Categoría','Fuente','Sede','Leads','Altas','Gasto','CPA'];const rows=filtered.map(d=>[d.mes,d.responsable,d.categoria,d.fuente,d.sede,d.leads,d.altas,d.gasto,fmtCpa(safe(Number(d.gasto)||0,Number(d.altas)||0))]);const csv=[h,...rows].map(r=>r.join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));a.download='captacion.csv';a.click()}
  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Captación y Marketing" subtitle="Acciones, leads, altas y costes">
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 bg-white"><Download size={12}/> CSV</button>
      </PageHeader>
      <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <div><label className="filter-label">Mes</label><select value={mf} onChange={e=>setMf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{meses.map(m=><option key={m} value={m}>{m==='todos'?'Todos':m}</option>)}</select></div>
        <div><label className="filter-label">Categoría</label><select value={cf} onChange={e=>setCf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{cats.map(c=><option key={c} value={c}>{c==='todas'?'Todas':c}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-2">
        <KpiCard label="Acciones" value={fmtNum(tot.n)}/><KpiCard label="Leads" value={fmtNum(tot.leads)}/><KpiCard label="Altas" value={fmtNum(tot.altas)} accent/><KpiCard label="Gasto total" value={fmtEur(tot.gasto)}/><KpiCard label="CPA" value={fmtCpa(tot.cpa)} sub="€/alta"/><KpiCard label="C/Lead" value={fmtCpa(tot.cpl)}/>
      </div>
      <Div t="Resumen mensual"/>
      <div className="kpi-card p-0 overflow-hidden mb-6">
        <div className="overflow-x-auto"><table className="w-full data-table whitespace-nowrap">
          <thead><tr><th>Mes</th><th>Leads</th><th>Altas</th><th>Gasto</th><th>CPA</th></tr></thead>
          <tbody>{byMes.map((m,i)=><tr key={i}><td className="font-medium">{m.mes}</td><td>{fmtNum(m.leads)}</td><td className="font-bold text-brand-red">{fmtNum(m.altas)}</td><td>{fmtEur(m.gasto)}</td><td className="font-medium">{fmtCpa(safe(m.gasto,m.altas))}</td></tr>)}</tbody>
        </table></div>
      </div>
      <Div t="Evolución mensual"/>
      <div className="kpi-card mb-6"><ResponsiveContainer width="100%" height={200}><BarChart data={byMes} barGap={2} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/><Tooltip/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="leads" name="Leads" fill="#C6C6C6" radius={[2,2,0,0]}/><Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></div>
      <Div t="Detalle de acciones"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full data-table whitespace-nowrap">
          <thead><tr><th>Mes</th><th>Responsable</th><th>Categoría</th><th>Fuente</th><th>Sede</th><th>Leads</th><th>Altas</th><th>Gasto</th><th>CPA</th></tr></thead>
          <tbody>{filtered.map((d,i)=><tr key={i}><td>{d.mes}</td><td>{d.responsable}</td><td><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{d.categoria}</span></td><td className="text-xs max-w-[140px] truncate">{d.fuente}</td><td>{d.sede}</td><td>{fmtNum(Number(d.leads)||0)}</td><td className="font-bold text-brand-red">{fmtNum(Number(d.altas)||0)}</td><td>{fmtEur(Number(d.gasto)||0)}</td><td>{fmtCpa(safe(Number(d.gasto)||0,Number(d.altas)||0))}</td></tr>)}</tbody>
        </table></div>
      </div>
    </div>
  )
}
