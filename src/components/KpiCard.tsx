import clsx from 'clsx'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export default function KpiCard({ label, value, sub, accent=false, trend, trendValue, className }: KpiCardProps) {
  return (
    <div className={clsx('kpi-card', accent && 'border-l-4 border-l-brand-red', className)}>
      <p className="kpi-label mb-1.5 leading-tight">{label}</p>
      <p className={clsx(
        'font-bold leading-none',
        accent ? 'text-brand-red' : 'text-zurko-black',
        // Responsive font size: smaller on mobile if value is long
        String(value).length > 7 ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
      )} style={{fontFamily:'Sansation,sans-serif'}}>
        {value}
      </p>
      {(sub || trend) && (
        <div className="flex items-center gap-2 mt-1.5">
          {sub && <p className="text-[11px] text-zurko-dark leading-tight">{sub}</p>}
          {trend && trendValue && (
            <span className={trend==='up'?'kpi-delta-up':trend==='down'?'kpi-delta-down':'text-xs text-zurko-dark'}>
              {trend==='up'?'↑':trend==='down'?'↓':''} {trendValue}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
