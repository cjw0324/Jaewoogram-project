"use client";

import { useEffect, useState } from "react";

interface MainResponse {
  message: string;
  version: string;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<MainResponse | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
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
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center text-base sm:text-left">
          <p className="mb-4 font-semibold">✅ 응답 결과:</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded max-w-md overflow-auto">
            <p>
              <strong>Message:</strong> {data?.message}
            </p>
            <p>
              <strong>Version:</strong> {data?.version}
            </p>
            <p>
              <strong>Timestamp:</strong> {data?.timestamp}
            </p>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* Footer 생략 */}
      </footer>
    </div>
  );
}
