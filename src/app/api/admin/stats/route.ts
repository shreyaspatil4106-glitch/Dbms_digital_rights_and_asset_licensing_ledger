import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const [assets] = await pool.query(
      "SELECT COUNT(*) AS total FROM ASSET"
    );

    const [licenses] = await pool.query(
      "SELECT COUNT(*) AS total FROM LICENSE"
    );

    const [licensees] = await pool.query(
      "SELECT COUNT(*) AS total FROM LICENSEE"
    );

    const [owners] = await pool.query(
      "SELECT COUNT(*) AS total FROM OWNER"
    );

    return NextResponse.json({
      success: true,
      stats: {
        assets: (assets as { total: number }[])[0].total,
        licenses: (licenses as { total: number }[])[0].total,
        licensees: (licensees as { total: number }[])[0].total,
        owners: (owners as { total: number }[])[0].total,
      },
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve dashboard statistics." },
      { status: 500 }
    );
  }
}