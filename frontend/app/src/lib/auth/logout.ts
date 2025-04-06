// src/lib/auth/logout.ts
export async function logout(): Promise<void> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.error("logout 오류", e);
  } finally {
    // 클라이언트 상태 초기화
    window.location.href = "/login";
  }
}
