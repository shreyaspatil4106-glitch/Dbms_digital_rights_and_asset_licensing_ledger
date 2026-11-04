import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  let mysqlStatus = "Disconnected";
  let mongodbStatus = "Disconnected";

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    mysqlStatus = "Connected";
  } catch (error) {
    console.error("MySQL connection error:", error);
  }

  try {
    const client = await clientPromise;
    await client.db("drm_licensing").command({ ping: 1 });
    mongodbStatus = "Connected";
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }

  const success =
    mysqlStatus === "Connected" && mongodbStatus === "Connected";

  return NextResponse.json(
    {
      success,
      databases: {
        mysql: mysqlStatus,
        mongodb: mongodbStatus,
      },
    },
    { status: success ? 200 : 500 }
  );
}