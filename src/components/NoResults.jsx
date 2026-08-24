import { motion } from 'framer-motion'
import CardHeading from './CardHeading'

export default function NoResults() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex items-center border-b border-emerald-100 pb-3">
        <CardHeading emoji="ℹ️" title="Information" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 py-14 text-center">
        <div className="text-5xl">🔍</div>
        <div>
          <p className="text-lg font-semibold text-slate-700">No loans found</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your search criteria</p>
        </div>
      </div>
    </motion.div>
  )
}
