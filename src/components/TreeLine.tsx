interface PineSpec {
  x: number;
  height: number;
  width: number;
  fill: string;
  opacity: number;
  delay: number;
  duration: number;
}

const BASE_Y = 138;

const PINES: PineSpec[] = [
  { x: 30, height: 78, width: 46, fill: "var(--canopy-700)", opacity: 0.35, delay: 0, duration: 7 },
  { x: 95, height: 118, width: 60, fill: "var(--canopy-900)", opacity: 0.55, delay: 0.6, duration: 6.2 },
  { x: 175, height: 92, width: 50, fill: "var(--canopy-800)", opacity: 0.45, delay: 1.1, duration: 6.8 },
  { x: 260, height: 134, width: 66, fill: "var(--canopy-950)", opacity: 0.7, delay: 0.3, duration: 5.6 },
  { x: 350, height: 100, width: 54, fill: "var(--canopy-800)", opacity: 0.5, delay: 1.6, duration: 7.4 },
  { x: 430, height: 72, width: 42, fill: "var(--canopy-700)", opacity: 0.32, delay: 0.9, duration: 6.4 },
  { x: 500, height: 122, width: 62, fill: "var(--canopy-900)", opacity: 0.58, delay: 0.2, duration: 5.9 },
  { x: 585, height: 88, width: 48, fill: "var(--canopy-800)", opacity: 0.42, delay: 1.4, duration: 6.9 },
  { x: 660, height: 140, width: 68, fill: "var(--canopy-950)", opacity: 0.72, delay: 0.7, duration: 5.4 },
  { x: 745, height: 96, width: 52, fill: "var(--canopy-800)", opacity: 0.46, delay: 1.9, duration: 7.1 },
  { x: 815, height: 76, width: 44, fill: "var(--canopy-700)", opacity: 0.34, delay: 0.4, duration: 6.6 },
  { x: 885, height: 128, width: 64, fill: "var(--canopy-900)", opacity: 0.6, delay: 1.2, duration: 5.7 },
  { x: 960, height: 90, width: 50, fill: "var(--canopy-800)", opacity: 0.44, delay: 0.1, duration: 7.2 },
  { x: 1035, height: 136, width: 66, fill: "var(--canopy-950)", opacity: 0.7, delay: 1.7, duration: 5.5 },
  { x: 1115, height: 98, width: 54, fill: "var(--canopy-800)", opacity: 0.48, delay: 0.5, duration: 6.7 },
  { x: 1170, height: 70, width: 40, fill: "var(--canopy-700)", opacity: 0.3, delay: 1.0, duration: 7.5 },
];

const FIREFLIES = [
  { x: 140, y: 88, delay: 0, duration: 4.2 },
  { x: 310, y: 60, delay: 1.1, duration: 5.1 },
  { x: 470, y: 100, delay: 2.3, duration: 4.6 },
  { x: 620, y: 70, delay: 0.6, duration: 5.4 },
  { x: 800, y: 92, delay: 1.8, duration: 4.4 },
  { x: 940, y: 58, delay: 0.3, duration: 5.0 },
  { x: 1090, y: 96, delay: 2.6, duration: 4.8 },
];

function Pine({ x, height, width, fill, opacity, delay, duration }: PineSpec) {
  const trunkW = width * 0.14;
  const trunkH = height * 0.16;
  const g = height * 0.28;

  return (
    <g
      className="tree-sway"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
      opacity={opacity}
    >
      <rect x={x - trunkW / 2} y={BASE_Y - trunkH} width={trunkW} height={trunkH} fill={fill} />
      <polygon
        points={`${x},${BASE_Y - trunkH - g * 2.6} ${x - width * 0.32},${BASE_Y - trunkH - g * 1.5} ${x + width * 0.32},${BASE_Y - trunkH - g * 1.5}`}
        fill={fill}
      />
      <polygon
        points={`${x},${BASE_Y - trunkH - g * 1.9} ${x - width * 0.42},${BASE_Y - trunkH - g * 0.75} ${x + width * 0.42},${BASE_Y - trunkH - g * 0.75}`}
        fill={fill}
      />
      <polygon
        points={`${x},${BASE_Y - trunkH - g * 1.1} ${x - width * 0.5},${BASE_Y - trunkH} ${x + width * 0.5},${BASE_Y - trunkH}`}
        fill={fill}
      />
    </g>
  );
}

/** A quiet, gently-swaying tree line with a few drifting fireflies — the
 * cabin's forest, rendered once as the page's opening flourish. */
export function TreeLine() {
  return (
    <div className="pointer-events-none -mx-6 mb-2 overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1200 150" className="h-28 w-full sm:h-36" preserveAspectRatio="xMidYMax slice">
        {PINES.map((pine, i) => (
          <Pine key={i} {...pine} />
        ))}
        {FIREFLIES.map((f, i) => (
          <circle
            key={i}
            cx={f.x}
            cy={f.y}
            r={2.2}
            fill="var(--amber-500)"
            className="firefly"
            style={{
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              filter: "drop-shadow(0 0 3px var(--amber-500))",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
