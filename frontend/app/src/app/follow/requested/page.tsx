"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

interface UserDto {
  id: number;
  nickname: string;
}

export default function FollowRequestedPage() {
  const [requested, setRequested] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequested = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/requested`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("보낸 요청을 불러오지 못했습니다.");
        const data: UserDto[] = await res.json();
        setRequested(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequested();
  }, []);

  const handleCancel = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/cancel/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setRequested((prev) => prev.filter((r) => r.id !== userId));
      }
    } catch (err) {
      console.error("취소 실패", err);
    }
  };

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
            <h1 className="text-base font-semibold">보낸 팔로우 요청</h1>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-3">
          {requested.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                보낸 팔로우 요청이 없습니다
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requested.map((user) => (
                <li
                  key={user.id}
                  className="py-2.5 flex justify-between items-center"
                >
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    {/* 프로필 이미지 (아바타 대체) */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2.5">
                      {user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{user.nickname}</span>
                  </div>
                  <button
                    onClick={() => handleCancel(user.id)}
                    className="text-xs font-semibold text-blue-500 py-1 px-2.5 rounded-md border border-gray-200"
                  >
                    요청 취소
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
