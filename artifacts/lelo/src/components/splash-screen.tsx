import { useEffect, useState } from "react";
import logoUrl from "../assets/bashak-logo.png";

const SPLASH_DURATION = 2000;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_DURATION - 500);
    const doneTimer = setTimeout(() => onDone(), SPLASH_DURATION);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.5s ease-in-out",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 18px #d4af3788); }
          50%       { transform: scale(1.06); filter: drop-shadow(0 0 36px #d4af37cc); }
        }
        @keyframes splash-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes splash-bar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splash-dots {
          0%, 20%  { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
          80%,100% { opacity: 0.2; transform: scale(0.8); }
        }
      `}</style>

      <div
        style={{
          animation: "splash-pulse 1.8s ease-in-out infinite",
          willChange: "transform, filter",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "1.25rem",
            padding: "1.5rem 2.5rem",
            boxShadow: "0 0 60px rgba(212,175,55,0.12)",
          }}
        >
          <img
            src={logoUrl}
            alt="Bashak Developments"
            style={{
              width: "200px",
              height: "72px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      </div>

      <p
        style={{
          fontFamily: "'Tajawal', 'Inter', sans-serif",
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.2em",
          background: "linear-gradient(90deg, #8b7340 0%, #d4af37 30%, #f5e9c8 50%, #d4af37 70%, #8b7340 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "splash-shimmer 2s linear infinite",
        }}
      >
        BASHAK DEVELOPMENTS
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "160px",
            height: "2px",
            background: "rgba(212,175,55,0.15)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #8b7340, #d4af37, #f5e9c8, #d4af37)",
              borderRadius: "999px",
              animation: `splash-bar ${SPLASH_DURATION}ms ease-in-out forwards`,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#d4af37",
                animation: `splash-dots 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
