import {fmtPct} from '@/lib/kpis'
const C:Record<string,string>={blue:'bg-blue-500',green:'bg-green-500',red:'bg-brand-red',amber:'bg-amber-500',purple:'bg-purple-500'}
export default function RateCard({label,value,color}:{label:string;value:number|null;color:string}){
  const pct=value===null?0:Math.min(value*100,100)
  return(<div className="kpi-card"><p className="kpi-label mb-2">{label}</p><p className="text-2xl font-bold text-zurko-black mb-2">{fmtPct(value)}</p><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${C[color]||'bg-brand-red'}`} style={{width:`${pct}%`}}/></div></div>)
}
