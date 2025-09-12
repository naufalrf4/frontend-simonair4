import React from 'react';
import { cn } from '@/lib/utils';

type Series = {
  name: string;
  color: string;
  points: Array<{ x: number; y: number | null }>;
};

interface LineChartProps {
  series: Series[];
  width?: number;
  height?: number;
  className?: string;
  yLabel?: string;
}

// Simple, dependency-free SVG line chart supporting multiple series
export const LineChart: React.FC<LineChartProps> = ({
  series,
  width = 800,
  height = 280,
  className,
}) => {
  const padding = { top: 16, right: 24, bottom: 24, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allX = series.flatMap(s => s.points.map(p => p.x));
  const allY = series.flatMap(s => s.points.map(p => p.y).filter((v): v is number => v !== null && !Number.isNaN(v)));

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const xScale = (x: number) => padding.left + ((x - minX) / Math.max(1, maxX - minX)) * innerW;
  const yScale = (y: number) => padding.top + innerH - ((y - minY) / Math.max(1e-9, maxY - minY)) * innerH;

  const xTicks = 5;
  const yTicks = 4;

  const xTickValues = Array.from({ length: xTicks }, (_, i) => minX + (i * (maxX - minX)) / (xTicks - 1));
  const yTickValues = Array.from({ length: yTicks }, (_, i) => minY + (i * (maxY - minY)) / (yTicks - 1));

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatNum = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1000) return n.toFixed(0);
    if (abs >= 100) return n.toFixed(1);
    return n.toFixed(2);
  };

  const pathFor = (pts: Array<{ x: number; y: number | null }>) => {
    let d = '';
    let started = false;
    for (const p of pts) {
      if (p.y === null || Number.isNaN(p.y)) {
        started = false;
        continue;
      }
      const X = xScale(p.x);
      const Y = yScale(p.y);
      d += started ? ` L ${X} ${Y}` : `M ${X} ${Y}`;
      started = true;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('w-full h-auto', className)}>
      {/* Axes */}
      <g>
        {/* Y grid + labels */}
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(v)}
              x2={width - padding.right}
              y2={yScale(v)}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text x={padding.left - 6} y={yScale(v)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {formatNum(v)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {xTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={xScale(v)}
              y1={padding.top + innerH}
              x2={xScale(v)}
              y2={padding.top + innerH + 4}
              stroke="#9ca3af"
            />
            <text x={xScale(v)} y={padding.top + innerH + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {formatTime(v)}
            </text>
          </g>
        ))}
      </g>

      {/* Series lines */}
      {series.map((s, idx) => (
        <path key={idx} d={pathFor(s.points)} fill="none" stroke={s.color} strokeWidth={2} />
      ))}

      {/* Border */}
      <rect
        x={padding.left}
        y={padding.top}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="#e5e7eb"
      />
    </svg>
  );
};

