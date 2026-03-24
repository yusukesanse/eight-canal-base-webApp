import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import type { NufEvent } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const snap = await db
    .collection("events")
    .where("published", "==", true)
    .orderBy("startAt", "asc")
    .get();

  const events = snap.docs.map((doc) => {
    const data = doc.data() as Omit<NufEvent, "eventId">;
    return {
      eventId: doc.id,
      ...data,
      goodCount: (data as Record<string, unknown>).goodCount ?? 0,
    };
  });

  return NextResponse.json({ events });
}
