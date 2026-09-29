export const feedbackCategories = ['suggestion', 'bug', 'reading', 'content', 'other'] as const;
export const feedbackRatings = ['none', 'helpful', 'mixed', 'unhelpful'] as const;
export const feedbackStates = ['new', 'reviewing', 'resolved', 'dismissed'] as const;
export const feedbackLimits = { message: 3000, context: 8000, contact: 254 } as const;
export type FeedbackRequest = {
  tool?: 'none' | 'bazi' | 'iching' | 'tarot' | 'ziwei' | 'agent' | 'interpret' | 'mcp';
  operation?: string;
  conversation?: string;
  category?: (typeof feedbackCategories)[number];
  rating?: (typeof feedbackRatings)[number];
  excerpt?: string;
};
export function openFeedback(detail: FeedbackRequest = {}) {
  window.dispatchEvent(new CustomEvent('wenbu:feedback', { detail }));
}
