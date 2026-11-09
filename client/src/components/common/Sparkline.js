export default function Sparkline({ values = [] }) {
  const WIDTH = 160;
  const TOP = 6;
  const BOTTOM = 25;
  const max = Math.max(...values, 0);
  const count = values.length;

  const points = values.map((v, i) => [
    count > 1 ? (i / (count - 1)) * WIDTH : WIDTH,
    max > 0 ? BOTTOM - (v / max) * (BOTTOM - TOP) : BOTTOM,
  ]);
  const last = points[points.length - 1];

  return (
    <svg
      className="w-full h-8 overflow-visible"
      fill="none"
      viewBox="0 0 160 30"
      role="img"
      aria-label="Completed orders over the last months"
    >
      <line stroke="#bdc9c1" strokeDasharray="2 2" strokeWidth="1" x1="0" x2="160" y1="28" y2="28" />
      {points.length > 0 && (
        <polyline
          points={points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}
          stroke="#005d42"
          strokeLinecap="square"
          strokeWidth="2"
        />
      )}
      {last && <circle cx={last[0]} cy={last[1]} r="2.5" fill="#047857" />}
    </svg>
  );
}