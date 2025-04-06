"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewItemPage() {
  const [itemName, setItemName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🧠 미리보기 URL 생성
  const previewUrls = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  // 🧹 메모리 누수 방지
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      fileRef.current = selected;
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    fileRef.current = newFiles;
  };

  const swapImages = (i: number, j: number) => {
    const newFiles = [...files];
    [newFiles[i], newFiles[j]] = [newFiles[j], newFiles[i]];
    setFiles(newFiles);
    fileRef.current = newFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls: string[] = [];
      const selectedFiles = fileRef.current;

      if (selectedFiles.length > 0) {
        const presignedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-urls`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(
              selectedFiles.map((file) => ({
                filename: file.name,
                contentType: file.type,
              }))
            ),
          }
        );

        const presigned = await presignedRes.json();

        const uploadedUrls = await Promise.all(
          presigned.map(
            async (entry: { url: string; s3Url: string }, idx: number) => {
              const uploadRes = await fetch(entry.url, {
                method: "PUT",
                headers: { "Content-Type": selectedFiles[idx].type },
                body: selectedFiles[idx],
              });

              if (!uploadRes.ok) {
                throw new Error(`${selectedFiles[idx].name} 업로드 실패`);
              }

              return entry.s3Url;
            }
          )
        );

        imageUrls = uploadedUrls;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemName, imageUrls }),
      });

      if (!res.ok) throw new Error("아이템 생성 실패");

      router.push("/items");
    } catch (err) {
      console.error("❌ 에러:", err);
      setError(err instanceof Error ? err.message : "오류 발생");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link
                href="/items"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← 아이템 목록으로 돌아가기
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  새 아이템 생성
                </h2>

                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="itemName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      아이템 이름
                    </label>
                    <input
                      id="itemName"
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      이미지 첨부
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.length > 0 && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        선택된 파일 수: {files.length}
                      </p>
                    )}
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        미리보기
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {previewUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`미리보기 ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            {/* 삭제 버튼 */}
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                            {/* 순서 이동 */}
                            <div className="absolute bottom-1 left-1 flex gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => swapImages(idx, idx - 1)}
                                  className="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"
                                >
                                  ←
                                </button>
                              )}
                              {idx < previewUrls.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => swapImages(idx, idx + 1)}
                                  className="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      href="/items"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200"
                    >
                      취소
                    </Link>
                    <button
                      type="submit"
                      disabled={loading || !itemName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-70"
                    >
                      {loading ? "생성 중..." : "생성하기"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} API 대시보드. 모든 권리 보유.
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
