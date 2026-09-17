"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { DEFAULT_STORE_THEME } from "@/types/store-builder";

export interface RegisterStandaloneStoreInput {
  name: string;
  email: string;
  password: string;
  storeName: string;
  phone: string;
  whatsapp?: string;
  location?: string;
  prompt?: string;
}

export async function registerStandaloneStoreUserAction(data: RegisterStandaloneStoreInput) {
  try {
    const email = data.email.trim().toLowerCase();
    const cleanPassword = data.password.trim();

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    if (!data.storeName?.trim()) {
      return { success: false, error: "Please enter your store or brand name." };
    }

    // 1. Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email }
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // 3. Find or create default STORE_OWNER role
    let storeOwnerRole = await prisma.role.findFirst({
      where: { name: "STORE_OWNER", businessId: null }
    });

    if (!storeOwnerRole) {
      storeOwnerRole = await prisma.role.create({
        data: {
          name: "STORE_OWNER",
          businessId: null
        }
      });
    }

    // 4. Create User without an Enterprise OS business
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash,
        phone: data.phone.trim(),
        roleId: storeOwnerRole.id,
        businessId: null,
        status: "active"
      }
    });

    // 5. Generate unique slug for the standalone store
    let baseSlug = data.storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    if (!baseSlug) baseSlug = "store";

    let finalSlug = baseSlug;
    const existingStore = await prisma.store.findUnique({
      where: { slug: finalSlug }
    });

    if (existingStore) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 6. Create Standalone Store record
    const store = await prisma.store.create({
      data: {
        name: data.storeName.trim(),
        slug: finalSlug,
        ownerId: user.id,
        businessId: null,
        storeType: "STANDALONE",
        whatsappPhone: data.whatsapp?.trim() || data.phone.trim(),
        contactPhone: data.phone.trim(),
        contactEmail: email,
        location: data.location?.trim() || "Freetown, Sierra Leone",
        description: data.prompt?.trim() || `Welcome to ${data.storeName.trim()} online store.`,
        themeConfig: DEFAULT_STORE_THEME as any,
        status: "DRAFT"
      }
    });

    return {
      success: true,
      userId: user.id,
      storeId: store.id,
      storeSlug: store.slug
    };
  } catch (error: any) {
    console.error("REGISTER STANDALONE STORE USER ERROR:", error);
    return {
      success: false,
      error: error.message || "Failed to register standalone store account"
    };
  }
}
