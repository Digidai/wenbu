import { useState } from 'react';
import { BarChart3, Download, LockKeyhole, RefreshCw, LogOut } from 'lucide-react';
import { campaigns, sources } from '../lib/analytics-contract';
type Row = Record<string, string | number | null>;
type Report = { generatedAt: string; days: number; includeTest: boolean; data: Record<string, Row[]> };
const number = (value: unknown) => (typeof value === 'number' ? value.toLocaleString() : '0');
export default function AnalyticsDashboard() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState<Report>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    days: '7',
    source: '',
    campaign: '',
    locale: '',
    device: '',
    channel: '',
    test: 'false',
  });
  async function load() {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/analytics?' + new URLSearchParams(filters), {
        headers: { Authorization: `Bearer ${token.trim()}` },
        cache: 'no-store',
      });
      if (!response.ok)
        throw new Error(
          response.status === 401 ? '管理密钥无效，请检查后再试。' : '统计暂时不可用，请稍后刷新。',
        );
      setReport(await response.json());
    } catch (e) {
      setReport(undefined);
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setBusy(false);
    }
  }
  const summary = report?.data.summary[0] ?? {};
  const funnel = report?.data.funnel[0] ?? {};
  const select = (key: keyof typeof filters, title: string, options: readonly string[]) => (
    <label>
      {title}
      <select value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
        {key !== 'days' && <option value="">全部</option>}
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wenbu-analytics.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const breakdownNames: Record<string, string> = {
    source: '访问来源',
    medium: '渠道类型',
    campaign: '推广活动',
    page: '浏览页面',
    entry_page: '进入页面',
    locale: '语言',
    device: '设备',
    browser: '浏览器',
    os: '操作系统',
    country: '国家 / 地区',
    channel: '使用方式',
    tool: '工具',
    mode: 'Agent 模式',
    action: '入口点击',
  };
  return (
    <section className="insights shell">
      <header className="insights-header">
        <div>
          <span className="eyebrow accent">WENBU · PRODUCT OBSERVATORY</span>
          <h1>
            <BarChart3 size={28} />
            访问与使用
          </h1>
          <p>从哪里来，在哪里开始，是否真正得到结果。</p>
        </div>
        <span className="insights-private">
          <LockKeyhole size={14} />
          仅管理员可见
        </span>
      </header>
      {!report ? (
        <form
          className="insights-login"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <LockKeyhole size={26} />
          <h2>打开数据观察室</h2>
          <p>输入管理密钥查看汇总。密钥只用于本页请求，不写入网址或浏览器存储。</p>
          <label>
            管理密钥
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? '正在验证…' : '查看统计'}
          </button>
        </form>
      ) : (
        <>
          <form
            className="insights-filters"
            onSubmit={(e) => {
              e.preventDefault();
              void load();
            }}
          >
            {select('days', '最近天数', ['1', '7', '30', '90'])}
            {select('source', '来源', sources)}
            {select('campaign', '活动', campaigns)}
            {select('locale', '语言', ['zh', 'en'])}
            {select('device', '设备', ['mobile', 'desktop', 'tablet', 'bot', 'unknown'])}
            {select('channel', '使用方式', ['web', 'api', 'cli', 'mcp'])}
            <label className="insights-test">
              <input
                type="checkbox"
                checked={filters.test === 'true'}
                onChange={(e) => setFilters({ ...filters, test: String(e.target.checked) })}
              />
              包含测试流量
            </label>
            <button className="button" disabled={busy}>
              <RefreshCw size={14} />
              {busy ? '读取中' : '应用筛选'}
            </button>
          </form>
          <div className="insights-toolbar">
            <span>
              最近 {report.days} 天 · UTC · {report.includeTest ? '包含测试' : '已排除测试'} ·{' '}
              {new Date(report.generatedAt).toLocaleString('zh-CN')}
            </span>
            <button onClick={download}>
              <Download size={15} />
              导出汇总
            </button>
            <button
              onClick={() => {
                setToken('');
                setReport(undefined);
              }}
            >
              <LogOut size={15} />
              退出
            </button>
          </div>
          <div className="insights-metrics">
            {[
              ['pageviews', '页面浏览'],
              ['visitors', '匿名访客'],
              ['sessions', '访问会话'],
              ['calculations', '成功计算'],
              ['agent_complete', 'Agent 完成回合'],
              ['failures', '服务错误'],
            ].map(([key, label]) => (
              <article key={key}>
                <span>{label}</span>
                <strong>{number(summary[key])}</strong>
              </article>
            ))}
          </div>
          {!summary.events && (
            <p className="insights-empty">这个范围内还没有记录。上线后的真实访问和功能使用会在这里出现。</p>
          )}
          <p className="insights-quality-note">
            示例计算 {number(summary.examples)} 次 · 输入未通过 {number(summary.invalid_inputs)} 次 · 额度 /
            限速 {number(summary.throttled)} 次 · 用户中断 {number(summary.cancellations)} 次。Agent 等待补充{' '}
            {number(summary.agent_waiting)} 回合 · 受限 {number(summary.agent_limited)}{' '}
            回合。以上与服务错误分开统计。
          </p>
          <div className="insights-primary">
            <article className="insights-card">
              <h2>每日访问与使用</h2>
              <p>柱高代表浏览量，旁边列出成功计算次数。</p>
              <div className="insights-timeline">
                {report.data.daily.map((row) => (
                  <div key={String(row.label)}>
                    <span>{String(row.label).slice(5)}</span>
                    <i
                      style={{
                        width: `${Math.max(2, (Number(row.views) / Math.max(1, ...report.data.daily.map((d) => Number(d.views)))) * 100)}%`,
                      }}
                    />
                    <b>
                      {number(row.views)} <small>浏览 · {number(row.calculations)} 计算</small>
                    </b>
                  </div>
                ))}
              </div>
            </article>
            <article className="insights-card">
              <h2>会话覆盖漏斗</h2>
              <p>同一会话内包含这些事件，非严格先后顺序。成功必须有服务端记录，示例不计入。</p>
              {[
                ['visited', '访问页面'],
                ['started', '开始工具或对话'],
                ['succeeded', '实际完成'],
                ['saved', '保存为手记'],
              ].map(([key, label], i) => (
                <div className="insights-funnel" key={key}>
                  <span>0{i + 1}</span>
                  <strong>{label}</strong>
                  <b>{number(funnel[key])}</b>
                </div>
              ))}
              <small>会话覆盖统计，不推断跨设备身份或因果关系。</small>
            </article>
          </div>
          <div className="insights-breakdowns">
            {Object.entries(breakdownNames).map(([key, label]) => (
              <details
                className="insights-card"
                key={key}
                open={['source', 'page', 'tool', 'device'].includes(key)}
              >
                <summary>{label}</summary>
                <div className="insights-table">
                  <table>
                    <thead>
                      <tr>
                        <th>维度</th>
                        <th>事件</th>
                        <th>会话</th>
                        <th>成功</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data[key].map((row) => (
                        <tr key={String(row.label)}>
                          <th>{String(row.label)}</th>
                          <td>{number(row.events)}</td>
                          <td>{number(row.sessions)}</td>
                          <td>{number(row.successes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
          <details className="insights-card">
            <summary>服务状态与耗时</summary>
            <div className="insights-table">
              <table>
                <thead>
                  <tr>
                    <th>功能</th>
                    <th>状态</th>
                    <th>次数</th>
                    <th>平均耗时</th>
                    <th>最大耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.performance.map((row, i) => (
                    <tr key={i}>
                      <th>{row.label}</th>
                      <td>{row.status}</td>
                      <td>{number(row.count)}</td>
                      <td>{number(row.average_ms)} ms</td>
                      <td>{number(row.max_ms)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <details className="insights-card">
            <summary>全部事件与接收位置</summary>
            <div className="insights-table">
              <table>
                <thead>
                  <tr>
                    <th>事件</th>
                    <th>接收位置</th>
                    <th>状态</th>
                    <th>数量</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.events.map((row, i) => (
                    <tr key={i}>
                      <th>{row.label}</th>
                      <td>{row.origin}</td>
                      <td>{row.status}</td>
                      <td>{number(row.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <p className="insights-footnote">
        匿名访客是 30
        天有效的浏览器标识，不代表精确人数。统计遵循用户关闭选项和浏览器隐私信号；拦截、离线和自动化流量会影响覆盖。事件保留
        90 天。数据用于产品改进，不用于计费。
      </p>
    </section>
  );
}
