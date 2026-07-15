'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.businessId) {
    throw new Error("Unauthorized");
  }
  return { session, businessId: session.user.businessId };
}

// === LIBRARY BOOKS ===

export async function getLibraryBooks() {
  const { businessId } = await getAuthSession();
  return prisma.schoolLibraryBook.findMany({
    where: { businessId },
    orderBy: { title: 'asc' }
  });
}

export async function addLibraryBook(data: {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
}) {
  const { businessId } = await getAuthSession();
  
  await prisma.schoolLibraryBook.create({
    data: {
      businessId,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      category: data.category,
      totalCopies: data.totalCopies,
      availableCopies: data.totalCopies,
    }
  });

  revalidatePath('/dashboard/school/library');
  return { success: true };
}

// === BOOK CHECKOUTS ===

export async function getCheckouts() {
  const { businessId } = await getAuthSession();
  return prisma.schoolBookCheckout.findMany({
    where: { businessId },
    include: {
      book: true,
      student: true
    },
    orderBy: { checkoutDate: 'desc' }
  });
}

export async function checkoutBook(bookId: string, studentId: string, dueDateStr: string) {
  const { businessId } = await getAuthSession();
  const dueDate = new Date(dueDateStr);

  // Use a transaction to ensure availableCopies is decremented safely
  try {
    await prisma.$transaction(async (tx) => {
      const book = await tx.schoolLibraryBook.findUnique({ where: { id: bookId } });
      if (!book || book.availableCopies <= 0) {
        throw new Error("Book not available");
      }

      await tx.schoolBookCheckout.create({
        data: {
          businessId,
          bookId,
          studentId,
          dueDate,
          status: 'ACTIVE'
        }
      });

      await tx.schoolLibraryBook.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } }
      });
    });

    revalidatePath('/dashboard/school/library');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function returnBook(checkoutId: string, bookId: string) {
  const { businessId } = await getAuthSession();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.schoolBookCheckout.update({
        where: { id: checkoutId, businessId },
        data: {
          status: 'RETURNED',
          returnDate: new Date()
        }
      });

      await tx.schoolLibraryBook.update({
        where: { id: bookId },
        data: { availableCopies: { increment: 1 } }
      });
    });

    revalidatePath('/dashboard/school/library');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
