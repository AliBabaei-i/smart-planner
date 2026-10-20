import React, { useState, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSearch, FiFilter, FiX, FiTrendingUp, FiTrendingDown, FiRepeat, FiInbox, FiPlus } from 'react-icons/fi'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import TransactionItem from './TransactionItem'
import EmptyState from '../../components/common/EmptyState'
import { TRANSACTION_TYPES } from './financeSlice'
import type { Transaction, Account } from '../../types/finance'

interface TransactionListProps {
  transactions?: Transaction[]
  accounts?: Account[]
  onEdit?: ((tx: Transaction) => void) | null
  onAdd?: (() => void) | null
  isCompact?: boolean
  showFilters?: boolean
}

const TransactionList = memo(({
  transactions = [],
  accounts = [],
  onEdit = null,
  onAdd = null,
  isCompact = false,
  showFilters: initialShowFilters = false
}: TransactionListProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  const [showFilters, setShowFilters] = useState(initialShowFilters)

  const accountsMap = useMemo(() => {
    const map = new Map<string, Account>()
    accounts.forEach(a => map.set(a.id, a))
    return map
  }, [accounts])

  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(tx =>
        tx.description?.toLowerCase().includes(term) ||
        tx.category?.toLowerCase().includes(term) ||
        tx.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType)
    }

    if (filterAccount !== 'all') {
      result = result.filter(tx => tx.accountId === filterAccount || tx.toAccountId === filterAccount)
    }

    result.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    return result
  }, [transactions, searchTerm, filterType, filterAccount])

  const groupedByDate = useMemo(() => {
    if (isCompact) return null
    const groups: Record<string, Transaction[]> = {}
    filteredTransactions.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = []
      groups[tx.date].push(tx)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredTransactions, isCompact])

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterAccount !== 'all'

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterType('all')
    setFilterAccount('all')
  }, [])

  // ✅ حالت compact
  if (isCompact) {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          <FiInbox size={28} className="mx-auto mb-2 opacity-40" />
          <p>{isPersian ? 'تراکنشی وجود ندارد' : 'No transactions'}</p>
        </div>
      )
    }
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {transactions.map(tx => (
          <TransactionItem
            key={tx.id}
            transaction={tx}
            account={accountsMap.get(tx.accountId)}
            toAccount={accountsMap.get(tx.toAccountId || '')}
            onEdit={onEdit || undefined}
            isCompact
          />
        ))}
      </div>
    )
  }

  // ✅ حالت کامل
  return (
    <div className="space-y-4">
      {/* فیلترها */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiSearch size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder={isPersian ? 'جستجو در تراکنش‌ها...' : 'Search transactions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pe-9"
            />
          </div>

          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
              showFilters || hasActiveFilters
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FiFilter size={14} />
            <span>{isPersian ? 'فیلتر' : 'Filter'}</span>
            {hasActiveFilters && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FiX size={14} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {isPersian ? 'نوع تراکنش' : 'Type'}
              </label>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: isPersian ? 'همه' : 'All', Icon: null as any },
                  ...Object.values(TRANSACTION_TYPES).map((tt: any) => ({
                    id: tt.id,
                    label: isPersian ? tt.label : tt.id,
                    Icon: tt.id === 'income' ? FiTrendingUp : tt.id === 'expense' ? FiTrendingDown : FiRepeat
                  }))
                ].map((opt: any) => {
                  const isActive = filterType === opt.id
                  const Icon = opt.Icon
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setFilterType(opt.id)}
                      className={`flex-1 py-1.5 px-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {Icon && <Icon size={10} />}
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {isPersian ? 'حساب' : 'Account'}
              </label>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">{isPersian ? 'همه حساب‌ها' : 'All accounts'}</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredTransactions.length} {isPersian ? 'تراکنش' : 'transactions'}
        </div>
      </div>

      {/* لیست یا Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<FiInbox size={40} />}
          title={
            transactions.length === 0
              ? (isPersian ? 'هنوز تراکنشی ثبت نشده' : 'No transactions yet')
              : (isPersian ? 'تراکنشی با این فیلترها پیدا نشد' : 'No transactions match filters')
          }
          description={
            transactions.length === 0
              ? (isPersian ? 'با ثبت اولین درآمد یا هزینه شروع کن' : 'Start by adding your first income or expense')
              : (isPersian ? 'فیلترها رو تغییر بده یا پاک کن' : 'Try changing or clearing filters')
          }
          action={
            transactions.length === 0 && onAdd ? (
              <Button onClick={onAdd} className="!bg-emerald-600 hover:!bg-emerald-700">
                <FiPlus size={16} />
                <span>{isPersian ? 'ثبت اولین تراکنش' : 'Add first transaction'}</span>
              </Button>
            ) : hasActiveFilters ? (
              <button onClick={clearFilters} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                {isPersian ? 'پاک کردن فیلترها' : 'Clear filters'}
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedByDate ? (
            groupedByDate.map(([date, txs]) => (
              <div key={date}>
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 py-2 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  {date}
                </div>
                <div className="space-y-2">
                  {txs.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      account={accountsMap.get(tx.accountId)}
                      toAccount={accountsMap.get(tx.toAccountId || '')}
                      onEdit={onEdit || undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map(tx => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  account={accountsMap.get(tx.accountId)}
                  toAccount={accountsMap.get(tx.toAccountId || '')}
                  onEdit={onEdit || undefined}
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