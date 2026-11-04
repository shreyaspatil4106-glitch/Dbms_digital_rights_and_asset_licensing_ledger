import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getAuthUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const {
      assetId, licenseId, licenseeId, territoryId,
      eventType, deviceType, operatingSystem
    } = await request.json();

    if (!assetId || !licenseId || !licenseeId || !territoryId || !eventType) {
      return NextResponse.json({ message: "Complete all access-check fields." }, { status: 400 });
    }

    const [rows]: any = await pool.execute(
      `SELECT LicenseID, Status, StartDate, EndDate, TerritoryID, LicenseeID
       FROM LICENSE
       WHERE LicenseID=? AND AssetID=?`,
      [licenseId, assetId]
    );

    let result = "DENIED";
    let denialReason: string | null = "LICENSE_NOT_FOUND";

    if (rows.length > 0) {
      const license = rows[0];
      const today = new Date().toISOString().slice(0, 10);
      const start = new Date(license.StartDate).toISOString().slice(0, 10);
      const end = new Date(license.EndDate).toISOString().slice(0, 10);

      if (license.LicenseeID !== licenseeId) {
        denialReason = "LICENSEE_MISMATCH";
      } else if (license.TerritoryID !== territoryId) {
        denialReason = "TERRITORY_MISMATCH";
      } else if (license.Status !== "Active") {
        denialReason = "LICENSE_INACTIVE";
      } else if (today < start || today > end) {
        denialReason = "LICENSE_OUTSIDE_VALIDITY";
      } else {
        result = "ALLOWED";
        denialReason = null;
      }
    }

    const client = await clientPromise;
    const db = client.db("drm_licensing");
    const eventId = `EVT-${Date.now()}`;
    const eventDate = new Date();

    await db.collection("access_logs").insertOne({
      eventId,
      assetId,
      licenseId,
      licenseeId,
      eventType,
      eventDate,
      territoryId,
      result,
      denialReason,
      device: {
        type: deviceType || "Unknown",
        operatingSystem: operatingSystem || "Unknown"
      },
      metadata: {
        accessChannel: "Web Dashboard",
        simulatedBy: user.userId
      }
    });

    if (result === "DENIED") {
      await db.collection("violation_reports").insertOne({
        reportId: `VIO-${Date.now()}`,
        eventId,
        assetId,
        licenseId,
        licenseeId,
        violationType: denialReason,
        severity: "HIGH",
        detectedAt: eventDate,
        expectedTerritory: rows[0]?.TerritoryID || null,
        attemptedTerritory: territoryId,
        status: "OPEN",
        evidence: ["Simulated access attempt was denied."]
      });
    }

    return NextResponse.json({
      success: true,
      result,
      denialReason,
      eventId,
      message: result === "ALLOWED" ? "Access allowed." : "Access denied and logged."
    });
  } catch (error) {
    console.error("Asset access check error:", error);
    return NextResponse.json({ message: "Unable to complete access check." }, { status: 500 });
  }
}
