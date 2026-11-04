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

        // 1. Revenue and license count by owner (USD only)
    const [ownerRevenue] = await pool.query(`
      SELECT
        O.OwnerID,
        O.Name AS OwnerName,
        COUNT(DISTINCT V.LicenseID) AS TotalLicenses,
        COALESCE(SUM(
          CASE
            WHEN P.PaymentStatus = 'Paid'
              AND P.Currency = 'USD'
            THEN P.Amount
            ELSE 0
          END
        ), 0) AS TotalRevenue
      FROM OWNER O
      LEFT JOIN ASSET A ON O.OwnerID = A.OwnerID
      LEFT JOIN LICENSE L ON A.AssetID = L.AssetID
      LEFT JOIN license_revenue_summary V ON L.LicenseID = V.LicenseID
      LEFT JOIN PAYMENT P ON L.LicenseID = P.LicenseID
      GROUP BY O.OwnerID, O.Name
      ORDER BY TotalRevenue DESC
    `);

    // 2. Owners with revenue above $50,000
    const [highRevenueOwners] = await pool.query(`
      SELECT
        O.OwnerID,
        O.Name AS OwnerName,
        SUM(P.Amount) AS TotalRevenue
      FROM OWNER O
      INNER JOIN ASSET A ON O.OwnerID = A.OwnerID
      INNER JOIN LICENSE L ON A.AssetID = L.AssetID
      INNER JOIN PAYMENT P ON L.LicenseID = P.LicenseID
      WHERE P.PaymentStatus = 'Paid'
        AND P.Currency = 'USD'
      GROUP BY O.OwnerID, O.Name
      HAVING SUM(P.Amount) > 50000
      ORDER BY TotalRevenue DESC
    `);

    // 3. Licensees with above-average payment totals
    const [aboveAverageLicensees] = await pool.query(`
      SELECT
        LE.LicenseeID,
        LE.Name AS LicenseeName,
        SUM(P.Amount) AS TotalPayments
      FROM LICENSEE LE
      INNER JOIN LICENSE L ON LE.LicenseeID = L.LicenseeID
      INNER JOIN PAYMENT P ON L.LicenseID = P.LicenseID
      WHERE P.PaymentStatus = 'Paid'
        AND P.Currency = 'USD'
      GROUP BY LE.LicenseeID, LE.Name
      HAVING SUM(P.Amount) > (
        SELECT AVG(LicenseeTotal)
        FROM (
          SELECT SUM(P2.Amount) AS LicenseeTotal
          FROM LICENSE L2
          INNER JOIN PAYMENT P2 ON L2.LicenseID = P2.LicenseID
          WHERE P2.PaymentStatus = 'Paid'
            AND P2.Currency = 'USD'
          GROUP BY L2.LicenseeID
        ) AS LicenseeTotals
      )
      ORDER BY TotalPayments DESC
    `);

    // 4. Overall paid revenue (USD)
    const [totalRevenue] = await pool.query(`
      SELECT
        COALESCE(SUM(Amount), 0) AS TotalRevenue
      FROM PAYMENT
      WHERE PaymentStatus = 'Paid'
        AND Currency = 'USD'
    `);

    return NextResponse.json({
      success: true,
      analytics: {
        ownerRevenue,
        highRevenueOwners,
        aboveAverageLicensees,
        totalRevenue: (totalRevenue as { TotalRevenue: number }[])[0]
          .TotalRevenue,
      },
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve revenue analytics." },
      { status: 500 }
    );
  }
}