"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAudit } from "./audit";

export interface SystemSettings {
  registrationOpen: boolean;
  defaultTrialDays: number;
  announcementBanner: string;
  announcementBannerUpdatedAt?: string;
  emailAlertsEnabled: boolean;
}

const defaultSettings: SystemSettings = {
  registrationOpen: true,
  defaultTrialDays: 14,
  announcementBanner: "",
  announcementBannerUpdatedAt: "",
  emailAlertsEnabled: true,
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { id: "singleton" },
    });

    if (!record) {
      // Create default row on first access
      const created = await prisma.systemSetting.create({
        data: {
          id: "singleton",
          registrationOpen: defaultSettings.registrationOpen,
          defaultTrialDays: defaultSettings.defaultTrialDays,
          announcementBanner: defaultSettings.announcementBanner,
          announcementBannerUpdatedAt: defaultSettings.announcementBannerUpdatedAt ?? "",
          emailAlertsEnabled: defaultSettings.emailAlertsEnabled,
        },
      });
      return {
        registrationOpen: created.registrationOpen,
        defaultTrialDays: created.defaultTrialDays,
        announcementBanner: created.announcementBanner,
        announcementBannerUpdatedAt: created.announcementBannerUpdatedAt,
        emailAlertsEnabled: created.emailAlertsEnabled,
      };
    }

    return {
      registrationOpen: record.registrationOpen,
      defaultTrialDays: record.defaultTrialDays,
      announcementBanner: record.announcementBanner,
      announcementBannerUpdatedAt: record.announcementBannerUpdatedAt,
      emailAlertsEnabled: record.emailAlertsEnabled,
    };
  } catch (error) {
    console.error("Error reading system settings:", error);
    return defaultSettings;
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  try {
    const session = await auth();
    if (session?.user?.role === "SUPERADMIN") {
      const keys = Object.keys(settings).join(", ");
      await logAudit({
        action: `UPDATED SYSTEM VARIABLES: ${keys}`,
        entity: "SYSTEM",
      });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        registrationOpen: settings.registrationOpen ?? defaultSettings.registrationOpen,
        defaultTrialDays: settings.defaultTrialDays ?? defaultSettings.defaultTrialDays,
        announcementBanner: settings.announcementBanner ?? defaultSettings.announcementBanner,
        announcementBannerUpdatedAt: settings.announcementBannerUpdatedAt ?? defaultSettings.announcementBannerUpdatedAt ?? "",
        emailAlertsEnabled: settings.emailAlertsEnabled ?? defaultSettings.emailAlertsEnabled,
      },
      update: {
        ...(settings.registrationOpen !== undefined && { registrationOpen: settings.registrationOpen }),
        ...(settings.defaultTrialDays !== undefined && { defaultTrialDays: settings.defaultTrialDays }),
        ...(settings.announcementBanner !== undefined && { announcementBanner: settings.announcementBanner }),
        ...(settings.announcementBannerUpdatedAt !== undefined && { announcementBannerUpdatedAt: settings.announcementBannerUpdatedAt }),
        ...(settings.emailAlertsEnabled !== undefined && { emailAlertsEnabled: settings.emailAlertsEnabled }),
      },
    });

    return {
      registrationOpen: updated.registrationOpen,
      defaultTrialDays: updated.defaultTrialDays,
      announcementBanner: updated.announcementBanner,
      announcementBannerUpdatedAt: updated.announcementBannerUpdatedAt,
      emailAlertsEnabled: updated.emailAlertsEnabled,
    };
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw new Error("Failed to save settings");
  }
}
