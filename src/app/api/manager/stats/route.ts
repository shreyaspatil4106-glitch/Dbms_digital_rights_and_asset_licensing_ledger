import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      user.role !== "LICENSE_MANAGER" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const [assets] = await pool.query(
      "SELECT COUNT(*) AS total FROM ASSET"
    );

    const [licenses] = await pool.query(
      "SELECT COUNT(*) AS total FROM LICENSE"
    );

    const [renewals] = await pool.query(
      "SELECT COUNT(*) AS total FROM RENEWAL"
    );

    return NextResponse.json({
      success: true,
      stats: {
        assets: (assets as { total: number }[])[0].total,
        licenses: (licenses as { total: number }[])[0].total,
        renewals: (renewals as { total: number }[])[0].total,
      },
    });
  } catch (error) {
    console.error("Manager statistics error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve dashboard statistics." },
      { status: 500 }
    );
  }
}