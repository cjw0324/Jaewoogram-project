"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Search, X } from "lucide-react";

interface UserDto {
  id: number;
  nickname: string;
}

export default function UserSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // debounce 함수: 타이핑이 멈춘 후 일정 시간이 지난 후에만 검색 요청
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // 검색 함수
  const fetchSearchResults = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/search?nickname=${term}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("검색 실패");

      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // debounce된 검색 함수
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      fetchSearchResults(term);
    }, 300), // 300ms 딜레이
    [fetchSearchResults]
  );

  // 검색어가 변경될 때마다 debounce된 검색 함수 호출
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setResults([]);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen max-w-md mx-auto border-x border-gray-200">
        {/* 헤더 */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center px-3 py-3">
            <button onClick={handleBack} className="mr-2">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold flex-1">유저 검색</h1>
          </div>

          {/* 검색창 */}
          <div className="px-3 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-100 w-full pl-10 pr-10 py-2 rounded-lg text-sm border-none focus:ring-0 focus:bg-gray-200"
                placeholder="닉네임으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-3">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse mx-1"></div>
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-pulse mx-1"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-pulse mx-1"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && searchTerm.trim() && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                "{searchTerm}"에 대한 검색 결과가 없습니다
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {results.map((user) => (
                <li
                  key={user.id}
                  className="py-2.5 flex items-center cursor-pointer"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  {/* 프로필 이미지 (아바타 대체) */}
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <span className="font-medium text-sm">{user.nickname}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!searchTerm.trim() && (
            <div className="py-6 text-center">
              <p className="text-gray-500 text-sm">사용자를 검색해보세요</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
