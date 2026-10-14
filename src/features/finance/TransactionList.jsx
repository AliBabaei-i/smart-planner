import React, { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiSearch, FiFilter, FiX, FiTrendingUp,
  FiTrendingDown, FiRepeat, FiInbox
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import TransactionItem from './TransactionItem'
import { TRANSACTION_TYPES } from './financeSlice'

const TransactionList = memo(({
  transactions = [],
  accounts = [],
  onEdit = null,
  isCompact = false,
  showFilters: initialShowFilters = false
}) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  const [showFilters, setShowFilters] = useState(initialShowFilters)

  // âœ… Map Ø­Ø³Ø§Ø¨â€ŒÙ‡Ø§ Ø¨Ø±Ø§ÛŒ Ø³Ø±ÛŒØ¹â€ŒØªØ± Ø´Ø¯Ù†
  const accountsMap = useMemo(() => {
    const map = new Map()
    accounts.forEach(a => map.set(a.id, a))
    return map
  }, [accounts])

  // âœ… ÙÛŒÙ„ØªØ± + Ù…Ø±ØªØ¨â€ŒØ³Ø§Ø²ÛŒ
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    // Ø¬Ø³ØªØ¬Ùˆ
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(t =>
        t.description?.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term) ||
        t.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // ÙÛŒÙ„ØªØ± Ù†ÙˆØ¹
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType)
    }

    // ÙÛŒÙ„ØªØ± Ø­Ø³Ø§Ø¨
    if (filterAccount !== 'all') {
      result = result.filter(t =>
        t.accountId === filterAccount || t.toAccountId === filterAccount
      )
    }

    // Ù…Ø±ØªØ¨â€ŒØ³Ø§Ø²ÛŒ: Ø¬Ø¯ÛŒØ¯ØªØ±ÛŒÙ† Ø§ÙˆÙ„
    result.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date)
      if (dateCompare !== 0) return dateCompare
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    return result
  }, [transactions, searchTerm, filterType, filterAccount])

  // âœ… Ú¯Ø±ÙˆÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø± Ø§Ø³Ø§Ø³ ØªØ§Ø±ÛŒØ® (ÙÙ‚Ø· Ø¯Ø± Ø­Ø§Ù„Øª ØºÛŒØ± compact)
  const groupedByDate = useMemo(() => {
    if (isCompact) return null
    const groups = {}
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date].push(t)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredTransactions, isCompact])

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterAccount !== 'all'

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterType('all')
    setFilterAccount('all')
  }, [])

  // âœ… Ø­Ø§Ù„Øª compact (Ø¨Ø¯ÙˆÙ† ÙÛŒÙ„ØªØ±ØŒ Ø³Ø§Ø¯Ù‡)
  if (isCompact) {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          <FiInbox size={28} className="mx-auto mb-2 opacity-40" />
          <p>{isPersian ? 'ØªØ±Ø§Ú©Ù†Ø´ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯' : 'No transactions'}</p>
        </div>
      )
    }
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {transactions.map(t => (
          <TransactionItem
            key={t.id}
            transaction={t}
            account={accountsMap.get(t.accountId)}
            toAccount={accountsMap.get(t.toAccountId)}
            onEdit={onEdit}
            isCompact
          />
        ))}
      </div>
    )
  }

  // âœ… Ø­Ø§Ù„Øª Ú©Ø§Ù…Ù„
  return (
    <div className="space-y-4">

      {/* ÙÛŒÙ„ØªØ±Ù‡Ø§ */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiSearch size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder={isPersian ? 'Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± ØªØ±Ø§Ú©Ù†Ø´â€ŒÙ‡Ø§...' : 'Search transactions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-9"
            />
          </div>

          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`
              px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm
              ${showFilters || hasActiveFilters
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <FiFilter size={14} />
            <span>{isPersian ? 'ÙÛŒÙ„ØªØ±' : 'Filter'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isPersian ? 'Ù¾Ø§Ú© Ú©Ø±Ø¯Ù† ÙÛŒÙ„ØªØ±Ù‡Ø§' : 'Clear filters'}
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* ÙÛŒÙ„ØªØ±Ù‡Ø§ÛŒ Ù¾ÛŒØ´Ø±ÙØªÙ‡ */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            {/* Ù†ÙˆØ¹ */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {isPersian ? 'Ù†ÙˆØ¹ ØªØ±Ø§Ú©Ù†Ø´' : 'Transaction Type'}
              </label>
              <div className="flex gap-1">
                {[{ id: 'all', label: isPersian ? 'Ù‡Ù…Ù‡' : 'All', Icon: null },
                  ...Object.values(TRANSACTION_TYPES).map(t => ({
                    id: t.id,
                    label: isPersian ? t.label : t.id,
                    Icon: t.id === 'income' ? FiTrendingUp 
                        : t.id === 'expense' ? FiTrendingDown 
                        : FiRepeat
                  }))
                ].map(opt => {
                  const isActive = filterType === opt.id
                  const Icon = opt.Icon
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFilterType(opt.id)}
                      className={`
                        flex-1 py-1.5 px-2 rounded-md text-xs transition-colors
                        flex items-center justify-center gap-1
                        ${isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {Icon && <Icon size={10} />}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Ø­Ø³Ø§Ø¨ */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {isPersian ? 'Ø­Ø³Ø§Ø¨' : 'Account'}
              </label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{isPersian ? 'Ù‡Ù…Ù‡ Ø­Ø³Ø§Ø¨â€ŒÙ‡Ø§' : 'All accounts'}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡ */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredTransactions.length} {isPersian ? 'ØªØ±Ø§Ú©Ù†Ø´' : 'transactions'}
        </div>
      </div>

      {/* Ù„ÛŒØ³Øª */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <FiInbox size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {transactions.length === 0
              ? (isPersian ? 'Ù‡Ù†ÙˆØ² ØªØ±Ø§Ú©Ù†Ø´ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡' : 'No transactions yet')
              : (isPersian ? 'ØªØ±Ø§Ú©Ù†Ø´ÛŒ Ø¨Ø§ Ø§ÛŒÙ† ÙÛŒÙ„ØªØ±Ù‡Ø§ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯' : 'No transactions match filters')}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-emerald-600 hover:text-emerald-700 text-xs font-medium"
            >
              {isPersian ? 'Ù¾Ø§Ú© Ú©Ø±Ø¯Ù† ÙÛŒÙ„ØªØ±Ù‡Ø§' : 'Clear filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate ? (
            // Ú¯Ø±ÙˆÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø± Ø§Ø³Ø§Ø³ ØªØ§Ø±ÛŒØ®
            groupedByDate.map(([date, txs]) => (
              <div key={date}>
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 py-2 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  {date}
                </div>
                <div className="space-y-2">
                  {txs.map(t => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      account={accountsMap.get(t.accountId)}
                      toAccount={accountsMap.get(t.toAccountId)}
                      onEdit={onEdit}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Ù„ÛŒØ³Øª Ø³Ø§Ø¯Ù‡
            <div className="space-y-2">
              {filteredTransactions.map(t => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  account={accountsMap.get(t.accountId)}
                  toAccount={accountsMap.get(t.toAccountId)}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

TransactionList.displayName = 'TransactionList'

export default TransactionList
