import * as crypto from "crypto";

/**
 * Normalizes full name for robust, case-insensitive comparison
 */
export function normalizeStudentName(name: string): string {
  if (!name) return "";
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "") // remove quotes/apostrophes
    .replace(/[^a-z0-9\s]/g, " ") // replace special chars with space
    .replace(/\s+/g, " "); // collapse multiple whitespace

  // Strip common honorific titles (e.g. Dr, Mr, Mrs, Ms, Prof)
  const tokens = cleaned
    .split(" ")
    .filter((w) => !["dr", "mr", "mrs", "ms", "miss", "prof", "engr", "chief", "sir"].includes(w));
  return tokens.join(" ") || cleaned;
}

/**
 * Compares two names with forgiving normalization (order independent if names match)
 */
export function compareStudentNames(inputName: string, registeredName: string): boolean {
  const n1 = normalizeStudentName(inputName);
  const n2 = normalizeStudentName(registeredName);

  if (!n1 || !n2) return false;
  if (n1 === n2) return true;

  // Check word set match (e.g. "Mohamed Kamara" vs "Kamara Mohamed")
  const words1 = n1.split(" ").filter(Boolean).sort().join(" ");
  const words2 = n2.split(" ").filter(Boolean).sort().join(" ");
  return words1 === words2;
}

/**
 * Secure Session Token for verified students (HMAC signed)
 */
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "protech-academy-secure-session-key-2026";

export interface StudentPortalSessionPayload {
  studentDbId: string;
  studentExamId: string;
  studentName: string;
  authorizedExamIds: string[];
  issuedAt: number;
  expiresAt: number;
}

export function createStudentSessionToken(payload: Omit<StudentPortalSessionPayload, "issuedAt" | "expiresAt">): string {
  const now = Date.now();
  const fullPayload: StudentPortalSessionPayload = {
    ...payload,
    issuedAt: now,
    expiresAt: now + 3 * 60 * 60 * 1000, // 3 hours validity
  };

  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyStudentSessionToken(token: string): StudentPortalSessionPayload | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadB64, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: StudentPortalSessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
