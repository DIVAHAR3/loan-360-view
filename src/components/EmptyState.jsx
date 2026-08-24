import { motion } from 'framer-motion'
import CardHeading from './CardHeading'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-center border-b border-emerald-100 pb-3">
        <CardHeading emoji="ℹ️" title="Information" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 py-14 text-center">
        <div className="animate-float text-6xl">🏦</div>
        <div>
          <p className="text-lg font-semibold text-slate-700">No search yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Enter a Customer ID, Branch Code, or Loan Account above to get started
          </p>
        </div>
      </div>
    </motion.div>
  )
}
