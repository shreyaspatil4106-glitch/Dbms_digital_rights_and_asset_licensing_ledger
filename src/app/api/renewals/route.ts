import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const [renewals] = await pool.query(`
      SELECT
        R.RenewalID AS renewalId,
        R.LicenseID AS licenseId,
        A.Title AS assetTitle,
        LE.Name AS licenseeName,
        DATE_FORMAT(R.RenewalDate, '%Y-%m-%d') AS renewalDate,
        DATE_FORMAT(R.NewStartDate, '%Y-%m-%d') AS newStartDate,
        DATE_FORMAT(R.NewEndDate, '%Y-%m-%d') AS newEndDate,
        R.Status AS status
      FROM RENEWAL R
      INNER JOIN LICENSE L ON R.LicenseID = L.LicenseID
      INNER JOIN ASSET A ON L.AssetID = A.AssetID
      INNER JOIN LICENSEE LE ON L.LicenseeID = LE.LicenseeID
      ORDER BY R.RenewalDate DESC
    `);

    return NextResponse.json({ success: true, records: renewals });
  } catch (error) {
    console.error("Renewals API error:", error);
    return NextResponse.json(
      { message: "Unable to retrieve renewal records." },
      { status: 500 }
    );
  }
}
