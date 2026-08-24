import { useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import ResultsList from './components/ResultsList'
import EmptyState from './components/EmptyState'
import LoanDetailView from './components/LoanDetailView'
import { searchLoans } from './mockData'

const EMPTY_FIELDS = { customerId: '', branchCode: '', loanAccount: '' }

function App() {
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [searchMode, setSearchMode] = useState('loanAccount')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)

  const handleFieldChange = (name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const hasAnyField = fields.branchCode.trim() !== '' || fields[searchMode].trim() !== ''

  const handleSearch = () => {
    if (!hasAnyField) return
    setLoading(true)
    setTimeout(() => {
      setResults(
        searchLoans({
          branchCode: fields.branchCode,
          customerId: searchMode === 'customerId' ? fields.customerId : '',
          loanAccount: searchMode === 'loanAccount' ? fields.loanAccount : '',
        }),
      )
      setHasSearched(true)
      setLoading(false)
    }, 500)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <Header />
          <SearchPanel
            fields={fields}
            searchMode={searchMode}
            onFieldChange={handleFieldChange}
            onModeChange={setSearchMode}
            onSearch={handleSearch}
            loading={loading}
            disabled={!hasAnyField}
          />

          <AnimatePresence mode="wait">
            {!hasSearched && !loading ? (
              <EmptyState key="empty" />
            ) : (
              <ResultsList
                key="results"
                results={results}
                loading={loading}
                hasSearched={hasSearched}
                onSelect={setSelectedLoan}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedLoan && <LoanDetailView loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

export default App
