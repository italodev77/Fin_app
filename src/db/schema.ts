export const MIGRATIONS: string[] = [
  `
  CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kind TEXT NOT NULL
  );

  CREATE TABLE bill_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    due_day INTEGER,
    kind TEXT NOT NULL,
    start_month TEXT NOT NULL,
    end_month TEXT,
    installments_total INTEGER,
    installments_paid INTEGER
  );

  CREATE TABLE bill_instance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER REFERENCES bill_template(id) ON DELETE SET NULL,
    month TEXT NOT NULL,
    name TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    paid_at TEXT,
    kind TEXT NOT NULL,
    amount_overridden INTEGER NOT NULL DEFAULT 0
  );
  CREATE UNIQUE INDEX bill_instance_template_month
    ON bill_instance(template_id, month) WHERE template_id IS NOT NULL;
  CREATE INDEX bill_instance_month ON bill_instance(month);

  CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    date TEXT NOT NULL,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL
  );
  CREATE INDEX transactions_date ON transactions(date);

  CREATE TABLE income_plan (
    month TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    net_cents INTEGER,
    tax_percent REAL NOT NULL,
    tax_on_extra INTEGER NOT NULL
  );

  CREATE TABLE income_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    label TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_cents INTEGER NOT NULL,
    is_extra INTEGER NOT NULL
  );
  CREATE INDEX income_item_month ON income_item(month);

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
];
