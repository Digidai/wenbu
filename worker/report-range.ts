import { ApiError } from './ai';
import { reportTimezones } from '../src/lib/analytics-report';
const DAY = 86400000;
export function reportRange(params: URLSearchParams, asOf = Date.now()) {
  const invalid = (message: string): never => {
    throw new ApiError(400, 'invalid_filter', message);
  };
  const timezone = params.get('timezone') || 'Asia/Shanghai';
  if (!(reportTimezones as readonly string[]).includes(timezone)) invalid('Unsupported timezone.');
  const offset = timezone === 'Asia/Shanghai' ? 8 * 3600000 : 0;
  const today = Math.floor((asOf + offset) / DAY) * DAY - offset;
  const date = (value: string) => {
    const time = Date.parse(value + 'T00:00:00Z');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(time) ||
      new Date(time).toISOString().slice(0, 10) !== value
    )
      invalid('Invalid calendar date.');
    return time - offset;
  };
  let days = Number(params.get('days') || 7);
  if (!Number.isInteger(days) || days < 1 || days > 90) invalid('Choose between 1 and 90 days.');
  const custom = Boolean(params.get('start') || params.get('end'));
  let end = today + DAY,
    since = end - days * DAY;
  if (custom) {
    since = date(params.get('start') || '');
    end = date(params.get('end') || '') + DAY;
    days = (end - since) / DAY;
    if (days < 1 || days > 90 || since < today - 89 * DAY || end > today + DAY)
      invalid('Choose an ordered date range within the last 90 calendar days.');
  }
  const grain = params.get('granularity') || 'auto';
  if (!['auto', 'hour', 'day'].includes(grain)) invalid('Unsupported time granularity.');
  const granularity = grain === 'auto' ? (days <= 3 ? 'hour' : 'day') : (grain as 'hour' | 'day');
  if (granularity === 'hour' && days > 7) invalid('Hourly detail supports up to 7 days.');
  return {
    asOf,
    timezone,
    offset,
    days,
    custom,
    end,
    since,
    grain,
    granularity,
    step: granularity === 'hour' ? 3600000 : DAY,
  };
}
