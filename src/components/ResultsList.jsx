import { AnimatePresence, motion } from 'framer-motion'
import LoanCard from './LoanCard'
import NoResults from './NoResults'
import CountUp from './CountUp'

export default function ResultsList({ results, loading, hasSearched, onSelect }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />
        <p className="text-sm">Searching loans…</p>
      </div>
    )
  }

  if (!hasSearched) return null

  if (results.length === 0) return <NoResults />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm font-medium text-slate-500">
        <CountUp value={results.length} duration={0.5} /> loan{results.length === 1 ? '' : 's'} found
      </p>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {results.map((loan, index) => (
            <LoanCard key={loan.id} loan={loan} index={index} onClick={() => onSelect(loan)} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
