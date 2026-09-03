import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  ButtonVariant,
  CheckBox,
  IconName,
  IconSize,
  LinkButton,
  LinkButtonIconAlign,
  LinkButtonSize,
  LinkButtonVariant,
  type OcThemeName,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import {
  mdiChevronDown,
  mdiCreation,
  mdiMagnify,
  mdiFilterVariantPlus,
  mdiFormatListBulleted,
  mdiViewGridOutline,
  mdiTune,
  mdiDotsVertical,
} from '@mdi/js';
import { candidates, type Candidate } from '../data/candidates';
import {
  getActionLabelForCategory,
  getNudgeForRowIndex,
  type CandidateNudge,
  type NudgeActionCategory,
} from '../data/candidateNudges';
import { getFeedbackPending } from '../data/feedbackRequests';
import InlineChatMiniModal from './InlineChatMiniModal';
import AiInsightsPopover from './AiInsightsPopover';
import FreeWorldCandidateList from './FreeWorldCandidateList';
import aiInterviewLogo from '/ai-interview-logo.png';
import './CandidateTable.css';

export type NudgeDisplayMode =
  | 'popup'
  | 'inline'
  | 'inlineChat'
  | 'actionable'
  | 'oda20'
  | 'freeWorld'
  | 'none';

interface CandidateTableProps {
  onInterviewWithAI: () => void;
  onCandidateClick?: (candidate: Candidate) => void;
  onNudgeViewClick?: (candidate: Candidate, nudge: CandidateNudge) => void;
  selectedIds: Set<string>;
  onToggleCandidate: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  nudgeDisplayMode: NudgeDisplayMode;
  onOpenAssistantWithPrompt?: (candidate: Candidate, prompt: string) => void;
  onAssistantPipelinePrompt?: (prompt: string, candidateIds: string[]) => void;
  onOpenFeedback?: (candidate: Candidate, rowIndex: number) => void;
}

function MatchIndicator({ candidate }: { candidate: Candidate }) {
  const score = candidate.matchScore ?? 0;
  const filled = Math.round(score);
  const hasAiBadge = candidate.interviewRound === 'Technical screen' || candidate.interviewRound === 'Phone screen';
  return (
    <div className="match-indicator" title={`Match ${score}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`match-dot${i < filled ? ' match-dot--filled' : ''}`} />
      ))}
      {hasAiBadge && <img src={aiInterviewLogo} alt="AI interviewed" className="match-ai-badge" />}
    </div>
  );
}

function getActionTheme(category: NudgeActionCategory): OcThemeName {
  switch (category) {
    case 'position':
      return 'green';
    case 'negative':
      return 'red';
    case 'overqualified':
      return 'orange';
    case 'neutral':
    default:
      return 'blueViolet';
  }
}

function NudgeViewCta({
  candidate,
  nudge,
  onClick,
  cta,
}: {
  candidate: Candidate;
  nudge: CandidateNudge;
  onClick: (e: React.MouseEvent) => void;
  cta: 'view' | 'askAi';
}) {
  const isAsk = cta === 'askAi';
  return (
    <LinkButton
      classNames={`candidate-nudge-view-btn${isAsk ? ' candidate-nudge-view-btn--ask' : ''}`}
      text={isAsk ? 'Ask AI' : 'View'}
      variant={LinkButtonVariant.Primary}
      size={LinkButtonSize.Small}
      gradient
      theme="blueViolet"
      alignIcon={LinkButtonIconAlign.Right}
      iconProps={{ path: IconName.mdiChevronRight, size: IconSize.XSmall }}
      href="#"
      onClick={onClick}
      aria-label={
        isAsk ? `Ask AI about ${nudge.label} for ${candidate.name}` : `View ${nudge.label} for ${candidate.name}`
      }
    />
  );
}

function AddToCompareCta({
  candidate,
  onAdd,
}: {
  candidate: Candidate;
  onAdd?: (id: string) => void;
}) {
  return (
    <LinkButton
      classNames="candidate-nudge-view-btn candidate-nudge-view-btn--add-compare"
      text="Add to compare"
      variant={LinkButtonVariant.Secondary}
      size={LinkButtonSize.Small}
      theme="blueViolet"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd?.(candidate.id);
      }}
      aria-label={`Add ${candidate.name} to compare`}
    />
  );
}

function FilterBar() {
  return (
    <div className="candidate-filter-bar">
      <div className="filter-bar-group">
        <button type="button" className="filter-pill filter-pill--active">
          Views : New Applicants
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
        <span className="filter-bar-divider" aria-hidden />
        <button type="button" className="filter-pill filter-pill--active">
          ATS Stage
          <span className="filter-pill-badge">1</span>
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
        <button type="button" className="filter-pill">
          Match Score
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
        <button type="button" className="filter-pill">
          Highlights
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
        <button type="button" className="filter-pill filter-pill--active">
          <Icon path={mdiTune} size={0.6} />
          All filters
          <span className="filter-pill-badge">1</span>
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
        <span className="filter-bar-divider" aria-hidden />
        <button type="button" className="filter-pill">
          Sort by
          <Icon path={mdiChevronDown} size={0.6} />
        </button>
      </div>
      <div className="filter-bar-icons">
        <button type="button" className="filter-icon-btn" aria-label="Search">
          <Icon path={mdiMagnify} size={0.8} />
        </button>
        <button type="button" className="filter-icon-btn" aria-label="Filter">
          <Icon path={mdiFilterVariantPlus} size={0.8} />
        </button>
        <button type="button" className="filter-icon-btn filter-icon-btn--active" aria-label="List view">
          <Icon path={mdiFormatListBulleted} size={0.8} />
        </button>
        <button type="button" className="filter-icon-btn" aria-label="Grid view">
          <Icon path={mdiViewGridOutline} size={0.8} />
        </button>
        <button type="button" className="filter-icon-btn" aria-label="Settings">
          <Icon path={mdiTune} size={0.8} />
        </button>
        <button type="button" className="filter-icon-btn filter-icon-btn--ai" aria-label="AI assistant">
          <Icon path={mdiCreation} size={0.8} />
        </button>
      </div>
    </div>
  );
}

function ActionToolbar({ onInterviewWithAI }: { onInterviewWithAI: () => void }) {
  return (
    <div className="candidate-action-toolbar">
      <button type="button" className="action-pill">
        Advance Stage
        <Icon path={mdiChevronDown} size={0.6} />
      </button>
      <span className="filter-bar-divider" aria-hidden />
      <button type="button" className="action-pill">Share</button>
      <button type="button" className="action-pill">Share Feedback</button>
      <button type="button" className="action-pill action-pill--ai" onClick={onInterviewWithAI}>
        <Icon path={mdiCreation} size={0.65} />
        Interview with AI
      </button>
      <button type="button" className="action-pill">Request Decision</button>
      <button type="button" className="action-pill">
        Contact
        <Icon path={mdiChevronDown} size={0.6} />
      </button>
      <button type="button" className="action-pill action-pill--danger">Reject</button>
      <button type="button" className="action-pill">
        Schedule
        <Icon path={mdiChevronDown} size={0.6} />
      </button>
      <button type="button" className="action-pill">Add as Ideal Candidate</button>
      <button type="button" className="filter-icon-btn" aria-label="More actions">
        <Icon path={mdiDotsVertical} size={0.85} />
      </button>
    </div>
  );
}

function ActionNudgeCta({
  candidate,
  nudge,
  onClick,
}: {
  candidate: Candidate;
  nudge: CandidateNudge;
  onClick: (e: React.MouseEvent) => void;
}) {
  const label = getActionLabelForCategory(nudge.actionCategory);
  const theme = getActionTheme(nudge.actionCategory);
  const isOverqualified = nudge.actionCategory === 'overqualified';
  return (
    <LinkButton
      classNames={`candidate-nudge-view-btn candidate-nudge-view-btn--action${isOverqualified ? ' candidate-nudge-view-btn--tone-overqualified' : ''}`}
      text={label}
      variant={LinkButtonVariant.Primary}
      size={LinkButtonSize.Small}
      gradient={!isOverqualified}
      theme={theme}
      href="#"
      onClick={onClick}
      aria-label={`${label} — ${nudge.label} for ${candidate.name}`}
    />
  );
}

export default function CandidateTable({
  onInterviewWithAI,
  onCandidateClick,
  onNudgeViewClick,
  selectedIds,
  onToggleCandidate,
  onToggleAll,
  onClearSelection,
  nudgeDisplayMode,
  onOpenAssistantWithPrompt,
  onAssistantPipelinePrompt,
  onOpenFeedback,
}: CandidateTableProps) {
  const isFreeWorld = nudgeDisplayMode === 'freeWorld';
  const isOda20 = nudgeDisplayMode === 'oda20';
  const isPopup = nudgeDisplayMode === 'popup';
  const isInline = nudgeDisplayMode === 'inline';
  const isInlineChat = nudgeDisplayMode === 'inlineChat';
  const isActionable = nudgeDisplayMode === 'actionable';
  const showInlineStrip = (isInline || isInlineChat || isActionable) && !isOda20 && !isFreeWorld;
  const [popupNudgeActiveId, setPopupNudgeActiveId] = useState<string | null>(null);
  const [inlineMiniChat, setInlineMiniChat] = useState<{
    candidate: Candidate;
    nudge: CandidateNudge;
  } | null>(null);
  const [odaInsights, setOdaInsights] = useState<{ candidate: Candidate; anchor: HTMLElement | null } | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [headerHovered, setHeaderHovered] = useState(false);

  const isDefault = nudgeDisplayMode === 'none';
  const hasSelection = selectedIds.size > 0;

  useEffect(() => {
    setInlineMiniChat(null);
  }, [nudgeDisplayMode]);

  useEffect(() => {
    setOdaInsights(null);
  }, [nudgeDisplayMode]);

  const handlePrimaryCta = (e: React.MouseEvent, candidate: Candidate, nudge: CandidateNudge) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInlineChat) {
      setInlineMiniChat({ candidate, nudge });
      return;
    }
    onNudgeViewClick?.(candidate, nudge);
  };

  const handleActionableCta = (e: React.MouseEvent, candidate: Candidate, nudge: CandidateNudge) => {
    e.preventDefault();
    e.stopPropagation();
    if (nudge.actionCategory === 'neutral') {
      onToggleCandidate(candidate.id);
    }
  };

  return (
    <div className="candidate-table-wrapper">
      {isDefault ? (
        <div className="toolbar-flip-wrapper">
          <div key={hasSelection ? 'actions' : 'filters'} className="toolbar-flip-anim">
            {hasSelection ? (
              <ActionToolbar onInterviewWithAI={onInterviewWithAI} />
            ) : (
              <FilterBar />
            )}
          </div>
        </div>
      ) : (
        <div className="table-actions">
          <button className="interview-ai-btn" onClick={onInterviewWithAI}>
            <img src={aiInterviewLogo} alt="" className="ai-btn-icon" />
            Interview with AI
          </button>
          <Button text="Schedule" variant={ButtonVariant.Secondary}>
            <Icon path={mdiChevronDown} size={0.65} />
          </Button>
        </div>
      )}

      {isFreeWorld ? (
        <FreeWorldCandidateList
          selectedIds={selectedIds}
          onToggleCandidate={onToggleCandidate}
          onToggleAll={onToggleAll}
          onClearSelection={onClearSelection}
          onCandidateClick={onCandidateClick}
          onInterviewWithAI={onInterviewWithAI}
          onOpenAssistantWithPrompt={onOpenAssistantWithPrompt}
          onAssistantPipelinePrompt={onAssistantPipelinePrompt}
        />
      ) : (
        <table className="candidate-table">
          <thead>
            <tr>
              <th
                className="col-candidate"
                onMouseEnter={() => isDefault && setHeaderHovered(true)}
                onMouseLeave={() => isDefault && setHeaderHovered(false)}
              >
                <div className="th-content">
                  {(!isDefault || headerHovered || hasSelection) && (
                    <CheckBox
                      checked={selectedIds.size === candidates.length}
                      onChange={onToggleAll}
                    />
                  )}
                  {isDefault && hasSelection ? (
                    <span className="th-label th-selected-summary">
                      {selectedIds.size} of {candidates.length} selected
                    </span>
                  ) : (
                    <span className="th-label">
                      Candidate
                      <span className="th-count">{candidates.length}</span>
                    </span>
                  )}
                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      className="th-clear-selection"
                      onClick={onClearSelection}
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </th>
              {isDefault && <th className="col-match">Match</th>}
              {isDefault && <th className="col-stage">Hiring Stage</th>}
              {isDefault && <th className="col-meeting">Meeting</th>}
              <th className="col-date">Application Time</th>
              {isDefault && <th className="col-feedback">Feedback</th>}
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate: Candidate, rowIndex: number) => {
              const nudge = getNudgeForRowIndex(rowIndex);
              return (
                <tr key={candidate.id} className={selectedIds.has(candidate.id) ? 'row-selected' : ''}>
                  <td
                    className={`col-candidate candidate-cell-wrap${showInlineStrip ? ' candidate-cell-wrap--inline-mode' : ''}`}
                  >
                    <div
                      className={`candidate-hover-nudge${isPopup ? ' candidate-hover-nudge--popup' : ''}${showInlineStrip ? ' candidate-hover-nudge--inline' : ''}${isPopup && popupNudgeActiveId === candidate.id ? ' candidate-hover-nudge--active' : ''}`}
                      onMouseEnter={() => isPopup && setPopupNudgeActiveId(candidate.id)}
                      onMouseLeave={() => isPopup && setPopupNudgeActiveId(null)}
                    >
                      <div className={`candidate-cell${showInlineStrip ? ' candidate-cell--inline' : ''}`}>
                        {isDefault ? (
                          <div
                            className={`candidate-avatar-slot${selectedIds.has(candidate.id) || hoveredRowId === candidate.id ? ' candidate-avatar-slot--checkbox-visible' : ''}`}
                            onMouseEnter={() => setHoveredRowId(candidate.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                          >
                            <div className="avatar-slot-layer avatar-slot-layer--checkbox">
                              <CheckBox
                                checked={selectedIds.has(candidate.id)}
                                onChange={() => onToggleCandidate(candidate.id)}
                              />
                            </div>
                            <div className="avatar-slot-layer avatar-slot-layer--avatar">
                              {candidate.avatarSrc ? (
                                <Avatar
                                  src={candidate.avatarSrc}
                                  alt={candidate.name}
                                  size="40px"
                                  type="round"
                                />
                              ) : (
                                <div
                                  className="candidate-avatar"
                                  style={{ backgroundColor: candidate.avatarColor }}
                                >
                                  {candidate.initials}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <CheckBox
                              checked={selectedIds.has(candidate.id)}
                              onChange={() => onToggleCandidate(candidate.id)}
                            />
                            {candidate.avatarSrc ? (
                              <Avatar
                                src={candidate.avatarSrc}
                                alt={candidate.name}
                                size="40px"
                                type="round"
                              />
                            ) : (
                              <div
                                className="candidate-avatar"
                                style={{ backgroundColor: candidate.avatarColor }}
                              >
                                {candidate.initials}
                              </div>
                            )}
                          </>
                        )}
                        <div className="candidate-text-stack">
                          <div className="candidate-info">
                            {isPopup ? (
                              <>
                                <div className="candidate-popup-name-row">
                                  <span
                                    className="candidate-name clickable"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCandidateClick?.(candidate);
                                    }}
                                  >
                                    {candidate.name}
                                  </span>
                                  <div className="candidate-nudge-popup-anchor">
                                    <div className="candidate-nudge-tooltip" role="tooltip">
                                      <span className="candidate-nudge-label">{nudge.label}</span>
                                      <p className="candidate-nudge-text">{nudge.text}</p>
                                      <div className="candidate-nudge-tooltip-footer">
                                        <NudgeViewCta
                                          candidate={candidate}
                                          nudge={nudge}
                                          cta="view"
                                          onClick={(e) => handlePrimaryCta(e, candidate, nudge)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <span className="candidate-title">{candidate.title}</span>
                              </>
                            ) : isOda20 ? (
                              <>
                                <div className="candidate-name-row-oda">
                                  <span
                                    className="candidate-name clickable"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCandidateClick?.(candidate);
                                    }}
                                  >
                                    {candidate.name}
                                  </span>
                                  <button
                                    type="button"
                                    className="oda-analyse-with-ai-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const anchor =
                                        (e.currentTarget.closest('.candidate-name-row-oda') as HTMLElement) ||
                                        null;
                                      setOdaInsights((prev) =>
                                        prev?.candidate.id === candidate.id ? null : { candidate, anchor }
                                      );
                                    }}
                                    aria-expanded={odaInsights?.candidate.id === candidate.id}
                                    aria-haspopup="dialog"
                                  >
                                    <Icon path={mdiCreation} size={0.6} color="#fff" />
                                    Analyse with AI
                                  </button>
                                </div>
                                <span className="candidate-title">{candidate.title}</span>
                              </>
                            ) : (
                              <>
                                <span
                                  className="candidate-name clickable"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCandidateClick?.(candidate);
                                  }}
                                >
                                  {candidate.name}
                                </span>
                                <span className="candidate-title">{candidate.title}</span>
                              </>
                            )}
                          </div>
                        {showInlineStrip && (
                          <div
                            className={`candidate-nudge-inline${isActionable ? ' candidate-nudge-inline--actionable-row' : ''}`}
                          >
                            <span className="candidate-nudge-inline-sparkle" aria-hidden>
                              <Icon path={mdiCreation} size={0.7} color="#593CB4" />
                            </span>
                            <div className="candidate-nudge-inline-body">
                              <span className="candidate-nudge-inline-label">{nudge.label}</span>
                              <span className="candidate-nudge-inline-sep" aria-hidden>
                                ·
                              </span>
                              <span className="candidate-nudge-inline-fact">{nudge.text}</span>
                            </div>
                            {isActionable ? (
                              <div className="candidate-nudge-inline-ctas">
                                <ActionNudgeCta
                                  candidate={candidate}
                                  nudge={nudge}
                                  onClick={(e) => handleActionableCta(e, candidate, nudge)}
                                />
                                {nudge.actionCategory !== 'neutral' && (
                                  <AddToCompareCta candidate={candidate} onAdd={onToggleCandidate} />
                                )}
                              </div>
                            ) : isInline ? (
                              <div className="candidate-nudge-inline-ctas">
                                <NudgeViewCta
                                  candidate={candidate}
                                  nudge={nudge}
                                  cta="view"
                                  onClick={(e) => handlePrimaryCta(e, candidate, nudge)}
                                />
                                <AddToCompareCta candidate={candidate} onAdd={onToggleCandidate} />
                              </div>
                            ) : (
                              <NudgeViewCta
                                candidate={candidate}
                                nudge={nudge}
                                cta={isInlineChat ? 'askAi' : 'view'}
                                onClick={(e) => handlePrimaryCta(e, candidate, nudge)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                {isDefault && (
                  <td className="col-match">
                    <MatchIndicator candidate={candidate} />
                  </td>
                )}
                {isDefault && (
                  <td className="col-stage">{candidate.interviewRound ?? '—'}</td>
                )}
                {isDefault && <td className="col-meeting">—</td>}
                <td className="col-date">{candidate.applicationDate}</td>
                {isDefault && (
                  <td className="col-feedback">
                    {getFeedbackPending(rowIndex) > 0 ? (
                      <button
                        type="button"
                        className="feedback-pending"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFeedback?.(candidate, rowIndex);
                        }}
                      >
                        {getFeedbackPending(rowIndex)} pending
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <AiInsightsPopover
        candidate={odaInsights?.candidate ?? null}
        open={odaInsights !== null}
        anchorEl={odaInsights?.anchor ?? null}
        onClose={() => setOdaInsights(null)}
        onOpenAssistantWithPrompt={onOpenAssistantWithPrompt}
        onAddToCompare={(c) => onToggleCandidate(c.id)}
      />

      <InlineChatMiniModal
        open={inlineMiniChat !== null}
        onClose={() => setInlineMiniChat(null)}
        candidate={inlineMiniChat?.candidate ?? null}
        nudge={inlineMiniChat?.nudge ?? null}
      />
    </div>
  );
}
