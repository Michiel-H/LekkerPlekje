interface Week {
  label: string;
  submissions: number;
  approvals: number;
}

/**
 * Hand-rolled grouped-bar chart (no chart dependency). Two series per week:
 * inzendingen (groen) and goedkeuringen (frisgroen). Pure SVG, server-rendered.
 */
export default function TrendChart({ weeks }: { weeks: Week[] }) {
  const W = 640;
  const H = 220;
  const padL = 28;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const max = Math.max(1, ...weeks.flatMap((w) => [w.submissions, w.approvals]));
  const groupW = plotW / weeks.length;
  const barW = Math.min(16, groupW * 0.32);
  const gap = 3;

  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const gridValues = [0, Math.round(max / 2), max];

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-4 text-xs text-espresso-light">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-groen" /> Inzendingen
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-frisgroen" /> Goedkeuringen
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Trend van inzendingen en goedkeuringen per week">
        {/* Gridlines + y labels */}
        {gridValues.map((gv) => (
          <g key={gv}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(gv)}
              y2={y(gv)}
              stroke="#2B1810"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
            <text x={0} y={y(gv) + 3} fontSize={10} fill="#5C4030" fillOpacity={0.7}>
              {gv}
            </text>
          </g>
        ))}

        {/* Bars */}
        {weeks.map((w, i) => {
          const cx = padL + groupW * i + groupW / 2;
          const x1 = cx - barW - gap / 2;
          const x2 = cx + gap / 2;
          return (
            <g key={w.label}>
              <rect
                x={x1}
                y={y(w.submissions)}
                width={barW}
                height={padT + plotH - y(w.submissions)}
                rx={2}
                fill="#00B4D8"
              />
              <rect
                x={x2}
                y={y(w.approvals)}
                width={barW}
                height={padT + plotH - y(w.approvals)}
                rx={2}
                fill="#06D6A0"
              />
              <text x={cx} y={H - 10} fontSize={10} fill="#5C4030" fillOpacity={0.7} textAnchor="middle">
                {w.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
