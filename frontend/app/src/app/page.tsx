"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface MainResponse {
  message: string;
  version: string;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<MainResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessage = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/"
        );
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch:", error);
        setData({
          message: "Failed to fetch data",
          version: "",
          timestamp: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="https://jaewoo-site-s3-bucket.s3.ap-northeast-2.amazonaws.com/logo.jpg"
              alt="API 대시보드 로고"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              API 대시보드
            </h1>
          </div>
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
        <div className="max-w-5xl mx-auto">
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              API 상태 정보
            </h2>

            {loading ? (
              <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      메시지
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                      {data?.message}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                      버전
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {data?.version || "-"}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                      타임스탬프
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {data?.timestamp || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link
                href="/items"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span>전체 아이템 목록 보기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>

              <button
                onClick={() => location.reload()}
                className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>새로고침</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} API 대시보드. contact :
          cchoi00332244@gmail.com.
        </div>
      </footer>
    </div>
  );
}
