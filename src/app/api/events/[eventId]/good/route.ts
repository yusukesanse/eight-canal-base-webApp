import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/**
 * POST /api/events/[eventId]/good
 * 匿名グッド: action = "add" で +1、"remove" で -1
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;

  let action: string;
  try {
    const body = await req.json();
    action = body.action;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (action !== "add" && action !== "remove") {
    return NextResponse.json({ error: "action must be 'add' or 'remove'" }, { status: 400 });
  }

  const db = getDb();
  const eventRef = db.collection("events").doc(eventId);

  // ドキュメント存在チェック
  const doc = await eventRef.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const delta = action === "add" ? 1 : -1;

  await eventRef.update({
    goodCount: FieldValue.increment(delta),
  });

  // 更新後の値を返す（最小 0 に補正）
  const updated = await eventRef.get();
  const goodCount = Math.max(0, updated.data()?.goodCount ?? 0);

  // 万が一マイナスになった場合は 0 に修正
  if ((updated.data()?.goodCount ?? 0) < 0) {
    await eventRef.update({ goodCount: 0 });
  }

  return NextResponse.json({ eventId, goodCount });
}
