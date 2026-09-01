import confetti from "canvas-confetti";

export type ReactionType = "SAVAGE" | "MID" | "CRINGE";

/**
 * Triggers a 2D Canvas confetti burst with tailored brand color palette & particle physics
 */
export function triggerConfettiBurst(brandColor: string = "#3b82f6") {
  // Center-bottom origin burst
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: [brandColor, "#f59e0b", "#ec4899", "#3b82f6", "#10b981"],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
}

/**
 * Creates floating emoji particle bursts on screen at click coordinates
 */
export function triggerEmojiExplosion(
  reactionType: ReactionType,
  clickEvent?: React.MouseEvent | { clientX: number; clientY: number }
) {
  const emojisMap: Record<ReactionType, string[]> = {
    SAVAGE: ["🔥", "💥", "⚡️", "🌶️", "👑"],
    MID: ["🥱", "💨", "💤", "😐", "🥔"],
    CRINGE: ["💀", "☠️", "⚰️", "🤡", "📉"],
  };

  const emojis = emojisMap[reactionType] || ["🔥"];

  // Determine origin coordinates
  const originX = clickEvent ? clickEvent.clientX : window.innerWidth / 2;
  const originY = clickEvent ? clickEvent.clientY : window.innerHeight / 2;

  // Create 12 floating particle elements
  for (let i = 0; i < 14; i++) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const particle = document.createElement("span");
    particle.innerText = emoji;

    // Apply floating particle inline styles
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 120;
    const destX = Math.cos(randomAngle) * distance;
    const destY = Math.sin(randomAngle) * distance - 80; // Upward biased trajectory
    const duration = 0.8 + Math.random() * 0.6;
    const size = 20 + Math.random() * 18;

    Object.assign(particle.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      fontSize: `${size}px`,
      pointerEvents: "none",
      zIndex: "9999",
      transform: "translate(-50%, -50%) scale(0.5)",
      transition: `all ${duration}s cubic-bezier(0.1, 0.8, 0.3, 1)`,
      opacity: "1",
    });

    document.body.appendChild(particle);

    // Trigger CSS animation frame
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${destX}px, ${destY}px) scale(1.4) rotate(${
        (Math.random() - 0.5) * 60
      }deg)`;
      particle.style.opacity = "0";
    });

    // Clean up DOM node after animation finishes
    setTimeout(() => {
      if (document.body.contains(particle)) {
        document.body.removeChild(particle);
      }
    }, duration * 1000 + 100);
  }
}
