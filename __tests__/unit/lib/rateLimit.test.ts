/**
 * 単体テスト: src/lib/rateLimit.ts
 * レートリミッター機能のテスト
 */
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

describe("rateLimit — レートリミッター", () => {
  // UT-RL-001: 初回リクエストはOK
  test("初回リクエストは許可される", () => {
    const result = checkRateLimit("test-ip-001", 5, 60000);
    expect(result).toBe(true);
  });

  // UT-RL-002: 上限内のリクエストはOK
  test("上限内のリクエストは全て許可される", () => {
    const key = "test-ip-002";
    const max = 3;
    for (let i = 0; i < max; i++) {
      expect(checkRateLimit(key, max, 60000)).toBe(true);
    }
  });

  // UT-RL-003: 上限を超えるとブロック
  test("上限を超えるとブロックされる", () => {
    const key = "test-ip-003";
    const max = 2;
    expect(checkRateLimit(key, max, 60000)).toBe(true);
    expect(checkRateLimit(key, max, 60000)).toBe(true);
    expect(checkRateLimit(key, max, 60000)).toBe(false);
  });

  // UT-RL-004: 異なるキーは独立
  test("異なるキーは独立してカウントされる", () => {
    const max = 1;
    expect(checkRateLimit("ip-A", max, 60000)).toBe(true);
    expect(checkRateLimit("ip-B", max, 60000)).toBe(true);
    expect(checkRateLimit("ip-A", max, 60000)).toBe(false);
    expect(checkRateLimit("ip-B", max, 60000)).toBe(false);
  });

  // UT-RL-005: ウィンドウ期限切れ後はリセット
  test("ウィンドウ期限後はカウントがリセットされる", () => {
    const key = "test-ip-005";
    const max = 1;
    const windowMs = 100; // 100ms

    expect(checkRateLimit(key, max, windowMs)).toBe(true);
    expect(checkRateLimit(key, max, windowMs)).toBe(false);

    // 待機して期限切れにする
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(checkRateLimit(key, max, windowMs)).toBe(true);
        resolve();
      }, 150);
    });
  });
});

describe("getClientIp — IPアドレス取得", () => {
  // UT-RL-006: x-forwarded-forからIP取得
  test("x-forwarded-forヘッダーからIPを取得する", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("192.168.1.1");
  });

  // UT-RL-007: ヘッダーなしはunknown
  test("ヘッダーがない場合は'unknown'を返す", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });

  // UT-RL-008: 単一IPのx-forwarded-for
  test("単一IPのx-forwarded-forを正しく処理する", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.50" },
    });
    expect(getClientIp(req)).toBe("203.0.113.50");
  });
});
