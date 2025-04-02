"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ItemResponseDto } from "../types/item";

export default function ItemListPage() {
  const [items, setItems] = useState<ItemResponseDto[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // 아이템 목록 조회
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await api.get<ItemResponseDto[]>("/items");
        setItems(data);
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 각 아이템별 좋아요 수 조회 (캐시 기준)
  useEffect(() => {
    const fetchLikeCounts = async () => {
      const newCounts: Record<number, number> = {};

      await Promise.all(
        items.map(async (item) => {
          try {
            const count = await api.get<number>(`/items/${item.itemId}/likes`);
            newCounts[item.itemId] = count;
          } catch (e) {
            console.error(`Failed to fetch like count for item ${item.itemId}`);
          }
        })
      );

      setLikeCounts(newCounts);
    };

    if (items.length > 0) fetchLikeCounts();
  }, [items]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">전체 아이템 목록</h1>
        <Link href="/items/new" className="text-blue-600 hover:underline">
          + 아이템 생성
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">아이템이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.itemId}
              className="border p-4 rounded shadow-sm hover:shadow-md transition"
            >
              <Link href={`/items/${item.itemId}`} className="block">
                <p className="font-semibold text-lg">{item.itemName}</p>
                <p className="text-sm text-gray-600">
                  좋아요 {likeCounts[item.itemId] ?? item.likeCount}개
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
