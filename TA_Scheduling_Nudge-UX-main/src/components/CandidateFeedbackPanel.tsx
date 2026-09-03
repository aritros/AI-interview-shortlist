import { useEffect, useRef, useState } from 'react';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiArrowExpand,
  mdiCreation,
  mdiChevronLeft,
  mdiChevronRight,
  mdiOpenInNew,
  mdiShareVariant,
  mdiDownload,
  mdiCalendarBlankOutline,
  mdiClockOutline,
  mdiInformationOutline,
  mdiTrashCanOutline,
  mdiStar,
  mdiStarOutline,
  mdiChevronDown,
  mdiThumbUp,
  mdiThumbDown,
  mdiThumbUpOutline,
  mdiThumbDownOutline,
  mdiArrowUp,
  mdiCheck,
  mdiFormatListBulletedSquare,
} from '@mdi/js';
import type { Candidate } from '../data/candidates';
import { FEEDBACK_REQUESTS, type FeedbackRequest } from '../data/feedbackRequests';
import { FEEDBACK_META, FEEDBACK_QUESTIONS, type FeedbackQuestion } from '../data/feedbackForm';
import { parseFeedbackInstruction, type PendingEdit } from '../data/agenticFeedbackEditor';
import './CandidateFeedbackPanel.css';

/* AI-identified interview signals — shown in the expanded floating input
   panel (Figma node 775:82173). Mocked, same spirit as FEEDBACK_QUESTIONS. */
const INTERVIEW_SIGNALS = [
  'Showcased good technical proficiency for Python',
  'Candidate was confident and had good English proficiency and showcased good storytelling',
  'Has good experience leading a team of developers',
  'Demonstrated strong problem-solving skills under pressure',
];

interface CandidateFeedbackPanelProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  candidates: Candidate[];
  onNavigate: (candidate: Candidate) => void;
  positionTitle: string;
  pendingCount: number;
}

function RequestRow({ request, onOpenDetail }: { request: FeedbackRequest; onOpenDetail: (id: string) => void }) {
  return (
    <div
      className={`cfp-request-row${request.hasDetail ? ' cfp-request-row--clickable' : ''}`}
      onClick={request.hasDetail ? () => onOpenDetail(request.id) : undefined}
      role={request.hasDetail ? 'button' : undefined}
      tabIndex={request.hasDetail ? 0 : undefined}
    >
      <div
        className="cfp-request-avatar"
        style={{ backgroundColor: request.reviewerColor }}
        aria-hidden
      >
        {request.reviewerInitials}
      </div>
      <div className="cfp-request-identity">
        <span className="cfp-request-name">{request.reviewerName}</span>
        {request.reviewerRole && <span className="cfp-request-role">{request.reviewerRole}</span>}
      </div>
      <div className="cfp-request-form">
        <span className="cfp-request-form-title">{request.formTitle}</span>
        <span className="cfp-request-date">{request.date}</span>
      </div>
      <div className="cfp-request-status">
        <span className="cfp-request-status-badge">
          <Icon path={mdiClockOutline} size={0.6} />
          {request.status === 'reviewPending' ? 'Review pending' : 'Feedback pending'}
        </span>
        <button
          type="button"
          className="cfp-request-action"
          onClick={(e) => {
            e.stopPropagation();
            if (request.actionLabel === 'Review feedback' && request.hasDetail) {
              onOpenDetail(request.id);
            }
          }}
        >
          {request.actionLabel}
          {request.showInfoIcon && <Icon path={mdiInformationOutline} size={0.6} />}
        </button>
      </div>
      {request.hasDetail && (
        <span className="cfp-request-chevron" aria-hidden>
          <Icon path={mdiChevronRight} size={0.8} />
        </span>
      )}
    </div>
  );
}

function AiSuggestionCard({
  edit,
  onApply,
  onDiscard,
}: {
  edit: PendingEdit;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="cfp-ai-suggestion">
      <div className="cfp-ai-suggestion-header">
        <Icon path={mdiCreation} size={0.65} color="#7b4fd6" />
        AI suggestion
      </div>
      <div className="cfp-ai-suggestion-body">
        {edit.kind === 'text' && <span>{edit.newAnswer}</span>}
        {edit.kind === 'rating' && (
          <span className="cfp-ai-suggestion-inline">
            <span className="cfp-q-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon
                  key={i}
                  path={i < edit.newStars ? mdiStar : mdiStarOutline}
                  size={0.8}
                  color={i < edit.newStars ? '#1999AC' : '#c7cbd3'}
                />
              ))}
            </span>
            {edit.newLabel}
          </span>
        )}
        {(edit.kind === 'radio' || edit.kind === 'yesNo') && <span>{edit.newSelected}</span>}
        {edit.kind === 'select' && <span>{edit.newValue}</span>}
        {edit.kind === 'checkboxGroup' && <span>{edit.newSelected.join(', ') || 'None selected'}</span>}
      </div>
      <div className="cfp-ai-suggestion-actions">
        <button type="button" className="cfp-ai-btn cfp-ai-btn--ghost" onClick={onDiscard}>
          Discard
        </button>
        <button type="button" className="cfp-ai-btn cfp-ai-btn--primary" onClick={onApply}>
          <Icon path={mdiCheck} size={0.6} color="#ffffff" />
          Apply
        </button>
      </div>
    </div>
  );
}

function QuestionBlock({
  question,
  pendingEdit,
  onApplyEdit,
  onDiscardEdit,
}: {
  question: FeedbackQuestion;
  pendingEdit?: PendingEdit;
  onApplyEdit: () => void;
  onDiscardEdit: () => void;
}) {
  const suggestion = pendingEdit ? (
    <AiSuggestionCard edit={pendingEdit} onApply={onApplyEdit} onDiscard={onDiscardEdit} />
  ) : null;

  switch (question.type) {
    case 'text':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-answer">{question.answer}</div>
          {question.allowComment && <button type="button" className="cfp-add-comment">+ Add comment</button>}
          {suggestion}
        </div>
      );
    case 'rating':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-rating-row">
            <div className="cfp-q-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon
                  key={i}
                  path={i < question.stars ? mdiStar : mdiStarOutline}
                  size={0.85}
                  color={i < question.stars ? '#1999AC' : '#c7cbd3'}
                />
              ))}
            </div>
            <span className="cfp-q-rating-label">{question.label}</span>
            <button type="button" className="cfp-q-delete" aria-label="Remove rating">
              <Icon path={mdiTrashCanOutline} size={0.75} />
            </button>
          </div>
          <div className="cfp-q-answer">{question.comment}</div>
          {suggestion}
        </div>
      );
    case 'radio':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-radio-row">
            {question.options.map((opt) => (
              <label className="cfp-q-radio" key={opt}>
                <span
                  className={`cfp-radio-dot${question.selected === opt ? ' cfp-radio-dot--selected' : ''}`}
                  aria-hidden
                />
                {opt}
              </label>
            ))}
          </div>
          {suggestion}
        </div>
      );
    case 'checkboxGroup':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-checkbox-grid">
            {question.options.map((opt) => (
              <label className="cfp-q-checkbox" key={opt}>
                <span
                  className={`cfp-checkbox-box${question.selected.includes(opt) ? ' cfp-checkbox-box--checked' : ''}`}
                  aria-hidden
                />
                {opt}
              </label>
            ))}
          </div>
          {question.allowComment && <button type="button" className="cfp-add-comment">+ Add comment</button>}
          {suggestion}
        </div>
      );
    case 'select':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-select">
            <span>{question.value}</span>
            <Icon path={mdiChevronDown} size={0.7} color="#69717F" />
          </div>
          {suggestion}
        </div>
      );
    case 'yesNo':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-radio-row">
            {(['Yes', 'No'] as const).map((opt) => (
              <label className="cfp-q-radio" key={opt}>
                <span
                  className={`cfp-radio-dot${question.selected === opt ? ' cfp-radio-dot--selected' : ''}`}
                  aria-hidden
                />
                {opt}
              </label>
            ))}
          </div>
          {question.allowComment && <button type="button" className="cfp-add-comment">+ Add comment</button>}
          {suggestion}
        </div>
      );
    case 'openComment':
      return (
        <div className="cfp-q">
          <div className="cfp-q-title">{question.question}</div>
          <div className="cfp-q-answer cfp-q-answer--placeholder">{question.placeholder}</div>
          {suggestion}
        </div>
      );
    default:
      return null;
  }
}

export default function CandidateFeedbackPanel({
  open,
  onClose,
  candidate,
  candidates,
  onNavigate,
  positionTitle,
  pendingCount,
}: CandidateFeedbackPanelProps) {
  const [view, setView] = useState<'summary' | 'detail'>('summary');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>(FEEDBACK_QUESTIONS);
  const [pendingEdits, setPendingEdits] = useState<Map<number, PendingEdit>>(new Map());
  const [instruction, setInstruction] = useState('');
  const [voteState, setVoteState] = useState<'idle' | 'up' | 'down'>('idle');
  const [expanded, setExpanded] = useState(false);

  const applyEditToQuestion = (question: FeedbackQuestion, edit: PendingEdit): FeedbackQuestion => {
    if (edit.kind === 'text' && question.type === 'text') return { ...question, answer: edit.newAnswer };
    if (edit.kind === 'rating' && question.type === 'rating') {
      return { ...question, stars: edit.newStars, label: edit.newLabel };
    }
    if (edit.kind === 'radio' && question.type === 'radio') return { ...question, selected: edit.newSelected };
    if (edit.kind === 'checkboxGroup' && question.type === 'checkboxGroup') {
      return { ...question, selected: edit.newSelected };
    }
    if (edit.kind === 'select' && question.type === 'select') return { ...question, value: edit.newValue };
    if (edit.kind === 'yesNo' && question.type === 'yesNo') return { ...question, selected: edit.newSelected };
    return question;
  };

  const submitInstruction = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const found = parseFeedbackInstruction(trimmed, questions);
    if (found.size > 0) {
      setPendingEdits((prev) => {
        const next = new Map(prev);
        found.forEach((edit, idx) => next.set(idx, edit));
        return next;
      });
    }
    setInstruction('');
  };

  const applyEdit = (idx: number) => {
    const edit = pendingEdits.get(idx);
    if (!edit) return;
    setQuestions((prev) => prev.map((q, i) => (i === idx ? applyEditToQuestion(q, edit) : q)));
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.delete(idx);
      return next;
    });
  };

  const discardEdit = (idx: number) => {
    setPendingEdits((prev) => {
      const next = new Map(prev);
      next.delete(idx);
      return next;
    });
  };

  const applyAllEdits = () => {
    setQuestions((prev) => prev.map((q, i) => (pendingEdits.has(i) ? applyEditToQuestion(q, pendingEdits.get(i)!) : q)));
    setPendingEdits(new Map());
  };

  const discardAllEdits = () => setPendingEdits(new Map());

  // Keep rendering the last candidate while the panel slides closed, so the
  // CSS transform transition has content to animate instead of unmounting.
  const lastCandidateRef = useRef<Candidate | null>(null);
  useEffect(() => {
    if (candidate) lastCandidateRef.current = candidate;
  }, [candidate]);
  const displayCandidate = candidate ?? lastCandidateRef.current;

  useEffect(() => {
    setView('summary');
    setActiveRequestId(null);
    setVoteState('idle');
    setExpanded(false);
  }, [displayCandidate?.id]);

  if (!displayCandidate) return null;

  const currentIndex = candidates.findIndex((c) => c.id === displayCandidate.id);
  const total = candidates.length;

  const handlePrevCandidate = () => {
    if (currentIndex > 0) onNavigate(candidates[currentIndex - 1]);
  };
  const handleNextCandidate = () => {
    if (currentIndex < total - 1) onNavigate(candidates[currentIndex + 1]);
  };

  const detailRequests = FEEDBACK_REQUESTS.filter((r) => r.hasDetail);
  const activeDetailIndex = Math.max(
    0,
    detailRequests.findIndex((r) => r.id === activeRequestId)
  );

  const openDetail = (id: string) => {
    setActiveRequestId(id);
    setView('detail');
    setVoteState('idle');
    setExpanded(true);
  };

  const goToDetailByOffset = (offset: number) => {
    const next = detailRequests[activeDetailIndex + offset];
    if (next) {
      setActiveRequestId(next.id);
      setVoteState('idle');
      setExpanded(false);
    }
  };

  const aiInterviewRequests = FEEDBACK_REQUESTS.filter((r) => r.category === 'aiInterviews');
  const interviewRequests = FEEDBACK_REQUESTS.filter((r) => r.category === 'interviews');

  return (
    <>
      <div className={`cfp-overlay${open ? ' cfp-overlay--visible' : ''}`} onClick={onClose} />
      <div className={`cfp-panel${open ? ' cfp-panel--open' : ''}`} role="dialog" aria-modal="true">
        <header className="cfp-header">
          <div className="cfp-header-left">
            <Icon path={mdiCreation} size={0.85} color="#ffffff" />
            <h2 className="cfp-header-title">Companion feedback for {positionTitle}</h2>
          </div>
          <div className="cfp-header-right">
            <button type="button" className="cfp-header-icon-btn" aria-label="Expand">
              <Icon path={mdiArrowExpand} size={0.85} color="#ffffff" />
            </button>
            <button type="button" className="cfp-header-icon-btn" onClick={onClose} aria-label="Close">
              <Icon path={mdiClose} size={0.9} color="#ffffff" />
            </button>
          </div>
        </header>

        {view === 'detail' && (
          <div className="cfp-detail-subheader">
            <div className="cfp-detail-toolbar">
              <button type="button" className="cfp-back-link" onClick={() => setView('summary')}>
                <Icon path={mdiChevronLeft} size={0.75} />
                Back to {displayCandidate.name.split(' ')[0]}'s summary
              </button>
              <div className="cfp-candidate-nav">
                <button
                  type="button"
                  className="cfp-nav-btn"
                  onClick={() => goToDetailByOffset(-1)}
                  disabled={activeDetailIndex === 0}
                  aria-label="Previous feedback form"
                >
                  <Icon path={mdiChevronLeft} size={0.7} />
                </button>
                <span className="cfp-nav-label">
                  {activeDetailIndex + 1} of {detailRequests.length}
                </span>
                <button
                  type="button"
                  className="cfp-nav-btn"
                  onClick={() => goToDetailByOffset(1)}
                  disabled={activeDetailIndex === detailRequests.length - 1}
                  aria-label="Next feedback form"
                >
                  <Icon path={mdiChevronRight} size={0.7} />
                </button>
              </div>
            </div>

            <div
              className={`cfp-detail-candidate-card${expanded ? ' cfp-detail-candidate-card--dimmed' : ''}`}
            >
              <div className="cfp-candidate-avatar" aria-hidden>
                {displayCandidate.initials}
              </div>
              <div className="cfp-candidate-identity">
                <span className="cfp-candidate-name">
                  {displayCandidate.name}
                  <Icon path={mdiOpenInNew} size={0.65} color="#146DA6" />
                </span>
                <span className="cfp-candidate-title">{displayCandidate.title}</span>
              </div>
            </div>
          </div>
        )}

        <div
          className={`cfp-body${view === 'detail' ? ' cfp-body--detail' : ''}${expanded ? ' cfp-body--frozen' : ''}`}
        >
          {view === 'summary' ? (
            <>
              <div className="cfp-candidate-card">
                <div className="cfp-candidate-avatar" aria-hidden>
                  {displayCandidate.initials}
                </div>
                <div className="cfp-candidate-identity">
                  <span className="cfp-candidate-name">
                    {displayCandidate.name}
                    <Icon path={mdiOpenInNew} size={0.65} color="#146DA6" />
                  </span>
                  <span className="cfp-candidate-title">{displayCandidate.title}</span>
                </div>
                <div className="cfp-candidate-nav">
                  <button
                    type="button"
                    className="cfp-nav-btn"
                    onClick={handlePrevCandidate}
                    disabled={currentIndex === 0}
                    aria-label="Previous candidate"
                  >
                    <Icon path={mdiChevronLeft} size={0.75} />
                  </button>
                  <span className="cfp-nav-label">
                    {currentIndex + 1} of {total} candidates
                  </span>
                  <button
                    type="button"
                    className="cfp-nav-btn"
                    onClick={handleNextCandidate}
                    disabled={currentIndex === total - 1}
                    aria-label="Next candidate"
                  >
                    <Icon path={mdiChevronRight} size={0.75} />
                  </button>
                </div>
              </div>

              <div className="cfp-summary-row">
                <div className="cfp-summary-label-group">
                  <span className="cfp-summary-label">Feedback summary</span>
                  <span className="cfp-summary-badge">
                    <Icon path={mdiClockOutline} size={0.65} />
                    {pendingCount}
                  </span>
                </div>
                <div className="cfp-summary-actions">
                  <button type="button" className="cfp-icon-circle-btn" aria-label="Share">
                    <Icon path={mdiShareVariant} size={0.75} />
                  </button>
                  <button type="button" className="cfp-icon-circle-btn" aria-label="Download">
                    <Icon path={mdiDownload} size={0.75} />
                  </button>
                </div>
              </div>

              <div className="cfp-event-row">
                <span className="cfp-event-note">
                  <Icon path={mdiCalendarBlankOutline} size={0.75} />
                  Event not associated
                </span>
                <span className="cfp-event-date">Last feedback submitted on 10 Aug 2026</span>
              </div>

              <h3 className="cfp-section-title cfp-section-title--ai">AI Interviews</h3>
              <div className="cfp-request-list">
                {aiInterviewRequests.map((r) => (
                  <RequestRow key={r.id} request={r} onOpenDetail={openDetail} />
                ))}
              </div>

              <h3 className="cfp-section-title">Interviews</h3>
              <div className="cfp-request-list">
                {interviewRequests.map((r) => (
                  <RequestRow key={r.id} request={r} onOpenDetail={openDetail} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="cfp-detail-lower">
                <div className={`cfp-detail-dim-wrap${expanded ? ' cfp-detail-dim-wrap--dimmed' : ''}`}>
                  <div className="cfp-detail-meta-row">
                    <div className="cfp-detail-meta-col">
                      <span className="cfp-detail-meta-label">Interviewer</span>
                      <div className="cfp-detail-interviewer">
                        <div className="cfp-request-avatar" style={{ backgroundColor: '#69717F' }} aria-hidden>
                          JB
                        </div>
                        <div>
                          <div className="cfp-detail-interviewer-name">{FEEDBACK_META.interviewerName}</div>
                          <div className="cfp-detail-interviewer-role">{FEEDBACK_META.interviewerRole}</div>
                        </div>
                      </div>
                    </div>
                    <div className="cfp-detail-meta-col">
                      <span className="cfp-detail-meta-label">Interview</span>
                      <div className="cfp-detail-meta-value">{FEEDBACK_META.interviewType}</div>
                      <div className="cfp-detail-meta-sub">{FEEDBACK_META.interviewDate}</div>
                    </div>
                    <div className="cfp-detail-meta-col">
                      <span className="cfp-detail-meta-label">Status</span>
                      <div className="cfp-detail-status-badge">
                        <Icon path={mdiThumbUp} size={0.6} color="#ffffff" />
                        Submitted
                      </div>
                      <div className="cfp-detail-meta-sub">{FEEDBACK_META.submittedDate}</div>
                    </div>
                  </div>

                  {pendingEdits.size > 0 && (
                    <div className="cfp-ai-banner">
                      <span className="cfp-ai-banner-text">
                        <Icon path={mdiCreation} size={0.7} color="#7b4fd6" />
                        AI proposed {pendingEdits.size} update{pendingEdits.size > 1 ? 's' : ''} — review the
                        highlighted fields below.
                      </span>
                      <span className="cfp-ai-banner-actions">
                        <button type="button" className="cfp-ai-btn cfp-ai-btn--ghost" onClick={discardAllEdits}>
                          Discard all
                        </button>
                        <button type="button" className="cfp-ai-btn cfp-ai-btn--primary" onClick={applyAllEdits}>
                          Apply all
                        </button>
                      </span>
                    </div>
                  )}

                  <div className="cfp-questions">
                    {questions.map((q, i) => (
                      <QuestionBlock
                        key={i}
                        question={q}
                        pendingEdit={pendingEdits.get(i)}
                        onApplyEdit={() => applyEdit(i)}
                        onDiscardEdit={() => discardEdit(i)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {view === 'detail' && (
          <div className={`cfp-fip-bar${expanded ? ' cfp-fip-bar--expanded' : ''}`}>
            {expanded ? (
              <>
                <div className="cfp-fip-expanded-header">
                  <Icon path={mdiFormatListBulletedSquare} size={0.85} color="#1A212E" />
                  Here's a few signals we identified from {displayCandidate.name.split(' ')[0]}'s interview
                </div>

                <div className="cfp-fip-signal-list">
                  {INTERVIEW_SIGNALS.map((signal) => (
                    <div key={signal} className="cfp-fip-signal-row">
                      <span className="cfp-fip-signal-text">{signal}</span>
                      <div className="cfp-fip-signal-actions">
                        <button type="button" className="cfp-fip-signal-btn">
                          Agree
                        </button>
                        <button type="button" className="cfp-fip-signal-btn">
                          Disagree
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cfp-fip-expanded-footer">
                  <div className="cfp-fip-notes-field">
                    <input
                      type="text"
                      className="cfp-fip-notes-input"
                      placeholder="Add your notes here if any"
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitInstruction(instruction);
                      }}
                    />
                    <button
                      type="button"
                      className="cfp-fip-arrow-btn"
                      aria-label="Submit instruction"
                      disabled={!instruction.trim()}
                      onClick={() => submitInstruction(instruction)}
                    >
                      <Icon path={mdiArrowUp} size={0.8} color="#054D7B" />
                    </button>
                  </div>
                  <button type="button" className="cfp-fip-skip-btn" onClick={() => setExpanded(false)}>
                    Go to feedback
                  </button>
                </div>
              </>
            ) : voteState === 'idle' ? (
              <div className="cfp-fip-pill">
                <button
                  type="button"
                  className="cfp-fip-thumb"
                  aria-label="Thumbs up"
                  onClick={() => setVoteState('up')}
                >
                  <Icon path={mdiThumbUpOutline} size={0.85} color="#054D7B" />
                </button>
                <button
                  type="button"
                  className="cfp-fip-thumb"
                  aria-label="Thumbs down"
                  onClick={() => setVoteState('down')}
                >
                  <Icon path={mdiThumbDownOutline} size={0.85} color="#054D7B" />
                </button>

                <input
                  type="text"
                  className="cfp-fip-input"
                  placeholder="Prompt to edit feedback"
                  value={instruction}
                  onFocus={() => setExpanded(true)}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitInstruction(instruction);
                  }}
                />

                <button
                  type="button"
                  className="cfp-fip-arrow-btn"
                  aria-label="Submit instruction"
                  disabled={!instruction.trim()}
                  onClick={() => submitInstruction(instruction)}
                >
                  <Icon path={mdiArrowUp} size={0.8} color="#054D7B" />
                </button>
              </div>
            ) : (
              <div className="cfp-fip-voted-row">
                <div className="cfp-fip-pill cfp-fip-pill--voted">
                  <span className="cfp-fip-thumb cfp-fip-thumb--voted" aria-hidden>
                    <Icon path={voteState === 'up' ? mdiThumbUp : mdiThumbDown} size={0.8} color="#ffffff" />
                  </span>
                  <span className="cfp-fip-voted-msg">You voted thumbs {voteState} for this candidate</span>
                  <button type="button" className="cfp-fip-submit-feedback-btn" onClick={() => setVoteState('idle')}>
                    Submit feedback
                  </button>
                </div>
                <button type="button" className="cfp-fip-cancel-btn" onClick={() => setVoteState('idle')}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
