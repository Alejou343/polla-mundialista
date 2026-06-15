import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1117",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "9999px",
          background: "radial-gradient(circle at 35% 30%, #fef9c3 0%, #fde047 55%, #d97706 100%)",
          border: "2px solid #0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            background: "#0d1117",
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
