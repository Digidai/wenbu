import { useEffect, useState } from 'react';
import { analyticsEnabled, setAnalyticsEnabled } from '../lib/analytics';
import type { Locale } from '../lib/schema';
export default function AnalyticsPreference({ locale }: { locale: Locale }) {
  const [enabled, setEnabled] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    setEnabled(analyticsEnabled());
    setBlocked(
      navigator.doNotTrack === '1' ||
        Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl),
    );
  }, []);
  return (
    <aside className="analytics-preference">
      <h2>{locale === 'zh' ? '本浏览器的统计偏好' : 'Measurement preference for this browser'}</h2>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          disabled={blocked}
          onChange={(event) => {
            setAnalyticsEnabled(event.target.checked);
            setEnabled(analyticsEnabled());
          }}
        />
        {locale === 'zh' ? '允许匿名使用统计' : 'Allow anonymous usage measurement'}
      </label>
      <p role="status">
        {blocked
          ? locale === 'zh'
            ? '浏览器的隐私信号已关闭统计。'
            : 'Your browser privacy signal has disabled measurement.'
          : enabled
            ? locale === 'zh'
              ? '已开启。仅记录功能使用，不记录你写下的内容。'
              : 'Enabled. Records feature use, never what you write.'
            : locale === 'zh'
              ? '已关闭。工具和对话仍可正常使用。'
              : 'Disabled. Tools and conversations continue to work.'}
      </p>
    </aside>
  );
}
