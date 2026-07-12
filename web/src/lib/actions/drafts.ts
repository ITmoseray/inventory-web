'use server';

import { revalidatePath } from 'next/cache';
import { getTenantPrisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createDraft(data: {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: any;
  totalAmount: number;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) {
      return { error: 'Unauthorized' };
    }
    const user = session.user;

    const prisma = await getTenantPrisma();

    // Generate a unique draft number: DRAFT-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const draftNumber = `DRAFT-${dateStr}-${randomNum}`;

    // Expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const draft = await prisma.salesDraft.create({
      data: {
        draftNumber,
        businessId: user.businessId,
        userId: user.id,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: data.items,
        totalAmount: data.totalAmount,
        notes: data.notes,
        expiresAt,
      },
    });

    revalidatePath('/dashboard/pos');
    return { success: true, draft };
  } catch (error) {
    console.error('Error creating draft:', error);
    return { error: 'Failed to create draft' };
  }
}

export async function updateDraft(id: string, data: {
  items: any;
  totalAmount: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) {
      return { error: 'Unauthorized' };
    }
    const user = session.user;

    const prisma = await getTenantPrisma();

    // Expires in 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const draft = await prisma.salesDraft.update({
      where: { id, businessId: user.businessId },
      data: {
        ...data,
        expiresAt,
      },
    });

    revalidatePath('/dashboard/pos');
    return { success: true, draft };
  } catch (error) {
    console.error('Error updating draft:', error);
    return { error: 'Failed to update draft' };
  }
}

export async function getDrafts() {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) {
      return { error: 'Unauthorized' };
    }
    const user = session.user;

    const prisma = await getTenantPrisma();

    // Fetch drafts that haven't expired
    const drafts = await prisma.salesDraft.findMany({
      where: {
        businessId: user.businessId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { success: true, drafts };
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return { error: 'Failed to fetch drafts' };
  }
}

export async function deleteDraft(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.businessId || !session?.user?.id) {
      return { error: 'Unauthorized' };
    }
    const user = session.user;

    const prisma = await getTenantPrisma();

    await prisma.salesDraft.delete({
      where: { id, businessId: user.businessId },
    });

    revalidatePath('/dashboard/pos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return { error: 'Failed to delete draft' };
  }
}
