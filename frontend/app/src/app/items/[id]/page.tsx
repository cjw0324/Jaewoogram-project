"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ItemResponseDto } from "../../types/item";
import Link from "next/link";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<ItemResponseDto | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 캐러셀 상태

  const fetchItem = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`
      );
      const data = await res.json();
      setItem(data);
    } catch (error) {
      console.error("Failed to fetch item:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}/likes`
      );
      const data = await res.json();
      setLikeCount(data);
    } catch (error) {
      console.error("Failed to fetch like count:", error);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}/like`, {
        method: "POST",
      });
      await fetchLikeCount();
    } catch (error) {
      console.error("Failed to like item:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        const deletedItem = await res.json();
        console.log("삭제된 아이템:", deletedItem);
        router.push("/items");
      } else {
        throw new Error("아이템 삭제에 실패했습니다");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    fetchItem();
    fetchLikeCount();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              API 대시보드
            </Link>
          </h1>
          <nav>
            <Link
              href="/items"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              아이템 목록
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/items"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ) : item ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {item.itemName}
                  </h2>

                  {/* ✅ 이미지 캐러셀 */}
                  {item.imageUrls && item.imageUrls.length > 0 && (
                    <div className="mb-6 relative">
                      <img
                        src={item.imageUrls[currentImageIndex]}
                        alt={`이미지 ${currentImageIndex + 1}`}
                        className="w-full h-64 object-contain bg-white rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                      />

                      {item.imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === 0
                                  ? item.imageUrls.length - 1
                                  : prev - 1
                              )
                            }
                            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-r hover:bg-black/50"
                          >
                            ◀
                          </button>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) =>
                                prev === item.imageUrls.length - 1
                                  ? 0
                                  : prev + 1
                              )
                            }
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-l hover:bg-black/50"
                          >
                            ▶
                          </button>
                        </>
                      )}

                      <div className="flex justify-center mt-2 space-x-1">
                        {item.imageUrls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full ${
                              idx === currentImageIndex
                                ? "bg-blue-600"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          ></button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 아이템 정보 카드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        아이템 ID
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.itemId}
                      </p>
                    </div>

                    <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-100 dark:border-pink-800">
                      <h3 className="text-sm font-medium text-pink-800 dark:text-pink-300 mb-1">
                        좋아요
                      </h3>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
                          {likeCount}
                        </span>
                        <span className="text-pink-500 dark:text-pink-400">
                          ❤️
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-70"
                  >
                    {likeLoading ? "처리 중..." : "좋아요"}
                  </button>

                  <Link
                    href={`/items/${id}/edit`}
                    className="px-4 py-2 border text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    수정하기
                  </Link>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                아이템을 찾을 수 없습니다.
              </p>
            </div>
          )}

          {/* 삭제 확인 모달 */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  정말 삭제하시겠습니까?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-70"
                  >
                    {deleteLoading ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} API 대시보드. 모든 권리 보유.
        </div>
      </footer>
    </div>
  );
}
