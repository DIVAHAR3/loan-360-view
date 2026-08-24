const STYLES = {
  Active: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  Closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Overdue: 'bg-red-100 text-red-700 ring-red-600/20',
}

export default function StatusBadge({ status, className = '' }) {
  const style = STYLES[status] ?? STYLES.Closed
  const isOverdue = status === 'Overdue'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style} ${
        isOverdue ? 'animate-pulse-soft' : ''
      } ${className}`}
    >
      {status}
    </span>
  )
}
