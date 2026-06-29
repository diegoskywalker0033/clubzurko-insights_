'use client'
import {useMemo,useState} from 'react'
import {PERFILES_DATA,CRECIMIENTO_DATA} from '@/lib/demoData2'
import type {PerfilMes,CrecimientoSemanal} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import KpiCard from '@/components/KpiCard'
import {fmtNum} from '@/lib/kpis'
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,AreaChart,Area} from 'recharts'

const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const COLORS={Madrid:'#B11C1F',Albacete:'#505050',Barcelona:'#C6C6C6'}

function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-7"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}
function Delta({v}:{v:number|null}){if(v===null)return<span className="text-xs text-gray-300">—</span>;const p=v>=0;return<span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${p?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>{p?'+':''}{fmtNum(v)}</span>}

export default function BaseDatosPage(){
  const[sf,setSf]=useState('todas')
  const perf=PERFILES_DATA as PerfilMes[]
  const crec=CRECIMIENTO_DATA as CrecimientoSemanal[]

  const pfilt=useMemo(()=>sf==='todas'?perf:perf.filter(p=>p.sede===sf),[perf,sf])
  const cfilt=useMemo(()=>sf==='todas'?crec:crec.filter(c=>c.sede===sf),[crec,sf])

  const latest=useMemo(()=>{const r:Record<string,PerfilMes>={};for(const p of perf){const c=r[p.sede];if(!c||MESES.indexOf(p.mes)>MESES.indexOf(c.mes))r[p.sede]=p}return r},[perf])

  // BDD evolution by mes — stacked by sede
  const bddStacked=useMemo(()=>{
    const bySede:Record<string,Record<string,number>>={Madrid:{},Albacete:{},Barcelona:{}}
    for(const p of perf){if(bySede[p.sede])bySede[p.sede][p.mes]=p.total_bdd}
    const meses=MESES.filter(m=>Object.values(bySede).some(s=>s[m]))
    return meses.map(m=>({mes:m,...Object.fromEntries(Object.entries(bySede).map(([sede,data])=>[sede,data[m]??0]))}))
  },[perf])

  // BDD filtered evolution
  const bddByMes=useMemo(()=>{const m:Record<string,number>={};for(const p of pfilt)m[p.mes]=(m[p.mes]||0)+p.total_bdd;return MESES.filter(x=>m[x]).map(x=>({mes:x,total:m[x]}))},[pfilt])

  // Altas stacked by sede weekly
  const altasStacked=useMemo(()=>{
    const bySede:Record<string,Record<number,number>>={Madrid:{},Albacete:{},Barcelona:{}}
    for(const c of crec){if(bySede[c.sede])bySede[c.sede][c.week]=(bySede[c.sede][c.week]||0)+c.altas}
    const allW=Array.from(new Set(crec.map(c=>c.week))).sort((a,b)=>a-b)
    return allW.map(w=>({'week':`W${w}`,...Object.fromEntries(Object.entries(bySede).map(([sede,data])=>[sede,data[w]??0]))}))
  },[crec])

  const altasFilt=useMemo(()=>{const b:Record<number,{week:number;citas:number;altas:number}>={};for(const c of cfilt){if(!b[c.week])b[c.week]={week:c.week,citas:0,altas:0};b[c.week].citas+=c.citas;b[c.week].altas+=c.altas}return Object.values(b).sort((a,b2)=>a.week-b2.week)},[cfilt])

  // Cumulative altas
  const altasCumul=useMemo(()=>{
    let sum=0
    return altasFilt.map(w=>{sum+=w.altas;return{week:`W${w.week}`,altas:w.altas,acumulado:sum}})
  },[altasFilt])

  const totalAltas=cfilt.reduce((s,c)=>s+c.altas,0)
  const ultBDD=bddByMes.at(-1)?.total??0

  const FIELDS=[{key:'total_bdd',label:'Total BDD'},{key:'asiaticos',label:'Asiáticos'},{key:'afros',label:'Afros'},{key:'arabe',label:'Árabe'},{key:'ft5',label:'Ft V'},{key:'ft6',label:'Ft VI'},{key:'bebes',label:'Bebés'},{key:'hijos',label:'Hijos'}]
  const incrData=useMemo(()=>{
    const bm:Record<string,Record<string,number>>={};for(const p of pfilt){if(!bm[p.mes])bm[p.mes]={asiaticos:0,afros:0,arabe:0,ft5:0,ft6:0,bebes:0,hijos:0,total_bdd:0};const b=bm[p.mes];for(const f of Object.keys(b))b[f]+=(p as unknown as Record<string,number>)[f]||0}
    const ms=MESES.filter(m=>bm[m])
    return ms.map((mes,i)=>{const cur=bm[mes],prev=i>0?bm[ms[i-1]]:null;const d=(f:string)=>prev?cur[f]-prev[f]:null;return{mes,cur,delta:d}})
  },[pfilt])

  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Base de Datos" subtitle="Crecimiento, perfiles y evolución de voluntarios activos"/>
      <div className="bg-white border border-gray-100 rounded-lg px-5 py-4 shadow-card mb-6">
        <label className="filter-label">Sede</label>
        <select value={sf} onChange={e=>setSf(e.target.value)} className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-brand-red">
          {['todas','Madrid','Albacete','Barcelona'].map(s=><option key={s} value={s}>{s==='todas'?'Todas las sedes':s}</option>)}
        </select>
      </div>

      <Div t="Resumen BDD"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Total BDD activa" value={fmtNum(ultBDD)} accent sub="último mes"/>
        <KpiCard label="Total altas período" value={fmtNum(totalAltas)}/>
        {['Madrid','Albacete','Barcelona'].map(s=><KpiCard key={s} label={s} value={fmtNum(latest[s]?.total_bdd||0)} sub="voluntarios activos"/>)}
      </div>

      {/* Stacked bars total por sede (solo si todas) */}
      {sf==='todas'&&(<>
        <Div t="BDD activa por sede y mes (barras apiladas)"/>
        <div className="kpi-card mb-6">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bddStacked} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={35}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Madrid" stackId="a" fill={COLORS.Madrid}/>
              <Bar dataKey="Albacete" stackId="a" fill={COLORS.Albacete}/>
              <Bar dataKey="Barcelona" stackId="a" fill={COLORS.Barcelona} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>)}

      <Div t={`Evolución BDD${sf!=='todas'?` · ${sf}`:' total'}`}/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={bddByMes}>
            <defs><linearGradient id="gBDD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B11C1F" stopOpacity={0.15}/><stop offset="95%" stopColor="#B11C1F" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="mes" tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/>
            <Area dataKey="total" name="BDD Activa" stroke="#B11C1F" strokeWidth={2.5} fill="url(#gBDD)" dot={{fill:'#B11C1F',r:3}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Altas semanales stacked */}
      {sf==='todas'&&(<>
        <Div t="Altas semanales por sede (barras apiladas)"/>
        <div className="kpi-card mb-6">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={altasStacked} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Madrid" stackId="a" fill={COLORS.Madrid}/>
              <Bar dataKey="Albacete" stackId="a" fill={COLORS.Albacete}/>
              <Bar dataKey="Barcelona" stackId="a" fill={COLORS.Barcelona} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>)}

      <Div t="Altas y acumulado semanal"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Citas vs Altas por semana</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={altasFilt} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tickFormatter={v=>`W${v}`} tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="citas" name="Citas" fill="#C6C6C6" radius={[2,2,0,0]}/>
              <Bar dataKey="altas" name="Altas" fill="#B11C1F" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="kpi-card"><h3 className="text-sm font-bold mb-3">Altas acumuladas en el año</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={altasCumul}>
              <defs><linearGradient id="gAC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#505050" stopOpacity={0.15}/><stop offset="95%" stopColor="#505050" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:9,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#505050'}} axisLine={false} tickLine={false}/>
              <Tooltip/>
              <Area dataKey="acumulado" name="Acumulado" stroke="#505050" strokeWidth={2} fill="url(#gAC)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Div t="Incremento mensual por perfil"/>
      <div className="kpi-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table whitespace-nowrap">
            <thead><tr><th>Mes</th>{FIELDS.map(f=><th key={f.key}>{f.label}</th>)}</tr></thead>
            <tbody>{incrData.map((row,i)=>(
              <tr key={i}><td className="font-medium">{row.mes}</td>
                {FIELDS.map(f=><td key={f.key}><span className="font-medium">{fmtNum(row.cur[f.key]||0)}</span>{row.delta(f.key)!==null&&<div className="mt-0.5"><Delta v={row.delta(f.key)}/></div>}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
