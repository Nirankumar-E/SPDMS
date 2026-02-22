import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const {
      citizenId,
      fpsCode,
      date,
      timeSlot,
      items,
      paymentMethod,
      totalAmount,
      transactionId
    } = await req.json();

    if (!citizenId || !fpsCode || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Slot ID with FPS isolation
    const slotId = `${fpsCode}_${date}_${timeSlot}`;
    const slotRef = adminDb.collection("fps_slots").doc(slotId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const slotDoc = await transaction.get(slotRef);

      let bookedCount = 0;
      let maxCapacity = 16;

      if (slotDoc.exists) {
        const data = slotDoc.data();
        bookedCount = data?.bookedCount || 0;
        maxCapacity = data?.maxCapacity || 16;
      }

      if (bookedCount >= maxCapacity) {
        throw new Error("Slot is full. Please choose another time.");
      }

      // Update slot counter
      transaction.set(
        slotRef,
        {
          bookedCount: bookedCount + 1,
          maxCapacity,
          date,
          timeSlot,
          fpsCode
        },
        { merge: true }
      );

      // Create booking
      const bookingRef = adminDb
        .collection("citizens")
        .doc(citizenId)
        .collection("bookings")
        .doc();

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

      const verifyUrl = `${baseUrl}/verify-booking/${citizenId}/${bookingRef.id}`;

      transaction.set(bookingRef, {
        date,
        timeSlot,
        status: "Booked",
        paymentStatus: paymentMethod === "upi" ? "Completed" : "Pending",
        items,
        paymentMethod,
        totalAmount,
        transactionId: transactionId || null,
        qrData: verifyUrl,
        createdAt: new Date(),
      });

      return { verifyUrl };
    });

    return NextResponse.json({
      success: true,
      verifyUrl: result.verifyUrl,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
