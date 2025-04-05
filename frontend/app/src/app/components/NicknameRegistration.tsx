"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NicknameRegistration() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Get the token from localStorage after component mounts
    const token = localStorage.getItem("auth_access_token");
    setAccessToken(token);

    // If no token is found, redirect to login
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    if (!accessToken) {
      setError("인증 토큰이 없습니다. 다시 로그인해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // Use the exact URL format as seen in the network tab
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/nickname`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          // Add CORS headers
          Accept: "application/json",
          Origin: window.location.origin,
        },
        body: JSON.stringify({ nickname }),
        // Change to 'same-origin' to match the policy shown in the screenshot
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "닉네임 등록에 실패했습니다.");
      }

      // 성공적으로 닉네임이 저장되면 메인 페이지로 리다이렉트
      router.push("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "닉네임 등록 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">닉네임 등록</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="block mb-2 text-sm font-medium"
            >
              사용할 닉네임을 입력해주세요
            </label>
            <input
              type="text"
              id="nickname"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLoading}
              placeholder="닉네임"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !accessToken}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "처리 중..." : "등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
