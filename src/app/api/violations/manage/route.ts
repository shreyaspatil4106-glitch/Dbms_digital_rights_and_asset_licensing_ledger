import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const { reportId, remarks } = await request.json();

    if (!reportId || !remarks?.trim()) {
      return NextResponse.json({ message: "Report ID and resolution remarks are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("drm_licensing");

    const result = await db.collection("violation_reports").updateOne(
      { reportId },
      {
        $set: {
          status: "RESOLVED",
          resolution: {
            resolvedAt: new Date(),
            remarks: remarks.trim()
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Violation report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Violation resolved successfully." });
  } catch (error) {
    console.error("Violation resolution error:", error);
    return NextResponse.json({ message: "Unable to resolve violation." }, { status: 500 });
  }
}
