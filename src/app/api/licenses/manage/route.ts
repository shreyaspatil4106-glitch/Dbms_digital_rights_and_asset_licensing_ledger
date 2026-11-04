
import { NextResponse } from "next/server";
import pool from "@/lib/adminMysql";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      licenseId,
      assetId,
      licenseeId,
      territoryId,
      startDate,
      endDate,
      licenseType,
      exclusivity,
      status,
      notes,
      autoRenew,
      action,
    } = body;

    // DELETE LICENSE
    if (action === "delete") {
      if (!licenseId) {
        return NextResponse.json(
          { message: "License ID is required." },
          { status: 400 }
        );
      }

      const [result]: any = await pool.execute(
        "DELETE FROM LICENSE WHERE LicenseID = ?",
        [licenseId]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "License not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "License deleted successfully.",
      });
    }

    // VALIDATE CREATE AND UPDATE FIELDS
    if (
      !licenseId ||
      !assetId ||
      !licenseeId ||
      !territoryId ||
      !startDate ||
      !endDate ||
      !licenseType ||
      !exclusivity
    ) {
      return NextResponse.json(
        { message: "Please complete all required license fields." },
        { status: 400 }
      );
    }

    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { message: "End date must be on or after start date." },
        { status: 400 }
      );
    }

    // UPDATE LICENSE
    if (action === "update") {
      const [result]: any = await pool.execute(
        `UPDATE LICENSE
         SET AssetID=?, LicenseeID=?, TerritoryID=?, StartDate=?, EndDate=?,
             LicenseType=?, Exclusivity=?, Status=?, Notes=?, AutoRenew=?
         WHERE LicenseID=?`,
        [
          assetId,
          licenseeId,
          territoryId,
          startDate,
          endDate,
          licenseType,
          exclusivity,
          status || "Active",
          notes || null,
          Boolean(autoRenew),
          licenseId,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "License not found or no changes made." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "License updated successfully.",
      });
    }

    // CREATE LICENSE
    if (action !== "create") {
      return NextResponse.json(
        { message: "Invalid action." },
        { status: 400 }
      );
    }

    // Check availability using the stored function
    const [availabilityResult]: any = await pool.execute(
      `SELECT CheckLicenseAvailability(?, ?, ?) AS Availability`,
      [assetId, territoryId, startDate]
    );

    const availability = availabilityResult[0]?.Availability;

    if (availability === "LICENSED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This asset is already licensed in the selected territory on the requested start date.",
        },
        { status: 409 }
      );
    }

    if (availability !== "AVAILABLE") {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify license availability.",
        },
        { status: 500 }
      );
    }

    await pool.execute(
      `INSERT INTO LICENSE
       (LicenseID, AssetID, LicenseeID, TerritoryID, StartDate, EndDate,
        LicenseType, Exclusivity, Status, Notes, AutoRenew)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        licenseId,
        assetId,
        licenseeId,
        territoryId,
        startDate,
        endDate,
        licenseType,
        exclusivity,
        status || "Active",
        notes || null,
        Boolean(autoRenew),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "License created successfully.",
    });
  } catch (error) {
    console.error("License management error:", error);

    return NextResponse.json(
      { message: "Unable to save license. Check the IDs and dates." },
      { status: 500 }
    );
  }
}
