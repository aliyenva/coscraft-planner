import type { Project } from '../types';

// Soft background / text pairs that sit well on white cards.
const TONES: [string, string][] = [
  ['#fce7f3', '#be185d'], // pink
  ['#ede9fe', '#5b21b6'], // lavender
  ['#ccfbf1', '#115e59'], // mint
  ['#fef3c7', '#92400e'], // butter
  ['#e0f2fe', '#075985'], // sky
];

/** "Frieren" -> "F", "2B" -> "2B", "Hatsune Miku" -> "HM" */
export const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  const w = words[0] ?? '?';
  return (w.length <= 3 ? w : w[0]).toUpperCase();
};

export default function Avatar({ project, size = 44 }: { project: Project; size?: number }) {
  const [bg, fg] = TONES[Math.abs(project.id - 1) % TONES.length];
  return (
    <span
      className="avatar"
      aria-hidden
      style={{ background: bg, color: fg, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(project.character)}
    </span>
  );
}
