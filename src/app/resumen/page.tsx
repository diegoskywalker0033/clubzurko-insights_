'use client'
import {useMemo} from 'react'
import {useDashboardStore} from '@/lib/store'
import {filtrarDatos,calcularKPIResumen,calcularAnalisisTemporal,fmtNum,fmtPct} from '@/lib/kpis'
import {DEMO_DATA} from '@/lib/demoData'
import {PERFILES_DATA} from '@/lib/demoData2'
import type {ProyectoSemanal,PerfilMes} from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import FiltrosBar from '@/components/FiltrosBar'
import FileUploader from '@/components/FileUploader'
import KpiCard from '@/components/KpiCard'
import RateCard from '@/components/RateCard'
import {ResponsiveContainer,AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'

const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
function Div({t}:{t:string}){return <div className="flex items-center gap-3 mb-3 mt-6"><div className="w-1 h-5 bg-brand-red rounded-full"/><h2 className="text-sm font-bold text-zurko-black uppercase tracking-wider">{t}</h2></div>}

export default function ResumenPage(){
  const{rawData,filtros,isUploaded}=useDashboardStore()
  const src=(isUploaded?rawData:DEMO_DATA) as ProyectoSemanal[]
  const filtered=useMemo(()=>filtrarDatos(src,filtros),[src,filtros])
  const kpis=useMemo(()=>calcularKPIResumen(filtered),[filtered])
  const weekly=useMemo(()=>calcularAnalisisTemporal(filtered).map(w=>({week:`W${w.week}`,Solicitados:w.sol_sin_extra,Reclutados:w.reclutados,Inicios:w.inicios})),[filtered])
  const perfiles=PERFILES_DATA as PerfilMes[]
  const latest=useMemo(()=>{const r:Record<string,PerfilMes>={};for(const p of perfiles){const c=r[p.sede];if(!c||MESES.indexOf(p.mes)>MESES.indexOf(c.mes))r[p.sede]=p}return r},[perfiles])
  const sedes=['Madrid','Albacete','Barcelona']
  const totalBDD=sedes.reduce((s,sede)=>s+(latest[sede]?.total_bdd||0),0)
  const bySede=useMemo(()=>sedes.map(sede=>({sede,...calcularKPIResumen(filtered.filter(r=>r.sede===sede))})),[filtered])
  const conRetraso=filtered.filter(r=>r.retraso===1).length
  const estudiosRetraso=new Set(filtered.filter(r=>r.retraso===1&&r.presupuesto.startsWith('S0')).map(r=>r.presupuesto)).size
  return(
    <div className="p-6 max-w-[1400px]">
      <PageHeader title="Resumen Ejecutivo" subtitle="Vista consolidada · Reclutamiento y Base de Datos"/>
      <div className="mb-5"><FileUploader/></div>
      <div className="mb-6"><FiltrosBar/></div>
      <Div t="Base de datos — voluntarios activos"/>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <KpiCard label="Total BDD" value={fmtNum(totalBDD)} accent sub="todas las sedes"/>
        {sedes.map(s=><KpiCard key={s} label={s} value={fmtNum(latest[s]?.total_bdd||0)} sub="voluntarios activos"/>)}
      </div>
      <Div t="KPIs de reclutamiento"/>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Reclutados" value={fmtNum(kpis.reclutados)} accent/>
        <KpiCard label="Asistentes" value={fmtNum(kpis.asistentes)}/>
        <KpiCard label="Inicios" value={fmtNum(kpis.inicios)}/>
        <KpiCard label="Proyectos en N" value={fmtNum(kpis.proyectoen_n)}/>
        <KpiCard label="Sobre objetivo N" value={fmtPct(kpis.semanas_sobre_n)} accent/>
        <KpiCard label="Sobre N+Extra" value={fmtPct(kpis.semanas_sobre_nx)}/>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        <RateCard label="Tasa asistencia" value={kpis.tasa_asistencia} color="blue"/>
        <RateCard label="Tasa inicios" value={kpis.tasa_inicios} color="green"/>
        <RateCard label="Tasa abandono" value={kpis.tasa_abandono} color="red"/>
        <RateCard label="Tasa exclusión" value={kpis.tasa_exclusion} color="amber"/>
        <RateCard label="No válidos" value={kpis.tasa_no_validos} color="purple"/>
      </div>
      {conRetraso>0&&(<>
        <Div t="Alertas de retraso"/>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="kpi-card border-l-4 border-l-amber-500"><p className="kpi-label mb-1">Proyectos con retraso</p><p className="text-2xl font-bold text-amber-600">{fmtNum(conRetraso)}</p><p className="text-xs text-zurko-dark mt-1">Ver detalle en &quot;Retrasos&quot;</p></div>
          <div className="kpi-card border-l-4 border-l-red-500"><p className="kpi-label mb-1">Estudios con retraso</p><p className="text-2xl font-bold text-red-600">{fmtNum(estudiosRetraso)}</p><p className="text-xs text-zurko-dark mt-1">Identificador S00XXX</p></div>
        </div>
      </>)}
      <Div t="Tendencia semanal"/>
      <div className="kpi-card mb-6">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C6C6C6" stopOpacity={0.3}/><stop offset="95%" stopColor="#C6C6C6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#B11C1F" stopOpacity={0.15}/><stop offset="95%" stopColor="#B11C1F" stopOpacity={0}/></linearGradient>
              <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#505050" stopOpacity={0.1}/><stop offset="95%" stopColor="#505050" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
            <XAxis dataKey="week" tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#505050'}} axisLine={false} tickLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11}}/>
            <Area type="monotone" dataKey="Solicitados" stroke="#C6C6C6" strokeWidth={2} fill="url(#gS)"/>
            <Area type="monotone" dataKey="Reclutados" stroke="#B11C1F" strokeWidth={2} fill="url(#gR)"/>
            <Area type="monotone" dataKey="Inicios" stroke="#505050" strokeWidth={2} fill="url(#gI)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Div t="Por sede"/>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bySede.map(s=>(
          <div key={s.sede} className="kpi-card border-t-4 border-t-brand-red">
            <h3 className="text-sm font-bold mb-3">{s.sede}</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-zurko-dark">BDD activa</span><span className="font-bold text-brand-red">{fmtNum(latest[s.sede]?.total_bdd||0)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Reclutados</span><span className="font-bold">{fmtNum(s.reclutados)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Inicios</span><span className="font-bold">{fmtNum(s.inicios)}</span></div>
              <div className="flex justify-between"><span className="text-zurko-dark">Sobre N</span><span className="font-bold text-brand-red">{fmtPct(s.semanas_sobre_n)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
