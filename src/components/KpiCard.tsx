interface P{label:string;value:string;sub?:string;accent?:boolean}
export default function KpiCard({label,value,sub,accent}:P){return(<div className="kpi-card"><p className="kpi-label mb-1.5">{label}</p><p className={`text-2xl font-bold ${accent?'text-brand-red':'text-zurko-black'}`}>{value}</p>{sub&&<p className="text-xs text-zurko-dark mt-1">{sub}</p>}</div>)}
