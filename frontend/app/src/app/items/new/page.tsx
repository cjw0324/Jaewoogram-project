"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewItemPage() {
  const [itemName, setItemName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrls: string[] = [];

      // 1. presigned URL 요청
      if (files.length > 0) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-urls`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              files.map((file) => ({
                filename: file.name,
                contentType: file.type,
              }))
            ),
          }
        );

        const presigned = await res.json();

        // 2. S3로 직접 업로드
        await Promise.all(
          presigned.map((entry: { url: string; s3Url: string }, idx: number) =>
            fetch(entry.url, {
              method: "PUT",
              headers: {
                "Content-Type": files[idx].type,
              },
              body: files[idx],
            })
          )
        );

        imageUrls = presigned.map((entry: { s3Url: string }) => entry.s3Url);
      }

      // 3. 아이템 생성 API 호출
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName,
          imageUrls,
        }),
      });

      if (!res.ok) throw new Error("아이템 생성에 실패했습니다");

      router.push("/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      console.error("Failed to create item:", err);
      setLoading(false);
    }
  };

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
                {/* 아이템 이름 */}
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

                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이미지 첨부
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                      }
                    }}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  />
                </div>

                {/* 버튼 */}
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

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              도움말
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              이 화면에서 새로운 아이템을 생성할 수 있습니다. 이름을 입력하고
              이미지를 첨부한 후 생성 버튼을 누르세요.
            </p>
          </div>
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
