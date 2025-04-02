"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ItemResponseDto } from "../../types/item";

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<ItemResponseDto | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchItem = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}`
    );
    const data = await res.json();
    setItem(data);
  };

  const fetchLikeCount = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}/likes`
    );
    const data = await res.json();
    setLikeCount(data);
  };

  const handleLike = async () => {
    setLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/items/${id}/like`, {
      method: "POST",
    });
    await fetchLikeCount(); // 캐시에서 바로 최신 값 불러옴
    setLoading(false);
  };

  useEffect(() => {
    fetchItem();
    fetchLikeCount(); // mount 시 좋아요 캐시 조회
  }, [id]);

  if (!item) return <p>Loading...</p>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">📦 아이템 INFO</h1>
      <p>🆔 ID: {item.itemId}</p>
      <p>📝 이름: {item.itemName}</p>
      <p>❤️ 좋아요: {likeCount}</p>

      <button
        onClick={handleLike}
        disabled={loading}
        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
      >
        {loading ? "처리 중..." : "❤️ 좋아요 누르기"}
      </button>
    </div>
  );
}
