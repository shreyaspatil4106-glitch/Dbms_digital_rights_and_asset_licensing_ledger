
import { NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
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

    // 1. Asset and ownership details
    const [assets] = await pool.query(`
      SELECT
        A.AssetID,
        A.Title,
        A.Type,
        A.Description,
        A.Format,
        A.ReleaseDate,
        A.Status AS AssetStatus,
        O.OwnerID,
        O.Name AS OwnerName,
        O.Organization
      FROM ASSET A
      INNER JOIN OWNER O ON A.OwnerID = O.OwnerID
      ORDER BY A.Title ASC
    `);

    // 2. License details using the stored procedure
    const licenses: any[] = [];

    for (const asset of assets as any[]) {
      const [procedureResults]: any = await pool.query(
        "CALL GetAssetLicenses(?)",
        [asset.AssetID]
      );

      const procedureLicenses = procedureResults[0] || [];

      // Get additional fields required by the existing frontend
      const [extraDetails]: any = await pool.query(
        `
          SELECT
            L.LicenseID,
            L.AssetID,
            T.Region,
            T.Country,
            L.AutoRenew,
            L.Notes
          FROM LICENSE L
          INNER JOIN TERRITORY T ON L.TerritoryID = T.TerritoryID
          WHERE L.AssetID = ?
        `,
        [asset.AssetID]
      );

      for (const item of procedureLicenses) {
        const extra = extraDetails.find(
          (detail: any) => detail.LicenseID === item.LicenseID
        );

        licenses.push({
          LicenseID: item.LicenseID,
          AssetID: asset.AssetID,
          LicenseeName: item.Licensee,
          TerritoryName: item.Territory,
          Region: extra?.Region || "",
          Country: extra?.Country || "",
          StartDate: item.StartDate,
          EndDate: item.EndDate,
          LicenseType: item.LicenseType,
          Exclusivity: item.Exclusivity,
          LicenseStatus: item.Status,
          AutoRenew: extra?.AutoRenew || 0,
          Notes: extra?.Notes || null,
        });
      }
    }

    // 3. Rights and restrictions for each license
    const [rights] = await pool.query(`
      SELECT
        LR.LicenseID,
        RE.RightID,
        RE.RightName,
        RE.Category,
        RE.Description,
        LR.Allowed,
        LR.Restrictions
      FROM LICENSE_RIGHT LR
      INNER JOIN RIGHT_ENT RE ON LR.RightID = RE.RightID
      ORDER BY LR.LicenseID, RE.RightName
    `);

    // 4. Payment records for each license
    const [payments] = await pool.query(`
      SELECT
        P.PaymentID,
        P.LicenseID,
        P.Amount,
        P.Currency,
        P.PaymentStatus,
        P.PaymentDate,
        P.Method
      FROM PAYMENT P
      ORDER BY P.LicenseID, P.PaymentDate DESC
    `);

    // 5. Paid revenue grouped by asset and currency
    const [revenue] = await pool.query(`
      SELECT
        A.AssetID,
        A.Title AS AssetTitle,
        P.Currency,
        SUM(P.Amount) AS TotalPaidRevenue,
        COUNT(P.PaymentID) AS PaidPaymentCount
      FROM ASSET A
      INNER JOIN LICENSE L ON A.AssetID = L.AssetID
      INNER JOIN PAYMENT P ON L.LicenseID = P.LicenseID
      WHERE P.PaymentStatus = 'Paid'
      GROUP BY A.AssetID, A.Title, P.Currency
      ORDER BY A.Title, P.Currency
    `);

    return NextResponse.json({
      success: true,
      analytics: {
        assets,
        licenses,
        rights,
        payments,
        revenue,
      },
    });
  } catch (error) {
    console.error("Asset licensing analytics error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve asset licensing details." },
      { status: 500 }
    );
  }
}
