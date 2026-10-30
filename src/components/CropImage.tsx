"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_CROP_IMAGE, getCropBlur } from "@/lib/cropImages";

interface CropImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  preload?: boolean;
  sizes?: string;
}

export function CropImage({
  src,
  alt,
  className = "h-full w-full object-cover",
  containerClassName = "relative h-full w-full overflow-hidden bg-page/30",
  priority = false,
  preload = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw",
}: CropImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_CROP_IMAGE);
  const [hasError, setHasError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(src || DEFAULT_CROP_IMAGE);
    setHasError(false);
  }

  const handleError = () => {
    if (!hasError) {
      if (imgSrc !== DEFAULT_CROP_IMAGE) {
        setImgSrc(DEFAULT_CROP_IMAGE);
      } else {
        setHasError(true);
      }
    }
  };

  const blur = getCropBlur(src || imgSrc);
  const shouldPreload = preload || priority;

  return (
    <div className={containerClassName}>
      {!hasError ? (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes}
          preload={shouldPreload}
          placeholder={blur ? "blur" : "empty"}
          blurDataURL={blur}
          onError={handleError}
          className={`${className} transition-all duration-300`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent-soft/30 p-2 text-center text-xs text-ink-2">
          <svg className="mb-1 h-6 w-6 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20a8 8 0 018 8c0 4-4 8-8 12M12 2a8 8 0 00-8 8c0 4 4 8 8 12" />
          </svg>
          <span className="line-clamp-1 font-medium">{alt}</span>
        </div>
      )}
    </div>
  );
}
