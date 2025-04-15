"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";

interface UserDto {
  id: number;
  nickname: string;
}

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/requests`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("요청 목록을 불러오지 못했습니다.");
        const data: UserDto[] = await res.json();
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/${userId}/approve`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== userId));
      }
    } catch (err) {
      console.error("승인 실패", err);
    }
  };

  const handleReject = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/${userId}/reject`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== userId));
      }
    } catch (err) {
      console.error("거절 실패", err);
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
            <h1 className="text-base font-semibold">받은 팔로우 요청</h1>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-3">
          {requests.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                받은 팔로우 요청이 없습니다
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requests.map((user) => (
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReject(user.id)}
                      className="text-xs font-semibold text-gray-500 py-1 px-2.5 rounded-md border border-gray-200"
                    >
                      거절
                    </button>
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="text-xs font-semibold text-white py-1 px-2.5 rounded-md bg-blue-500"
                    >
                      승인
                    </button>
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
