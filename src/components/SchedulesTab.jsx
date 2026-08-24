import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, formatDate } from '../formatters'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const STATUS_OPTIONS = ['All statuses', 'Paid', 'Upcoming']

function buildCategorySchedule(loan) {
  const monthlyRate = loan.interestRate / 100 / 12
  const n = loan.termMonths
  const principalAmount = loan.originalAmount
  const payment =
    monthlyRate > 0 ? (principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : principalAmount / n
  const startDate = new Date(loan.disbursementDate)
  const today = new Date()

  let balance = principalAmount
  const principalRows = []
  const interestRows = []
  const taxRows = []

  for (let period = 1; period <= n; period++) {
    const opening = balance
    const interest = opening * monthlyRate
    const principalPortion = Math.min(payment - interest, opening)
    const interestTax = interest * 0.04
    balance = Math.max(opening - principalPortion, 0)

    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + period)
    const dueDateIso = dueDate.toISOString().slice(0, 10)
    const status = dueDate <= today ? 'Paid' : 'Upcoming'

    principalRows.push({
      no: period,
      dueDate: dueDateIso,
      opening,
      amount: principalPortion,
      dueAmount: status === 'Paid' ? 0 : principalPortion,
      status,
      closing: balance,
    })
    interestRows.push({
      no: period,
      dueDate: dueDateIso,
      opening,
      amount: interest,
      dueAmount: status === 'Paid' ? 0 : interest,
      status,
      closing: balance,
    })
    taxRows.push({
      no: period,
      dueDate: dueDateIso,
      opening: null,
      amount: interestTax,
      dueAmount: status === 'Paid' ? 0 : interestTax,
      status,
      closing: null,
    })
  }

  const feeStatus = new Date(loan.disbursementDate) <= today ? 'Paid' : 'Upcoming'
  const feeRows = [
    {
      no: 1,
      dueDate: loan.disbursementDate,
      opening: null,
      amount: loan.components.processingFee.expected,
      dueAmount: feeStatus === 'Paid' ? 0 : loan.components.processingFee.expected,
      status: feeStatus,
      closing: null,
    },
  ]

  return [
    { code: 'PRINCIPAL', description: 'Principal repayment', dot: 'bg-blue-500', rows: principalRows },
    { code: 'INTEREST', description: 'Interest accrual', dot: 'bg-violet-500', rows: interestRows },
    { code: 'INTEREST TAX', description: 'Tax on interest', dot: 'bg-rose-500', rows: taxRows },
    { code: 'PROCESSING FEE', description: 'One-time origination fee', dot: 'bg-amber-500', rows: feeRows },
  ]
}

function ddmmyyyyToIso(value) {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

function Th({ children, align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      className={`whitespace-nowrap border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 ${alignClass}`}
    >
      {children}
    </th>
  )
}

export default function SchedulesTab({ loan }) {
  const categories = useMemo(() => buildCategorySchedule(loan), [loan])
  const [activeCode, setActiveCode] = useState(categories[0].code)
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [statusOpen, setStatusOpen] = useState(false)
  const [goToDate, setGoToDate] = useState('')
  const [highlightedRow, setHighlightedRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [pageSize, setPageSize] = useState(25)
  const [customRows, setCustomRows] = useState('')
  const [pendingScroll, setPendingScroll] = useState(null)
  const rowRefs = useRef({})

  const active = categories.find((c) => c.code === activeCode) ?? categories[0]

  const filteredRows = useMemo(() => {
    if (statusFilter === 'All statuses') return active.rows
    return active.rows.filter((r) => r.status === statusFilter)
  }, [active, statusFilter])

  const filteredTotal = useMemo(() => filteredRows.reduce((sum, r) => sum + r.amount, 0), [filteredRows])
  const filteredDue = useMemo(() => filteredRows.reduce((sum, r) => sum + r.dueAmount, 0), [filteredRows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pagedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage, pageSize],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCode, statusFilter, pageSize])

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  const jumpToPage = () => {
    const n = Number(pageInput)
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
      setCurrentPage(Math.round(n))
    } else {
      setPageInput(String(currentPage))
    }
  }

  useEffect(() => {
    if (pendingScroll == null) return
    const el = rowRefs.current[pendingScroll]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedRow(pendingScroll)
      window.setTimeout(() => setHighlightedRow((cur) => (cur === pendingScroll ? null : cur)), 1400)
    }
    setPendingScroll(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pendingScroll])

  const handleGoToDate = (value) => {
    setGoToDate(value)
    const iso = ddmmyyyyToIso(value)
    if (!iso) return
    const idx = filteredRows.findIndex((r) => r.dueDate >= iso)
    const matchIdx = idx === -1 ? filteredRows.length - 1 : idx
    if (matchIdx < 0) return
    const match = filteredRows[matchIdx]
    const page = Math.floor(matchIdx / pageSize) + 1
    if (page !== currentPage) {
      setCurrentPage(page)
      setPendingScroll(match.no)
    } else {
      const el = rowRefs.current[match.no]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedRow(match.no)
        window.setTimeout(() => setHighlightedRow((cur) => (cur === match.no ? null : cur)), 1400)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white"
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/60 p-2">
        {categories.map((cat) => {
          const isActive = cat.code === active.code
          return (
            <button
              key={cat.code}
              type="button"
              onClick={() => setActiveCode(cat.code)}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-left transition-colors duration-150 ${
                isActive ? '' : 'hover:bg-white/60'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="schedule-tab-active-bg"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_12px_-4px_rgba(15,28,23,0.18)] ring-1 ring-slate-100"
                />
              )}
              <motion.span
                animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 h-2 w-2 shrink-0 rounded-full ${cat.dot}`}
              />
              <span className="relative z-10 flex flex-col leading-tight">
                <span className={`text-xs font-extrabold tracking-wide ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {cat.code}
                </span>
                <span className="text-[10px] text-slate-400">{cat.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.code}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active.dot}`} />
              <h3 className="text-sm font-extrabold tracking-wide text-slate-800">{active.code}</h3>
              <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                {active.description}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <span>🔍</span>
              <span className="text-xs font-semibold">Status</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-150 ${
                  statusOpen ? 'border-[#0B7A54] ring-1 ring-[#0B7A54]' : 'border-slate-200'
                }`}
              >
                {statusFilter}
                <motion.span animate={{ rotate: statusOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400">
                  ▾
                </motion.span>
              </button>
              <AnimatePresence>
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 mt-1.5 w-36 origin-top overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_16px_32px_-12px_rgba(15,28,23,0.25)]"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStatusFilter(option)
                            setStatusOpen(false)
                          }}
                          className={`flex w-full items-center px-3.5 py-2 text-left text-xs font-semibold transition-colors duration-150 ${
                            option === statusFilter ? 'bg-[#0B7A54] text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <span>📅</span>
              <span className="text-xs font-semibold">Go to date</span>
            </div>
            <input
              type="text"
              value={goToDate}
              onChange={(e) => handleGoToDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-32 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 outline-none transition-colors duration-150 focus:border-[#0B7A54]"
            />

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Rows</span>
              <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 p-0.5">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size)
                      setCustomRows('')
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors duration-150 ${
                      pageSize === size && !customRows ? 'bg-[#0B7A54] text-white' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <input
                  type="text"
                  inputMode="numeric"
                  value={customRows}
                  onChange={(e) => setCustomRows(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    const n = Number(customRows)
                    if (n > 0) setPageSize(n)
                  }}
                  onBlur={() => {
                    const n = Number(customRows)
                    if (n > 0) setPageSize(n)
                    else setCustomRows('')
                  }}
                  placeholder="Custom"
                  aria-label="Custom rows per page"
                  className={`w-14 rounded-full px-2 py-1 text-center text-[11px] font-bold outline-none transition-colors duration-150 placeholder:font-normal placeholder:text-slate-400 ${
                    customRows ? 'bg-[#0B7A54] text-white placeholder:text-white/70' : 'bg-transparent text-slate-400'
                  }`}
                />
              </div>
            </div>

            <span className="ml-auto text-xs text-slate-400">
              Total <span className="font-extrabold text-slate-800">{formatCurrency(filteredTotal, loan.currency)}</span>
              {' · '}
              Due <span className="font-extrabold text-rose-600">{formatCurrency(filteredDue, loan.currency)}</span>
            </span>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="sticky top-0 z-10 bg-white">
                  <Th>#</Th>
                  <Th>Due Date</Th>
                  <Th align="right">Opening</Th>
                  <Th align="right">Amount</Th>
                  <Th align="right">Due Amount</Th>
                  <Th align="center">Status</Th>
                  <Th align="right">Closing</Th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr
                    key={row.no}
                    ref={(el) => {
                      rowRefs.current[row.no] = el
                    }}
                    className={`transition-colors duration-300 hover:bg-emerald-50/60 ${
                      highlightedRow === row.no ? 'bg-emerald-100' : ''
                    }`}
                  >
                    <td className="border-b border-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-400">{row.no}</td>
                    <td className="border-b border-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800">{formatDate(row.dueDate)}</td>
                    <td className="border-b border-slate-50 px-4 py-2.5 text-right text-sm font-semibold text-slate-600">
                      {row.opening == null ? '—' : formatCurrency(row.opening, loan.currency)}
                    </td>
                    <td className="border-b border-slate-50 px-4 py-2.5 text-right text-sm font-semibold text-slate-600">
                      {formatCurrency(row.amount, loan.currency)}
                    </td>
                    <td
                      className={`border-b border-slate-50 px-4 py-2.5 text-right text-sm font-bold ${
                        row.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(row.dueAmount, loan.currency)}
                    </td>
                    <td className="border-b border-slate-50 px-4 py-2.5 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="border-b border-slate-50 px-4 py-2.5 text-right text-sm font-extrabold text-slate-800">
                      {row.closing == null ? '—' : formatCurrency(row.closing, loan.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No rows match this filter.</p>}
          </div>

          {filteredRows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
              <span className="text-xs text-slate-400">
                Showing{' '}
                <span className="font-bold text-slate-700">
                  {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRows.length)}
                </span>{' '}
                of <span className="font-bold text-slate-700">{filteredRows.length}</span>
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Go to</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') jumpToPage()
                    }}
                    onBlur={jumpToPage}
                    aria-label="Go to page"
                    className="h-7 w-12 rounded-full border border-slate-200 bg-white text-center text-xs font-bold text-slate-700 outline-none transition-colors duration-150 focus:border-[#0B7A54]"
                  />
                  <span>of {totalPages}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-150 ${
                      page === currentPage ? 'bg-[#0B7A54] text-white' : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next page"
                >
                  ›
                </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
