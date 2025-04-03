"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ItemResponseDto } from "../../../types/item";
import Link from "next/link";

export default function EditItemPage() {
  const params = useParams();
  const id = params?.id as string; // id가 문자열임을 명시적으로 지정
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // id가 존재하는지 확인
    if (!id) {
      setError("아이템 ID가 없습니다");
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`
        );
        if (!res.ok) {
          throw new Error("아이템을 불러오는데 실패했습니다");
        }
        const data: ItemResponseDto = await res.json();
        setItemName(data.itemName);

        // 이미지 URL이 있으면 설정
        if (data.imageUrls && Array.isArray(data.imageUrls)) {
          setImageUrls(data.imageUrls);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
        console.error("Failed to fetch item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // 이미지 파일이 선택되었을 때 호출되는 함수
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...selectedFiles]);

      // 선택된 파일의 미리보기 URL 생성
      const newPreviewUrls = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  // 이미지 삭제 (기존 이미지)
  const handleRemoveExistingImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 이미지 삭제 (새로 추가된 이미지)
  const handleRemoveNewImage = (index: number) => {
    // 미리보기 URL 해제
    URL.revokeObjectURL(previewUrls[index]);

    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 이미지 업로드 함수 (Presigned URL 사용)
  const uploadImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];

    setIsUploading(true);
    const s3Urls: string[] = [];

    try {
      // 1. Presigned URL 요청
      const fileRequests = newImages.map((file) => ({
        filename: file.name,
        contentType: file.type,
      }));

      const presignedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/s3/presigned-urls`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fileRequests),
        }
      );

      if (!presignedResponse.ok) {
        throw new Error("Presigned URL을 가져오는데 실패했습니다");
      }

      const presignedData = await presignedResponse.json();

      // 2. 각 이미지를 Presigned URL을 통해 S3에 업로드
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const { url, s3Url } = presignedData[i];

        // PUT 요청으로 S3에 직접 업로드
        const uploadResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`이미지 업로드 실패: ${file.name}`);
        }

        // 성공적으로 업로드된 S3 URL 저장
        s3Urls.push(s3Url);

        // 업로드 진행 상황 업데이트
        setUploadProgress(Math.round(((i + 1) / newImages.length) * 100));
      }

      return s3Urls;
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1. 새 이미지 업로드 시도
      let allImageUrls = [...imageUrls];

      if (newImages.length > 0) {
        try {
          const uploadedUrls = await uploadImages();
          allImageUrls = [...allImageUrls, ...uploadedUrls];
        } catch (uploadError) {
          console.error(
            "이미지 업로드 실패, 기존 이미지만 유지합니다:",
            uploadError
          );
          // 이미지 업로드에 실패하더라도 기존 이미지만 사용하여 계속 진행
          setError(
            "이미지 업로드에 실패했지만, 기존 정보로 업데이트를 진행합니다."
          );
        }
      }

      // 2. 아이템 정보 업데이트
      const updateData: any = { itemName };

      // API가 imageUrls 필드를 지원하는 경우에만 포함
      if (allImageUrls.length > 0) {
        updateData.imageUrls = allImageUrls;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) {
        throw new Error("아이템 업데이트에 실패했습니다");
      }

      router.push(`/items/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      console.error("Failed to update item:", err);
      setSaving(false);
    }
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleSelectFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
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

      {/* Main content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/items/${id}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              아이템 상세로 돌아가기
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                아이템 수정
              </h2>

              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="아이템 이름을 입력하세요"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      아이템 ID: {id}
                    </p>
                  </div>

                  {/* 이미지 섹션 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이미지
                    </label>

                    {/* 기존 이미지 미리보기 */}
                    {imageUrls.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          기존 이미지
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {imageUrls.map((url, index) => (
                            <div
                              key={`existing-${index}`}
                              className="relative group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                            >
                              <img
                                src={url}
                                alt={`아이템 이미지 ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="이미지 삭제"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 새 이미지 미리보기 */}
                    {previewUrls.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          새 이미지
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {previewUrls.map((url, index) => (
                            <div
                              key={`new-${index}`}
                              className="relative group border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                            >
                              <img
                                src={url}
                                alt={`새 이미지 ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs px-2 py-1">
                                새 이미지
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="이미지 삭제"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 이미지 업로드 버튼 */}
                    <div className="mt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleSelectFilesClick}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                          />
                        </svg>
                        이미지 추가
                      </button>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        * 이미지는 AWS S3에 직접 업로드됩니다. (Presigned URL
                        방식)
                      </p>
                    </div>

                    {/* 업로드 진행 상황 */}
                    {isUploading && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                          {uploadProgress}% 업로드 중...
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      href={`/items/${id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      취소
                    </Link>
                    <button
                      type="submit"
                      disabled={saving || !itemName.trim()}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 transition-colors"
                    >
                      {saving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          수정 완료
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              관련 작업
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/items/${id}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                아이템 상세보기
              </Link>

              <Link
                href="/items"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                아이템 목록으로
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} API 대시보드. 모든 권리 보유.
        </div>
      </footer>
    </div>
  );
}
