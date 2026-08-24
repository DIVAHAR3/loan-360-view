import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'
import { formatCurrency } from '../formatters'

const ICONS = {
  'Car Loan': '🚗',
  Mortgage: '🏠',
  'Personal Loan': '💳',
  'Business Loan': '💼',
}

export default function LoanCard({ loan, index, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-[box-shadow,border-color] duration-[250ms] ease-out hover:border-emerald-300 hover:shadow-lg hover:shadow-slate-200/70"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl">
        {ICONS[loan.loanType] ?? '💰'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-slate-900">
          {loan.branchCode} / {loan.loanAccount}
        </p>
        <p className="truncate text-sm text-slate-400">{loan.internalId}</p>
        <p className="mt-0.5 text-sm text-slate-500">
          CIF: {loan.customerId} • {loan.loanType} • {formatCurrency(loan.originalAmount, loan.currency)}
        </p>
      </div>

      <StatusBadge status={loan.status} className="shrink-0" />
    </motion.button>
  )
}
