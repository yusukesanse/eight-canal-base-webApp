/**
 * 結合テスト: /api/admin/auth
 * 管理者認証APIのテスト
 */
import { POST, DELETE, GET } from "@/app/api/admin/auth/route";
import { NextRequest } from "next/server";

function createRequest(
  method: string,
  body?: object,
  headers?: Record<string, string>,
  cookies?: Record<string, string>
): NextRequest {
  const url = "http://localhost:3000/api/admin/auth";
  const init: RequestInit = {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  const req = new NextRequest(url, init);
  if (cookies) {
    for (const [key, value] of Object.entries(cookies)) {
      req.cookies.set(key, value);
    }
  }
  return req;
}

describe("API /api/admin/auth — 管理者認証", () => {
  // IT-AAUTH-001: 正しいトークンでログイン成功
  test("POST: 正しいトークンでログイン成功 → httpOnly Cookie設定", async () => {
    const req = createRequest("POST", { token: "test-admin-token-12345" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Cookieが設定されているか確認
    const setCookieHeader = res.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("__admin_session");
    expect(setCookieHeader).toContain("HttpOnly");
  });

  // IT-AAUTH-002: 不正なトークンでログイン失敗
  test("POST: 不正なトークンで401エラー", async () => {
    const req = createRequest("POST", { token: "wrong-token" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBeTruthy();
  });

  // IT-AAUTH-003: トークンなしでログイン失敗
  test("POST: トークンなしで401エラー", async () => {
    const req = createRequest("POST", {});
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  // IT-AAUTH-004: ログアウト
  test("DELETE: ログアウトでCookieクリア", async () => {
    const res = await DELETE();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    const setCookieHeader = res.headers.get("set-cookie");
    expect(setCookieHeader).toContain("__admin_session=;");
  });

  // IT-AAUTH-005: Bearerトークンで認証チェック
  test("GET: Bearerトークンで認証成功", async () => {
    const req = createRequest("GET", undefined, {
      authorization: "Bearer test-admin-token-12345",
    });
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.authenticated).toBe(true);
  });

  // IT-AAUTH-006: 認証なしでGET
  test("GET: 認証なしで401エラー", async () => {
    const req = createRequest("GET");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.authenticated).toBe(false);
  });

  // IT-AAUTH-007: 不正なBearerトークン
  test("GET: 不正なBearerトークンで401エラー", async () => {
    const req = createRequest("GET", undefined, {
      authorization: "Bearer wrong-token",
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
