import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Card } from './Card';

interface ChartTable {
  headers: string[];
  rows: (string | number)[][];
}

interface ResponsiveChartProps {
  title: string;
  description?: string;
  height?: number;
  minWidth?: number;
  table: ChartTable;
  isEmpty?: boolean;
  emptyMessage?: string;
  footnote?: ReactNode;
  children: ReactElement;
}

export const CHART_THEME = {
  bar: 'var(--color-primary)',
  barMuted: 'var(--color-mint)',
  grid: 'var(--color-border)',
  axis: 'var(--color-muted)',
  text: 'var(--color-text)',
};

export function ResponsiveChart({
  title,
  description,
  height = 220,
  minWidth = 320,
  table,
  isEmpty = false,
  emptyMessage = 'ยังไม่มีข้อมูลสำหรับกราฟนี้',
  footnote,
  children,
}: ResponsiveChartProps) {
  return (
    <Card as="section" aria-label={title}>
      <h2 className="text-section font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-caption text-muted">{description}</p>}

      {isEmpty ? (
        <p className="mt-4 rounded-control bg-background px-4 py-8 text-center text-body text-muted">{emptyMessage}</p>
      ) : (
        <div className="scrollbar-hide -mx-1 mt-4 overflow-x-auto">
          <div style={{ minWidth, height }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {footnote && <div className="mt-3 text-caption text-muted">{footnote}</div>}

      {!isEmpty && (
        <details className="mt-3 text-caption">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-primary">ดูข้อมูลเป็นตาราง</summary>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full border-collapse text-left">
              <thead>
                <tr>
                  {table.headers.map((h) => (
                    <th key={h} scope="col" className="border-b border-border py-2 pr-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border-b border-border py-2 pr-4 text-muted">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { value?: number | string; payload?: Record<string, unknown> }[];
  unit: string;
  labelKey?: string;
}

export function ChartTooltip({ active, payload, label, unit, labelKey }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const title = labelKey && payload[0].payload ? String(payload[0].payload[labelKey]) : String(label ?? '');
  return (
    <div className="rounded-control border border-border bg-surface px-3 py-2 text-caption shadow-raised">
      <p className="font-semibold text-text">{title}</p>
      <p className="text-muted">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}
