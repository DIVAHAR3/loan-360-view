import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from './CountUp'
import CardHeading from './CardHeading'
import { formatCurrency, formatDate } from '../formatters'

const PERIODS_PER_PAGE = 12

const COMPONENT_STYLES = {
  Interest: 'bg-violet-100 text-violet-700',
  'Interest Tax': 'bg-rose-100 text-rose-700',
  Principal: 'bg-blue-100 text-blue-700',
}

function buildSchedule(loan) {
  const rows = []
  const monthlyRate = loan.interestRate / 100 / 12
  const n = loan.termMonths
  const principalAmount = loan.originalAmount
  const payment =
    monthlyRate > 0 ? (principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : principalAmount / n

  let balance = principalAmount
  const startDate = new Date(loan.disbursementDate)

  for (let period = 1; period <= n; period++) {
    const interest = balance * monthlyRate
    const principalPortion = Math.min(payment - interest, balance)
    const interestTax = interest * 0.04
    balance = Math.max(balance - principalPortion, 0)

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + period)
    const dueDateStr = dueDate.toISOString().slice(0, 10)

    rows.push({ period, component: 'Interest', dueDate: dueDateStr, amountDue: interest, amountPaid: 0, status: 'Pending' })
    rows.push({
      period,
      component: 'Interest Tax',
      dueDate: dueDateStr,
      amountDue: interestTax,
      amountPaid: interestTax,
      status: 'Paid',
    })
    rows.push({
      period,
      component: 'Principal',
      dueDate: dueDateStr,
      amountDue: principalPortion,
      amountPaid: 0,
      status: 'Pending',
    })
  }

  return rows
}

const COMPONENT_OPTIONS = ['All Components', 'Interest', 'Interest Tax', 'Principal']

function ComponentDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Component</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 flex w-44 items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 outline-none transition-colors duration-200 hover:border-emerald-400"
      >
        {value}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-emerald-500">
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-lg"
            >
              {COMPONENT_OPTIONS.map((option) => {
                const active = option === value
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-150 ${
                      active ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ExportButton({ emoji, label, tone }) {
  const [busy, setBusy] = useState(false)

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(15,23,42,0.1)' }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        setBusy(true)
        setTimeout(() => setBusy(false), 900)
      }}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors duration-200 ${tone}`}
    >
      <motion.span
        animate={busy ? { rotate: 360 } : { rotate: 0 }}
        transition={busy ? { duration: 0.7, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
      >
        {emoji}
      </motion.span>
      {label}
    </motion.button>
  )
}

export default function LoanStatementModal({ loan, onClose }) {
  const schedule = useMemo(() => buildSchedule(loan), [loan])
  const [activeComponent, setActiveComponent] = useState('All Components')
  const [page, setPage] = useState(1)

  const totalDue = schedule.reduce((sum, r) => sum + r.amountDue, 0)
  const totalPaid = schedule.reduce((sum, r) => sum + r.amountPaid, 0)
  const totalPages = Math.max(1, Math.ceil(loan.termMonths / PERIODS_PER_PAGE))

  const periodStart = (page - 1) * PERIODS_PER_PAGE + 1
  const periodEnd = Math.min(page * PERIODS_PER_PAGE, loan.termMonths)

  const visibleRows = schedule.filter(
    (r) =>
      r.period >= periodStart &&
      r.period <= periodEnd &&
      (activeComponent === 'All Components' || r.component === activeComponent),
  )

  const changePage = (next) => {
    setPage(Math.min(Math.max(next, 1), totalPages))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="relative shrink-0 border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardHeading emoji="🧾" title="Loan Statement" />
              <p className="mt-1 pl-9 text-sm text-slate-500">Account: {loan.loanAccount}</p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </motion.button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ComponentDropdown
              value={activeComponent}
              onChange={(value) => {
                setActiveComponent(value)
                setPage(1)
              }}
            />

            <div className="ml-auto flex flex-wrap gap-2">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Schedules</p>
                <p className="text-sm font-bold text-slate-800">
                  <CountUp value={loan.termMonths} duration={0.6} />
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Total Due</p>
                <p className="text-sm font-bold text-slate-800">
                  <CountUp value={totalDue} format={(v) => formatCurrency(v, loan.currency)} duration={0.7} />
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">Total Paid</p>
                <p className="text-sm font-bold text-slate-800">
                  <CountUp value={totalPaid} format={(v) => formatCurrency(v, loan.currency)} duration={0.7} />
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-2">#</th>
                <th className="pb-2 pr-2">Component</th>
                <th className="pb-2 pr-2">Start Date</th>
                <th className="pb-2 pr-2">Due Date</th>
                <th className="pb-2 pr-2 text-right">Amount Due</th>
                <th className="pb-2 pr-2 text-right">Amount Paid</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={`${page}-${activeComponent}`}
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }}
              >
                {visibleRows.map((row, i) => (
                  <motion.tr
                    key={`${row.period}-${row.component}`}
                    variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ backgroundColor: 'rgba(5,150,105,0.04)' }}
                    className="border-b border-slate-50"
                  >
                    <td className="py-2 pr-2 text-slate-500">{row.period}</td>
                    <td className="py-2 pr-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${COMPONENT_STYLES[row.component]}`}
                      >
                        {row.component}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-slate-400">-</td>
                    <td className="py-2 pr-2 text-slate-700">{formatDate(row.dueDate)}</td>
                    <td className="py-2 pr-2 text-right font-semibold text-slate-800">
                      {formatCurrency(row.amountDue, loan.currency)}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold text-slate-800">
                      {formatCurrency(row.amountPaid, loan.currency)}
                    </td>
                    <td className="py-2 text-right">
                      {row.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          ○ Pending
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </motion.button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <motion.button
              type="button"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </motion.button>
          </div>

          <div className="flex gap-2">
            <ExportButton emoji="📊" label="Download XLS" tone="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" />
            <ExportButton emoji="📄" label="Download PDF" tone="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
