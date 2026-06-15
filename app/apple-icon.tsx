import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 0%, #1a2230 0%, #0d1117 55%, #06110b 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "9999px",
            background: "radial-gradient(circle at 35% 30%, #fef9c3 0%, #fde047 55%, #d97706 100%)",
            border: "3px solid #0d1117",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px 0 rgba(250,204,21,0.45)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#0d1117",
              clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
          />
        </div>
        <div
          style={{
            color: "#fde047",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 3,
            fontFamily: "Impact, sans-serif",
          }}
        >
          PF26
        </div>
      </div>
    </div>,
    { ...size },
  );
}
