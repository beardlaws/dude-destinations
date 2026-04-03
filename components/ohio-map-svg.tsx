// More accurate Ohio state outline as SVG path
// This is a simplified but recognizable Ohio shape
export function OhioMapSVG() {
  return (
    <svg
      viewBox="0 0 1000 800"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Ohio border - more accurate outline */}
      <path
        d="M 200 150 L 250 140 L 280 135 L 320 130 L 360 125 L 400 120 L 440 115 L 480 118 L 520 120 L 560 118 L 600 115 L 640 120 L 680 125 L 720 130 L 750 140 L 780 155 L 800 180 L 810 210 L 815 240 L 820 280 L 825 320 L 828 360 L 830 400 L 829 440 L 825 480 L 820 520 L 815 560 L 808 600 L 800 630 L 780 660 L 750 675 L 720 680 L 680 682 L 640 680 L 600 682 L 560 680 L 520 682 L 480 680 L 440 682 L 400 680 L 360 682 L 320 680 L 280 682 L 240 680 L 200 675 L 170 660 L 160 630 L 155 600 L 152 560 L 150 520 L 148 480 L 147 440 L 148 400 L 150 360 L 152 320 L 155 280 L 158 240 L 160 210 L 165 180 Z"
        fill="none"
        stroke="oklch(0.72 0.18 48 / 0.15)"
        strokeWidth="2"
        className="drop-shadow-lg"
      />

      {/* Subtle grid overlay */}
      <g stroke="oklch(0.72 0.18 48 / 0.05)" strokeWidth="1" strokeDasharray="5,5">
        <line x1="100" y1="0" x2="100" y2="800" />
        <line x1="300" y1="0" x2="300" y2="800" />
        <line x1="500" y1="0" x2="500" y2="800" />
        <line x1="700" y1="0" x2="700" y2="800" />
        <line x1="900" y1="0" x2="900" y2="800" />
        <line x1="0" y1="200" x2="1000" y2="200" />
        <line x1="0" y1="400" x2="1000" y2="400" />
        <line x1="0" y1="600" x2="1000" y2="600" />
      </g>

      {/* Background tint */}
      <rect width="1000" height="800" fill="oklch(0.11 0.005 60 / 0.5)" />
    </svg>
  );
}
