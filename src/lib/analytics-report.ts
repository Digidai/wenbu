import { campaigns, mediums, pagePaths, sources, tools } from './analytics-contract';

export const reportPresets = [1, 3, 7, 14, 30, 90] as const;
export const reportTimezones = ['Asia/Shanghai', 'UTC'] as const;
export const reportDimensions: Record<string, readonly string[]> = {
  source: sources,
  medium: mediums,
  campaign: campaigns,
  locale: ['zh', 'en'],
  device: ['mobile', 'desktop', 'tablet', 'bot', 'unknown'],
  channel: ['web', 'api', 'cli', 'mcp'],
  page: [...pagePaths.map((p) => `/${p ? p + '/' : ''}`), '/other/'],
  entry_page: [...pagePaths.map((p) => `/${p ? p + '/' : ''}`), '/other/'],
  tool: tools,
  mode: ['none', 'explore', 'research'],
  browser: ['chrome', 'safari', 'firefox', 'edge', 'other', 'unknown'],
  os: ['windows', 'macos', 'ios', 'android', 'linux', 'other', 'unknown'],
};
export type ReportFilters = {
  days: string;
  start: string;
  end: string;
  timezone: string;
  granularity: string;
  test: string;
  source: string;
  medium: string;
  campaign: string;
  locale: string;
  device: string;
  channel: string;
  page: string;
  entry_page: string;
  tool: string;
  mode: string;
  browser: string;
  os: string;
  country: string;
};
export const defaultReportFilters: ReportFilters = {
  days: '7',
  start: '',
  end: '',
  timezone: 'Asia/Shanghai',
  granularity: 'auto',
  test: 'false',
  source: '',
  medium: '',
  campaign: '',
  locale: '',
  device: '',
  channel: '',
  page: '',
  entry_page: '',
  tool: '',
  mode: '',
  browser: '',
  os: '',
  country: '',
};
export const reportMetrics = [
  { key: 'pageviews', label: '页面浏览', color: '#47664d', dash: undefined },
  { key: 'visitors', label: '匿名访客', color: '#896239', dash: '3 3' },
  { key: 'sessions', label: '访问会话', color: '#4e7383', dash: '7 3' },
  { key: 'calculations', label: '成功计算', color: '#9b573f', dash: undefined },
  { key: 'agent_complete', label: 'Agent 完成', color: '#796783', dash: '3 3' },
  { key: 'failures', label: '服务错误', color: '#923f57', dash: '7 3' },
] as const;
export type ReportMetric = (typeof reportMetrics)[number]['key'];
export type ReportRow = Record<string, string | number | null>;
export type TrendPoint = Record<ReportMetric, number | null> & {
  bucket: number;
  end: number;
  label: string;
  state: 'observed' | 'partial' | 'future';
};
export type AnalyticsReport = {
  generatedAt: string;
  days: number;
  includeTest: boolean;
  retentionDays: number;
  timezone: string;
  filters: ReportFilters;
  range: {
    start: number;
    end: number;
    asOf: number;
    startDate: string;
    endDate: string;
    granularity: 'hour' | 'day';
  };
  series: TrendPoint[];
  data: Record<string, ReportRow[]>;
};
export const reportLabels: Record<string, string> = {
  source: '来源',
  medium: '渠道类型',
  campaign: '活动',
  locale: '语言',
  device: '设备',
  channel: '使用方式',
  page: '浏览页面',
  entry_page: '进入页面',
  tool: '功能事件',
  mode: 'Agent 模式',
  browser: '浏览器',
  os: '操作系统',
  country: '国家 / 地区',
  direct: '直接访问',
  internal: '站内来源',
  other: '其他',
  unknown: '未知',
  none: '未指定',
  zh: '中文',
  en: 'English',
  mobile: '手机',
  desktop: '电脑',
  tablet: '平板',
  bot: '自动化访问',
  organic: '自然搜索',
  referral: '引荐',
  social: '社交',
  email: '邮件',
  cpc: '付费点击',
  ai: 'AI 引荐',
  web: '网页',
  api: 'API',
  cli: 'CLI',
  mcp: 'MCP',
  bazi: '八字',
  iching: '易经',
  tarot: '塔罗',
  ziwei: '紫微',
  agent: 'Agent',
  interpret: 'AI 解读',
  explore: '探索',
  research: '研究',
  complete: '已完成',
  waiting: '等待补充',
  limited: '额度限制',
  cancelled: '用户中断',
  error: '服务错误',
  timeout: '超时',
  rate_limited: '限流',
  invalid_input: '输入未通过',
  unavailable: '服务不可用',
};
export function reportLabel(value: string) {
  return reportLabels[value] ?? value;
}
export function dateInTimezone(time: number, timezone: string) {
  const offset = timezone === 'Asia/Shanghai' ? 8 * 3600000 : 0;
  return new Date(time + offset).toISOString().slice(0, 10);
}
export function formatReportTime(time: number, timezone: string, detail = false) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    ...(detail ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const } : {}),
  }).format(time);
}
