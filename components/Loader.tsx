"use client";

import React from "react";

type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  size?: LoaderSize;
  label?: string;
  className?: string;
  fullscreen?: boolean;
}

const SIZE_PX: Record<LoaderSize, number> = {
  sm: 48,
  md: 96,
  lg: 160,
};

const LOGO_URL = "https://mundial.hes-abo.com/assets/fwc-logo-04d254fa.webp";

export default function Loader({
  size = "md",
  label = "Cargando",
  className = "",
  fullscreen = false,
}: LoaderProps) {
  const px = SIZE_PX[size];
  const [imgFailed, setImgFailed] = React.useState(false);

  const style: React.CSSProperties = {
    width: px,
    height: px,
    ["--loader-size" as string]: `${px}px`,
    ["--orbit-r" as string]: `${px * 0.44}px`,
    ["--satellite" as string]: `${Math.max(4, px * 0.075)}px`,
    ["--logo" as string]: `${px * 0.52}px`,
    ["--trophy" as string]: "#38bdf8",
    ["--pitch" as string]: "#015816",
    ["--stadium" as string]: "#0d1117",
  };

  const loader = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`relative inline-grid place-items-center ${className}`}
      style={style}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(1,88,22,0) 55%, rgba(1,88,22,0.35) 70%, rgba(1,88,22,0) 78%)",
        }}
      />

      <span
        aria-hidden
        className="absolute inset-[8%] rounded-full"
        style={{
          border: "1px solid rgba(56,189,248,0.18)",
          boxShadow: "inset 0 0 12px rgba(56,189,248,0.08), 0 0 18px rgba(56,189,248,0.06)",
        }}
      />

      <span aria-hidden className="loader-orbit loader-orbit--a">
        <span className="loader-sat loader-sat--a" />
      </span>

      <span aria-hidden className="loader-orbit loader-orbit--b">
        <span className="loader-sat loader-sat--b" />
      </span>

      <span
        aria-hidden
        className="loader-core relative grid place-items-center rounded-full"
        style={{
          width: "var(--logo)",
          height: "var(--logo)",
        }}
      >
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LOGO_URL}
            alt=""
            width={px * 0.52}
            height={px * 0.52}
            decoding="async"
            draggable={false}
            onError={() => setImgFailed(true)}
            className="loader-logo block h-full w-full select-none object-contain"
          />
        ) : (
          <span
            className="block h-full w-full rounded-full"
            style={{
              border: "2px solid var(--trophy)",
              boxShadow: "0 0 12px rgba(56,189,248,0.45), inset 0 0 8px rgba(56,189,248,0.25)",
            }}
          />
        )}
      </span>

      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        className="fixed inset-0 z-50 grid place-items-center"
        style={{
          background:
            "radial-gradient(circle at center, rgba(13,17,23,0.75) 0%, rgba(13,17,23,0.92) 70%)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        {loader}
      </div>
    );
  }

  return loader;
}
