import { fmtPct } from '@/lib/kpis'
import clsx from 'clsx'

interface RateCardProps {
  label: string
  value: number | null
  color?: 'green' | 'red' | 'amber' | 'blue' | 'purple'
  className?: string
}

const colorMap = {
  green: { bar: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  red: { bar: 'bg-brand-red', text: 'text-brand-red', bg: 'bg-red-50' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  blue: { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
  purple: { bar: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
}

export default function RateCard({ label, value, color = 'blue', className }: RateCardProps) {
  const c = colorMap[color]
  const pct = value !== null ? Math.min(value * 100, 100) : 0

  return (
    <div className={clsx('kpi-card', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="kpi-label">{label}</p>
        <span className={clsx('text-sm font-bold', c.text)}>
          {fmtPct(value)}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={clsx('progress-fill', c.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
