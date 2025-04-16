"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Lock } from "lucide-react";
import Image from "next/image";

interface UserDto {
  id: number;
  nickname: string;
  // 필요한 경우 더 많은 필드를 추가할 수 있습니다
}

export default function FollowersPage() {
  const [followers, setFollowers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();
  const params = useParams();
  const userId =
    typeof params.userId === "string"
      ? params.userId
      : Array.isArray(params.userId)
      ? params.userId[0]
      : "";

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/followers`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              showUserId: userId || "", // 백엔드 API로 userId 전달
            },
          }
        );

        // 403 에러 처리
        if (res.status === 403) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("팔로워 목록을 불러오지 못했습니다.");
        }

        const data = await res.json();
        setFollowers(data.users || []); // API 응답 구조에 맞게 조정
        setTotalCount(data.totalCount || 0);
      } catch (err: any) {
        console.error("팔로워 목록 조회 중 오류 발생:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFollowers();
    }
  }, [userId]); // userId가 변경될 때마다 다시 호출

  const handleBack = () => {
    router.back();
  };

  if (loading) {
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
  }

  if (error) {
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
  }

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen max-w-md mx-auto border-x border-gray-200">
        {/* 헤더 */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center px-3 py-3">
            <button onClick={handleBack} className="mr-2">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold">
              팔로워 {!forbidden && totalCount > 0 && `${totalCount}명`}
            </h1>
          </div>
        </header>

        {/* 본문 */}
        <div className="px-3">
          {forbidden ? (
            // 권한 없음 UI
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Lock size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-semibold mb-1">권한이 없습니다</p>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                이 계정의 팔로워 목록을 볼 수 있는 권한이 없습니다.
              </p>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">팔로워가 없습니다</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {followers.map((user) => (
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
                    className="text-xs font-semibold text-gray-600 py-1 px-2.5 rounded-md border border-gray-300"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    보기
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
