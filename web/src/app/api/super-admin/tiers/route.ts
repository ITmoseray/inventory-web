import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const tiers = await prisma.activationTier.findMany({
      orderBy: { price: 'asc' }
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("GET /api/super-admin/tiers ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPERADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { name, maxUsers, maxProducts, price, features } = body;

    const tier = await prisma.activationTier.create({
      data: {
        name,
        maxUsers: Number(maxUsers) || 5,
        maxProducts: Number(maxProducts) || 100,
        price: Number(price) || 0,
        features: features || [],
      }
    });

    return NextResponse.json(tier);
  } catch (error) {
    console.error("POST /api/super-admin/tiers ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
