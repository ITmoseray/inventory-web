import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantPrisma } from "@/lib/prisma";
import { ReconciliationClient } from "./ReconciliationClient";

export const metadata = {
  title: "Bank Reconciliation | Enterprise OS",
};

export default async function BankReconciliationPage() {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect("/auth/signin");
  }

  const prisma = getTenantPrisma(session.user.businessId);

  // Fetch bank transactions
  const bankTransactions = await prisma.bankTransaction.findMany({
    orderBy: { date: "desc" },
  });

  // Fetch expenses and sales for matching
  const expenses = await prisma.expense.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    take: 100,
  });

  const sales = await prisma.sale.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            Bank <span className="text-emerald-500">Reconciliation</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px] md:text-xs">
            Match bank statements against system records
          </p>
        </div>
      </div>

      <ReconciliationClient 
        initialTransactions={JSON.parse(JSON.stringify(bankTransactions))} 
        expenses={JSON.parse(JSON.stringify(expenses))}
        sales={JSON.parse(JSON.stringify(sales))}
      />
    </div>
  );
}
