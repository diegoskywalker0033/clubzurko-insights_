'use client'
import{useMemo,useState}from'react'
import{CAPTACION_DATA}from'@/lib/demoData2'
import type{AccionCaptacion}from'@/lib/types'
import PageHeader from'@/components/PageHeader'
import KpiCard from'@/components/KpiCard'
import StatCard from'@/components/StatCard'
import{fmtNum,fmtEur,safe,calcularStats}from'@/lib/kpis'
import{ResponsiveContainer,BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,LabelList}from'recharts'
import{Download}from'lucide-react'
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const fmtCpa=(v:number|null)=>v===null||!isFinite(v)?'—':`${v.toFixed(2)} €`
const PIE_COLORS=['#B11C1F','#505050','#C6C6C6','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444']
function Div({t}:{t:string}){return<div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

// Custom label that always renders text
const renderCustomLabel=(props:any)=>{
  const{x,y,width,value}=props
  if(!value||value===0) return null
  return<text x={x+(width||0)/2} y={(y||0)-4} fill="#505050" textAnchor="middle" fontSize={9} fontWeight={500}>{value}</text>
}
const renderBarLabel=(props:any)=>{
  const{x,y,width,height,value}=props
  if(!value||value===0) return null
  return<text x={(x||0)+(width||0)/2} y={(y||0)+(height||0)/2+4} fill="#fff" textAnchor="middle" fontSize={9} fontWeight={600}>{value}</text>
}

export default function CaptacionPage(){
  const[mf,setMf]=useState('todos')
  const[cf,setCf]=useState('todas')
  const data=CAPTACION_DATA as AccionCaptacion[]
  const meses=['todos',...MESES.filter(m=>data.some(d=>d.mes===m||d.mes.trim()===m))]
  const cats=['todas',...Array.from(new Set(data.map(d=>d.categoria))).sort()]
  const filtered=useMemo(()=>data.filter(d=>{
    if(mf!=='todos'&&d.mes.trim()!==mf) return false
    if(cf!=='todas'&&d.categoria!==cf) return false
    return true
  }),[data,mf,cf])
  const tot=useMemo(()=>{
    const leads=filtered.reduce((s,d)=>s+(Number(d.leads)||0),0)
    const altas=filtered.reduce((s,d)=>s+(Number(d.altas)||0),0)
    // GASTO: only rows where gasto>0 count — no imputation for zeros
    const gasto=filtered.filter(d=>d.gasto>0).reduce((s,d)=>s+d.gasto,0)
    const accionesConGasto=filtered.filter(d=>d.gasto>0).length
    return{leads,altas,gasto,n:filtered.length,accionesConGasto,cpa:safe(gasto,altas),cpl:safe(gasto,leads),conv:safe(altas,leads)}
  },[filtered])
  const byMes=useMemo(()=>{
    const m:Record<string,{mes:string;altas:number;gasto:number;leads:number}>={};
    for(const d of data){const k=d.mes.trim();if(!m[k])m[k]={mes:k,altas:0,gasto:0,leads:0};m[k].altas+=Number(d.altas)||0;m[k].gasto+=d.gasto>0?d.gasto:0;m[k].leads+=Number(d.leads)||0}
    return MESES.filter(x=>m[x]).map(x=>({...m[x],cpa:safe(m[x].gasto,m[x].altas)??0,conv:safe(m[x].altas,m[x].leads)??0}))
  },[data])
  const byFuente=useMemo(()=>{
    const m:Record<string,{fuente:string;altas:number;leads:number;gasto:number}>={};
    for(const d of filtered){const k=d.fuente||'Sin fuente';if(!m[k])m[k]={fuente:k,altas:0,leads:0,gasto:0};m[k].altas+=Number(d.altas)||0;m[k].leads+=Number(d.leads)||0;m[k].gasto+=d.gasto>0?d.gasto:0}
    return Object.values(m).sort((a,b)=>b.altas-a.altas).slice(0,12)
  },[filtered])
  const byCat=useMemo(()=>{
    const m:Record<string,{cat:string;altas:number;gasto:number}>={};
    for(const d of filtered){if(!m[d.categoria])m[d.categoria]={cat:d.categoria,altas:0,gasto:0};m[d.categoria].altas+=Number(d.altas)||0;m[d.categoria].gasto+=d.gasto>0?d.gasto:0}
    return Object.values(m).sort((a,b)=>b.altas-a.altas)
  },[filtered])
  const statsAltas=useMemo(()=>calcularStats(byMes.map(m=>m.altas)),[byMes])
  const statsLeads=useMemo(()=>calcularStats(byMes.map(m=>m.leads)),[byMes])
  const pieCat=byCat.map(c=>({name:c.cat,value:c.altas}))
  const exportCSV=()=>{const h=['Mes','Responsable','Categoría','Fuente','Sede','Leads','Altas','Gasto'];const rows=filtered.map(d=>[d.mes,d.responsable,d.categoria,d.fuente,d.sede,d.leads,d.altas,d.gasto]);const csv=[h,...rows].map(r=>r.join(';')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='captacion.csv';a.click()}
  return(<div className="p-6 max-w-[1400px]">
    <PageHeader title="Captación y Marketing" subtitle="Acciones, leads, altas, costes y eficiencia por canal">
      <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-zurko-dark border border-gray-200 rounded-md px-3 py-1.5 bg-white"><Download size={12}/> CSV</button>
    </PageHeader>
    <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
      <div><label className="filter-label">Mes</label><select value={mf} onChange={e=>setMf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{meses.map(m=><option key={m} value={m}>{m==='todos'?'Todos los meses':m}</option>)}</select></div>
      <div><label className="filter-label">Categoría</label><select value={cf} onChange={e=>setCf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">{cats.map(c=><option key={c} value={c}>{c==='todas'?'Todas':c}</option>)}</select></div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-2">
      <KpiCard label="Acciones" value={fmtNum(tot.n)}/><KpiCard label="Leads" value={fmtNum(tot.leads)}/><KpiCard label="Altas" value={fmtNum(tot.altas)} accent/>
      <KpiCard label="Gasto registrado" value={fmtEur(tot.gasto)} sub={`${tot.accionesConGasto} acciones con gasto`}/>
      <KpiCard label="CPA" value={fmtCpa(tot.cpa)} sub="€ por alta"/><KpiCard label="C/Lead" value={fmtCpa(tot.cpl)}/><KpiCard label="Conversión" value={tot.conv?`${(tot.conv*100).toFixed(1)}%`:'—'} sub="Leads→Altas"/>
    </div>
    <p className="text-[11px] text-zurko-dark mt-1 mb-4 px-1">⚠️ El gasto suma solo las acciones con importe registrado ({tot.accionesConGasto} de {tot.n}). Las filas sin gasto no se imputan.</p>

    <Div t="Estadísticos descriptivos"/>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <StatCard label="Altas por mes" stats={statsAltas}/>
      <StatCard label="Leads por mes" stats={statsLeads}/>
    </div>

    <Div t="Distribución de altas"/>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Altas por categoría</h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={150} height={150}>
            <PieChart><Pie data={pieCat} cx={70} cy={70} innerRadius={35} outerRadius={60} dataKey="value">{pieCat.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip formatter={(v:number,n:string)=>[`${v} altas`,n]}/></PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">{pieCat.map((c,i)=><div key={c.name} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/><span className="text-zurko-dark">{c.name}</span></div><span className="font-bold ml-2">{fmtNum(c.value)}</span></div>)}</div>
        </div>
      </div>
      {/* Fuente bar chart — labels always visible, rotated */}
      <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Altas por fuente (top 12)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byFuente} layout="vertical" margin={{left:8,right:40}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
            <XAxis type="number" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis dataKey="fuente" type="category" width={130} tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/>
            <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[0,2,2,0]}>
              <LabelList dataKey="altas" position="right" style={{fontSize:9,fill:'#505050',fontWeight:600}}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <Div t="Evolución mensual"/>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Leads y Altas por mes — con etiquetas</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byMes} barGap={2} barCategoryGap="30%" margin={{top:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="mes" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Bar dataKey="leads" name="Leads" fill="#C6C6C6" radius={[2,2,0,0]}><LabelList dataKey="leads" content={renderCustomLabel}/></Bar>
            <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}><LabelList dataKey="altas" content={renderCustomLabel}/></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="kpi-card"><h3 className="text-sm font-bold mb-3">CPA y conversión por mes</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={byMes} margin={{top:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="mes" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40}/>
            <YAxis yAxisId="left" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(0)}€`}/>
            <YAxis yAxisId="right" orientation="right" tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Line yAxisId="left" dataKey="cpa" name="CPA (€)" stroke="#B11C1F" strokeWidth={2.5} dot={{r:3}}/>
            <Line yAxisId="right" dataKey="conv" name="Conversión" stroke="#505050" strokeWidth={2} dot={{r:3}} strokeDasharray="4 2"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <Div t="Resumen mensual"/>
    <div className="kpi-card p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full data-table whitespace-nowrap">
      <thead><tr><th>Mes</th><th>Leads</th><th>Altas</th><th>Gasto con importe</th><th>CPA</th><th>C/Lead</th><th>Conversión</th></tr></thead>
      <tbody>{byMes.map((m,i)=><tr key={i}><td className="font-medium">{m.mes}</td><td>{fmtNum(m.leads)}</td><td className="font-bold text-brand-red">{fmtNum(m.altas)}</td><td>{fmtEur(m.gasto)}</td><td className="font-medium">{fmtCpa(safe(m.gasto,m.altas))}</td><td>{fmtCpa(safe(m.gasto,m.leads))}</td><td>{m.conv?(m.conv*100).toFixed(1)+'%':'—'}</td></tr>)}</tbody>
    </table></div></div>
  </div>)
}
