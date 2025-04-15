"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Search } from "lucide-react";

interface UserDto {
  id: number;
  nickname: string;
}

interface FollowListResponseDto {
  totalCount: number;
  users: UserDto[];
}

export default function FollowersPage() {
  const [followers, setFollowers] = useState<UserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/followers`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("팔로워 목록을 불러오지 못했습니다.");
        const data: FollowListResponseDto = await res.json();
        setFollowers(data.users);
        setTotalCount(data.totalCount);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const handleBack = () => {
    router.back();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-white max-w-md mx-auto border-x border-gray-200">
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
    );

  if (error)
    return (
      <div className="p-4 text-center max-w-md mx-auto min-h-screen border-x border-gray-200">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-500 text-sm font-semibold"
        >
          돌아가기
        </button>
      </div>
    );

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen max-w-md mx-auto border-x border-gray-200">
        {/* 헤더 */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center px-3 py-3">
            <button onClick={handleBack} className="mr-2">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold flex-1">
              팔로워 {totalCount}명
            </h1>
          </div>

          {/* 검색창 (인스타그램 스타일) */}
          <div className="px-3 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-lg text-sm border-none focus:ring-0 focus:bg-gray-200"
                placeholder="검색"
              />
            </div>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-3">
          {followers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">팔로워가 없습니다</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {followers.map((user) => (
                <li
                  key={user.id}
                  className="py-2.5 flex items-center"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  {/* 프로필 이미지 (아바타 대체) */}
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 cursor-pointer">
                    <span className="font-medium text-sm">{user.nickname}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
