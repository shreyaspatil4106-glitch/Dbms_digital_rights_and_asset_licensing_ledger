import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const connection = await pool.getConnection();

  try {
    const { renewalId, licenseId, newStartDate, newEndDate, status } = await request.json();

    if (!renewalId || !licenseId || !newStartDate || !newEndDate) {
      return NextResponse.json({ message: "Complete all renewal fields." }, { status: 400 });
    }

    if (new Date(newEndDate) < new Date(newStartDate)) {
      return NextResponse.json({ message: "New end date must be on or after the start date." }, { status: 400 });
    }

    await connection.beginTransaction();

    const [licenses]: any = await connection.execute(
      "SELECT LicenseID FROM LICENSE WHERE LicenseID = ? FOR UPDATE",
      [licenseId]
    );

    if (licenses.length === 0) {
      await connection.rollback();
      return NextResponse.json({ message: "License not found." }, { status: 404 });
    }

    await connection.execute(
      `INSERT INTO RENEWAL
       (RenewalID, LicenseID, RenewalDate, NewStartDate, NewEndDate, Status)
       VALUES (?, ?, CURDATE(), ?, ?, ?)`,
      [renewalId, licenseId, newStartDate, newEndDate, status || "Approved"]
    );

    await connection.execute(
      `UPDATE LICENSE
       SET StartDate=?, EndDate=?, Status='Active'
       WHERE LicenseID=?`,
      [newStartDate, newEndDate, licenseId]
    );

    await connection.commit();

    return NextResponse.json({ success: true, message: "Renewal completed successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Renewal transaction error:", error);
    return NextResponse.json({ message: "Renewal failed. Check the renewal ID and license ID." }, { status: 500 });
  } finally {
    connection.release();
  }
}
