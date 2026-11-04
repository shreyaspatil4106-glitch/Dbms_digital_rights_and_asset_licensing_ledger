import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: number;
  role: "ADMIN" | "LICENSE_MANAGER";
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as AuthUser;

    if (
      !decoded.userId ||
      !["ADMIN", "LICENSE_MANAGER"].includes(decoded.role)
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function requireRole(
  allowedRole: "ADMIN" | "LICENSE_MANAGER"
) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/");
  }

  if (user.role !== allowedRole) {
    redirect(user.role === "ADMIN" ? "/admin" : "/manager");
  }

  return user;
}