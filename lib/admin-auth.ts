import { cookies } from "next/headers";

const ADMIN_MASTER_PASSKEY = process.env.ADMIN_SECRET_KEY || "ROAST_ADMIN_2026";
const ADMIN_SESSION_COOKIE = "admin_session";

export function verifyAdminPasskey(key: string): boolean {
  if (!key) return false;
  return key.trim() === ADMIN_MASTER_PASSKEY;
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
    if (!sessionCookie || !sessionCookie.value) return false;
    return sessionCookie.value === "authorized_super_admin";
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return false;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "authorized_super_admin", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
