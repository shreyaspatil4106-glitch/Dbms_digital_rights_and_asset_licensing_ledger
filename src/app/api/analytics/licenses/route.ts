
import { NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
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

    // 1. Licenses approaching expiry within the next 30 days
    const [approachingExpiry] = await pool.query(`
      SELECT
        L.LicenseID,
        A.Title AS AssetTitle,
        LE.Name AS LicenseeName,
        L.EndDate,
        DATEDIFF(L.EndDate, CURDATE()) AS DaysRemaining
      FROM LICENSE L
      INNER JOIN ASSET A ON L.AssetID = A.AssetID
      INNER JOIN LICENSEE LE ON L.LicenseeID = LE.LicenseeID
      WHERE L.Status = 'Active'
        AND L.EndDate BETWEEN CURDATE()
        AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY L.EndDate ASC
    `);

    // 2. Overlapping exclusive licenses for the same asset
    const [exclusiveOverlaps] = await pool.query(`
      SELECT
        L1.AssetID,
        A.Title AS AssetTitle,
        L1.LicenseID AS LicenseID1,
        L2.LicenseID AS LicenseID2,
        L1.StartDate AS StartDate1,
        L1.EndDate AS EndDate1,
        L2.StartDate AS StartDate2,
        L2.EndDate AS EndDate2
      FROM LICENSE L1
      INNER JOIN LICENSE L2
        ON L1.AssetID = L2.AssetID
        AND L1.LicenseID < L2.LicenseID
      INNER JOIN ASSET A ON L1.AssetID = A.AssetID
      WHERE L1.Exclusivity = 'Exclusive'
        AND L2.Exclusivity = 'Exclusive'
        AND L1.Status = 'Active'
        AND L2.Status = 'Active'
        AND L1.StartDate <= L2.EndDate
        AND L2.StartDate <= L1.EndDate
      ORDER BY L1.AssetID
    `);

    // 3. Assets associated with multiple licenses
    const [multipleLicensedAssets] = await pool.query(`
      SELECT
        A.AssetID,
        A.Title AS AssetTitle,
        COUNT(L.LicenseID) AS TotalLicenses
      FROM ASSET A
      INNER JOIN LICENSE L ON A.AssetID = L.AssetID
      GROUP BY A.AssetID, A.Title
      HAVING COUNT(L.LicenseID) > 1
      ORDER BY TotalLicenses DESC
    `);

    // 4. Licenses with no payment records
    const [unpaidLicenses] = await pool.query(`
      SELECT
        L.LicenseID,
        A.Title AS AssetTitle,
        LE.Name AS LicenseeName,
        L.Status,
        L.StartDate,
        L.EndDate
      FROM LICENSE L
      INNER JOIN ASSET A ON L.AssetID = A.AssetID
      INNER JOIN LICENSEE LE ON L.LicenseeID = LE.LicenseeID
      WHERE NOT EXISTS (
        SELECT 1
        FROM PAYMENT P
        WHERE P.LicenseID = L.LicenseID
      )
      ORDER BY L.StartDate DESC
    `);

    return NextResponse.json({
      success: true,
      analytics: {
        approachingExpiry,
        exclusiveOverlaps,
        multipleLicensedAssets,
        unpaidLicenses,
      },
    });
  } catch (error) {
    console.error("License intelligence error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve license intelligence." },
      { status: 500 }
    );
  }
}
