"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const previewUrls = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content, imageUrls }),
      });

      if (!res.ok) throw new Error("게시글 생성 실패");

      const postId = await res.json();
      router.push(`/posts/${postId}`);
    } catch (err) {
      console.error("❌ 에러:", err);
      setError(err instanceof Error ? err.message : "오류 발생");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex flex-col items-center">
        {/* 헤더 (인스타그램 스타일) */}
        <header className="w-full bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-10">
          <div className="max-w-xl mx-auto flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="text-black font-semibold"
            >
              취소
            </button>
            <h1 className="text-base font-semibold text-black">새 게시물</h1>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="text-blue-500 font-semibold disabled:opacity-60"
            >
              {loading ? "게시 중..." : "공유"}
            </button>
          </div>
        </header>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full max-w-xl mt-2 px-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          </div>
        )}

        {/* 메인 폼 */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-4 space-y-5">
          {/* 이미지 섹션 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">
                이미지
              </label>
              <label className="text-sm font-medium text-blue-500 cursor-pointer">
                추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* 이미지 미리보기 */}
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`미리보기 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => swapImages(idx, idx - 1)}
                          className="bg-black bg-opacity-60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          ←
                        </button>
                      )}
                      {idx < previewUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={() => swapImages(idx, idx + 1)}
                          className="bg-black bg-opacity-60 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  사진을 추가해 주세요
                </p>
                <label className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg cursor-pointer">
                  갤러리에서 선택
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* 제목 입력 */}
          <div className="border-t border-gray-200 pt-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-2 border-0 text-base font-medium placeholder-gray-400 focus:ring-0"
              placeholder="제목 추가..."
              required
            />
          </div>

          {/* 내용 입력 */}
          <div className="border-t border-gray-200 pt-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-0 py-2 border-0 text-base placeholder-gray-400 focus:ring-0 h-40 resize-none"
              placeholder="내용을 입력하세요..."
            />
          </div>

          {/* 모바일에서는 헤더에 버튼을 사용하므로 이 버튼은 화면이 넓을 때만 표시 */}
          <div className="hidden md:block">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "게시 중..." : "게시하기"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
