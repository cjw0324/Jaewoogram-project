"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { ChevronLeft, Check, Camera, Lock, Globe } from "lucide-react";

interface UserProfileDto {
  id: number;
  nickname: string;
  private: boolean;
  followerCount: number;
  followingCount: number;
  bio: string;
}

export default function ProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${user.id}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("프로필 조회 실패");
        }

        const data = await res.json();
        setProfile(data);
        setNickname(data.nickname || "");
        setBio(data.bio || "");
      } catch (error) {
        console.error("프로필 조회 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id || saving) return;

    setSaving(true);

    try {
      // 닉네임 변경
      if (nickname !== profile?.nickname) {
        const nicknameRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/nickname`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nickname: nickname.trim() }),
            credentials: "include",
          }
        );

        if (!nicknameRes.ok) {
          throw new Error("닉네임 변경 실패");
        }
      }

      // 프로필 소개 변경
      if (bio !== profile?.bio) {
        const bioRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change/bio`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bio }),
            credentials: "include",
          }
        );

        if (!bioRes.ok) {
          throw new Error("프로필 소개 변경 실패");
        }
      }

      // 성공적으로 저장한 후 프로필 페이지로 돌아가기
      router.push(`/users/${user.id}`);
    } catch (error) {
      console.error("프로필 저장 중 오류 발생:", error);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user?.id) return;

    setStatusLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/change/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            userId: user.id.toString(),
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("상태 변경 요청 실패");
      }

      // 업데이트된 프로필 로드
      const updatedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${user.id}`,
        {
          credentials: "include",
        }
      );

      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setProfile(updatedData);
      }
    } catch (error) {
      console.error("상태 변경 중 오류 발생:", error);
    } finally {
      setStatusLoading(false);
    }
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

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen max-w-md mx-auto border-x border-gray-200">
        {/* 헤더 */}
        <header className="flex items-center px-4 py-3 border-b border-gray-200">
          <button onClick={() => router.back()} className="p-1 mr-4">
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-base font-medium flex-1">프로필 편집</h1>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="text-blue-500 font-semibold disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check size={24} />
            )}
          </button>
        </header>

        <div className="p-4">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                  src="/images/default-profile.png"
                  alt="프로필 이미지"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <Camera size={16} />
              </button>
            </div>
            <button className="text-blue-500 text-sm font-medium">
              프로필 사진 변경
            </button>
          </div>

          {/* 닉네임 폼 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="닉네임을 입력하세요"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">{nickname.length}/20</p>
          </div>

          {/* 소개 폼 */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none"
              placeholder="소개를 입력하세요"
              maxLength={150}
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/150</p>
          </div>

          {/* 프로필 공개 설정 */}
          <div className="border-t border-gray-200 pt-5">
            <h2 className="text-base font-medium mb-4">계정 설정</h2>

            <button
              onClick={handleToggleStatus}
              disabled={statusLoading}
              className="w-full flex items-center justify-between bg-gray-50 text-gray-800 px-4 py-3 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 disabled:opacity-50 mb-3"
            >
              <div className="flex items-center">
                {profile?.private ? (
                  <>
                    <Lock size={16} className="mr-2" />
                    <span>비공개 계정</span>
                  </>
                ) : (
                  <>
                    <Globe size={16} className="mr-2" />
                    <span>공개 계정</span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                <span>{profile?.private ? "비공개" : "공개"}</span>
                {statusLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                )}
              </div>
            </button>

            <p className="text-xs text-gray-500 mb-5">
              {profile?.private
                ? "비공개 계정: 팔로우를 요청한 사용자만 회원님의 게시물과 스토리를 볼 수 있습니다."
                : "공개 계정: 모든 사용자가 회원님의 프로필과 게시물을 볼 수 있습니다."}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
