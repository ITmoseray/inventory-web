import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';
import { getPublicReceipt } from '@/lib/actions/public-receipt';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sales = await db.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const results = [];
    for (const sale of sales) {
      try {
        const receipt = await getPublicReceipt(sale.id);
        results.push({
          id: sale.id,
          success: !!receipt,
          error: receipt === null ? "Returned null" : null
        });
      } catch (err: any) {
        results.push({
          id: sale.id,
          success: false,
          error: err.message
        });
      }
    }

    return NextResponse.json({ sales: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
