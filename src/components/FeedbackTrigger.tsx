import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { openFeedback, type FeedbackRequest } from '../lib/feedback-contract';
import type { Locale } from '../lib/schema';
export default function FeedbackTrigger({ locale, ...detail }: FeedbackRequest & { locale: Locale }) {
  const zh = locale === 'zh';
  return (
    <div className="feedback-inline" aria-label={zh ? '评价这次结果' : 'Rate this result'}>
      <span>{zh ? '这次有帮助吗？' : 'Was this helpful?'}</span>
      <button
        type="button"
        aria-label={zh ? '有帮助，留下反馈' : 'Helpful — leave feedback'}
        onClick={() => openFeedback({ ...detail, rating: 'helpful' })}
      >
        <ThumbsUp size={15} />
      </button>
      <button
        type="button"
        aria-label={zh ? '没帮到我，留下反馈' : 'Not helpful — leave feedback'}
        onClick={() => openFeedback({ ...detail, rating: 'unhelpful' })}
      >
        <ThumbsDown size={15} />
      </button>
      <button type="button" onClick={() => openFeedback(detail)}>
        <MessageSquare size={15} />
        {zh ? '说说建议' : 'Leave a note'}
      </button>
    </div>
  );
}
