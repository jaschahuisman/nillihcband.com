import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "crm_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const id = payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (
      typeof id !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }

    return {
      id,
      email,
      name: typeof payload.name === "string" ? payload.name : null,
      role: role as SessionUser["role"],
    };
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies SessionUser;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
