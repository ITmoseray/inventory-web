import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return Response.json({ error: "Missing businessId" }, { status: 400 });
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
