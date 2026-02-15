import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { slotId, userId } = await req.json();

    const slotRef = adminDb.collection("slots").doc(slotId);

    await adminDb.runTransaction(async (transaction) => {
      const slotDoc = await transaction.get(slotRef);

      if (!slotDoc.exists) {
        throw new Error("Slot not found");
      }

      const data = slotDoc.data();
      const booked = data?.bookedCount || 0;
      const max = data?.maxCapacity || 16;

      if (booked >= max) {
        throw new Error("Slot is full");
      }

      transaction.update(slotRef, {
        bookedCount: booked + 1,
      });

      transaction.set(
        adminDb.collection("bookings").doc(),
        {
          slotId,
          userId,
          createdAt: new Date(),
        }
      );
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}