// frontend/src/features/finance/FinancePage.jsx
import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiDollarSign, FiPlus, FiPieChart, FiTrendingUp,
  FiFileText, FiSettings, FiCreditCard,
  FiTarget, FiPercent, FiBarChart2
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FinanceReports from './FinanceReports'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import AccountForm from './AccountForm'
import AccountCard from './AccountCard'
import BudgetCard from './BudgetCard'
import BudgetForm from './BudgetForm'
import PlanForm from './PlanForm'
import PlanCard from './PlanCard'
import CategoryManager from './CategoryManager'
import IslamicPanel from './IslamicPanel'
import FinanceDashboard from './FinanceDashboard'
import FinanceImportExport from './FinanceImportExport'
import { formatCompact } from './currencyHelpers'

// ═══════════════════════════════════════════════
// ✅ TABS با ترجمه — بدون hardcoded
// ═══════════════════════════════════════════════
const TAB_DEFINITIONS = [
  { id: 'dashboard', icon: FiPieChart, labelKey: 'finance.tabs.dashboard' },
  { id: 'transactions', icon: FiFileText, labelKey: 'finance.tabs.transactions' },
  { id: 'accounts', icon: FiCreditCard, labelKey: 'finance.tabs.accounts' },
  { id: 'budgets', icon: FiTarget, labelKey: 'finance.tabs.budgets' },
  { id: 'plans', icon: FiTrendingUp, labelKey: 'finance.tabs.plans' },
  { id: 'reports', icon: FiBarChart2, labelKey: 'finance.tabs.reports' },
  { id: 'islamic', icon: FiPercent, labelKey: 'finance.tabs.islamic' },
  { id: 'settings', icon: FiSettings, labelKey: 'finance.tabs.settings' }
]

const FinancePage = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const { accounts = [], transactions = [], budgets = [], plans = [] } = finance

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // ─────────────────────────────────────────────
  // ✅ هندلرهای فرم — برای ویرایش
  // ─────────────────────────────────────────────
  const handleOpenTransactionForm = useCallback((tx = null) => {
    setEditingItem(tx)
    setShowTransactionForm(true)
  }, [])

  const handleOpenAccountForm = useCallback((account = null) => {
    setEditingItem(account)
    setShowAccountForm(true)
  }, [])

  const handleOpenBudgetForm = useCallback((budget = null) => {
    setEditingItem(budget)
    setShowBudgetForm(true)
  }, [])

  const handleOpenPlanForm = useCallback((plan = null) => {
    setEditingItem(plan)
    setShowPlanForm(true)
  }, [])

  const handleCloseForms = useCallback(() => {
    setShowTransactionForm(false)
    setShowAccountForm(false)
    setShowBudgetForm(false)
    setShowPlanForm(false)
    setEditingItem(null)
  }, [])

  // ─────────────────────────────────────────────
  // ✅ محاسبات برای tabs
  // ─────────────────────────────────────────────
  const accountsById = useMemo(() => {
    const map = new Map()
    accounts.forEach(a => map.set(a.id, a))
    return map
  }, [accounts])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════ */}
      {/* هدر */}
      {/* ═══════════════════════════════════ */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiDollarSign className="text-emerald-600" size={26} />
            <span>{t('finance.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('finance.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => handleOpenTransactionForm()}>
            <FiPlus size={16} />
            <span>{t('finance.actions.newTransaction')}</span>
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* Tabs */}
      {/* ═══════════════════════════════════ */}
      <Card className="p-1 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TAB_DEFINITIONS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-colors whitespace-nowrap
                  ${isActive
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={16} />
                <span>{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* ═══════════════════════════════════ */}
      {/* محتوا */}
      {/* ═══════════════════════════════════ */}

      {/* داشبورد */}
      {activeTab === 'dashboard' && (
        <FinanceDashboard onNavigate={setActiveTab} />
      )}

      {/* تراکنش‌ها */}
      {activeTab === 'transactions' && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('finance.transactions.title')}
            </h3>
            <Button size="small" onClick={() => handleOpenTransactionForm()}>
              <FiPlus size={14} />
              <span>{t('finance.actions.newTransaction')}</span>
            </Button>
          </div>
          <TransactionList
            transactions={transactions}
            accounts={accounts}
            onEdit={handleOpenTransactionForm}
            onAdd={() => handleOpenTransactionForm()}
          />
        </Card>
      )}

      {/* حساب‌ها */}
      {activeTab === 'accounts' && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('finance.accounts.title')}
            </h3>
            <Button size="small" onClick={() => handleOpenAccountForm()}>
              <FiPlus size={14} />
              <span>{t('finance.actions.newAccount')}</span>
            </Button>
          </div>
          {accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(acc => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onEdit={() => handleOpenAccountForm(acc)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <FiCreditCard size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('finance.accounts.empty')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('finance.accounts.emptyHint')}
              </p>
              <Button onClick={() => handleOpenAccountForm()}>
                <FiPlus size={16} />
                <span>{t('finance.actions.newAccount')}</span>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* بودجه */}
      {activeTab === 'budgets' && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('finance.budgets.title')}
            </h3>
            <Button size="small" onClick={() => handleOpenBudgetForm()}>
              <FiPlus size={14} />
              <span>{t('finance.actions.newBudget')}</span>
            </Button>
          </div>
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map(b => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={() => handleOpenBudgetForm(b)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('finance.budgets.empty')}
            </div>
          )}
        </Card>
      )}

      {/* وام و بدهی */}
      {activeTab === 'plans' && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('finance.plans.title')}
            </h3>
            <Button size="small" onClick={() => handleOpenPlanForm()}>
              <FiPlus size={14} />
              <span>{t('finance.actions.newPlan')}</span>
            </Button>
          </div>
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(p => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  onEdit={() => handleOpenPlanForm(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('finance.plans.empty')}
            </div>
          )}
        </Card>
      )}

      {/* ═══════ گزارشات ═══════ */}
      {/* ✅ بدون Card wrapper — FinanceReports خودش Card داره */}
      {activeTab === 'reports' && (
        <FinanceReports />
      )}

      {/* اسلامی */}
      {activeTab === 'islamic' && <IslamicPanel />}

      {/* تنظیمات */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('finance.settings.categoriesTitle')}
            </h3>
            <CategoryManager />
          </Card>
          <FinanceImportExport />
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* Modals — همه با قابلیت ویرایش */}
      {/* ═══════════════════════════════════ */}

      {showTransactionForm && (
        <TransactionForm
          transaction={editingItem}
          onClose={handleCloseForms}
        />
      )}

      {showAccountForm && (
        <AccountForm
          account={editingItem}
          onClose={handleCloseForms}
        />
      )}

      {showBudgetForm && (
        <BudgetForm
          budget={editingItem}
          onClose={handleCloseForms}
        />
      )}

      {showPlanForm && (
        <PlanForm
          plan={editingItem}
          onClose={handleCloseForms}
        />
      )}
    </div>
  )
})

FinancePage.displayName = 'FinancePage'

export default FinancePage