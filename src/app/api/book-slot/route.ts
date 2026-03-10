import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/book-slot
 * Handles ration slot booking using Firestore transaction.
 * Checks monthly duplicate booking using database query
 * and tracks slot capacity.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      citizenId,
      fpsCode,
      date,
      timeSlot,
      slotIndex,
      items,
      paymentMethod,
      totalAmount,
      transactionId
    } = body;

    // Basic validation
    if (!citizenId || !fpsCode || !date || slotIndex === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const currentMonth = date.substring(0, 7); // YYYY-MM
    const slotId = `${fpsCode}_${date}_${slotIndex}`;

    const citizenRef = adminDb.collection("citizens").doc(citizenId);
    const slotRef = adminDb.collection("fps_slots").doc(slotId);

    const result = await adminDb.runTransaction(async (transaction) => {

      // 1️⃣ Get Citizen Data
      const citizenDoc = await transaction.get(citizenRef);

      if (!citizenDoc.exists) {
        throw new Error("Citizen profile not found.");
      }

      const citizenData = citizenDoc.data();

      // 2️⃣ Check existing booking for this month
      const bookingsRef = citizenRef.collection("bookings");

      const existingBookings = await bookingsRef
        .where("date", ">=", `${currentMonth}-01`)
        .where("date", "<=", `${currentMonth}-31`)
        .get();

      if (!existingBookings.empty) {
        throw new Error("A booking has already been made for this month.");
      }

      // 3️⃣ Check slot capacity
      const slotDoc = await transaction.get(slotRef);

      let bookedCount = 0;
      let maxCapacity = 16;

      if (slotDoc.exists) {
        const slotData = slotDoc.data();
        bookedCount = slotData?.bookedCount || 0;
        maxCapacity = slotData?.maxCapacity || 16;
      }

      if (bookedCount >= maxCapacity) {
        throw new Error("This time slot is full. Please select another time.");
      }

      // 4️⃣ Update slot counter
      transaction.set(
        slotRef,
        {
          bookedCount: bookedCount + 1,
          maxCapacity,
          date,
          timeSlot,
          fpsCode,
          updatedAt: new Date()
        },
        { merge: true }
      );

      // 5️⃣ Create booking
      const bookingRef = citizenRef.collection("bookings").doc();

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const verifyUrl = `${baseUrl}/verify-booking/${citizenId}/${bookingRef.id}`;

      transaction.set(bookingRef, {
        date,
        timeSlot,
        slotIndex,
        status: "Booked",
        paymentStatus: paymentMethod === "upi" ? "Completed" : "Pending",
        items,
        paymentMethod,
        totalAmount,
        transactionId: transactionId || null,
        qrData: verifyUrl,
        createdAt: new Date(),
        citizenName: citizenData?.name || "Unknown",
        district: citizenData?.district || "",
        taluk: citizenData?.taluk || "",
        fpsCode: citizenData?.fpsCode || ""
      });

      return { verifyUrl };
    });

    return NextResponse.json({
      success: true,
      verifyUrl: result.verifyUrl
    });

  } catch (error: any) {

    console.error("Booking API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "An unexpected server error occurred during booking."
      },
      { status: 500 }
    );
  }
}
