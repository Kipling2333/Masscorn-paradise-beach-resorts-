"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Reveal } from "@/components/widgets";

interface MediaItem {
  id: number | string;
  imageUrl?: string | null;
  image_url?: string | null;
  title?: string | null;
  category?: string | null;
}

export function DynamicGalleryGrid() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setImages(data.images || []);
        }
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center font-display text-lg text-ivory/60">
        Loading resort gallery...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="py-20 text-center font-display text-lg text-ivory/60">
        No images uploaded to gallery yet.
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {images.map((it, i) => {
        const src = it.imageUrl || it.image_url;
        const caption = it.title || "Resort Gallery";
        if (!src) return null;

        return (
          <Reveal key={it.id || i} delay={0.04 * (i % 3)}>
            <figure className="group relative overflow-hidden rounded-2xl break-inside-avoid">
              <img
                src={src}
                alt={caption}
                className={`w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105 ${
                  i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square"
                }`}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/85 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div>
                  <span className="font-display text-lg text-ivory block">{caption}</span>
                  {it.category && (
                    <span className="text-xs uppercase text-gold font-semibold tracking-wider">
                      {it.category}
                    </span>
                  )}
                </div>
                <Camera size={15} className="text-gold shrink-0 ml-2" />
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
    </div>
  );
}