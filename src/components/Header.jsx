import { motion } from 'framer-motion'
import { SparkleIcon } from './Icons'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-4">
        <span className="hidden sm:block h-px flex-1 max-w-20 border-t-2 border-dotted border-emerald-300" />
        <span className="hidden sm:block h-1.5 w-1.5 rounded-full bg-emerald-400" />

        <div className="relative inline-block">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#05513F]">
            Loan 360°
          </h1>
          <SparkleIcon className="absolute -top-2 -right-3 h-5 w-5 text-emerald-400 animate-pulse-soft" />
        </div>

        <span className="hidden sm:block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="hidden sm:block h-px flex-1 max-w-20 border-t-2 border-dotted border-emerald-300" />
      </div>
      <p className="mt-2 text-slate-500">Search for a loan to view complete details</p>
    </motion.header>
  )
}
