
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

    const [licenses] = await pool.query(`
      SELECT
        V.LicenseID,
        L.AssetID,
        V.AssetTitle,
        V.Licensee AS LicenseeName,
        LE.Organization AS LicenseeOrganization,
        V.Territory AS TerritoryName,
        V.StartDate,
        V.EndDate,
        V.LicenseType,
        V.Exclusivity,
        L.Status,
        L.AutoRenew
      FROM active_license_overview V
      INNER JOIN LICENSE L ON V.LicenseID = L.LicenseID
      INNER JOIN LICENSEE LE ON L.LicenseeID = LE.LicenseeID
      ORDER BY V.StartDate DESC
    `);

    return NextResponse.json({
      success: true,
      licenses,
    });
  } catch (error) {
    console.error("Licensing agreements error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve licensing agreements." },
      { status: 500 }
    );
  }
}
