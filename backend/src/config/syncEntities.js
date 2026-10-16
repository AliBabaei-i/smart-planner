// ═══════════════════════════════════════════════
// ✅ Sync Entities Configuration
// هر entity: نام جدول + ستون‌های مجاز
// ⚠️ مهم: deleted_at توی همه columns هست (soft delete)
// ═══════════════════════════════════════════════
export const SYNC_ENTITIES = {
  tasks: {
    table: 'tasks',
    columns: [
      'id', 'title', 'description', 'project_id', 'priority', 'status',
      'due_date', 'due_time', 'time_estimate', 'actual_time', 'completed',
      'subtasks', 'notes', 'tags', 'recurring', 'recurring_end_date',
      'parent_task_id', 'financial_cost', 'financial_category',
      'financial_transaction_id', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['subtasks', 'tags'],
    booleanColumns: ['completed']
  },

  projects: {
    table: 'projects',
    columns: [
      'id', 'name', 'description', 'color', 'budget', 'budget_currency',
      'budget_period', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: [],
    booleanColumns: []
  },

  habits: {
    table: 'habits',
    columns: [
      'id', 'name', 'description', 'icon_id', 'color', 'archived',
      'completions', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['completions'],
    booleanColumns: ['archived']
  },

  notes: {
    table: 'notes',
    columns: [
      'id', 'title', 'content', 'color', 'pinned', 'archived',
      'tags', 'checklist', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['tags', 'checklist'],
    booleanColumns: ['pinned', 'archived']
  },

  goals: {
    table: 'goals',
    columns: [
      'id', 'title', 'description', 'category', 'status', 'color',
      'start_date', 'target_date', 'milestones', 'archived',
      'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['milestones'],
    booleanColumns: ['archived']
  },

  journals: {
    table: 'journals',
    columns: [
      'id', 'date', 'mood', 'energy', 'wins', 'challenges',
      'reflection', 'gratitude', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['wins', 'challenges'],
    booleanColumns: []
  },

  skills: {
    table: 'skills',
    columns: [
      'id', 'name', 'description', 'category', 'level', 'target_level',
      'color', 'hours', 'sessions', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['sessions'],
    booleanColumns: []
  },

  financeAccounts: {
    table: 'finance_accounts',
    columns: [
      'id', 'name', 'type', 'currency', 'balance', 'color', 'is_active',
      'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: [],
    booleanColumns: ['is_active']
  },

  financeTransactions: {
    table: 'finance_transactions',
    columns: [
      'id', 'account_id', 'type', 'amount', 'currency', 'category',
      'subcategory', 'description', 'date', 'time', 'tags', 'to_account_id',
      'to_amount', 'khums_relevant', 'zakat_relevant', 'task_id',
      'project_id', 'plan_id', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: ['tags'],
    booleanColumns: ['khums_relevant', 'zakat_relevant']
  },

  financePlans: {
    table: 'finance_plans',
    columns: [
      'id', 'type', 'title', 'description', 'total_amount', 'currency',
      'start_date', 'installments_count', 'installment_amount',
      'last_installment_amount', 'periodicity', 'account_id',
      'counterparty', 'is_active', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: [],
    booleanColumns: ['is_active']
  },

  financePlanDues: {
    table: 'finance_plan_dues',
    columns: [
      'id', 'plan_id', 'due_index', 'paid', 'paid_date', 'paid_amount',
      'transaction_id', 'notes', 'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: [],
    booleanColumns: ['paid']
  },

  financeBudgets: {
    table: 'finance_budgets',
    columns: [
      'id', 'category', 'amount', 'currency', 'period', 'start_date',
      'end_date', 'rollover', 'project_id', 'is_active',
      'created_at', 'updated_at', 'deleted_at'
    ],
    jsonColumns: [],
    booleanColumns: ['rollover', 'is_active']
  }
}

export default SYNC_ENTITIES