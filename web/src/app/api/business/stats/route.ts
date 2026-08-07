import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  // Security: require authenticated session
  const session = await auth();
  if (!session?.user?.businessId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return Response.json({ error: "Missing businessId" }, { status: 400 });
  }

  // Security: ensure callers can only query their own business
  if (businessId !== session.user.businessId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.count({
    where: { businessId },
  });

  const orders = await prisma.sale.count({
    where: { businessId },
  });

  const revenue = await prisma.sale.aggregate({
    where: { businessId },
    _sum: {
      totalAmount: true,
    },
  });

  return Response.json({
    products,
    orders,
    revenue: revenue._sum.totalAmount || 0,
  });
}
