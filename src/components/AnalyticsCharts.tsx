import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, Download, Table2 } from 'lucide-react';
import {
  formatReportTime,
  reportLabel,
  reportMetrics,
  type AnalyticsReport,
  type ReportFilters,
  type ReportMetric,
  type ReportRow,
  type TrendPoint,
} from '../lib/analytics-report';

const count = (v: unknown) => Number(v ?? 0).toLocaleString('zh-CN');
function saveFile(body: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function ChartTooltip({
  active,
  payload,
  report,
}: {
  active?: boolean;
  payload?: readonly {
    dataKey?: string | number;
    value?: number | string;
    color?: string;
    payload?: TrendPoint;
  }[];
  report: AnalyticsReport;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="observatory-tooltip">
      <strong>
        {point.label}
        {report.range.granularity === 'hour' ? ' 起的一小时' : ''}
      </strong>
      {point.state === 'partial' && (
        <small>尚未结束 · 截至 {formatReportTime(report.range.asOf, report.timezone, true)}</small>
      )}
      {payload?.map((entry) => (
        <div key={String(entry.dataKey)}>
          <i style={{ background: entry.color }} />
          <span>{reportMetrics.find((m) => m.key === entry.dataKey)?.label}</span>
          <b>{count(entry.value)}</b>
        </div>
      ))}
    </div>
  );
}
export function AnalyticsTrend({
  report,
  selected,
  onToggle,
}: {
  report: AnalyticsReport;
  selected: ReportMetric[];
  onToggle: (key: ReportMetric) => void;
}) {
  const [table, setTable] = useState(false);
  const hourly = report.range.granularity === 'hour';
  const ticks = report.series
    .filter((_, i, a) => i === 0 || i === a.length - 1 || i % Math.ceil(a.length / 5) === 0)
    .map((p) => p.bucket);
  const formatTick = (time: number) =>
    hourly && report.days === 1
      ? new Intl.DateTimeFormat('en-GB', {
          timeZone: report.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(time)
      : formatReportTime(time, report.timezone, hourly);
  function download() {
    const headers = ['时段开始 UTC', '时段结束 UTC', '状态', ...reportMetrics.map((m) => m.label)];
    const rows = report.series.map((p) => [
      new Date(p.bucket).toISOString(),
      new Date(p.end).toISOString(),
      p.state,
      ...reportMetrics.map((m) => p[m.key] ?? ''),
    ]);
    saveFile(
      '\uFEFF' + [headers, ...rows].map((row) => row.join(',')).join('\n'),
      'text/csv;charset=utf-8',
      `wenbu-trend-${report.range.startDate}-${report.range.endDate}.csv`,
    );
  }
  return (
    <section className="insights-card observatory-trend" aria-label="访问与使用趋势">
      <div className="observatory-chart-heading">
        <div>
          <span className="eyebrow">TRAFFIC OVER TIME</span>
          <h2>访问与使用趋势</h2>
          <p>
            {hourly ? '每小时' : '每天'}一个观测点 ·{' '}
            {report.timezone === 'Asia/Shanghai' ? '北京时间 UTC+8' : 'UTC'}
          </p>
        </div>
        <div className="observatory-chart-actions">
          <button type="button" onClick={() => setTable(!table)} aria-pressed={table}>
            <Table2 size={14} />
            {table ? '查看曲线' : '查看数据'}
          </button>
          <button type="button" onClick={download}>
            <Download size={14} />
            导出 CSV
          </button>
        </div>
      </div>
      <div className="observatory-legend" aria-label="显示的趋势指标">
        {reportMetrics.map((m) => (
          <button
            type="button"
            key={m.key}
            aria-pressed={selected.includes(m.key)}
            onClick={() => onToggle(m.key)}
          >
            <i style={{ borderColor: m.color, borderStyle: m.dash ? 'dashed' : 'solid' }} />
            {m.label}
          </button>
        ))}
      </div>
      {table ? (
        <div className="insights-table observatory-data-table">
          <table>
            <caption>相同筛选下的完整趋势数据；时段按所选时区显示</caption>
            <thead>
              <tr>
                <th>时段</th>
                {reportMetrics.map((m) => (
                  <th key={m.key}>{m.label}</th>
                ))}
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {report.series.map((p) => (
                <tr key={p.bucket}>
                  <th>{p.label}</th>
                  {reportMetrics.map((m) => (
                    <td key={m.key}>{p[m.key] === null ? '—' : count(p[m.key])}</td>
                  ))}
                  <td>{p.state === 'future' ? '尚未到来' : p.state === 'partial' ? '进行中' : '已结束'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="observatory-line-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={report.series}
              margin={{ top: 16, right: 24, left: 0, bottom: 14 }}
              accessibilityLayer
            >
              <CartesianGrid stroke="#dfe3d8" vertical={false} strokeDasharray="3 5" />
              <XAxis
                type="number"
                dataKey="bucket"
                domain={[report.series[0].bucket, report.series.at(-1)!.bucket]}
                ticks={ticks}
                tickFormatter={formatTick}
                tick={{ fill: '#687461', fontSize: 11 }}
                tickMargin={13}
                interval="preserveStartEnd"
                minTickGap={28}
                axisLine={{ stroke: '#c5cebf' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                domain={[0, 'auto']}
                tick={{ fill: '#687461', fontSize: 11 }}
                width={44}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip report={report} />}
                cursor={{ stroke: '#7b8975', strokeDasharray: '3 4' }}
              />
              {reportMetrics
                .filter((m) => selected.includes(m.key))
                .map((m) => (
                  <Line
                    key={m.key}
                    name={m.label}
                    dataKey={m.key}
                    type="linear"
                    stroke={m.color}
                    strokeWidth={2.2}
                    strokeDasharray={m.dash}
                    connectNulls={false}
                    dot={report.series.length <= 31 ? { r: 2.5, strokeWidth: 1.5 } : false}
                    activeDot={{ r: 5, stroke: '#fffef9', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="observatory-chart-note">
        悬停或使用左右方向键查看数值。空白时段尚未到来；0
        表示该时段未记录到事件。当前时段未结束。访客与会话在每个时段内去重，跨时段不能直接相加。
      </p>
    </section>
  );
}

function RankedBars({
  title,
  eyebrow,
  rows,
  metric,
  label,
  onPick,
}: {
  title: string;
  eyebrow: string;
  rows: ReportRow[];
  metric: string;
  label: string;
  onPick?: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ordered = rows
    .filter((r) => Number(r[metric]) > 0)
    .sort((a, b) => Number(b[metric]) - Number(a[metric]));
  const total = ordered.reduce((sum, r) => sum + Number(r[metric]), 0),
    max = Number(ordered[0]?.[metric] ?? 1);
  const visible = expanded ? ordered : ordered.slice(0, 5);
  return (
    <section className="insights-card observatory-ranking">
      <span className="eyebrow">{eyebrow}</span>
      <div className="observatory-ranking-title">
        <h2>{title}</h2>
        <small>{label}</small>
      </div>
      {!visible.length && <p className="observatory-no-data">当前筛选下暂无记录。</p>}
      <ol>
        {visible.map((r) => (
          <li key={String(r.label)}>
            <button
              type="button"
              disabled={!onPick}
              onClick={() => onPick?.(String(r.label))}
              title={String(r.label)}
            >
              <span>{reportLabel(String(r.label))}</span>
              {onPick && <ArrowUpRight size={13} />}
              <b>{count(r[metric])}</b>
            </button>
            <div className="observatory-bar-track">
              <i style={{ width: `${(Number(r[metric]) / max) * 100}%` }} />
            </div>
            <small>{total ? ((Number(r[metric]) / total) * 100).toFixed(1) : 0}%</small>
          </li>
        ))}
      </ol>
      {ordered.length > 5 && (
        <button type="button" className="observatory-text-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起' : `查看全部 ${ordered.length} 项`}
        </button>
      )}
      <p className="observatory-chart-note">
        比例以当前筛选下的{label}为分母。{onPick ? '点击名称进一步筛选。' : ''}
      </p>
    </section>
  );
}

export function AnalyticsBreakdownCharts({
  report,
  onFilter,
}: {
  report: AnalyticsReport;
  onFilter: (key: keyof ReportFilters, value: string) => void;
}) {
  const completed = report.data.performance
    .filter((r) => r.status === 'complete')
    .map((r) => ({ ...r, completed: Number(r.count) }));
  const statuses = new Map<string, number>();
  for (const r of report.data.performance)
    statuses.set(String(r.status), (statuses.get(String(r.status)) ?? 0) + Number(r.count));
  const statusRows = [...statuses].map(([label, count]) => ({ label, count }));
  return (
    <>
      <div className="observatory-two-column">
        <RankedBars
          title="访问从哪里来"
          eyebrow="ACQUISITION"
          rows={report.data.source}
          metric="views"
          label="页面浏览"
          onPick={(v) => onFilter('source', v)}
        />
        <RankedBars
          title="哪些页面被看见"
          eyebrow="PAGES"
          rows={report.data.page}
          metric="views"
          label="页面浏览"
          onPick={(v) => onFilter('page', v)}
        />
      </div>
      <section className="insights-card observatory-hourly">
        <span className="eyebrow">THE RHYTHM OF A DAY</span>
        <h2>24 小时活跃分布</h2>
        <p>
          将所选日期的页面浏览按钟点累加，观察活跃时段。
          {report.timezone === 'Asia/Shanghai' ? '北京时间 UTC+8' : 'UTC'}。
        </p>
        <div className="observatory-hour-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={report.data.hours}
              margin={{ left: 0, right: 12, top: 10, bottom: 10 }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} stroke="#dfe3d8" strokeDasharray="3 5" />
              <XAxis
                dataKey="label"
                ticks={[0, 4, 8, 12, 16, 20, 23]}
                tickFormatter={(v) => `${String(v).padStart(2, '0')}:00`}
                tick={{ fontSize: 11, fill: '#687461' }}
                minTickGap={18}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: '#c5cebf' }}
              />
              <YAxis
                allowDecimals={false}
                width={44}
                tick={{ fontSize: 11, fill: '#687461' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={(v) =>
                  `${String(v).padStart(2, '0')}:00–${String(Number(v) + 1).padStart(2, '0')}:00`
                }
                formatter={(v) => [count(v), '页面浏览']}
                contentStyle={{ background: '#fffef9', borderColor: '#d6decc', fontSize: 12 }}
                cursor={{ fill: '#e6eadf' }}
              />
              <Bar dataKey="views" name="页面浏览" fill="#7b8a6a" maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="observatory-two-column">
        <RankedBars
          title="使用设备"
          eyebrow="DEVICES"
          rows={report.data.device}
          metric="views"
          label="页面浏览"
          onPick={(v) => onFilter('device', v)}
        />
        <RankedBars
          title="完成了哪些功能"
          eyebrow="COMPLETED CALLS"
          rows={completed}
          metric="completed"
          label="完成调用（含示例）"
          onPick={(v) => onFilter('tool', v)}
        />
        <RankedBars
          title="服务结果分布"
          eyebrow="SERVICE OUTCOMES"
          rows={statusRows}
          metric="count"
          label="服务调用"
        />
        <Coverage report={report} />
      </div>
    </>
  );
}
function Coverage({ report }: { report: AnalyticsReport }) {
  const row = report.data.funnel[0] ?? {},
    visited = Number(row.visited ?? 0);
  return (
    <section className="insights-card observatory-coverage">
      <span className="eyebrow">SESSION COVERAGE</span>
      <h2>会话走到了哪一步</h2>
      <p>同一会话内逐层满足这些条件，不表示严格发生顺序。</p>
      {(
        [
          ['visited', '访问页面'],
          ['started', '开始工具或对话'],
          ['succeeded', '实际完成'],
          ['saved', '保存为手记'],
        ] as const
      ).map(([key, label], i) => (
        <div key={key}>
          <span>
            <small>0{i + 1}</small>
            {label}
            <b>{count(row[key])}</b>
          </span>
          <div className="observatory-bar-track">
            <i style={{ width: `${visited ? (Number(row[key] ?? 0) / visited) * 100 : 0}%` }} />
          </div>
          <em>{visited ? `${((Number(row[key] ?? 0) / visited) * 100).toFixed(1)}%` : '—'}</em>
        </div>
      ))}
      <p className="observatory-chart-note">
        比例以本范围内有访问记录的会话为分母。示例计算不算完成；无会话 ID 的 API / CLI / MCP 请求不计入。
      </p>
    </section>
  );
}
