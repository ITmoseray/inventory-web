import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  getStoreByBusiness, 
  getStoreCuratedProducts, 
  getStoreOrders, 
  getStoreAnalyticsOverview 
} from "@/lib/actions/store-builder";
import { StoreBuilderDashboardClient } from "@/components/store-builder/StoreBuilderDashboardClient";

export const dynamic = "force-dynamic";

export default async function StoreBuilderPage({
  searchParams
}: {
  searchParams?: Promise<{ prompt?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialPrompt = resolvedParams?.prompt || "";

  const businessId = session.user.businessId;

  // Load existing store, curated products, orders, analytics, catalog
  const [store, curatedProducts, orders, analytics, availableProducts, business] = await Promise.all([
    getStoreByBusiness(),
    getStoreCuratedProducts(),
    getStoreOrders(),
    getStoreAnalyticsOverview(),
    businessId
      ? prisma.product.findMany({
          where: { businessId, deletedAt: null },
          select: {
            id: true,
            name: true,
            sku: true,
            unitPrice: true,
            stockQuantity: true,
            imageUrl: true,
            category: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: "desc" },
          take: 60
        })
      : Promise.resolve([]),
    businessId
      ? prisma.business.findUnique({
          where: { id: businessId },
          select: { name: true, phone: true, email: true, whatsappPhone: true }
        })
      : Promise.resolve(null)
  ]);

  const serializedCatalog = availableProducts.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unitPrice: Number(p.unitPrice),
    stockQuantity: Number(p.stockQuantity),
    imageUrl: p.imageUrl,
    category: p.category?.name || "Uncategorized"
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <StoreBuilderDashboardClient
        initialStore={store}
        availableProducts={serializedCatalog}
        curatedProducts={curatedProducts}
        orders={orders || []}
        analytics={analytics}
        businessName={business?.name || store?.name || session.user.name || "My Store"}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}
