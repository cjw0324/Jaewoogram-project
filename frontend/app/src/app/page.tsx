"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthProvider";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";

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

  useEffect(() => {
    fetchMainInfo();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 pb-16">
        <div className="max-w-xl mx-auto">
          {/* 피드 영역 */}
          <div className="py-2">
            {/* 서버 정보 카드 */}
            <div className="mb-4">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings size={18} className="text-blue-600" />
                  </div>
                  <div className="font-semibold">서버 정보</div>
                </div>
              </div>
              <div className="px-4 py-3">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
                    {error}
                  </div>
                ) : serverInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start py-1 border-b border-gray-100">
                      <span className="text-gray-500 w-24 flex-shrink-0 mt-1">
                        메시지
                      </span>
                      <pre className="ml-6 whitespace-pre-wrap text-sm">
                        {serverInfo.message}
                      </pre>
                    </div>

                    <p className="flex items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500 w-24 flex-shrink-0">
                        버전
                      </span>
                      <span className="ml-6">{serverInfo.version}</span>
                    </p>
                    <p className="flex items-center py-1">
                      <span className="text-gray-500 w-24 flex-shrink-0">
                        타임스탬프
                      </span>
                      <span className="ml-6">{serverInfo.timestamp}</span>
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="px-4 py-2 flex justify-between border-t border-gray-100">
                {user && (
                  <button
                    onClick={logout}
                    className="text-red-500 font-medium text-sm flex items-center"
                  >
                    <LogOut size={14} className="mr-1" />
                    로그아웃
                  </button>
                )}
              </div>
            </div>

            {user && (
              <div className="mb-4 border-t border-b border-gray-100">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div className="font-semibold">사용자 정보</div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">이메일</span>
                      <span>{user.email}</span>
                    </p>
                    <p className="flex justify-between py-1">
                      <span className="text-gray-500">닉네임</span>
                      <span>{user.nickname}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 서비스 정보 */}
            <div className="grid grid-cols-1 gap-4 px-4 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium mb-2">서비스 안내</h3>
                <p className="text-gray-600 text-sm">
                  환영합니다! 서비스를 이용하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-10">
        <div className="max-w-xl mx-auto flex justify-around">
          <button className="p-2 text-black">
            <Home size={24} />
          </button>
          <button
            className="p-2 text-gray-400"
            onClick={() => router.push("/users/search")}
          >
            <Search size={24} />
          </button>
          <button
            className="p-2 text-gray-400"
            onClick={() => router.push("/posts/new")}
          >
            <PlusSquare size={24} />
          </button>
          <button className="p-2 text-gray-400">
            <Heart size={24} />
          </button>
          <button
            className="p-2 text-gray-400"
            onClick={() =>
              user ? router.push(`/users/${user.id}`) : router.push("/login")
            }
          >
            <User size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}
