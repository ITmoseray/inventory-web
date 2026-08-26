import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  costPrice?: number | null;
  unitPrice: number;
  stockQuantity: number;
  categoryId: string | null;
  imageUrl?: string;
  metadata?: any;
  baseUnit?: string;
  units?: any[];
  requiresPrescription?: boolean;
  genericAlternative?: string | null;
  isControlledSubstance?: boolean;
}

export interface LocalCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface LocalCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  debtBalance: number;
  loyaltyPoints?: number;
  status?: string;
}

export interface LocalSupplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  address?: string | null;
}

export interface PendingSale {
  id?: number;
  clientSaleId?: string;
  items: {
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    isExternalSourced?: boolean;
    externalSourceName?: string;
    externalCostPrice?: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerId?: string;
  amountPaid?: number;
  splitPayments?: any;
  saleNote?: string;
  createdAt: number;
  synced: boolean;
}

export interface PendingStockAdjustment {
  id?: number;
  clientAdjustmentId?: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'SET';
  quantity: number;
  reason: string;
  costPrice?: number;
  createdAt: number;
  synced: boolean;
}

export interface PendingCustomerPayment {
  id?: number;
  clientPaymentId?: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  createdAt: number;
  synced: boolean;
}

export interface PendingExpense {
  id?: number;
  clientExpenseId?: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  receiptUrl?: string;
  createdAt: number;
  synced: boolean;
}

export interface AppMeta {
  key: string;
  value: any;
  updatedAt: number;
}

export class OfflineDB extends Dexie {
  products!: Table<LocalProduct>;
  categories!: Table<LocalCategory>;
  customers!: Table<LocalCustomer>;
  suppliers!: Table<LocalSupplier>;
  pendingSales!: Table<PendingSale>;
  pendingStockAdjustments!: Table<PendingStockAdjustment>;
  pendingCustomerPayments!: Table<PendingCustomerPayment>;
  pendingExpenses!: Table<PendingExpense>;
  appMeta!: Table<AppMeta>;

  constructor() {
    super('UniversalBusinessPOS_v3');
    
    this.version(1).stores({
      products: 'id, name, sku, barcode, categoryId',
      categories: 'id, name',
      customers: 'id, name, phone, debtBalance',
      suppliers: 'id, name, phone',
      pendingSales: '++id, clientSaleId, createdAt, synced, customerId',
      pendingStockAdjustments: '++id, clientAdjustmentId, productId, createdAt, synced',
      pendingCustomerPayments: '++id, clientPaymentId, customerId, createdAt, synced',
      pendingExpenses: '++id, clientExpenseId, category, createdAt, synced',
      appMeta: 'key, updatedAt'
    });
  }
}

export const db = new OfflineDB();

// Auto-recover corrupted or incompatible offline databases
if (typeof window !== "undefined") {
  db.open().catch(async (err) => {
    console.warn("Dexie DB Open Failed (falling back to live API mode):", err);
    try {
      await Dexie.delete('UniversalBusinessPOS_v3');
      await db.open();
    } catch (e) {
      console.error("Dexie recovery failed:", e);
    }
  });
}
