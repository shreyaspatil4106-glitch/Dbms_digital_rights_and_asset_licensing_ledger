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

    if (!["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const [assets] = await pool.query(`
      SELECT
        A.AssetID,
        A.Title,
        A.Type,
        A.Description,
        A.Format,
        A.ReleaseDate,
        A.Status,
        O.Name AS OwnerName,
        O.Organization AS OwnerOrganization
      FROM ASSET A
      INNER JOIN OWNER O ON A.OwnerID = O.OwnerID
      ORDER BY A.Title ASC
    `);

    return NextResponse.json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error("Digital assets error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve digital assets." },
      { status: 500 }
    );
  }
}