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
        background: "radial-gradient(circle at 50% 20%, #1a2230 0%, #0d1117 60%, #06110b 100%)",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: "9999px",
          background: "radial-gradient(circle at 38% 32%, #ffffff 0%, #f1f5f9 65%, #c4cad3 100%)",
          border: "2px solid #38bdf8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px 2px rgba(56,189,248,0.45), inset 0 0 0 1px rgba(13,17,23,0.35)",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            background: "#0d1117",
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
