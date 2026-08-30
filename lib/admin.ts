import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "ads_admin";

function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return null;
  }

  return createHash("sha256").update(password).digest("hex");
}

export async function isAdminUnlocked() {
  const expected = adminToken();
  if (!expected) {
    return true;
  }

  const store = await cookies();
  return store.get(COOKIE)?.value === expected;
}

export async function setAdminCookie() {
  const token = adminToken();
  if (!token) {
    return;
  }

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
