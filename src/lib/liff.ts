"use client";

import type { Liff } from "@line/liff";

let liffInstance: Liff | null = null;

/**
 * LIFF SDK を初期化して返す。
 * 複数回呼ばれても 1 回だけ初期化する。
 */
export async function initLiff(): Promise<Liff> {
  if (liffInstance) return liffInstance;

  const liff = (await import("@line/liff")).default;
  await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
  liffInstance = liff;
  return liff;
}

/**
 * LINE ユーザー ID を取得する。
 * 未ログインの場合、LINE アプリ内・外部ブラウザ両方で LINE ログインへリダイレクトする。
 */
export async function getLineUserId(): Promise<string> {
  const liff = await initLiff();

  if (!liff.isLoggedIn()) {
    // LINE アプリ内・外部ブラウザ両方で LINE ログインへリダイレクト
    liff.login({ redirectUri: window.location.href });
    // login() はリダイレクトするため、ここには到達しない
    throw new Error("Redirecting to LINE login");
  }

  const profile = await liff.getProfile();
  return profile.userId;
}

/**
 * LINE プロフィールを取得する。
 * 未ログインの場合、LINE アプリ内・外部ブラウザ両方で LINE ログインへリダイレクトする。
 */
export async function getLineProfile() {
  const liff = await initLiff();

  if (!liff.isLoggedIn()) {
    // LINE アプリ内・外部ブラウザ両方で LINE ログインへリダイレクト
    liff.login({ redirectUri: window.location.href });
    // login() はリダイレクトするため、ここには到達しない
    throw new Error("Redirecting to LINE login");
  }

  return liff.getProfile();
}
