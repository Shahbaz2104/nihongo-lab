import { ImageResponse } from "next/og";

export const alt = "Nihongo Lab — interactive Japanese learning lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#17130e",
          backgroundImage:
            "radial-gradient(ellipse at 85% 20%, rgba(232,96,63,0.12) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(147,168,218,0.07) 0%, transparent 45%)",
          color: "#eae3d2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 9999,
              border: "7px solid #e8603f",
              borderRightColor: "transparent",
              borderBottomColor: "#e8603f55",
              transform: "rotate(-30deg)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
              Nihongo Lab
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 26,
                color: "#a5977c",
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              Japanese learning lab
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 34,
            color: "#eae3d2",
            lineHeight: 1.35,
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span>Kana, kanji, and JLPT vocab —</span>
          <span style={{ display: "flex", alignItems: "baseline" }}>
            <span>with a from-scratch</span>
            <span style={{ color: "#e8603f", fontWeight: 700, margin: "0 10px" }}>SM-2</span>
            <span>spaced-repetition engine.</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["8,300+ words", "2,200+ kanji", "Graded stories", "73 tests"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 9999,
                border: "1px solid #3a3121",
                backgroundColor: "#201a13",
                color: "#a5977c",
                fontSize: 24,
                fontWeight: 500,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
