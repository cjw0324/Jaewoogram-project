// src/lib/auth/refreshToken.ts
export async function refreshToken(): Promise<boolean> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiBaseUrl}/auth/reissue`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return false;

    console.log("✅ refreshToken 성공");
    return true;
  } catch (e) {
    console.error("refreshToken 오류", e);
    return false;
  }
}
