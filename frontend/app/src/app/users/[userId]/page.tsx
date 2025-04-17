"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import {
  Grid,
  Lock,
  Globe,
  ChevronLeft,
  Settings,
  Bookmark,
  Users,
} from "lucide-react";

interface UserProfileDto {
  id: number;
  nickname: string;
  private: boolean;
  followerCount: number;
  followingCount: number;
  bio: string;
}

interface UserFeedResponse {
  postId: number;
  imageUrl: string;
}

type FollowState = "FOLLOWING" | "REQUESTED" | "NONE";

export default function UserProfilePage() {
  const { user } = useAuth();
  const myId = user?.id;
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowState | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "tagged">("posts");
  const [feed, setFeed] = useState<UserFeedResponse[] | "FORBIDDEN" | null>(
    null
  );
  const [postCount, setPostCount] = useState<number>(0); // 게시글 수를 저장할 상태 변수

  // 게시글 수를 가져오는 함수
  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/feed/count`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              showUserId: userId,
            },
          }
        );
        if (res.ok) {
          const count = await res.json();
          setPostCount(count);
        }
      } catch (err) {
        console.error("게시글 수 조회 중 오류 발생:", err);
      }
    };

    fetchPostCount();
  }, [userId]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/feed`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              showUserId: userId,
            },
          }
        );
        if (res.status === 403) {
          setFeed("FORBIDDEN");
          setLoading(false);
          return; // 403 에러 시 즉시 함수 종료
        }

        const data = await res.json();
        setFeed(data);
      } catch (err) {
        console.error(err);
        setFeed([]); // 실패했을 때는 빈 피드로 처리
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [userId]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("프로필 조회 실패");
      }
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("프로필 조회 중 오류 발생:", error);
    }
  }, [userId]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/status/${userId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("팔로우 상태 조회 실패");
      }
      const data = await res.json();
      setFollowStatus(data.status);
    } catch (error) {
      console.error("팔로우 상태 조회 중 오류 발생:", error);
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchStatus()]);
      } catch (error) {
        console.error("데이터 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchProfile, fetchStatus]);

  const handleFollow = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("팔로우 요청 실패");
      }
      const data = await res.json();
      setFollowStatus(data.approved ? "FOLLOWING" : "REQUESTED");
      await fetchProfile();
    } catch (error) {
      console.error("팔로우 요청 중 오류 발생:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("언팔로우 요청 실패");
      }
      setFollowStatus("NONE");
      await fetchProfile();
    } catch (error) {
      console.error("언팔로우 요청 중 오류 발생:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/follow/cancel/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("팔로우 요청 취소 실패");
      }
      setFollowStatus("NONE");
      await fetchProfile();
    } catch (error) {
      console.error("팔로우 요청 취소 중 오류 발생:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/rooms/direct?partnerId=${profile?.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("채팅방 생성 실패");
      const roomId = await res.json();
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  const renderFollowButton = () => {
    if (myId?.toString() === userId) return null;

    if (statusLoading) {
      return (
        <button
          disabled
          className="w-full bg-gray-200 text-gray-500 font-semibold px-4 py-1.5 rounded text-sm"
        >
          처리 중...
        </button>
      );
    }

    if (followStatus === "FOLLOWING")
      return (
        <button
          onClick={handleUnfollow}
          className="w-full bg-gray-200 text-gray-800 font-semibold px-4 py-1.5 rounded-md text-sm"
        >
          팔로잉
        </button>
      );

    if (followStatus === "REQUESTED")
      return (
        <button
          onClick={handleCancelRequest}
          className="w-full bg-gray-200 text-gray-800 font-semibold px-4 py-1.5 rounded-md text-sm"
        >
          요청됨
        </button>
      );

    return (
      <button
        onClick={handleFollow}
        className="w-full bg-blue-500 text-white font-semibold px-4 py-1.5 rounded-md text-sm"
      >
        팔로우
      </button>
    );
  };

  if (loading || !profile)
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

  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen max-w-md mx-auto border-x border-gray-200">
        {/* 헤더 */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <button onClick={() => router.back()} className="p-1 mr-4">
            <ChevronLeft size={24} />
          </button>

          <div className="text-base font-semibold flex-1 flex items-center">
            <h1>{profile.nickname}</h1>
            {profile.private && (
              <Lock size={14} className="ml-1.5 text-gray-500" />
            )}
          </div>

          {myId?.toString() === userId ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/profile/edit")}
                className="text-black"
              >
                <Settings size={22} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* <button className="text-black">
                <Users size={22} />
              </button> */}
            </div>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="px-4 py-4">
          <div className="flex mb-5">
            <div className="mr-5">
              <div className="w-20 h-20 rounded-full overflow-hidden relative border-2 border-gray-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <Image
                      src="/images/default-profile.png"
                      alt={profile.nickname}
                      width={80}
                      height={80}
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="font-semibold text-lg">{postCount}</div>
                  <div className="text-xs text-gray-500">게시물</div>
                </div>

                <div
                  className="text-center cursor-pointer"
                  onClick={() => router.push(`/followers/${userId}`)}
                >
                  <div className="font-semibold text-lg">
                    {profile.followerCount}
                  </div>
                  <div className="text-xs text-gray-500">팔로워</div>
                </div>

                <div
                  className="text-center cursor-pointer"
                  onClick={() => router.push(`/followings/${userId}`)}
                >
                  <div className="font-semibold text-lg">
                    {profile.followingCount}
                  </div>
                  <div className="text-xs text-gray-500">팔로잉</div>
                </div>
              </div>

              <div className="mt-4 flex gap-1">
                {myId?.toString() === userId ? (
                  <>
                    <button
                      className="flex-1 bg-gray-100 text-gray-800 font-medium px-2 py-1.5 rounded-md text-sm border border-gray-300"
                      onClick={() => router.push("/profile/edit")}
                    >
                      프로필 편집
                    </button>
                    <button
                      onClick={() => router.push("/follow/requests")}
                      className="flex-1 bg-gray-100 text-gray-800 font-medium px-2 py-1.5 rounded-md text-sm border border-gray-300"
                    >
                      받은 요청
                    </button>

                    <button
                      onClick={() => router.push("/follow/requested")}
                      className="flex-1 bg-gray-100 text-gray-800 font-medium px-2 py-1.5 rounded-md text-sm border border-gray-300"
                    >
                      보낸 요청
                    </button>
                  </>
                ) : (
                  <div className="w-full flex gap-1">
                    {renderFollowButton()}
                    <button
                      onClick={handleSendMessage}
                      className="w-24 bg-gray-100 text-gray-800 font-medium px-4 py-1.5 rounded-md text-sm border border-gray-300"
                    >
                      메시지
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 프로필 소개 */}
          <div className="mb-4 text-sm">
            {profile.bio ? (
              <p className="whitespace-pre-wrap font-medium">{profile.bio}</p>
            ) : null}
          </div>

          {/* 탭 인터페이스 */}
          <div className="border-t border-gray-200">
            <div className="flex justify-around pt-1">
              <button
                className={`p-2 ${
                  activeTab === "posts"
                    ? "text-black border-t-2 border-black"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("posts")}
              >
                <Grid size={22} />
              </button>
              <button
                className={`p-2 ${
                  activeTab === "tagged"
                    ? "text-black border-t-2 border-black"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("tagged")}
              >
                <Bookmark size={22} />
              </button>
            </div>

            {/* 게시물 그리드 */}
            {activeTab === "posts" ? (
              <div className="grid grid-cols-3 gap-px mt-0.5">
                {feed === "FORBIDDEN" ? (
                  // ✅ 권한 없음
                  <div className="col-span-3 py-16 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Lock size={24} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold mb-1">
                      권한이 없습니다
                    </p>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      이 계정의 게시물을 볼 수 있는 권한이 없습니다.
                    </p>
                  </div>
                ) : Array.isArray(feed) && feed.length > 0 ? (
                  // ✅ 게시물 있음
                  feed.map((post) => (
                    <div
                      key={post.postId}
                      className="aspect-square relative cursor-pointer"
                      onClick={() => router.push(`/posts/${post.postId}`)}
                    >
                      <Image
                        src={post.imageUrl || "/images/default-thumbnail.png"}
                        alt={`Post ${post.postId}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  // ✅ 게시물 없음
                  <div className="col-span-3 py-16 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Grid size={24} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold mb-1">게시물 없음</p>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      {myId?.toString() === userId
                        ? "사진이나 동영상을 공유하면 회원님의 프로필에 표시됩니다."
                        : "이 계정에 게시된 사진이나 동영상이 없습니다."}
                    </p>
                    {myId?.toString() === userId && (
                      <button
                        className="mt-6 bg-blue-500 text-white font-medium text-sm px-4 py-2 rounded-md"
                        onClick={() => router.push("/posts/new")}
                      >
                        첫 게시물 공유하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-px mt-0.5">
                <div className="col-span-3 py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Bookmark size={24} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold mb-1">저장됨 없음</p>
                  <p className="text-sm text-gray-500 text-center max-w-xs">
                    저장한 사진과 동영상이 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
