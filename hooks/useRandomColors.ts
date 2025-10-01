"use client";

import { useEffect, useState } from "react";

const COLOR_OPTIONS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-violet-500",
];

interface UseRandomColorsOptions {
  count: number;
  fallbackColor?: string;
}

export function useRandomColors({
  count,
  fallbackColor = "bg-gray-300",
}: UseRandomColorsOptions) {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    // クライアントサイドでのみランダムな色を生成
    const generatedColors = Array.from(
      { length: count },
      () => COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    );

    setColors(generatedColors);
  }, [count]);

  // 色が未生成の場合はフォールバック色を返す
  const getColor = (index: number): string => {
    return colors[index] || fallbackColor;
  };

  return {
    colors,
    getColor,
    isReady: colors.length > 0,
  };
}
