"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthProvider";
import { ChevronLeft } from "lucide-react";

export default function NicknameRegistrationPage() {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, fetchUserInfo } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/user/nickname`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 전송
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "닉네임 등록에 실패했습니다.");
      }

      await fetchUserInfo();
      // 등록 성공 시 홈페이지로 이동
      router.push("/");
    } catch (error: any) {
      setError(error.message || "닉네임 등록 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-200 py-3 px-4 flex items-center">
        <button onClick={() => router.back()} className="p-1 mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-medium flex-1 text-center">
          닉네임 설정
        </h1>
        <div className="w-10"></div> {/* 균형을 위한 빈 공간 */}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* 로고 */}
          <div className="flex justify-center mb-6">
            <div className="text-4xl font-semibold font-serif italic">
              Instagram
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-gray-900">프로필 설정</h2>
            <p className="mt-1 text-sm text-gray-600">
              다른 사용자가 회원님을 알아볼 수 있도록 닉네임을 설정하세요.
            </p>
          </div>

          {/* 닉네임 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
                maxLength={20}
                className="w-full px-4 py-3 border-0 focus:ring-0 text-sm"
                required
              />
            </div>

            <div className="text-xs text-gray-500 flex justify-between px-1">
              <span>{user?.email && `${user.email}로 로그인`}</span>
              <span>{nickname.length}/20</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !nickname.trim()}
              className={`w-full py-2.5 rounded-md text-sm font-medium ${
                nickname.trim() && !isLoading
                  ? "bg-blue-500 text-white"
                  : "bg-blue-200 text-white cursor-default"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  처리 중...
                </div>
              ) : (
                "다음"
              )}
            </button>
          </form>

          {/* 안내 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              나중에 프로필 설정에서 닉네임을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="py-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 Jaewoo's toy project </p>
        </div>
      </footer>
    </div>
  );
}
