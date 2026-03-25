/**
 * 単体テスト: src/lib/session.ts
 * セッションJWT生成・検証のテスト
 */
import { signSession, verifySession } from "@/lib/session";

describe("session — JWT セッション管理", () => {
  // UT-SES-001: セッション生成と検証
  test("signSession で生成したトークンを verifySession で検証できる", async () => {
    const lineUserId = "U1234567890abcdef";
    const token = await signSession(lineUserId);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const result = await verifySession(token);
    expect(result).not.toBeNull();
    expect(result?.lineUserId).toBe(lineUserId);
  });

  // UT-SES-002: 不正なトークンはnull
  test("不正なトークンはnullを返す", async () => {
    expect(await verifySession("invalid")).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("a.b.c")).toBeNull();
  });

  // UT-SES-003: 改ざんされたトークンはnull
  test("改ざんされたトークンはnullを返す", async () => {
    const token = await signSession("U1234567890");
    const tampered = token.slice(0, -3) + "XXX";
    expect(await verifySession(tampered)).toBeNull();
  });

  // UT-SES-004: 異なるユーザーIDで異なるトークン
  test("異なるユーザーIDで異なるトークンが生成される", async () => {
    const token1 = await signSession("user-A");
    const token2 = await signSession("user-B");
    expect(token1).not.toBe(token2);

    const result1 = await verifySession(token1);
    const result2 = await verifySession(token2);
    expect(result1?.lineUserId).toBe("user-A");
    expect(result2?.lineUserId).toBe("user-B");
  });
});
