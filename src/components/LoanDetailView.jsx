import { useState, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from './CountUp'
import CardHeading from './CardHeading'
import LoanStatementModal from './LoanStatementModal'
import SchedulesTab from './SchedulesTab'
import { formatCurrency, formatDate } from '../formatters'
import { getTotalOutstanding } from '../mockData'
import {
  BankIcon,
  ArrowLeftIcon,
  RefreshIcon,
  DocumentIcon,
  TrendingUpIcon,
  DotsVerticalIcon,
  CopyIcon,
  CalendarIcon,
  WarningIcon,
  PieChartIcon,
  ListIcon,
  CreditCardIcon,
  ShieldIcon,
  PeopleIcon,
  GearIcon,
  BarChartIcon,
  CarIcon,
} from './Icons'

const TYPE_EMOJI = {
  'Car Loan': '🚗',
  Mortgage: '🏠',
  'Personal Loan': '💳',
  'Business Loan': '💼',
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: PieChartIcon },
  { key: 'timeline', label: 'Timeline', icon: ListIcon },
  { key: 'schedules', label: 'Schedules', icon: CalendarIcon },
  { key: 'overdue', label: 'Overdue', icon: WarningIcon },
  { key: 'charges', label: 'Charges', icon: CreditCardIcon },
  { key: 'collateral', label: 'Collateral', icon: ShieldIcon },
  { key: 'applicants', label: 'Applicants', icon: PeopleIcon },
  { key: 'rateHistory', label: 'Rate History', icon: TrendingUpIcon },
]

const ALL_TABS = [...NAV_ITEMS, { key: 'settings', label: 'Settings', icon: GearIcon }]

const STAT_THEMES = {
  emerald: {
    solidBg: 'bg-emerald-50',
    text: 'text-emerald-600',
    badge: 'bg-gradient-to-br from-emerald-50 to-emerald-100 ring-1 ring-emerald-200/60',
    bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    wave: '#059669',
    hoverFill: 'bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100',
    hoverBorder: 'border-emerald-300',
    tileInner: 'bg-gradient-to-b from-white to-emerald-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(5,150,105,0.38)]',
    iconBadge: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_6px_14px_-2px_rgba(5,150,105,0.65)]',
  },
  blue: {
    solidBg: 'bg-blue-50',
    text: 'text-blue-600',
    badge: 'bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200/60',
    bar: 'bg-gradient-to-r from-blue-400 to-blue-600',
    wave: '#2563eb',
    hoverFill: 'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100',
    hoverBorder: 'border-blue-300',
    tileInner: 'bg-gradient-to-b from-white to-blue-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(37,99,235,0.38)]',
    iconBadge: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_6px_14px_-2px_rgba(37,99,235,0.65)]',
  },
  violet: {
    solidBg: 'bg-violet-50',
    text: 'text-violet-600',
    badge: 'bg-gradient-to-br from-violet-50 to-violet-100 ring-1 ring-violet-200/60',
    bar: 'bg-gradient-to-r from-violet-400 to-violet-600',
    wave: '#7c3aed',
    hoverFill: 'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100',
    hoverBorder: 'border-violet-300',
    tileInner: 'bg-gradient-to-b from-white to-violet-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(124,58,237,0.38)]',
    iconBadge: 'bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-[0_6px_14px_-2px_rgba(124,58,237,0.65)]',
  },
  orange: {
    solidBg: 'bg-orange-50',
    text: 'text-orange-600',
    badge: 'bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-200/60',
    bar: 'bg-gradient-to-r from-orange-400 to-orange-600',
    wave: '#ea580c',
    hoverFill: 'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100',
    hoverBorder: 'border-orange-300',
    tileInner: 'bg-gradient-to-b from-white to-orange-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(234,88,12,0.38)]',
    iconBadge: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_6px_14px_-2px_rgba(234,88,12,0.65)]',
  },
  teal: {
    solidBg: 'bg-teal-50',
    text: 'text-teal-600',
    badge: 'bg-gradient-to-br from-teal-50 to-teal-100 ring-1 ring-teal-200/60',
    bar: 'bg-gradient-to-r from-teal-400 to-teal-600',
    wave: '#0d9488',
    hoverFill: 'bg-gradient-to-br from-teal-50 via-teal-50 to-teal-100',
    hoverBorder: 'border-teal-300',
    tileInner: 'bg-gradient-to-b from-white to-teal-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(13,148,136,0.38)]',
    iconBadge: 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_6px_14px_-2px_rgba(13,148,136,0.65)]',
  },
  amber: {
    solidBg: 'bg-amber-50',
    text: 'text-amber-600',
    badge: 'bg-gradient-to-br from-amber-50 to-amber-100 ring-1 ring-amber-200/60',
    bar: 'bg-gradient-to-r from-amber-400 to-amber-600',
    wave: '#d97706',
    hoverFill: 'bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100',
    hoverBorder: 'border-amber-300',
    tileInner: 'bg-gradient-to-b from-white to-amber-50',
    tileGlow: 'drop-shadow-[0_14px_24px_rgba(217,119,6,0.38)]',
    iconBadge: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_6px_14px_-2px_rgba(217,119,6,0.65)]',
  },
}

const AVATAR_BADGE_STYLE =
  'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-1 ring-emerald-800/10 shadow-[0_2px_6px_rgba(5,81,63,0.35),0_1px_2px_rgba(0,0,0,0.06)]'

function Sidebar({ activeTab, onSelect }) {
  return (
    <aside className="my-4 ml-4 hidden w-24 shrink-0 flex-col items-center gap-1 rounded-3xl bg-white py-5 shadow-sm sm:flex">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${AVATAR_BADGE_STYLE}`}>
        <BankIcon className="h-5 w-5" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`relative flex w-[84px] flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-colors duration-200 ${
                active ? 'text-emerald-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 rounded-2xl bg-emerald-50"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                <Icon className="h-5 w-5" />
                <span className="text-[10.5px] font-medium leading-none">{label}</span>
              </span>
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={() => onSelect('settings')}
        className={`relative flex w-[84px] flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-colors duration-200 ${
          activeTab === 'settings' ? 'text-emerald-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
      >
        {activeTab === 'settings' && (
          <motion.div
            layoutId="sidebarActive"
            className="absolute inset-0 rounded-2xl bg-emerald-50"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className="relative z-10 flex flex-col items-center gap-1">
          <GearIcon className="h-5 w-5" />
          <span className="text-[10.5px] font-medium leading-none">Settings</span>
        </span>
      </button>

      <div className={`relative mt-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${AVATAR_BADGE_STYLE}`}>
        DS
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
      </div>
    </aside>
  )
}

function TopBarButton({ icon: Icon, label, onClick, primary, spinning, disabled }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, boxShadow: '0 6px 16px rgba(15,23,42,0.08)' }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
        primary
          ? 'bg-[#0B7A54] text-white hover:bg-[#05513F]'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      <motion.span
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
        className="flex"
      >
        <Icon className="h-4 w-4" />
      </motion.span>
      {label}
    </motion.button>
  )
}

function BackPill({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-50"
    >
      <ArrowLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </button>
  )
}

function DetailRow({ emoji, label, value, theme = 'emerald' }) {
  const t = STAT_THEMES[theme]
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border-l-4 bg-slate-50/60 p-2.5" style={{ borderLeftColor: t.wave }}>
      <span className="flex items-center gap-2.5 text-sm text-slate-500">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base ${t.badge}`}>{emoji}</span>
        {label}
      </span>
      <span className="text-base font-bold text-slate-800">{value}</span>
    </div>
  )
}

function PanelCard({ emoji, title, children }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-600 bg-white p-5 shadow-sm">
      <span className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-300" />
      <CardHeading emoji={emoji} title={title} />
      <div className="mt-3 grid grid-cols-2 gap-2.5">{children}</div>
    </div>
  )
}

function LoanInfoCard({ loan }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PanelCard emoji="📄" title="Loan Details">
        <DetailRow emoji="📄" label="Account Number" value={loan.loanAccount} theme="emerald" />
        <DetailRow emoji={TYPE_EMOJI[loan.loanType] ?? '💰'} label="Product" value={loan.loanType} theme="blue" />
        <DetailRow emoji="🏷️" label="Product Code" value={loan.productCode} theme="violet" />
        <DetailRow emoji="🗂️" label="Category" value={loan.category} theme="amber" />
        <DetailRow emoji="💶" label="Currency" value={loan.currency} theme="teal" />
        <DetailRow emoji="🏦" label="Branch" value={loan.branchCode} theme="orange" />
      </PanelCard>

      <PanelCard emoji="📅" title="Dates & Schedule">
        <DetailRow emoji="📅" label="Book Date" value={formatDate(loan.bookDate)} theme="emerald" />
        <DetailRow emoji="🗓️" label="Value Date" value={formatDate(loan.valueDate)} theme="blue" />
        <DetailRow emoji="🏁" label="Maturity Date" value={formatDate(loan.maturityDate)} theme="violet" />
        <DetailRow emoji="🔢" label="Total Installments" value={loan.termMonths} theme="amber" />
        <DetailRow emoji="🔁" label="Frequency" value={loan.frequency} theme="teal" />
        <DetailRow emoji="📈" label="Interest Rate" value={`${loan.interestRate.toFixed(4)}%`} theme="orange" />
      </PanelCard>
    </div>
  )
}

function CarScene() {
  return (
    <svg viewBox="0 0 200 320" fill="none" preserveAspectRatio="none" className="h-full w-full">
      <circle cx="35" cy="40" r="6" fill="rgba(255,255,255,0.18)" />
      <circle cx="165" cy="65" r="4" fill="rgba(255,255,255,0.14)" />

      <path
        d="M40,20 C10,60 60,90 30,140 C5,180 55,210 25,260 C5,290 40,300 60,320"
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <path
        d="M40,20 C10,60 60,90 30,140 C5,180 55,210 25,260 C5,290 40,300 60,320"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2"
        strokeDasharray="8 10"
        strokeLinecap="round"
      />

      <g transform="translate(28,150) rotate(-6)">
        <ellipse cx="0" cy="17" rx="26" ry="5" fill="rgba(0,0,0,0.15)" />
        <rect x="-22" y="-8" width="44" height="14" rx="6" fill="#ffffff" fillOpacity="0.92" />
        <rect x="-11" y="-17" width="22" height="10" rx="4" fill="#ffffff" fillOpacity="0.75" />
        <circle cx="-11" cy="7" r="6" fill="rgba(4,40,28,0.9)" />
        <circle cx="12" cy="7" r="6" fill="rgba(4,40,28,0.9)" />
      </g>
    </svg>
  )
}

function MortgageScene() {
  return (
    <svg viewBox="0 0 200 320" fill="none" preserveAspectRatio="none" className="h-full w-full">
      <circle cx="40" cy="35" r="5" fill="rgba(255,255,255,0.16)" />
      <circle cx="160" cy="55" r="4" fill="rgba(255,255,255,0.14)" />

      <path d="M-10,300 C60,285 140,295 210,280 L210,320 L-10,320 Z" fill="rgba(255,255,255,0.1)" />

      <g transform="translate(58,300)">
        <path d="M-19,4 L0,-17 L19,4 Z" fill="rgba(255,255,255,0.8)" />
        <rect x="-15" y="4" width="30" height="18" fill="rgba(255,255,255,0.6)" />
        <rect x="-4.5" y="10" width="9" height="12" fill="rgba(4,40,28,0.7)" />
        <rect x="7" y="-13" width="3" height="9" fill="rgba(4,40,28,0.7)" />
      </g>

      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={65 + i * 3} cy={280 - i * 18} r={4 + i} fill="rgba(255,255,255,0.35)" />
      ))}
    </svg>
  )
}

function PersonalLoanScene() {
  return (
    <svg viewBox="0 0 200 320" fill="none" preserveAspectRatio="none" className="h-full w-full">
      <circle cx="35" cy="45" r="5" fill="rgba(255,255,255,0.16)" />
      <circle cx="160" cy="70" r="4" fill="rgba(255,255,255,0.14)" />

      <g transform="translate(65,295)">
        <rect x="-36" y="-16" width="72" height="36" rx="7" fill="rgba(255,255,255,0.22)" />
        <rect x="-36" y="-16" width="72" height="11" rx="7" fill="rgba(255,255,255,0.38)" />
        <rect x="6" y="-2" width="20" height="13" rx="3" fill="rgba(255,255,255,0.9)" />
        <circle cx="16" cy="4.5" r="2.7" fill="rgba(4,40,28,0.8)" />
      </g>

      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={55 + i * 20} cy={270 - i * 24} r="7" fill="rgba(255,255,255,0.55)" />
          <text x={55 + i * 20} y={273.5 - i * 24} fontSize="8" textAnchor="middle" fill="rgba(4,40,28,0.6)">
            €
          </text>
        </g>
      ))}
    </svg>
  )
}

function BusinessScene() {
  return (
    <svg viewBox="0 0 200 320" fill="none" preserveAspectRatio="none" className="h-full w-full">
      <g fill="rgba(255,255,255,0.1)">
        <rect x="15" y="230" width="20" height="60" />
        <rect x="40" y="200" width="16" height="90" />
        <rect x="150" y="215" width="18" height="75" />
        <rect x="172" y="245" width="14" height="45" />
      </g>
    </svg>
  )
}

const CARD_SCENES = {
  'Car Loan': CarScene,
  Mortgage: MortgageScene,
  'Personal Loan': PersonalLoanScene,
  'Business Loan': BusinessScene,
}

function LoanCardPanel({ loan, emoji }) {
  const Scene = CARD_SCENES[loan.loanType] ?? CarScene
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
      className="relative w-full shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-5 text-white shadow-lg lg:w-72"
    >
      <div className="pointer-events-none absolute inset-0">
        <Scene />
      </div>

      <p className="relative mt-3 text-lg font-bold">{loan.loanType}</p>

      <div className="relative mt-5 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
          className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/15 text-3xl ring-2 ring-white/30"
        >
          {loan.loanType === 'Car Loan' ? <CarIcon className="h-8 w-8 text-white" /> : emoji}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 1.1, delay: 0.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      <div className="relative mt-5 text-center">
        <p className="text-xl font-bold tracking-wide">
          {loan.branchCode} {loan.loanAccount}
        </p>
        <p className="mt-1 text-xs text-emerald-100/80">
          CIF: {loan.customerId} · {loan.productCode}
        </p>
      </div>

      <div className="relative mt-3 flex flex-wrap justify-center gap-1.5">
        {[
          { emoji: '👤', text: `CIF: ${loan.customerId}` },
          { emoji, text: loan.loanType },
          { emoji: '💶', text: loan.currency },
          { emoji: '📈', text: `${loan.interestRate.toFixed(4)}%` },
        ].map(({ emoji: badgeEmoji, text }) => (
          <span
            key={text}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white"
          >
            <span className="text-xs leading-none">{badgeEmoji}</span>
            {text}
          </span>
        ))}
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-emerald-100/70">Status</p>
          <p className="flex items-center gap-1.5 font-semibold">
            {loan.status}
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse-soft ${loan.status === 'Overdue' ? 'bg-rose-400' : 'bg-emerald-300'}`} />
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-emerald-100/70">Accrual</p>
          <p className="font-semibold">{loan.accrualStatus}</p>
        </div>
      </div>

      <div className="relative mt-5 flex justify-end">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[10px]">
          📶
        </span>
      </div>
    </motion.div>
  )
}

function StatCard({ emoji, label, numericValue, format, sub, theme, index }) {
  const t = STAT_THEMES[theme]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 14px 28px rgba(15,23,42,0.12)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: index * 0.06 }}
      className={`relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm ${t.hoverBorder}`}
    >
      <div className={`pointer-events-none absolute inset-0 ${t.hoverFill}`} />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <motion.span
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.12, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: index * 0.06 + 0.15 }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${t.badge}`}
          >
            {emoji}
          </motion.span>
          <span className="text-sm text-slate-500">{label}</span>
        </div>
        <p className="mt-2.5 text-xl font-bold text-slate-900">
          <CountUp value={numericValue} format={format} />
        </p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </motion.div>
  )
}

const COMPONENT_THEMES = {
  blue: {
    border: 'border-blue-200',
    leftBorder: 'border-l-blue-600',
    pill: 'bg-blue-100 text-blue-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100',
  },
  emerald: {
    border: 'border-emerald-200',
    leftBorder: 'border-l-emerald-600',
    pill: 'bg-emerald-100 text-emerald-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100',
  },
  amber: {
    border: 'border-amber-200',
    leftBorder: 'border-l-amber-600',
    pill: 'bg-amber-100 text-amber-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-amber-50 hover:to-amber-100',
  },
  teal: {
    border: 'border-teal-200',
    leftBorder: 'border-l-teal-600',
    pill: 'bg-teal-100 text-teal-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100',
  },
  violet: {
    border: 'border-violet-200',
    leftBorder: 'border-l-violet-600',
    pill: 'bg-violet-100 text-violet-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-violet-50 hover:to-violet-100',
  },
  rose: {
    border: 'border-rose-200',
    leftBorder: 'border-l-rose-600',
    pill: 'bg-rose-100 text-rose-700',
    hoverFill: 'hover:bg-gradient-to-br hover:from-rose-50 hover:to-rose-100',
  },
}

function ComponentCard({ label, category, expected, outstanding, currency, theme, index = 0 }) {
  const t = COMPONENT_THEMES[theme]
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -3, scale: 1.02, boxShadow: '0 10px 24px rgba(15,23,42,0.08)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.06 }}
      className={`rounded-lg border-2 border-l-4 bg-white p-2.5 transition-colors duration-200 ${t.border} ${t.leftBorder} ${t.hoverFill}`}
    >
      <p className="truncate text-xs font-extrabold uppercase tracking-wide text-slate-900">{label}</p>
      <motion.span
        initial={{ opacity: 0, scale: 0, rotate: -12 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 320, damping: 14, delay: index * 0.06 + 0.15 }}
        className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${t.pill}`}
      >
        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 }}
          className="inline-block"
        >
          {category}
        </motion.span>
      </motion.span>

      <div className="mt-2 flex flex-col gap-0.5 border-t border-slate-100 pt-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Expected</span>
          <span className="font-bold text-slate-700">
            <CountUp value={expected} format={(v) => formatCurrency(v, currency)} />
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Outstanding</span>
          <span className="font-bold text-slate-700">
            <CountUp value={outstanding} format={(v) => formatCurrency(v, currency)} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-center">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-slate-800">{value}</p>
    </div>
  )
}

function formatCompactAmount(value) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`
  return `${Math.round(value)}`
}

function LoanProgressTrendCard({ loan }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const n = Math.max(loan.termMonths, 1)
  const w = 320
  const h = 150
  const padL = 40
  const padB = 18
  const chartW = w - padL - 4
  const chartH = h - padB

  const points = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const base = 1 - Math.pow(1 - t, 1.3)
    const zigzag = Math.sin(i * 1.7) * 0.05 + Math.sin(i * 3.1 + 1) * 0.025
    return Math.min(1, Math.max(0, base + zigzag))
  })
  const path = points.map((v, i) => `${padL + (i / n) * chartW},${chartH - v * chartH}`).join(' ')

  const maxValue = loan.originalAmount
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => maxValue * f)

  const start = new Date(loan.disbursementDate)
  const end = new Date(loan.maturityDate)
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => new Date(start.getTime() + (end.getTime() - start.getTime()) * f))
  const formatShortDate = (d) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(d)

  const totalDue = loan.originalAmount + loan.components.interest.expected

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * w
    const t = Math.min(1, Math.max(0, (relX - padL) / chartW))
    setHoverIndex(Math.round(t * n))
  }

  const hover =
    hoverIndex != null
      ? {
          x: padL + (hoverIndex / n) * chartW,
          y: chartH - points[hoverIndex] * chartH,
          value: maxValue * points[hoverIndex],
          date: new Date(start.getTime() + ((end.getTime() - start.getTime()) * hoverIndex) / n),
        }
      : null

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-600 bg-white p-5 shadow-sm">
      <CardHeading emoji="📈" title="Loan Progress" />
      <div className="relative mt-4 flex-1 overflow-hidden rounded-xl bg-white p-1">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-full w-full cursor-crosshair"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="loanProgressLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="loanProgressAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((val, i) => {
            const y = (i / (yTicks.length - 1)) * chartH
            return (
              <g key={val}>
                <line x1={padL} y1={y} x2={w} y2={y} stroke="#eef2f7" strokeWidth="1" />
                <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                  {formatCompactAmount(val)}
                </text>
              </g>
            )
          })}
          <motion.polygon
            points={`${padL},${chartH} ${path} ${padL + chartW},${chartH}`}
            fill="url(#loanProgressAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.polyline
            points={path}
            fill="none"
            stroke="url(#loanProgressLineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {xTicks.map((d, i) => {
            const x = padL + (i / (xTicks.length - 1)) * chartW
            return (
              <text key={i} x={x} y={h - 3} textAnchor="middle" fontSize="9" fill="#94a3b8">
                {formatShortDate(d)}
              </text>
            )
          })}
          {hover && (
            <>
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x1={hover.x}
                y1={0}
                x2={hover.x}
                y2={chartH}
                stroke="#2563eb"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                cx={hover.x}
                cy={hover.y}
                r="4.5"
                fill="#2563eb"
                stroke="#fff"
                strokeWidth="2"
              />
            </>
          )}
        </svg>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold whitespace-nowrap text-white shadow-lg"
            style={{
              left: `${(hover.x / w) * 100}%`,
              top: `${(hover.y / h) * 100}%`,
              transform: 'translate(-50%, -140%)',
            }}
          >
            {formatCurrency(hover.value, loan.currency)} · {formatShortDate(hover.date)}
          </motion.div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <MiniStat label="Amount Financed" value={formatCurrency(loan.originalAmount, loan.currency)} />
        <MiniStat label="Payment Due" value={formatCurrency(totalDue, loan.currency)} />
        <MiniStat label="Payment Disbursed" value={formatCurrency(loan.amountDisbursed, loan.currency)} />
      </div>
    </div>
  )
}

function BoldCardTitle({ emoji, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0B7A54] to-[#4D7A9E] text-base text-white">
        {emoji}
      </span>
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-800">{title}</h3>
    </div>
  )
}

function AmortizationRow({ emoji, label, value, color, index, onHover }) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ x: 4, scale: 1.02 }}
      onMouseEnter={() => {
        setIsHovered(true)
        onHover(color)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onHover(null)
      }}
      className="flex w-full cursor-default items-center justify-between gap-4 rounded-lg px-1.5 py-1 transition-colors duration-200"
      style={{ backgroundColor: isHovered ? `${color}14` : 'transparent' }}
    >
      <span className="flex items-center gap-3 text-sm text-slate-600">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base transition-colors duration-200"
          style={{ backgroundColor: isHovered ? `${color}22` : '#ecfdf5' }}
        >
          {emoji}
        </span>
        {label}
      </span>
      <span className="text-base font-bold transition-colors duration-200" style={{ color: isHovered ? color : '#1e293b' }}>
        {value}
      </span>
    </motion.div>
  )
}

function AmortizationContent({ loan }) {
  const [ringColor, setRingColor] = useState(null)
  const repaidPercent = loan.originalAmount === 0 ? 0 : (loan.principalPaid / loan.originalAmount) * 100
  const circumference = 2 * Math.PI * 46
  const emi = buildInstallments(loan)[0]?.amount ?? 0
  const rows = [
    { emoji: '👛', label: 'Principal', value: formatCurrency(loan.originalAmount, loan.currency), color: '#059669' },
    { emoji: '🧾', label: 'Fees', value: formatCurrency(loan.components.processingFee.outstanding, loan.currency), color: '#d97706' },
    { emoji: '📟', label: 'EMI', value: formatCurrency(emi, loan.currency), color: '#2563eb' },
    { emoji: '⚖️', label: 'Balance', value: formatCurrency(loan.components.principal.outstanding, loan.currency), color: '#7c3aed' },
  ]
  const activeColor = ringColor ?? '#059669'

  return (
    <div className="flex h-full flex-col">
      <BoldCardTitle emoji="🧮" title="Amortization Overview" />
      <div className="mt-5 flex w-full flex-1 items-center gap-8">
        <motion.div
          className="relative h-48 w-48 shrink-0"
          animate={{ scale: ringColor ? 1.06 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            animate={{ background: `radial-gradient(circle, ${activeColor}30 0%, transparent 70%)` }}
            transition={{ duration: 0.4 }}
          />
          <svg viewBox="0 0 104 104" className="relative h-full w-full -rotate-90">
            <circle cx="52" cy="52" r="46" stroke="#f1f5f9" strokeWidth="10" fill="none" />
            <motion.circle
              cx="52"
              cy="52"
              r="46"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - repaidPercent / 100), stroke: activeColor }}
              transition={{ strokeDashoffset: { duration: 0.9, ease: 'easeOut' }, stroke: { duration: 0.3 } }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              animate={{ color: activeColor }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-extrabold"
            >
              {repaidPercent.toFixed(0)}%
            </motion.span>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Amortization</span>
          </div>
        </motion.div>
        <div className="flex-1 space-y-4">
          {rows.map((r, index) => (
            <AmortizationRow key={r.label} emoji={r.emoji} label={r.label} value={r.value} color={r.color} index={index} onHover={setRingColor} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RepaymentStatusRow({ emoji, label, value, color, segmentKey, index, onHover }) {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ x: 4, scale: 1.02 }}
      onMouseEnter={() => {
        setIsHovered(true)
        onHover(segmentKey)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onHover(null)
      }}
      className="flex w-full cursor-default items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors duration-200"
      style={{ backgroundColor: isHovered ? `${color}14` : '#f8fafc' }}
    >
      <span className="flex items-center gap-3 text-sm text-slate-600">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors duration-200"
          style={{ backgroundColor: isHovered ? `${color}22` : `${color}18` }}
        >
          {emoji}
        </span>
        {label}
      </span>
      <span className="text-base font-bold transition-colors duration-200" style={{ color: isHovered ? color : '#1e293b' }}>
        {value}
      </span>
    </motion.div>
  )
}

function VerticalGauge({ paidPct, overduePct, upcomingPct, highlight }) {
  const dim = (key) => (highlight && highlight !== key ? 0.25 : 1)
  const badgeColor = highlight === 'overdue' ? '#d97706' : highlight === 'upcoming' ? '#2563eb' : '#059669'

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <motion.span
        animate={{ color: badgeColor }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1 text-xs font-bold"
      >
        📊 {Math.round(paidPct)}%
      </motion.span>
      <div className="flex items-end gap-2">
        <motion.div
          className="relative flex h-48 w-6 flex-col-reverse overflow-hidden rounded-full bg-slate-100"
          animate={{ scale: highlight ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: `${paidPct}%`,
              opacity: dim('paid'),
              boxShadow: highlight === 'paid' ? '0 0 10px 2px rgba(5,150,105,0.55)' : '0 0 0px 0px rgba(0,0,0,0)',
            }}
            transition={{ height: { duration: 0.8, ease: 'easeOut' }, opacity: { duration: 0.25 }, boxShadow: { duration: 0.25 } }}
            className="w-full bg-emerald-500"
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: `${overduePct}%`,
              opacity: dim('overdue'),
              boxShadow: highlight === 'overdue' ? '0 0 10px 2px rgba(217,119,6,0.55)' : '0 0 0px 0px rgba(0,0,0,0)',
            }}
            transition={{ height: { duration: 0.8, ease: 'easeOut', delay: 0.1 }, opacity: { duration: 0.25 }, boxShadow: { duration: 0.25 } }}
            className="w-full bg-amber-400"
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: `${upcomingPct}%`,
              opacity: dim('upcoming'),
              boxShadow: highlight === 'upcoming' ? '0 0 10px 2px rgba(37,99,235,0.55)' : '0 0 0px 0px rgba(0,0,0,0)',
            }}
            transition={{ height: { duration: 0.8, ease: 'easeOut', delay: 0.2 }, opacity: { duration: 0.25 }, boxShadow: { duration: 0.25 } }}
            className="w-full bg-blue-400"
          />
        </motion.div>
        <div className="flex h-48 flex-col justify-between text-[10px] font-medium text-slate-400">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
      </div>
    </div>
  )
}

function RepaymentStatusContent({ loan }) {
  const [highlight, setHighlight] = useState(null)
  const installments = classifyInstallments(loan)
  const total = installments.length || 1
  const paidCount = installments.filter((row) => row.status === 'paid').length
  const overdueCount = installments.filter((row) => row.status === 'overdue').length
  const upcomingCount = installments.filter((row) => row.status === 'upcoming').length
  const emi = buildInstallments(loan)[0]?.amount ?? 0
  const repaidPercent = loan.originalAmount === 0 ? 0 : (loan.principalPaid / loan.originalAmount) * 100

  const rows = [
    { emoji: '✓', label: 'Paid', value: paidCount, color: '#059669', segmentKey: 'paid' },
    { emoji: '⚠️', label: 'Overdue', value: overdueCount, color: '#d97706', segmentKey: 'overdue' },
    { emoji: '🕐', label: 'Upcoming', value: upcomingCount, color: '#2563eb', segmentKey: 'upcoming' },
    { emoji: '🏁', label: 'Matures', value: formatDate(loan.maturityDate), color: '#7c3aed', segmentKey: null },
  ]

  return (
    <div className="flex h-full flex-col">
      <BoldCardTitle emoji="📅" title="Repayment Status" />
      <div className="mt-5 flex w-full flex-1 items-center gap-6">
        <VerticalGauge
          paidPct={(paidCount / total) * 100}
          overduePct={(overdueCount / total) * 100}
          upcomingPct={(upcomingCount / total) * 100}
          highlight={highlight}
        />
        <div className="flex-1 space-y-2.5">
          {rows.map((r, index) => (
            <RepaymentStatusRow
              key={r.label}
              emoji={r.emoji}
              label={r.label}
              value={r.value}
              color={r.color}
              segmentKey={r.segmentKey}
              index={index}
              onHover={setHighlight}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="font-medium text-slate-500">EMI</span>
        <span className="font-bold text-slate-800">{formatCurrency(emi, loan.currency)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-500">Repayment</span>
        <span className="font-bold text-emerald-600">{repaidPercent.toFixed(0)}%</span>
      </div>
    </div>
  )
}

function LoanBreakdownCard({ loan }) {
  return (
    <div className="relative flex min-h-full flex-col rounded-2xl border border-emerald-600 bg-white shadow-sm sm:flex-row">
      <div className="flex-[3] p-5">
        <AmortizationContent loan={loan} />
      </div>
      <div className="hidden w-px shrink-0 bg-slate-100 sm:block" />
      <div className="flex-[2] p-5">
        <RepaymentStatusContent loan={loan} />
      </div>
    </div>
  )
}

const STATUS_META = {
  paid: { label: 'Paid', dot: 'bg-emerald-500', chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', icon: '✓' },
  overdue: { label: 'Overdue', dot: 'bg-rose-500', chipBg: 'bg-rose-50', chipText: 'text-rose-700', icon: '!' },
  upcoming: { label: 'Upcoming', dot: 'bg-slate-300', chipBg: 'bg-slate-100', chipText: 'text-slate-500', icon: '○' },
}

const TIMELINE_STAT_THEMES = {
  emerald: { badge: 'bg-emerald-100', text: 'text-emerald-700' },
  blue: { badge: 'bg-blue-100', text: 'text-blue-700' },
  rose: { badge: 'bg-rose-100', text: 'text-rose-700' },
  slate: { badge: 'bg-slate-100', text: 'text-slate-700' },
}

function buildInstallments(loan) {
  const rows = []
  const monthlyRate = loan.interestRate / 100 / 12
  const n = loan.termMonths
  const principalAmount = loan.originalAmount
  const payment =
    monthlyRate > 0 ? (principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n)) : principalAmount / n
  const startDate = new Date(loan.disbursementDate)

  for (let period = 1; period <= n; period++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + period)
    rows.push({ period, dueDate, amount: payment })
  }
  return rows
}

function classifyInstallments(loan) {
  const installments = buildInstallments(loan)
  const today = new Date()
  const elapsed = installments.filter((row) => row.dueDate <= today).length
  return installments.map((row, idx) => ({
    ...row,
    status: idx >= elapsed ? 'upcoming' : loan.status === 'Overdue' ? 'overdue' : 'paid',
  }))
}

function TimelineStat({ emoji, value, label, theme, index }) {
  const t = TIMELINE_STAT_THEMES[theme]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${t.badge}`}>{emoji}</span>
      <div>
        <p className={`text-lg font-bold ${t.text}`}>{value}</p>
        <p className="text-xs font-medium text-slate-400">{label}</p>
      </div>
    </motion.div>
  )
}

function TimelineStatCard({ emoji, value, label, solid, alert, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      className={`flex items-center gap-3 rounded-2xl border p-4 ${alert ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-white'}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white ${solid}`}>{emoji}</span>
      <div>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </motion.div>
  )
}

const EVENT_THEME = {
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-600' },
  rose: { dot: 'bg-rose-500', badge: 'bg-rose-500' },
  amber: { dot: 'bg-amber-500', badge: 'bg-amber-500' },
  violet: { dot: 'bg-violet-500', badge: 'bg-violet-500' },
}

function TimelineEvent({ icon, theme, date, title, description, amount, badge, currency, isLast, index }) {
  const t = EVENT_THEME[theme]
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex gap-4"
    >
      <div className="flex flex-col items-center">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.dot}`}>
          {icon}
        </span>
        {!isLast && <span className="w-0.5 flex-1 bg-slate-100" />}
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-100 pb-4">
        <div className="flex items-center justify-between bg-slate-50/70 px-4 py-2.5">
          <span className="text-sm font-bold text-slate-800">{formatDate(date.toISOString().slice(0, 10))}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${t.badge}`}>{badge}</span>
        </div>
        <div className="px-4 pt-3">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          {amount != null && <p className="mt-2 text-lg font-extrabold text-slate-900">{formatCurrency(amount, currency)}</p>}
        </div>
      </div>
    </motion.div>
  )
}

function YearGroup({ year, events, currency, index }) {
  const [open, setOpen] = useState(false)
  const upcoming = events.filter((e) => e.badge === 'Upcoming').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 bg-emerald-50/40 px-5 py-4 text-left transition-colors duration-200 hover:bg-emerald-50"
      >
        <span className="flex items-center gap-3">
          <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }} className="text-emerald-600">
            ▶
          </motion.span>
          <span className="text-xl font-extrabold text-emerald-700">{year}</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm">{events.length} events</span>
        </span>
        {upcoming > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
            ○ {upcoming}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-2">
              {events.map((e, i) => (
                <TimelineEvent key={e.key} {...e} currency={currency} isLast={i === events.length - 1} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TimelineTab({ loan }) {
  const installments = useMemo(() => classifyInstallments(loan), [loan])
  const n = installments.length
  const paidCount = installments.filter((row) => row.status === 'paid').length
  const overdueCount = installments.filter((row) => row.status === 'overdue').length
  const upcomingCount = installments.filter((row) => row.status === 'upcoming').length

  const start = new Date(loan.disbursementDate)
  const end = new Date(loan.maturityDate)
  const today = new Date()
  const totalSpan = end.getTime() - start.getTime()
  const progressPct = totalSpan > 0 ? Math.min(100, Math.max(0, ((today.getTime() - start.getTime()) / totalSpan) * 100)) : 0

  const events = useMemo(() => {
    const disbursement = {
      key: 'disbursement',
      date: new Date(loan.disbursementDate),
      icon: '💰',
      theme: 'emerald',
      title: 'Loan Disbursed',
      description: `Loan amount of ${formatCurrency(loan.originalAmount, loan.currency)} disbursed to customer`,
      amount: loan.originalAmount,
      badge: 'Disbursement',
    }
    const emiEvents = installments.map((inst) => {
      const statusLabel = inst.status === 'paid' ? 'Paid' : inst.status === 'overdue' ? 'Overdue' : 'Upcoming'
      return {
        key: `emi-${inst.period}`,
        date: inst.dueDate,
        icon: inst.status === 'paid' ? '✓' : inst.status === 'overdue' ? '⚠' : '○',
        theme: inst.status === 'paid' ? 'emerald' : inst.status === 'overdue' ? 'rose' : 'amber',
        title: `EMI #${inst.period} ${statusLabel === 'Upcoming' ? 'Due' : statusLabel}`,
        description: `EMI Amount: ${formatCurrency(inst.amount, loan.currency)}`,
        amount: inst.amount,
        badge: statusLabel,
      }
    })
    const maturity = {
      key: 'maturity',
      date: new Date(loan.maturityDate),
      icon: '🏁',
      theme: 'violet',
      title: 'Loan Maturity Date',
      description: 'Expected final payment and loan closure',
      badge: 'Maturity',
    }
    return [disbursement, ...emiEvents, maturity]
  }, [loan, installments])

  const yearGroups = useMemo(() => {
    const groups = new Map()
    events.forEach((e) => {
      const year = e.date.getFullYear()
      if (!groups.has(year)) groups.set(year, [])
      groups.get(year).push(e)
    })
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
  }, [events])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TimelineStatCard
          emoji="💰"
          value={formatCurrency(loan.amountDisbursed, loan.currency)}
          label="Disbursed"
          solid="bg-emerald-500"
          index={0}
        />
        <TimelineStatCard emoji="✓" value={`${paidCount} / ${n}`} label="EMIs Paid" solid="bg-emerald-600" index={1} />
        <TimelineStatCard emoji="⚠" value={overdueCount} label="Overdue" solid="bg-rose-500" alert index={2} />
        <TimelineStatCard emoji="○" value={upcomingCount} label="Upcoming" solid="bg-amber-500" index={3} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 lg:w-72 lg:shrink-0">
          <h3 className="text-base font-extrabold text-slate-800">Loan Journey</h3>

          <div className="mt-5 flex flex-1 gap-5">
            <div className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">{formatDate(loan.maturityDate)}</span>
              <div className="relative flex w-3 flex-1 flex-col-reverse overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${progressPct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="w-full rounded-full bg-slate-800"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-white"
                  style={{ bottom: `${progressPct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">{formatDate(loan.disbursementDate)}</span>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-4">
              <span className="inline-block w-fit whitespace-nowrap rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500">
                Today · {progressPct.toFixed(0)}%
              </span>
              <div className="flex flex-col gap-2">
                {['paid', 'overdue', 'upcoming'].map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                    {STATUS_META[s].label} ({s === 'paid' ? paidCount : s === 'overdue' ? overdueCount : upcomingCount})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {yearGroups.map(([year, events], index) => (
            <YearGroup key={year} year={year} events={events} currency={loan.currency} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function OverdueTab({ loan }) {
  const installments = useMemo(() => classifyInstallments(loan), [loan])
  const overdueRows = installments.filter((row) => row.status === 'overdue')
  const hasOverdue = loan.totalOverdue > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 space-y-4"
    >
      <div className="flex justify-end">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-rose-300 bg-rose-50 px-6 py-4">
          <span className="flex h-11 w-11 items-center justify-center text-3xl">⚠️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total Overdue Amount</p>
            <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(loan.totalOverdue, loan.currency)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        {hasOverdue ? (
          <div className="space-y-2.5">
            {overdueRows.slice(0, 10).map((row) => (
              <motion.div
                key={row.period}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">⚠</span>
                  <span className="text-sm font-semibold text-slate-700">Payment {row.period}</span>
                  <span className="text-xs text-slate-400">{formatDate(row.dueDate.toISOString().slice(0, 10))}</span>
                </span>
                <span className="text-sm font-bold text-rose-600">{formatCurrency(row.amount, loan.currency)}</span>
              </motion.div>
            ))}
            {overdueRows.length > 10 && (
              <p className="pt-1 text-center text-xs font-medium text-slate-400">+{overdueRows.length - 10} more overdue installments</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600"
            >
              ✓
            </motion.span>
            <p className="text-lg font-bold text-slate-800">No Overdue Amounts</p>
            <p className="text-sm text-slate-400">All payments are up to date!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ChargeStat({ emoji, label, value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-lg text-white">{emoji}</span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </motion.div>
  )
}

function ChargeTh({ children, align = 'left' }) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      className={`whitespace-nowrap border-b border-slate-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 ${alignClass}`}
    >
      {children}
    </th>
  )
}

function buildChargeComponents(loan) {
  const n = loan.termMonths
  const startDate = new Date(loan.disbursementDate)

  const buildSchedule = (total) =>
    Array.from({ length: n }, (_, i) => {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i + 1)
      return {
        no: i + 1,
        dueDate: dueDate.toISOString().slice(0, 10),
        amountDue: total / n,
        amountSettled: 0,
        accrued: 0,
      }
    })

  const utilizationFeeTotal = loan.components.principal.outstanding * 0.005

  return [
    {
      code: 'PROCESSINGFEE',
      total: loan.components.processingFee.expected,
      settled: loan.components.processingFee.expected - loan.components.processingFee.outstanding,
      schedule: buildSchedule(loan.components.processingFee.expected),
    },
    {
      code: 'UTILIZATIONFEE',
      total: utilizationFeeTotal,
      settled: 0,
      schedule: buildSchedule(utilizationFeeTotal),
    },
  ].filter((c) => c.total > 0)
}

function ChargesTab({ loan }) {
  const components = useMemo(() => buildChargeComponents(loan), [loan])
  const [expanded, setExpanded] = useState(null)
  const totalDue = components.reduce((sum, c) => sum + c.total, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 space-y-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ChargeStat emoji="💳" label="Total Charge Components" value={components.length} index={0} />
        <ChargeStat emoji="📄" label="Components With Schedules" value={components.filter((c) => c.schedule.length > 0).length} index={1} />
        <ChargeStat emoji="💰" label="Total Amount Due" value={formatCurrency(totalDue, loan.currency)} index={2} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <CardHeading emoji="💳" title="Charge Components" />
          <span className="text-xs italic text-slate-400">Click on a row to view schedule details</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <ChargeTh>Component</ChargeTh>
                <ChargeTh>Type</ChargeTh>
                <ChargeTh>Currency</ChargeTh>
                <ChargeTh>Effective Date</ChargeTh>
                <ChargeTh align="right">Amount Due</ChargeTh>
                <ChargeTh align="right">Amount Settled</ChargeTh>
                <ChargeTh align="right">Accrued</ChargeTh>
                <ChargeTh align="center">Schedules</ChargeTh>
                <ChargeTh align="center">Capitalized</ChargeTh>
                <ChargeTh align="center">Deferred</ChargeTh>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => {
                const isOpen = expanded === c.code
                return (
                  <Fragment key={c.code}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : c.code)}
                      className="cursor-pointer border-l-4 border-l-emerald-500 bg-emerald-50/40 transition-colors duration-150 hover:bg-emerald-50"
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }} className="text-emerald-600">
                            ▾
                          </motion.span>
                          <span>
                            <p className="text-sm font-extrabold text-slate-800">{c.code}</p>
                            <p className="text-[10px] text-slate-400">{c.code}</p>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">CHARGE</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{loan.currency}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">-</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-600">{formatCurrency(c.total, loan.currency)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">{formatCurrency(c.settled, loan.currency)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(0, loan.currency)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{c.schedule.length}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-400">No</td>
                      <td className="px-4 py-3 text-center text-xs text-slate-400">No</td>
                    </tr>
                    <AnimatePresence>
                      {isOpen && (
                        <tr>
                          <td colSpan={10} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              className="overflow-hidden bg-slate-50/60 px-4 pb-4"
                            >
                              <div className="mt-3">
                                <CardHeading emoji="📄" title={`Schedule Details for ${c.code}`} />
                              </div>
                              <table className="mt-2 w-full border-separate border-spacing-0 text-left">
                                <thead>
                                  <tr>
                                    <ChargeTh>#</ChargeTh>
                                    <ChargeTh>Start Date</ChargeTh>
                                    <ChargeTh>Due Date</ChargeTh>
                                    <ChargeTh align="right">Amount Due</ChargeTh>
                                    <ChargeTh align="right">Amount Settled</ChargeTh>
                                    <ChargeTh align="right">Accrued Amount</ChargeTh>
                                    <ChargeTh align="center">Formula</ChargeTh>
                                    <ChargeTh align="center">Process #</ChargeTh>
                                  </tr>
                                </thead>
                                <tbody>
                                  {c.schedule.map((s) => (
                                    <tr key={s.no} className="odd:bg-rose-50/30">
                                      <td className="px-4 py-2 text-sm text-slate-500">{s.no}</td>
                                      <td className="px-4 py-2 text-sm text-slate-400">-</td>
                                      <td className="px-4 py-2 text-sm font-semibold text-slate-700">{formatDate(s.dueDate)}</td>
                                      <td className="px-4 py-2 text-right text-sm font-bold text-rose-600">{formatCurrency(s.amountDue, loan.currency)}</td>
                                      <td className="px-4 py-2 text-right text-sm text-emerald-600">{formatCurrency(s.amountSettled, loan.currency)}</td>
                                      <td className="px-4 py-2 text-right text-sm text-slate-600">{formatCurrency(s.accrued, loan.currency)}</td>
                                      <td className="px-4 py-2 text-center text-sm text-slate-300">-</td>
                                      <td className="px-4 py-2 text-center text-sm text-slate-300">-</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

const COLLATERAL_CATALOG = [
  { id: 'COL-1042', description: 'Residential Property', lendableValue: 220000, icon: '🏠' },
  { id: 'COL-2078', description: 'Vehicle - Sedan', lendableValue: 28000, icon: '🚗' },
  { id: 'COL-3391', description: 'Fixed Deposit', lendableValue: 60000, icon: '💰' },
  { id: 'COL-4520', description: 'Commercial Equipment', lendableValue: 45000, icon: '🏭' },
]

function CollateralTab({ loan }) {
  const [linked, setLinked] = useState(() => {
    const item = COLLATERAL_CATALOG[0]
    const linkedValue = Math.min(item.lendableValue, loan.originalAmount)
    return [{ id: item.id, description: item.description, icon: item.icon, linkedValue, percent: (linkedValue / item.lendableValue) * 100 }]
  })

  const securedValue = linked.reduce((sum, c) => sum + c.linkedValue, 0)
  const coverage = loan.originalAmount > 0 ? Math.min(100, (securedValue / loan.originalAmount) * 100) : 0

  const handleUnlink = (index) => {
    setLinked((cur) => cur.filter((_, i) => i !== index))
  }

  const stats = [
    { label: 'Secured Value', value: formatCurrency(securedValue, loan.currency) },
    { label: 'Loan Amount', value: formatCurrency(loan.originalAmount, loan.currency) },
    { label: 'Coverage', value: `${coverage.toFixed(0)}%` },
    { label: 'Utilized', value: formatCurrency(0, loan.currency) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 space-y-4"
    >
      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div>
          <CardHeading emoji="🛡️" title="Collateral" />
          <p className="mt-1 pl-9 text-xs text-slate-400">Collateral linked to this contract</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.06, ease: 'easeOut' }}
              className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {linked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="flex flex-col gap-2 pt-4">
                <AnimatePresence initial={false}>
                  {linked.map((c, i) => (
                    <motion.div
                      key={`${c.id}-${i}`}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -12, transition: { duration: 0.2 } }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26, delay: i * 0.06 }}
                      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B7A54] text-lg text-white">
                        {c.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                          {c.id} · {c.description}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Linked {formatCurrency(c.linkedValue, loan.currency)} · {c.percent.toFixed(2)}% of lendable
                        </p>
                      </div>
                      <span className="shrink-0 text-lg text-[#0B7A54]">✓</span>
                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUnlink(i)}
                        className="shrink-0 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                      >
                        De-collateralize
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ApplicantsTab({ loan }) {
  const allocatedPercent = 0
  const remainingPercent = 100 - allocatedPercent
  const applicantCount = 0

  const stats = [
    { label: 'Allocated', value: `${allocatedPercent.toFixed(2)}%`, accent: true },
    { label: 'Remaining', value: `${remainingPercent.toFixed(2)}%` },
    { label: 'Applicants', value: String(applicantCount) },
    { label: 'Principal', value: formatCurrency(loan.originalAmount, loan.currency) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 rounded-2xl border border-slate-100 bg-white p-5"
    >
      <div>
        <CardHeading emoji="👥" title="Applicant Allocation" />
        <p className="mt-1 pl-9 text-xs text-slate-400">Assign the loan principal across borrowers and guarantors.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className={`mt-1 text-lg font-extrabold ${stat.accent ? 'text-blue-600' : 'text-slate-800'}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${allocatedPercent}%` }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-blue-500"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{remainingPercent.toFixed(2)}% still to allocate</span>
        <span>Target 100%</span>
      </div>
    </motion.div>
  )
}

function RateHistoryTab({ loan }) {
  const rows = [{ effectiveDate: loan.disbursementDate, type: 'Initial', change: 0, spread: null, effectiveRate: loan.interestRate }]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-4 rounded-2xl border border-slate-100 bg-white p-5"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <CardHeading emoji="📈" title="Interest Rate History" />
        <span className="text-xs font-medium text-slate-400">
          {rows.length} rate {rows.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <ChargeTh>Effective Date</ChargeTh>
              <ChargeTh>Rate</ChargeTh>
              <ChargeTh align="right">Spread</ChargeTh>
              <ChargeTh align="right">Effective Rate</ChargeTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <td className="border-b border-slate-50 px-4 py-3 text-sm font-bold text-slate-800">{formatDate(r.effectiveDate)}</td>
                <td className="border-b border-slate-50 px-4 py-3">
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {r.type}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {r.change >= 0 ? '+' : ''}
                    {r.change.toFixed(4)}%
                  </p>
                </td>
                <td className="border-b border-slate-50 px-4 py-3 text-right text-sm text-slate-400">
                  {r.spread == null ? '—' : `${r.spread.toFixed(4)}%`}
                </td>
                <td className="border-b border-slate-50 px-4 py-3 text-right text-base font-extrabold text-emerald-700">
                  {r.effectiveRate.toFixed(4)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default function LoanDetailView({ loan, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showStatement, setShowStatement] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setRefreshKey((k) => k + 1)
    }, 2000)
  }

  const totalOutstanding = getTotalOutstanding(loan)
  const emoji = TYPE_EMOJI[loan.loanType] ?? '💰'
  const activeTabMeta = ALL_TABS.find((t) => t.key === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex overflow-y-auto bg-gradient-to-b from-white via-slate-50 to-slate-100"
    >
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
            className="fixed inset-x-0 top-0 z-[70] h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-[#4D7A9E]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: 1, ease: 'easeInOut' }}
            className="pointer-events-none fixed inset-y-0 z-[65] w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          />
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />

      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: isRefreshing ? 0.4 : 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
        className="flex-1 px-4 py-4 sm:px-6 sm:py-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-baseline gap-2 text-2xl font-extrabold text-[#05513F] sm:text-3xl">
            Loans 360
            <span className="text-slate-300">·</span>
            <span className="text-xl font-medium text-slate-500 sm:text-2xl">{loan.loanAccount}</span>
          </h1>
          <div className="flex items-center gap-2">
            <TopBarButton
              icon={RefreshIcon}
              label={isRefreshing ? 'Refreshing…' : 'Refresh'}
              primary
              spinning={isRefreshing}
              disabled={isRefreshing}
              onClick={handleRefresh}
            />
            <TopBarButton icon={DocumentIcon} label="Statement" onClick={() => setShowStatement(true)} />
            <TopBarButton icon={BarChartIcon} label="Reschedule" />
            <motion.button
              type="button"
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(15,23,42,0.08)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <DotsVerticalIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <BackPill label="Back to Search" onClick={onClose} />
          <BackPill label="Back to Customer360" onClick={onClose} />
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row">
          <LoanCardPanel loan={loan} emoji={emoji} />
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
            <LoanProgressTrendCard loan={loan} />
            <div className="lg:col-span-2">
              <LoanBreakdownCard loan={loan} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard index={0} emoji="💰" theme="emerald" label="Amount Financed" numericValue={loan.originalAmount} format={(v) => formatCurrency(v, loan.currency)} />
          <StatCard index={1} emoji="📊" theme="blue" label="Principal Outstanding" numericValue={loan.components.principal.outstanding} format={(v) => formatCurrency(v, loan.currency)} />
          <StatCard index={2} emoji="💳" theme="violet" label="Total Outstanding" numericValue={totalOutstanding} format={(v) => formatCurrency(v, loan.currency)} />
          <StatCard index={3} emoji="📅" theme="amber" label="Disbursement Date" numericValue={0} format={() => formatDate(loan.disbursementDate)} />
          <StatCard index={4} emoji="📈" theme="teal" label="Interest Rate" numericValue={loan.interestRate} format={(v) => `${v.toFixed(4)}%`} />
          <StatCard index={5} emoji="⚠️" theme="orange" label="Total Overdue" numericValue={loan.totalOverdue} format={(v) => formatCurrency(v, loan.currency)} />
        </div>

        <div className="mt-4 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium ${
                  active ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="tabActive"
                    className="absolute inset-0 rounded-xl bg-emerald-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' ? (
          <>
            <LoanInfoCard loan={loan} />

            <div className="mt-4">
              <div className="mb-3">
                <CardHeading emoji="🧾" title="Component-wise Outstanding" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <ComponentCard
                  index={0}
                  label="Principal"
                  category="Principal"
                  theme="blue"
                  currency={loan.currency}
                  expected={loan.components.principal.expected}
                  outstanding={loan.components.principal.outstanding}
                />
                <ComponentCard
                  index={1}
                  label="Interest"
                  category="Interest"
                  theme="emerald"
                  currency={loan.currency}
                  expected={loan.components.interest.expected}
                  outstanding={loan.components.interest.outstanding}
                />
                <ComponentCard
                  index={2}
                  label="Processing Fee"
                  category="Fee"
                  theme="amber"
                  currency={loan.currency}
                  expected={loan.components.processingFee.expected}
                  outstanding={loan.components.processingFee.outstanding}
                />
                <ComponentCard
                  index={3}
                  label="Utilization Fee"
                  category="Fee"
                  theme="teal"
                  currency={loan.currency}
                  expected={loan.components.principal.outstanding * 0.005}
                  outstanding={loan.components.principal.outstanding * 0.005}
                />
                <ComponentCard
                  index={4}
                  label="Interest Tax"
                  category="Tax"
                  theme="violet"
                  currency={loan.currency}
                  expected={loan.components.interest.expected * 0.04}
                  outstanding={loan.components.interest.outstanding * 0.04}
                />
                <ComponentCard
                  index={5}
                  label="Overdue Tax"
                  category="Tax"
                  theme="rose"
                  currency={loan.currency}
                  expected={loan.totalOverdue * 0.04}
                  outstanding={loan.totalOverdue * 0.04}
                />
              </div>
            </div>
          </>
        ) : activeTab === 'timeline' ? (
          <TimelineTab loan={loan} />
        ) : activeTab === 'schedules' ? (
          <SchedulesTab loan={loan} />
        ) : activeTab === 'overdue' ? (
          <OverdueTab loan={loan} />
        ) : activeTab === 'charges' ? (
          <ChargesTab loan={loan} />
        ) : activeTab === 'collateral' ? (
          <CollateralTab loan={loan} />
        ) : activeTab === 'applicants' ? (
          <ApplicantsTab loan={loan} />
        ) : activeTab === 'rateHistory' ? (
          <RateHistoryTab loan={loan} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white py-16 text-center text-slate-400"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"
            >
              {activeTabMeta && <activeTabMeta.icon className="h-10 w-10" />}
            </motion.span>
            <div>
              <p className="text-lg font-semibold text-slate-600">Nothing here yet</p>
              <p className="text-sm">The {activeTabMeta?.label ?? 'Settings'} tab isn't wired up in this demo.</p>
            </div>
          </motion.div>
        )}

        <div className="h-20" />
      </motion.div>

      <div className="fixed bottom-6 right-6 z-10">
        <motion.span
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 rounded-full border border-emerald-400"
        />
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
          whileHover={{ scale: 1.04, boxShadow: '0 10px 30px rgba(5,81,63,0.45)' }}
          whileTap={{ scale: 0.96 }}
          className="relative flex items-center gap-2 rounded-full bg-[#0B7A54] px-5 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(5,81,63,0.35)] transition-colors duration-200 hover:bg-[#05513F]"
        >
          <CopyIcon className="h-4 w-4" />
          Copy to new
        </motion.button>
      </div>

      <AnimatePresence>
        {showStatement && <LoanStatementModal loan={loan} onClose={() => setShowStatement(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
