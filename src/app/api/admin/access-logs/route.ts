import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const user = await getAuthUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const database = client.db("drm_licensing");

    const logs = await database
      .collection("access_logs")
      .find({})
      .sort({ eventDate: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      success: true,
      logs: logs.map((log) => ({
        ...log,
        _id: String(log._id),
      })),
    });
  } catch (error) {
    console.error("Admin access logs error:", error);
    return NextResponse.json({ message: "Unable to retrieve access logs." }, { status: 500 });
  }
}