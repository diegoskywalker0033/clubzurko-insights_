import{fmtDec,fmtNum}from'@/lib/kpis'
interface Stats{mean:number;median:number;max:number;min:number;std:number}
export default function StatCard({label,stats,isPct=false}:{label:string;stats:Stats|null;isPct?:boolean}){
  if(!stats)return null
  const fmt=(v:number)=>isPct?`${(v*100).toFixed(1)}%`:fmtDec(v,1)
  return(<div className="kpi-card border-l-4 border-l-zurko-light">
    <p className="kpi-label mb-2">{label}</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      <div className="text-zurko-dark">Media</div><div className="font-bold">{fmt(stats.mean)}</div>
      <div className="text-zurko-dark">Mediana</div><div className="font-bold">{fmt(stats.median)}</div>
      <div className="text-zurko-dark">Máximo</div><div className="font-bold text-green-600">{fmt(stats.max)}</div>
      <div className="text-zurko-dark">Mínimo</div><div className="font-bold text-red-600">{fmt(stats.min)}</div>
      <div className="text-zurko-dark">Desv. típ.</div><div className="font-bold text-zurko-dark">{fmt(stats.std)}</div>
    </div>
  </div>)
}