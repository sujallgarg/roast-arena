import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SALT_LEN = 16;
const KEY_LEN = 64;

/**
 * Hashes a plaintext password using scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const derivedKey = crypto.scryptSync(password, salt, KEY_LEN).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedKey, "hex"));
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export interface UserSessionPayload {
  id: string;
  username: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  location?: string | null;
  points: number;
  level: string;
}

/**
 * Returns the currently authenticated user based on user_session cookie
 */
export async function getAuthenticatedUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session");
    if (!sessionCookie || !sessionCookie.value) return null;

    const sessionData = JSON.parse(sessionCookie.value) as { id: string };
    if (!sessionData.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: sessionData.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        location: true,
        points: true,
        level: true,
      },
    });

    if (!user) {
      // User deleted from database: remove cookies for that particular user
      try {
        cookieStore.delete("user_session");
      } catch {}
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error reading authenticated user session:", error);
    return null;
  }
}

/**
 * Sets the authenticated user_session cookie
 */
export async function setUserSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("user_session", JSON.stringify({ id: userId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

/**
 * Creates or retrieves an existing user for Google Authentication
 */
export async function createOrGetGoogleUser(params: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<UserSessionPayload> {
  const cleanEmail = params.email.trim().toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    // Generate unique username from name or email prefix
    const baseCandidate = (params.name || cleanEmail.split("@")[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15) || "voter";

    let uniqueUsername = baseCandidate;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
      uniqueUsername = `${baseCandidate}${Math.floor(100 + Math.random() * 900)}`;
      counter++;
      if (counter > 15) {
        uniqueUsername = `voter_${Date.now().toString().slice(-6)}`;
        break;
      }
    }

    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: params.name?.trim() || uniqueUsername,
        avatarUrl:
          params.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uniqueUsername)}`,
        points: 500, // Welcome bonus points
        level: "Level 1 • Arena Rookie",
      },
    });
  } else if (params.avatarUrl && !user.avatarUrl) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: params.avatarUrl },
    });
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    points: user.points,
    level: user.level,
  };
}

