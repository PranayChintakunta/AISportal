const COLORS = ["#2f5fe8", "#f2a968", "#9f95c7", "#4f7bff", "#356b2e"];
const PIECE_COUNT = 14;

// A small celebratory burst at a screen position (e.g. the button someone
// just clicked). Pure DOM + CSS — no canvas, no dependency — pieces attach
// to <body>, fly outward via .confetti-piece's keyframe (see globals.css),
// then remove themselves when the animation ends.
export function burstConfetti(x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < PIECE_COUNT; i++) {
    const el = document.createElement("span");
    el.className = "confetti-piece";

    const angle = (Math.PI * 2 * i) / PIECE_COUNT + (Math.random() - 0.5) * 0.6;
    const distance = 40 + Math.random() * 55;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 25; // slight upward bias

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
    el.style.setProperty("--rot", `${Math.random() * 360}deg`);
    el.style.width = `${5 + Math.random() * 4}px`;
    el.style.height = `${3 + Math.random() * 3}px`;
    el.style.backgroundColor = COLORS[i % COLORS.length];
    el.style.animationDelay = `${Math.random() * 60}ms`;

    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
}
