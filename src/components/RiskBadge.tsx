import clsx from 'clsx'

const RISK_CONFIG = {
  low: { label: 'Bajo', className: 'bg-green-100 text-green-800' },
  medium: { label: 'Medio', className: 'bg-amber-100 text-amber-800' },
  high: { label: 'Alto', className: 'bg-red-100 text-red-800' },
  very_high: { label: 'Muy alto', className: 'bg-purple-100 text-purple-800' },
}

export default function RiskBadge({ riesgo }: { riesgo: string }) {
  const config = RISK_CONFIG[riesgo as keyof typeof RISK_CONFIG] ?? { label: riesgo, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', config.className)}>
      {config.label}
    </span>
  )
}
