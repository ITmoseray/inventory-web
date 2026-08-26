"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "@/lib/db";
import { getProducts } from "@/lib/actions/product";
import { getCategories } from "@/lib/actions/category";
import { getCustomers } from "@/lib/actions/customer";
import { getSuppliers } from "@/lib/actions/supplier";
import { createSale } from "@/lib/actions/sale";
import { createDebtPayment } from "@/lib/actions/debt";
import { updateStockLevel } from "@/lib/actions/inventory";
import { createExpense } from "@/lib/actions/expense";
import { toast } from "sonner";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const syncingRef = useRef(false);

  // Refresh pending count from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      const [sales, adjustments, payments, expenses] = await Promise.all([
        db.pendingSales.where("synced").equals(0).count(),
        db.pendingStockAdjustments.where("synced").equals(0).count(),
        db.pendingCustomerPayments.where("synced").equals(0).count(),
        db.pendingExpenses.where("synced").equals(0).count(),
      ]);
      const total = sales + adjustments + payments + expenses;
      setPendingCount(total);

      const meta = await db.appMeta.get("lastSyncedAt");
      if (meta && meta.value) {
        setLastSyncedAt(new Date(meta.value));
      }
    } catch (err) {
      console.warn("Could not read pending sync counts:", err);
    }
  }, []);

  // Pre-cache all core catalogs: Products, Categories, Customers, Suppliers
  const initialSync = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    try {
      setIsSyncing(true);
      syncingRef.current = true;

      const [products, categories, customers, suppliers] = await Promise.all([
        getProducts().catch(() => []),
        getCategories().catch(() => []),
        getCustomers().catch(() => []),
        getSuppliers().catch(() => []),
      ]);

      // Populate IndexedDB safely
      try {
        if (products && products.length > 0) {
          await db.products.clear();
          await db.products.bulkAdd(
            products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sku: p.sku || null,
              barcode: p.barcode || null,
              costPrice: p.costPrice ? parseFloat(p.costPrice) : null,
              unitPrice: parseFloat(p.unitPrice) || 0,
              stockQuantity: parseFloat(p.stockQuantity) || 0,
              categoryId: p.categoryId || null,
              imageUrl: p.imageUrl,
              metadata: p.metadata,
              baseUnit: p.baseUnit || "Unit",
              units: p.units || [],
              requiresPrescription: p.requiresPrescription || false,
              genericAlternative: p.genericAlternative || null,
              isControlledSubstance: p.isControlledSubstance || false,
            }))
          );
        }

        if (categories && categories.length > 0) {
          await db.categories.clear();
          await db.categories.bulkAdd(
            categories.map((c: any) => ({
              id: c.id,
              name: c.name,
              description: c.description || null,
            }))
          );
        }

        if (customers && customers.length > 0) {
          await db.customers.clear();
          await db.customers.bulkAdd(
            customers.map((c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone || null,
              email: c.email || null,
              address: c.address || null,
              debtBalance: c.debtBalance ? parseFloat(c.debtBalance) : 0,
              loyaltyPoints: c.loyaltyPoints || 0,
              status: c.status || "active",
            }))
          );
        }

        if (suppliers && suppliers.length > 0) {
          await db.suppliers.clear();
          await db.suppliers.bulkAdd(
            suppliers.map((s: any) => ({
              id: s.id,
              name: s.name,
              phone: s.phone || null,
              email: s.email || null,
              contactPerson: s.contactPerson || null,
              address: s.address || null,
            }))
          );
        }

        const now = new Date();
        await db.appMeta.put({
          key: "lastSyncedAt",
          value: now.toISOString(),
          updatedAt: Date.now(),
        });
        setLastSyncedAt(now);
      } catch (dbErr) {
        console.warn("IndexedDB pre-cache write failed:", dbErr);
      }
    } catch (error) {
      console.error("Master catalog sync failed:", error);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
      refreshPendingCount();
    }
  }, [refreshPendingCount]);

  // Push all offline queued mutations to Cloud Database
  const syncPendingMutations = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    try {
      setIsSyncing(true);
      syncingRef.current = true;

      const [pendingSales, pendingAdjustments, pendingPayments, pendingExpenses] = await Promise.all([
        db.pendingSales.where("synced").equals(0).toArray(),
        db.pendingStockAdjustments.where("synced").equals(0).toArray(),
        db.pendingCustomerPayments.where("synced").equals(0).toArray(),
        db.pendingExpenses.where("synced").equals(0).toArray(),
      ]);

      let totalSynced = 0;

      // 1. Sync Sales
      for (const sale of pendingSales) {
        try {
          const res = await createSale({
            items: sale.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              isExternalSourced: item.isExternalSourced,
              externalSourceName: item.externalSourceName,
              externalCostPrice: item.externalCostPrice,
            })),
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            customerId: sale.customerId,
            amountPaid: sale.amountPaid,
            saleNote: sale.saleNote || "OFFLINE SYNCED SALE",
          });

          if (res.success) {
            await db.pendingSales.delete(sale.id!);
            totalSynced++;
          }
        } catch (err) {
          console.error("Failed to sync offline sale:", err);
        }
      }

      // 2. Sync Stock Adjustments
      for (const adj of pendingAdjustments) {
        try {
          const delta = adj.type === "IN" ? adj.quantity : -adj.quantity;
          await updateStockLevel(
            adj.productId,
            delta,
            adj.type === "IN" ? "PURCHASE" : "ADJUSTMENT",
            `Offline stock adjustment: ${adj.reason}`
          );
          await db.pendingStockAdjustments.delete(adj.id!);
          totalSynced++;
        } catch (err) {
          console.error("Failed to sync offline adjustment:", err);
        }
      }

      // 3. Sync Customer Debt Payments
      for (const pay of pendingPayments) {
        try {
          await createDebtPayment(
            pay.customerId,
            pay.amount,
            pay.paymentMethod,
            pay.reference || "Offline customer payment"
          );
          await db.pendingCustomerPayments.delete(pay.id!);
          totalSynced++;
        } catch (err) {
          console.error("Failed to sync customer payment:", err);
        }
      }

      // 4. Sync Expenses
      for (const exp of pendingExpenses) {
        try {
          await createExpense({
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
            paymentMethod: exp.paymentMethod,
          });
          await db.pendingExpenses.delete(exp.id!);
          totalSynced++;
        } catch (err) {
          console.error("Failed to sync offline expense:", err);
        }
      }

      if (totalSynced > 0) {
        toast.success(`Cloud Sync Complete: ${totalSynced} offline transactions synchronized!`);
      }

      // Pull fresh data
      syncingRef.current = false;
      await initialSync();
    } catch (error) {
      console.error("Offline sync error:", error);
    } finally {
      setIsSyncing(false);
      syncingRef.current = false;
      refreshPendingCount();
    }
  }, [initialSync, refreshPendingCount]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast.success("Connection restored! Synchronizing offline data with cloud...");
      syncPendingMutations();
    }

    function handleOffline() {
      setIsOnline(false);
      toast.warning("Network connection lost. Enterprise OS operating in Offline Mode.", {
        description: "All sales, receipt prints, and adjustments will be saved safely in browser storage."
      });
      refreshPendingCount();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check and hydration
    refreshPendingCount();
    if (navigator.onLine) {
      initialSync();
    }

    // Periodic check for unsynced records
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine && pendingCount > 0 && !syncingRef.current) {
        syncPendingMutations();
      }
    }, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [initialSync, syncPendingMutations, refreshPendingCount, pendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncedAt,
    initialSync,
    syncPendingMutations,
    refreshPendingCount,
  };
}
