// ═══════════════════════════════════════════════
// ✅ Sync Entities Mapping
// ═══════════════════════════════════════════════

export interface EntityConfig {
  sliceName: string
  backendName: string
  statePath: string[]
  fields: string[]
}

export const ENTITY_MAP: Record<string, EntityConfig> = {
  tasks: {
    sliceName: 'tasks',
    backendName: 'tasks',
    statePath: ['tasks', 'tasks'],
    fields: [
      'id', 'title', 'description', 'projectId', 'priority', 'status',
      'dueDate', 'dueTime', 'timeEstimate', 'actualTime', 'completed',
      'subtasks', 'notes', 'tags', 'recurring', 'recurringEndDate',
      'parentTaskId', 'financialCost', 'financialCategory',
      'financialTransactionId', 'createdAt', 'updatedAt'
    ]
  },
  projects: {
    sliceName: 'projects',
    backendName: 'projects',
    statePath: ['projects', 'projects'],
    fields: [
      'id', 'name', 'description', 'color', 'budget', 'budgetCurrency',
      'budgetPeriod', 'createdAt', 'updatedAt'
    ]
  },
  habits: {
    sliceName: 'habits',
    backendName: 'habits',
    statePath: ['habits', 'habits'],
    fields: [
      'id', 'name', 'description', 'iconId', 'color', 'archived',
      'completions', 'createdAt', 'updatedAt'
    ]
  },
  notes: {
    sliceName: 'notes',
    backendName: 'notes',
    statePath: ['notes', 'notes'],
    fields: [
      'id', 'title', 'content', 'color', 'pinned', 'archived',
      'tags', 'checklist', 'createdAt', 'updatedAt'
    ]
  },
  goals: {
    sliceName: 'goals',
    backendName: 'goals',
    statePath: ['goals', 'goals'],
    fields: [
      'id', 'title', 'description', 'category', 'status', 'color',
      'startDate', 'targetDate', 'milestones', 'archived',
      'createdAt', 'updatedAt'
    ]
  },
  journals: {
    sliceName: 'growth',
    backendName: 'journals',
    statePath: ['growth', 'journals'],
    fields: [
      'id', 'date', 'mood', 'energy', 'wins', 'challenges',
      'reflection', 'gratitude', 'createdAt', 'updatedAt'
    ]
  },
  skills: {
    sliceName: 'growth',
    backendName: 'skills',
    statePath: ['growth', 'skills'],
    fields: [
      'id', 'name', 'description', 'category', 'level', 'targetLevel',
      'color', 'hours', 'sessions', 'createdAt', 'updatedAt'
    ]
  },
  financeAccounts: {
    sliceName: 'finance',
    backendName: 'financeAccounts',
    statePath: ['finance', 'accounts'],
    fields: [
      'id', 'name', 'type', 'currency', 'balance', 'color', 'isActive',
      'createdAt', 'updatedAt'
    ]
  },
  financeTransactions: {
    sliceName: 'finance',
    backendName: 'financeTransactions',
    statePath: ['finance', 'transactions'],
    fields: [
      'id', 'accountId', 'type', 'amount', 'currency', 'category',
      'subcategory', 'description', 'date', 'time', 'tags', 'toAccountId',
      'toAmount', 'khumsRelevant', 'zakatRelevant', 'taskId',
      'projectId', 'planId', 'createdAt', 'updatedAt'
    ]
  },
  financePlans: {
    sliceName: 'finance',
    backendName: 'financePlans',
    statePath: ['finance', 'plans'],
    fields: [
      'id', 'type', 'title', 'description', 'totalAmount', 'currency',
      'startDate', 'installmentsCount', 'installmentAmount',
      'lastInstallmentAmount', 'periodicity', 'accountId',
      'counterparty', 'isActive', 'createdAt', 'updatedAt'
    ]
  },
  financePlanDues: {
    sliceName: 'finance',
    backendName: 'financePlanDues',
    statePath: ['finance', 'planDues'],
    fields: [
      'id', 'planId', 'index', 'paid', 'paidDate', 'paidAmount',
      'transactionId', 'notes', 'createdAt', 'updatedAt'
    ]
  },
  financeBudgets: {
    sliceName: 'finance',
    backendName: 'financeBudgets',
    statePath: ['finance', 'budgets'],
    fields: [
      'id', 'category', 'amount', 'currency', 'period', 'startDate',
      'endDate', 'rollover', 'projectId', 'isActive',
      'createdAt', 'updatedAt'
    ]
  }
}

export function getEntityFromAction(actionType: string): string | null {
  if (!actionType || typeof actionType !== 'string') return null

  const [sliceName] = actionType.split('/')

  for (const [key, config] of Object.entries(ENTITY_MAP)) {
    if (config.sliceName === sliceName) {
      const lowerAction = actionType.toLowerCase()

      if (sliceName === 'growth') {
        if (lowerAction.includes('journal')) return 'journals'
        if (lowerAction.includes('skill')) return 'skills'
        return null
      }

      if (sliceName === 'finance') {
        if (lowerAction.includes('account')) return 'financeAccounts'
        if (lowerAction.includes('transaction')) return 'financeTransactions'
        if (lowerAction.includes('plandue')) return 'financePlanDues'
        if (lowerAction.includes('plan')) return 'financePlans'
        if (lowerAction.includes('budget')) return 'financeBudgets'
        return null
      }

      return key
    }
  }

  return null
}

export function getEntitiesFromState(state: any, entityName: string): any[] {
  const config = ENTITY_MAP[entityName]
  if (!config) return []

  let current = state
  for (const path of config.statePath) {
    if (!current || typeof current !== 'object') return []
    current = current[path]
  }

  return Array.isArray(current) ? current : []
}

export default ENTITY_MAP