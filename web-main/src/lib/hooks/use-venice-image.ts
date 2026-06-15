"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "zkpull_bounty_images";

export type GeneratedImage = {
  imageBase64: string | null;
  format: string;
  seed: number;
  generatedAt: string;
  error?: string;
};

export type VeniceImageState = {
  isGenerating: boolean;
  generatedImage: GeneratedImage | null;
  error: string | null;
  imageCache: Record<string, GeneratedImage>;
};

function loadCache(): Record<string, GeneratedImage> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, GeneratedImage>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

export function getCachedBountyImage(projectName: string): GeneratedImage | null {
  const cache = loadCache();
  return cache[projectName.trim().toLowerCase()] || null;
}

export function getCachedBountyImageUrl(projectName: string): string | null {
  const img = getCachedBountyImage(projectName);
  if (!img?.imageBase64) return null;
  return `data:image/${img.format};base64,${img.imageBase64}`;
}

export function useVeniceImage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_ZK_BACKEND_CHAT ||
    process.env.NEXT_PUBLIC_ZK_BACKEND_GENERATE_PROOF?.replace(
      "/generate-proof",
      ""
    ) ||
    "http://localhost:5000";

  const [state, setState] = useState<VeniceImageState>(() => ({
    isGenerating: false,
    generatedImage: null,
    error: null,
    imageCache: loadCache(),
  }));

  const generateImage = useCallback(
    async ({
      projectName,
      description,
      repoLink,
    }: {
      projectName: string;
      description?: string;
      repoLink?: string;
    }) => {
      if (!projectName.trim()) {
        setState((prev) => ({ ...prev, error: "Project name is required" }));
        return;
      }

      const cacheKey = projectName.trim().toLowerCase();

      const cached = state.imageCache[cacheKey];
      if (cached) {
        setState((prev) => ({
          ...prev,
          generatedImage: cached,
          error: null,
        }));
        return cached;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
      }));

      try {
        const response = await fetch(
          `${backendUrl}/api/venice/generate-image`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectName: projectName.trim(),
              description: description || "",
              repoLink: repoLink || "",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data: GeneratedImage = await response.json();

        const newCache = {
          ...state.imageCache,
          [cacheKey]: data,
        };
        saveCache(newCache);

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generatedImage: data,
          error: data.error || null,
          imageCache: newCache,
        }));

        return data;
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to generate image";

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMsg,
        }));

        return null;
      }
    },
    [backendUrl, state.imageCache]
  );

  const clearImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      generatedImage: null,
      error: null,
    }));
  }, []);

  const getDataUrl = useCallback(() => {
    if (!state.generatedImage?.imageBase64) return null;
    return `data:image/${state.generatedImage.format};base64,${state.generatedImage.imageBase64}`;
  }, [state.generatedImage]);

  return {
    ...state,
    generateImage,
    clearImage,
    getDataUrl,
  };
}
