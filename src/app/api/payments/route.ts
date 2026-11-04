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

    const [payments] = await pool.query(`
      SELECT
        P.PaymentID AS paymentId,
        P.LicenseID AS licenseId,
        A.Title AS assetTitle,
        LE.Name AS licenseeName,
        P.Amount AS amount,
        P.Currency AS currency,
        P.PaymentStatus AS paymentStatus,
        DATE_FORMAT(P.PaymentDate, '%Y-%m-%d') AS paymentDate,
        P.Method AS method
      FROM PAYMENT P
      INNER JOIN LICENSE L ON P.LicenseID = L.LicenseID
      INNER JOIN ASSET A ON L.AssetID = A.AssetID
      INNER JOIN LICENSEE LE ON L.LicenseeID = LE.LicenseeID
      ORDER BY P.PaymentDate DESC
    `);

    return NextResponse.json({ success: true, records: payments });
  } catch (error) {
    console.error("Payments API error:", error);
    return NextResponse.json(
      { message: "Unable to retrieve payment records." },
      { status: 500 }
    );
  }
}
