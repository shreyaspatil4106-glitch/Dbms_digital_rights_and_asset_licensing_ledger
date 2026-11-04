import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  UserID: number;
  Name: string;
  Email: string;
  PasswordHash: string;
  Role: "ADMIN" | "LICENSE_MANAGER";
  Status: "ACTIVE" | "INACTIVE";
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<User[]>(
      `SELECT UserID, Name, Email, PasswordHash, Role, Status
       FROM APP_USER
       WHERE Email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (user.Status !== "ACTIVE") {
      return NextResponse.json(
        { message: "This account is inactive." },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.PasswordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        userId: user.UserID,
        role: user.Role,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        userId: user.UserID,
        name: user.Name,
        email: user.Email,
        role: user.Role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}