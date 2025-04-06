"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";

export default function HomePage() {
  const { user, logout, loading } = useAuth();
  const [serverInfo, setServerInfo] = useState<{
    message: string;
    version: string;
    timestamp: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMainInfo = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("서버 정보를 가져오는 데 실패했습니다.");
      }

      const data = await response.json();
      setServerInfo(data);
    } catch (err) {
      console.error("메인 페이지 정보 로딩 중 오류:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  const handleGoToItems = () => {
    if (user) {
      router.push("/items");
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchMainInfo();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">메인 페이지</h1>
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              로그인
            </a>
          )}
        </div>

        {/* ✅ 아이템 보기 버튼 */}
        <div className="mb-6">
          <button
            onClick={handleGoToItems}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            아이템 목록 보기
          </button>
        </div>

        {user && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">사용자 정보</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>이메일:</strong> {user.email}
              </p>
              <p>
                <strong>닉네임:</strong> {user.nickname}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">서버 정보</h2>
          {loading ? (
            <p className="animate-pulse text-sm">서버 정보를 불러오는 중...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : serverInfo ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>메시지:</strong> {serverInfo.message}
              </p>
              <p>
                <strong>버전:</strong> {serverInfo.version}
              </p>
              <p>
                <strong>타임스탬프:</strong> {serverInfo.timestamp}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">서비스 안내</h3>
            <p className="text-gray-600 dark:text-gray-300">
              환영합니다! 서비스를 이용하실 수 있습니다.
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">알림</h3>
            <p className="text-gray-600 dark:text-gray-300">
              새로운 알림이 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
