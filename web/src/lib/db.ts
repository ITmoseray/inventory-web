import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unitPrice: number;
  stockQuantity: number;
  categoryId: string | null;
  imageUrl?: string;
  metadata: any;
  baseUnit: string;
  units: any[];
  requiresPrescription?: boolean;
  genericAlternative?: string | null;
  isControlledSubstance?: boolean;
}

export interface LocalCategory {
  id: string;
  name: string;
}

export interface PendingSale {
  id?: number;
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
  splitPayments?: any;
  createdAt: number;
  synced: boolean;
}

export class OfflineDB extends Dexie {
  products!: Table<LocalProduct>;
  categories!: Table<LocalCategory>;
  pendingSales!: Table<PendingSale>;

  constructor() {
    super('UniversalBusinessPOS_v2');
    this.version(1).stores({
      products: 'id, name, sku, barcode, categoryId',
      categories: 'id, name',
      pendingSales: '++id, createdAt, synced'
    });
  }
}

export const db = new OfflineDB();

// Auto-recover corrupted or incompatible offline databases
if (typeof window !== "undefined") {
  db.open().catch(async (err) => {
    console.warn("Dexie DB Open Failed (falling back to live API mode):", err);
    try {
      await Dexie.delete('UniversalBusinessPOS_v2');
    } catch (e) {
      // Ignore
    }
  });
}
