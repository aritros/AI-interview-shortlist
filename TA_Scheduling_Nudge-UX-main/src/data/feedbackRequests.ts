/* Mock "pending feedback" count shown in the Feedback column — shared between
   CandidateTable (the "{N} pending" cell) and CandidateFeedbackPanel (the
   summary badge), so both agree on the count for a given row. */
const FEEDBACK_PENDING = [20, 5, 2, 0, 8, 0, 3, 0, 6, 0];

export function getFeedbackPending(rowIndex: number): number {
  return FEEDBACK_PENDING[rowIndex % FEEDBACK_PENDING.length];
}

export type FeedbackRequestStatus = 'reviewPending' | 'feedbackPending';

export interface FeedbackRequest {
  id: string;
  category: 'aiInterviews' | 'interviews';
  reviewerName: string;
  reviewerRole: string;
  reviewerInitials: string;
  reviewerColor: string;
  formTitle: string;
  date: string;
  status: FeedbackRequestStatus;
  actionLabel: 'Review feedback' | 'Send reminder';
  showInfoIcon?: boolean;
  /* Whether this row has a detail form to drill into (chevron shown). */
  hasDetail: boolean;
}

/* Reused as-is across candidates for this prototype — the interaction (open
   summary → drill into a form → back) is what's being demoed, not per-row
   data fidelity. */
export const FEEDBACK_REQUESTS: FeedbackRequest[] = [
  {
    id: 'fr-1',
    category: 'aiInterviews',
    reviewerName: 'Acme User',
    reviewerRole: 'Brand Manager',
    reviewerInitials: 'AU',
    reviewerColor: '#69717F',
    formTitle: 'AI Coding Interview Metrics Feedback...',
    date: 'Sep 21, 2025',
    status: 'reviewPending',
    actionLabel: 'Review feedback',
    hasDetail: true,
  },
  {
    id: 'fr-2',
    category: 'aiInterviews',
    reviewerName: 'Hm 1',
    reviewerRole: '',
    reviewerInitials: 'H1',
    reviewerColor: '#9D2F6A',
    formTitle: 'AI Coding Interview Metrics Feedback...',
    date: 'Sep 16, 2025',
    status: 'reviewPending',
    actionLabel: 'Send reminder',
    showInfoIcon: true,
    hasDetail: true,
  },
  {
    id: 'fr-3',
    category: 'aiInterviews',
    reviewerName: 'Acme User',
    reviewerRole: 'Brand Manager',
    reviewerInitials: 'AU',
    reviewerColor: '#69717F',
    formTitle: 'AI Coding Interview Metrics Feedback...',
    date: 'Sep 15, 2025',
    status: 'reviewPending',
    actionLabel: 'Review feedback',
    hasDetail: true,
  },
  {
    id: 'fr-4',
    category: 'aiInterviews',
    reviewerName: 'Acme User',
    reviewerRole: 'Brand Manager',
    reviewerInitials: 'AU',
    reviewerColor: '#69717F',
    formTitle: 'AI Coding Interview Metrics Feedback...',
    date: 'Sep 15, 2025',
    status: 'reviewPending',
    actionLabel: 'Review feedback',
    hasDetail: true,
  },
  {
    id: 'fr-5',
    category: 'interviews',
    reviewerName: 'Recruiter Demo User',
    reviewerRole: '',
    reviewerInitials: 'RD',
    reviewerColor: '#9D6309',
    formTitle: 'modular_interview',
    date: 'Aug 10, 2026',
    status: 'feedbackPending',
    actionLabel: 'Send reminder',
    hasDetail: false,
  },
];
