export const PERMISSIONS = {
  DASHBOARD: { VIEW: 'dashboard.view' },
  INVENTORY: {
    VIEW: 'inventory.view',
    CREATE: 'inventory.create',
    EDIT: 'inventory.edit',
    DELETE: 'inventory.delete',
  },
  PRODUCTS: {
    VIEW: 'products.view',
    CREATE: 'products.create',
    EDIT: 'products.edit',
    DELETE: 'products.delete',
  },
  CATEGORIES: {
    VIEW: 'categories.view',
    MANAGE: 'categories.manage',
  },
  PURCHASES: {
    VIEW: 'purchases.view',
    MANAGE: 'purchases.manage',
  },
  SUPPLIERS: {
    VIEW: 'suppliers.view',
    MANAGE: 'suppliers.manage',
  },
  SALES: {
    VIEW: 'sales.view',
    MANAGE: 'sales.manage',
    REFUND: 'sales.refund',
  },
  CUSTOMERS: {
    VIEW: 'customers.view',
    MANAGE: 'customers.manage',
  },
  ACCOUNTING: {
    VIEW: 'accounting.view',
    MANAGE: 'accounting.manage',
  },
  REPORTS: {
    VIEW: 'reports.view',
    EXPORT: 'reports.export',
  },
  HR: {
    VIEW: 'hr.view',
    MANAGE: 'hr.manage',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    MANAGE: 'settings.manage',
  },
} as const;
