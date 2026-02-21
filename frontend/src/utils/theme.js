export const T = {
  bg: "#0a0a0a", bg1: "#111111", bg2: "#181818", bg3: "#222222",
  card: "#161616", cardBorder: "rgba(255,255,255,0.07)",
  cream: "#f0ece3", creamDim: "#b8b3a8", creamFaint: "#6b6760",
  red: "#e84040", redGlow: "rgba(232,64,64,0.35)", redFaint: "rgba(232,64,64,0.12)",
  green: "#4ade80", amber: "#f59e0b", blue: "#60a5fa", white: "#fff",
};

export const injectStyles = () => {
  if (document.getElementById("na-styles")) return;
  const s = document.createElement("style");
  s.id = "na-styles";
  s.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0a; font-family: 'DM Sans', sans-serif; color: #f0ece3; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes floatR { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
    @keyframes floatL { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes record-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,64,64,0.5)} 70%{box-shadow:0 0 0 16px rgba(232,64,64,0)} }
    @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.7} }
    @keyframes glow-pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
  `;
  document.head.appendChild(s);
};
