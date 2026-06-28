"use server";

import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { logAudit } from "./audit";

const CONFIG_PATH = path.join(process.cwd(), "src/lib/system-settings.json");

export interface SystemSettings {
  registrationOpen: boolean;
  defaultTrialDays: number;
  announcementBanner: string;
  announcementBannerUpdatedAt?: string;
  emailAlertsEnabled: boolean;
}

const defaultSettings: SystemSettings = {
  registrationOpen: true,
  defaultTrialDays: 7,
  announcementBanner: "",
  announcementBannerUpdatedAt: "",
  emailAlertsEnabled: true,
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(CONFIG_PATH, "utf-8");
    return { ...defaultSettings, ...JSON.parse(data) };
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

    const current = await getSystemSettings();
    const updated = { ...current, ...settings };
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
    return updated;
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw new Error("Failed to save settings");
  }
}
