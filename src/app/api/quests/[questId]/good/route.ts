import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/**
 * POST /api/quests/[questId]/good
 * 匿名グッド: action = "add" で +1、"remove" で -1
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { questId: string } }
) {
  const { questId } = params;

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
  const questRef = db.collection("quests").doc(questId);

  const doc = await questRef.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  const delta = action === "add" ? 1 : -1;

  await questRef.update({
    goodCount: FieldValue.increment(delta),
  });

  const updated = await questRef.get();
  const goodCount = Math.max(0, updated.data()?.goodCount ?? 0);

  if ((updated.data()?.goodCount ?? 0) < 0) {
    await questRef.update({ goodCount: 0 });
  }

  return NextResponse.json({ questId, goodCount });
}
