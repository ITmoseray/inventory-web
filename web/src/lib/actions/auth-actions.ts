"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function preLoginCheck(email: string, password: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: 'insensitive' } },
        { username: { equals: email, mode: 'insensitive' } }
      ]
    }
  });

  if (!user) {
    return "INVALID_CREDENTIALS";
  }

  if (user.status === 'blocked') {
    return "ACCOUNT_BLOCKED";
  }

  if (user.status !== 'active') {
    return "ACCOUNT_INACTIVE";
  }

  const passwordMatch = await bcrypt.compare(password.trim(), user.passwordHash);
  if (!passwordMatch) {
    const newAttempts = user.failedLoginAttempts + 1;
    const isNowBlocked = newAttempts >= 3;
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        status: isNowBlocked ? 'blocked' : user.status
      }
    });

    if (isNowBlocked) {
      return "ACCOUNT_BLOCKED";
    }
    return `INVALID_ATTEMPT:${newAttempts}`;
  }

  // Password is correct, don't reset attempts here (let auth.ts do it upon successful session)
  return null;
}
