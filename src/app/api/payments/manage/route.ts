import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();

    if (!user || !["ADMIN", "LICENSE_MANAGER"].includes(user.role)) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const { paymentId, licenseId, amount, currency, paymentStatus, paymentDate, method } = await request.json();

    if (!paymentId || !licenseId || amount === undefined || !currency || !paymentStatus || !paymentDate || !method) {
      return NextResponse.json({ message: "Complete all payment fields." }, { status: 400 });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ message: "Enter a valid positive payment amount." }, { status: 400 });
    }

    await pool.execute(
      `INSERT INTO PAYMENT
       (PaymentID, LicenseID, Amount, Currency, PaymentStatus, PaymentDate, Method)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, licenseId, amount, currency, paymentStatus, paymentDate, method]
    );

    return NextResponse.json({ success: true, message: "Payment recorded successfully." });
  } catch (error) {
    console.error("Payment recording error:", error);
    return NextResponse.json({ message: "Unable to record payment. Check the payment and license IDs." }, { status: 500 });
  }
}
