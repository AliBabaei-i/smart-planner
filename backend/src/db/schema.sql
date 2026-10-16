CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  settings TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT,
  sessions_invalidated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date TEXT,
  due_time INTEGER,
  time_estimate INTEGER,
  actual_time INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  subtasks TEXT DEFAULT '[]',
  notes TEXT,
  tags TEXT DEFAULT '[]',
  recurring TEXT,
  recurring_end_date TEXT,
  parent_task_id TEXT,
  financial_cost REAL,
  financial_category TEXT,
  financial_transaction_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_updated ON tasks(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  budget REAL,
  budget_currency TEXT DEFAULT 'IRR',
  budget_period TEXT DEFAULT 'total',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON projects(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_id TEXT,
  color TEXT,
  archived INTEGER DEFAULT 0,
  completions TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habits_user_updated ON habits(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT,
  color TEXT,
  pinned INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',
  checklist TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  color TEXT,
  start_date TEXT,
  target_date TEXT,
  milestones TEXT DEFAULT '[]',
  archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goals_user_updated ON goals(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT,
  mood INTEGER,
  energy INTEGER,
  wins TEXT DEFAULT '[]',
  challenges TEXT DEFAULT '[]',
  reflection TEXT,
  gratitude TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level INTEGER DEFAULT 1,
  target_level INTEGER DEFAULT 5,
  color TEXT,
  hours REAL DEFAULT 0,
  sessions TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_journals_user_updated ON journals(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_user_updated ON skills(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS finance_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'bank',
  currency TEXT DEFAULT 'IRR',
  balance REAL DEFAULT 0,
  color TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finance_accounts_user_updated ON finance_accounts(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT,
  category TEXT,
  subcategory TEXT,
  description TEXT,
  date TEXT,
  time TEXT,
  tags TEXT DEFAULT '[]',
  to_account_id TEXT,
  to_amount REAL,
  khums_relevant INTEGER DEFAULT 1,
  zakat_relevant INTEGER DEFAULT 0,
  task_id TEXT,
  project_id TEXT,
  plan_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_updated ON finance_transactions(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS finance_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'debt',
  title TEXT NOT NULL,
  description TEXT,
  total_amount REAL NOT NULL,
  currency TEXT,
  start_date TEXT,
  installments_count INTEGER DEFAULT 1,
  installment_amount REAL,
  last_installment_amount REAL,
  periodicity TEXT DEFAULT 'monthly',
  account_id TEXT,
  counterparty TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_plan_dues (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  due_index INTEGER NOT NULL,
  paid INTEGER DEFAULT 0,
  paid_date TEXT,
  paid_amount REAL,
  transaction_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES finance_plans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT,
  period TEXT DEFAULT 'monthly',
  start_date TEXT,
  end_date TEXT,
  rollover INTEGER DEFAULT 0,
  project_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS finance_settings (
  user_id TEXT PRIMARY KEY,
  categories TEXT DEFAULT '{}',
  islamic_settings TEXT DEFAULT '{}',
  currency_settings TEXT DEFAULT '{}',
  settings TEXT DEFAULT '{}',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  user_id TEXT PRIMARY KEY,
  layout TEXT DEFAULT '[]',
  edit_mode INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  user_id TEXT PRIMARY KEY,
  data TEXT DEFAULT '{}',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);