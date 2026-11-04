import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
import { getAuthUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function isAdmin() {
  const user = await getAuthUser();
  return user?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const [rows] = await pool.query(
      "SELECT UserID, Name, Email, Role, Status, CreatedAt FROM APP_USER ORDER BY UserID"
    );

    return NextResponse.json({ success: true, users: rows });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ message: "Unable to retrieve users." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role;

    if (!name || !email || !password || !["ADMIN", "LICENSE_MANAGER"].includes(role)) {
      return NextResponse.json({ message: "All fields are required and role must be valid." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must contain at least 8 characters." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO APP_USER (Name, Email, PasswordHash, Role, Status) VALUES (?, ?, ?, ?, 'ACTIVE')",
      [name, email, passwordHash, role]
    );

    return NextResponse.json({ success: true, message: "User created successfully." });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ message: "Unable to create user. The email may already exist." }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = Number(body.userId);
    const role = body.role;
    const status = body.status;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: "Invalid user ID." }, { status: 400 });
    }

    if (!["ADMIN", "LICENSE_MANAGER"].includes(role) || !["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json({ message: "Invalid role or status." }, { status: 400 });
    }

    const currentUser = await getAuthUser();

    if (currentUser?.userId === userId && (role !== "ADMIN" || status !== "ACTIVE")) {
      return NextResponse.json({ message: "You cannot deactivate or demote your own account." }, { status: 400 });
    }

    const [result] = await pool.query(
      "UPDATE APP_USER SET Role = ?, Status = ? WHERE UserID = ?",
      [role, status, userId]
    );

    if (!(result as { affectedRows: number }).affectedRows) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User updated successfully." });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ message: "Unable to update user." }, { status: 400 });
  }
}