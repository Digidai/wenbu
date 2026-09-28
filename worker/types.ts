import type { UsageGate } from './quota';
export interface Env {
  ASSETS: Fetcher;
  QUOTA: DurableObjectNamespace<UsageGate>;
  RATE_LIMITER?: RateLimit;
  DEEPSEEK_API_KEY?: string;
  QUOTA_SALT?: string;
  SITE_URL: string;
  DEEPSEEK_MODEL: string;
  AI_DAILY_LIMIT: string;
  AI_PER_USER_DAILY_LIMIT: string;
  AGENT_PER_USER_DAILY_LIMIT?: string;
  AGENT_GLOBAL_DAILY_LIMIT?: string;
}
