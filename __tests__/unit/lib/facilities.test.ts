/**
 * 単体テスト: src/lib/facilities.ts
 * 施設マスタデータと施設取得関数のテスト
 * ※ Firestoreモック環境ではフォールバックデータが使われる
 */
import { getFacilities, getFacilityById, FALLBACK_FACILITIES } from "@/lib/facilities";
import type { Facility } from "@/types";

// Firestore をモック（空のコレクションを返す → フォールバックが使われる）
jest.mock("@/lib/firebaseAdmin", () => ({
  getDb: () => ({
    collection: () => ({
      where: () => ({
        orderBy: () => ({
          get: async () => ({ empty: true, docs: [] }),
        }),
      }),
      doc: (id: string) => ({
        get: async () => ({
          exists: false,
          data: () => undefined,
        }),
      }),
      get: async () => ({ empty: true, docs: [] }),
    }),
  }),
}));

describe("facilities — 施設マスタ", () => {
  // UT-FAC-001: フォールバック施設一覧の件数
  test("フォールバック施設は6件（会議室3 + ブース3）登録されている", () => {
    expect(FALLBACK_FACILITIES).toHaveLength(6);
  });

  // UT-FAC-002: 会議室の件数
  test("会議室は3件", () => {
    const rooms = FALLBACK_FACILITIES.filter((f: Facility) => f.type === "meeting_room");
    expect(rooms).toHaveLength(3);
  });

  // UT-FAC-003: ブースの件数
  test("ブースは3件", () => {
    const booths = FALLBACK_FACILITIES.filter((f: Facility) => f.type === "booth");
    expect(booths).toHaveLength(3);
  });

  // UT-FAC-004: 全施設にIDが設定されている
  test("全施設にID・名前・容量・calendarIdが設定されている", () => {
    FALLBACK_FACILITIES.forEach((f: Facility) => {
      expect(f.id).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.capacity).toBeGreaterThan(0);
      expect(f.calendarId).toBeTruthy();
    });
  });

  // UT-FAC-005: getFacilities はフォールバックを返す（Firestore空の場合）
  test("getFacilities はFirestore空の場合フォールバックを返す", async () => {
    const facilities = await getFacilities();
    expect(facilities).toHaveLength(6);
  });

  // UT-FAC-006: getFacilityById で施設を取得できる（フォールバック）
  test("getFacilityById で会議室Aを取得できる", async () => {
    const facility = await getFacilityById("meetingroom-a");
    expect(facility).toBeDefined();
    expect(facility?.name).toBe("会議室 A");
    expect(facility?.type).toBe("meeting_room");
    expect(facility?.capacity).toBe(6);
  });

  // UT-FAC-007: 存在しないIDはundefinedを返す
  test("存在しないIDはundefinedを返す", async () => {
    const result = await getFacilityById("nonexistent");
    expect(result).toBeUndefined();
  });

  // UT-FAC-008: 各施設のIDがユニーク
  test("施設IDがすべてユニーク", () => {
    const ids = FALLBACK_FACILITIES.map((f: Facility) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
