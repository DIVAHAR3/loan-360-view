import { motion, AnimatePresence } from 'framer-motion'
import { BankIcon, PersonIcon, LockIcon, IdCardIcon } from './Icons'

function FieldCard({ label, name, value, onChange, icon: Icon, trailingIcon: TrailingIcon }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-semibold text-slate-700">{label}</span>
      </div>

      <div className="p-4">
        <div className="relative">
          <motion.input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            whileFocus={{ scale: 1.015 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-slate-800 outline-none transition-shadow duration-200 ease-out focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
          />
          {TrailingIcon && (
            <TrailingIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
          )}
        </div>
      </div>
    </div>
  )
}

function ModeTab({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left transition-colors duration-200 ${
        active
          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm'
          : 'text-slate-600 hover:bg-emerald-50'
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          active ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-semibold">{label}</span>
    </button>
  )
}

const identifierFieldVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
}

export default function SearchPanel({ fields, searchMode, onFieldChange, onModeChange, onSearch, loading, disabled }) {
  const handleChange = (e) => onFieldChange(e.target.name, e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
      className="rounded-2xl bg-white p-5 sm:p-6 shadow-md shadow-emerald-900/5 ring-1 ring-emerald-100"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-emerald-200 bg-white p-3 sm:w-56">
          <ModeTab
            label="Loan Account"
            icon={BankIcon}
            active={searchMode === 'loanAccount'}
            onClick={() => onModeChange('loanAccount')}
          />
          <ModeTab
            label="Customer ID"
            icon={PersonIcon}
            active={searchMode === 'customerId'}
            onClick={() => onModeChange('customerId')}
          />
        </div>

        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FieldCard
              label="Branch Code"
              name="branchCode"
              value={fields.branchCode}
              onChange={handleChange}
              icon={BankIcon}
              trailingIcon={LockIcon}
            />
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              {searchMode === 'loanAccount' ? (
                <motion.div
                  key="loanAccount"
                  variants={identifierFieldVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <FieldCard
                    label="Loan Account"
                    name="loanAccount"
                    value={fields.loanAccount}
                    onChange={handleChange}
                    icon={BankIcon}
                    trailingIcon={BankIcon}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="customerId"
                  variants={identifierFieldVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <FieldCard
                    label="Customer ID"
                    name="customerId"
                    value={fields.customerId}
                    onChange={handleChange}
                    icon={PersonIcon}
                    trailingIcon={IdCardIcon}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center sm:justify-end">
        <motion.button
          type="submit"
          disabled={loading || disabled}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#0B7A54] px-6 py-2.5 font-semibold text-white shadow-sm transition-colors duration-200 ease-out hover:bg-[#05513F] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Searching…' : 'Search'}
        </motion.button>
      </div>
    </motion.form>
  )
}
