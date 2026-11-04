import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("drm_licensing");

    const reports = await db
      .collection("violation_reports")
      .find({})
      .sort({ detectedAt: -1 })
      .toArray();

    const records = reports.map(({ _id, ...report }) => report);

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Violations API error:", error);
    return NextResponse.json(
      { message: "Unable to retrieve violation reports." },
      { status: 500 }
    );
  }
}
