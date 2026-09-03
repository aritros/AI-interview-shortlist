import { useEffect, useState } from 'react';
import {
  Button,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
  CheckBox,
  Link,
  Pill,
  PillSize,
  TextInput,
  TextInputShape,
  TextInputSize,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import {
  mdiClose,
  mdiInformationOutline,
  mdiCheck,
  mdiChevronDown,
  mdiAlertOutline,
  mdiMinus,
  mdiPlus,
} from '@mdi/js';
import aiInterviewLogo from '/ai-interview-logo.png';
import eightfoldLogo from '/eightfold-logo.png';
import './AutomationSetupPanel.css';

/* ---------- Data modelled from Figma node 58:34691 ---------- */

interface InterviewOption {
  id: string;
  badge: string | null;
  glyph: string | null;
  title: string;
  tags: string[];
  meta: string;
}

const INTERVIEW_OPTIONS: InterviewOption[] = [
  {
    id: '360',
    badge: 'Recommended',
    glyph: '360°',
    title: '360 interview',
    tags: ['Profile', 'Technical Q&A', 'Coding'],
    meta: '10 questions · 60 mins',
  },
  {
    id: 'comprehensive',
    badge: null,
    glyph: null,
    title: 'Comprehensive evaluation',
    tags: ['Profile', 'Conceptual Q&A', 'Coding'],
    meta: '10 questions · 60 mins',
  },
];

interface SectionInfo {
  title: string;
  questions: string;
  time: string;
  desc: string;
  dot: string;
}

const SECTIONS: SectionInfo[] = [
  {
    title: 'Profile screening',
    questions: '5 questions',
    time: '15 mins',
    desc: 'Evaluate skills and competencies with pre-built tests',
    dot: '#1999AC',
  },
  {
    title: 'Conceptual Q&A',
    questions: '3 questions',
    time: '15 mins',
    desc: 'Check theory and domain knowledge',
    dot: '#2C8CC9',
  },
  {
    title: 'Coding excercise',
    questions: '2 questions',
    time: '40 mins',
    desc: 'Hands-on coding tasks matched to the job description',
    dot: '#7C5CFC',
  },
  {
    title: 'Algorithmic challenge',
    questions: '2 questions',
    time: '40 mins',
    desc: 'Algorithmic thinking with automated test cases',
    dot: '#C158DC',
  },
];

/* Step 2 — automation filters (Figma node 43:28281) */
interface FilterInfo {
  key: string;
  title: string;
  desc: string;
}

const FILTERS: FilterInfo[] = [
  { key: 'match', title: 'Match score', desc: 'Invite candidates above a certain match score' },
  {
    key: 'relevant',
    title: 'Relevant experience',
    desc: 'Invite candidates with the right skills and similar past experience',
  },
  { key: 'level', title: 'Right level', desc: 'Invite candidates at the right seniority and experience level' },
  {
    key: 'nearby',
    title: 'Nearby candidates',
    desc: 'Invite candidates within a set distance from the job location',
  },
  {
    key: 'trajectory',
    title: 'Strong career trajectory',
    desc: 'Invite candidates with consistent growth and progression',
  },
];

interface AutomationSetupPanelProps {
  open: boolean;
  onClose: () => void;
}

/* ---------- Subcomponents ---------- */

function InterviewCard({
  option,
  selected,
  onSelect,
}: {
  option: InterviewOption;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`asetup-iv-card${selected ? ' asetup-iv-card--selected' : ''}`}
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
    >
      {option.badge && (
        <Pill label={option.badge} theme="blueGreen" size={PillSize.XSmall} />
      )}
      <div className="asetup-iv-card-head">
        {option.glyph && <span className="asetup-iv-glyph">{option.glyph}</span>}
        <span className="asetup-iv-title">{option.title}</span>
      </div>
      <div className="asetup-iv-tags">
        {option.tags.map((t) => (
          <Pill key={t} label={t} theme="grey" size={PillSize.XSmall} />
        ))}
      </div>
      <div className="asetup-iv-meta">{option.meta}</div>
    </button>
  );
}

/* Vertical stepper — token-faithful (Octuple's <Stepper> ships a boolean `ref`
   that React 19, which this repo uses, rejects; so it's rendered here with the
   same DS tokens instead). */
const STEPS = ['Review interview details', 'Define automation settings'];

function StepRail({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="asetup-stepper">
      {STEPS.map((label, i) => {
        const active = i === activeIndex;
        const complete = i < activeIndex;
        const last = i === STEPS.length - 1;
        const nodeState = complete ? 'complete' : active ? 'active' : 'pending';
        return (
          <li className="asetup-step" key={label}>
            <div className="asetup-step-rail">
              <span className={`asetup-step-node asetup-step-node--${nodeState}`}>
                {complete ? <Icon path={mdiCheck} size={0.6} color="#ffffff" /> : i + 1}
              </span>
              {!last && (
                <span
                  className={`asetup-step-line${i < activeIndex ? ' asetup-step-line--done' : ''}`}
                />
              )}
            </div>
            <span
              className={`asetup-step-label${active || complete ? ' asetup-step-label--active' : ' asetup-step-label--pending'}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* Number stepper — Octuple Buttons + TextInput */
function NumberStepper({
  value,
  unit,
  onChange,
}: {
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="asetup-num">
      <Button
        variant={ButtonVariant.Neutral}
        shape={ButtonShape.Round}
        size={ButtonSize.Small}
        ariaLabel={`Decrease ${unit}`}
        iconProps={{ path: mdiMinus as any }}
        onClick={() => onChange(Math.max(0, value - 1))}
      />
      <span className="asetup-num-field">
        <TextInput
          numbersOnly
          shape={TextInputShape.Underline}
          size={TextInputSize.Small}
          value={String(value)}
          onChange={(e) => onChange(Number((e.target as HTMLInputElement).value) || 0)}
          classNames="asetup-num-input"
          aria-label={unit}
        />
        <span className="asetup-num-unit">{unit}</span>
      </span>
      <Button
        variant={ButtonVariant.Neutral}
        shape={ButtonShape.Round}
        size={ButtonSize.Small}
        ariaLabel={`Increase ${unit}`}
        iconProps={{ path: mdiPlus as any }}
        onClick={() => onChange(value + 1)}
      />
    </div>
  );
}

/* Gradient-bordered flow card with a grey section-label pill */
function FlowCard({
  label,
  children,
  connector,
}: {
  label: string;
  children: React.ReactNode;
  connector?: boolean;
}) {
  return (
    <div className="asetup-flowcard-wrap">
      {connector && <span className="asetup-flow-connector" />}
      <div className="asetup-flowcard">
        <span className="asetup-flowcard-label">
          <Pill label={label} theme="grey" size={PillSize.XSmall} />
        </span>
        <div className="asetup-flowcard-body">{children}</div>
      </div>
    </div>
  );
}

function AutomationSettings() {
  const [invitesPerDay, setInvitesPerDay] = useState(40);
  const [stopAfter, setStopAfter] = useState(15);
  const [pauseOnStage, setPauseOnStage] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({});

  return (
    <div className="asetup-flow">
      <FlowCard label="Trigger">
        <div className="asetup-trigger">New applicant received</div>
      </FlowCard>

      <FlowCard label="Conditions" connector>
        <div className="asetup-cond-row">
          <div className="asetup-cond-text">
            <span className="asetup-cond-title">Invites per day</span>
            <span className="asetup-cond-desc">
              Maximum number of AI interview invites to be sent per day
            </span>
          </div>
          <NumberStepper value={invitesPerDay} unit="invites" onChange={setInvitesPerDay} />
        </div>
        <div className="asetup-cond-row">
          <div className="asetup-cond-text">
            <span className="asetup-cond-title">Stop invites after</span>
            <span className="asetup-cond-desc">Define when to stop the automation process</span>
          </div>
          <NumberStepper value={stopAfter} unit="days" onChange={setStopAfter} />
        </div>
        <div className="asetup-cond-row">
          <div className="asetup-cond-text">
            <span className="asetup-cond-title">Pause invites based on hiring stage</span>
            <span className="asetup-cond-desc">
              Define settings to pause automation if there are candidates in a specific stage
            </span>
          </div>
          <CheckBox
            toggle
            checked={pauseOnStage}
            onChange={(e) => setPauseOnStage((e.target as HTMLInputElement).checked)}
            ariaLabel="Pause invites based on hiring stage"
          />
        </div>
      </FlowCard>

      <FlowCard label="Filters" connector>
        <div className="asetup-filter-list">
          {FILTERS.map((f) => (
            <div className="asetup-filter-card" key={f.key}>
              <div className="asetup-cond-text">
                <span className="asetup-cond-title">{f.title}</span>
                <span className="asetup-cond-desc">{f.desc}</span>
              </div>
              <CheckBox
                toggle
                checked={!!filters[f.key]}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [f.key]: (e.target as HTMLInputElement).checked }))
                }
                ariaLabel={f.title}
              />
            </div>
          ))}
        </div>
      </FlowCard>
    </div>
  );
}

function SectionRow({ section, last }: { section: SectionInfo; last: boolean }) {
  return (
    <div className="asetup-section-row">
      <div className="asetup-section-rail">
        <span className="asetup-section-dot" style={{ background: section.dot }} />
        {!last && <span className="asetup-section-line" />}
      </div>
      <div className="asetup-section-body">
        <div className="asetup-section-headline">
          <span className="asetup-section-title">{section.title}</span>
          <Pill label={section.questions} theme="grey" size={PillSize.XSmall} />
          <Pill label={section.time} theme="grey" size={PillSize.XSmall} />
        </div>
        <div className="asetup-section-desc">{section.desc}</div>
      </div>
      <Icon path={mdiChevronDown} size={0.7} color="#69717F" className="asetup-section-chevron" />
    </div>
  );
}

function DetailCard() {
  return (
    <div className="asetup-detail-card">
      <div className="asetup-detail-scroll">
        <h2 className="asetup-detail-title">360 interview</h2>
        <div className="asetup-detail-metarow">
          <span className="asetup-meta-agent">Sophia (AI agent)</span>
          <span className="asetup-meta-item">
            <Icon path={mdiCheck} size={0.62} color="#1999AC" /> Evaluate language proficiency
          </span>
          <span className="asetup-meta-item">
            <Icon path={mdiCheck} size={0.62} color="#1999AC" /> Proctoring checks
          </span>
          <Link href="#view-all" classNames="asetup-meta-link">
            View all ›
          </Link>
        </div>

        <div className="asetup-sections">
          {SECTIONS.map((s, i) => (
            <SectionRow key={s.title} section={s} last={i === SECTIONS.length - 1} />
          ))}
        </div>

        <div className="asetup-detail-stats">
          <span className="asetup-stat asetup-stat--accent">360 interview</span>
          <span className="asetup-stat-sep">·</span>
          <span className="asetup-stat">3x faster hiring</span>
          <span className="asetup-stat-sep">·</span>
          <span className="asetup-stat">Save 10+ hrs/hire</span>
        </div>
      </div>

      <div className="asetup-detail-footerbar">
        <Link href="#learn-more" classNames="asetup-detail-learn">
          Learn more ›
        </Link>
        <span className="asetup-detail-powered">
          Powered by <img src={eightfoldLogo} alt="eightfold.ai" />
        </span>
      </div>
    </div>
  );
}

/* ---------- Panel ---------- */

export default function AutomationSetupPanel({ open, onClose }: AutomationSetupPanelProps) {
  const [selected, setSelected] = useState('360');
  const [step, setStep] = useState(0);

  // Reset to the first step whenever the panel is closed.
  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  return (
    <>
      <div className={`asetup-overlay${open ? ' asetup-overlay--visible' : ''}`} onClick={onClose} />

      <div
        className={`asetup-panel${open ? ' asetup-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Automation setup"
      >
        {/* Header */}
        <header className="asetup-header">
          <div className="asetup-brand">
            <img src={aiInterviewLogo} alt="" className="asetup-brand-mark" />
            <h2 className="asetup-modal-title">Automation setup</h2>
          </div>
          <Button
            variant={ButtonVariant.SystemUI}
            shape={ButtonShape.Round}
            size={ButtonSize.Medium}
            ariaLabel="Close"
            onClick={onClose}
            iconProps={{ path: mdiClose as any }}
          />
        </header>

        <div className="asetup-divider" />

        {/* Body */}
        <div className="asetup-body">
          {/* Left rail */}
          <aside className="asetup-sidebar">
            <StepRail activeIndex={step} />

            {step === 0 && (
              <>
                <div className="asetup-sidebar-divider" />
                <div className="asetup-sidebar-section-label">
                  Select an interview
                  <Icon path={mdiInformationOutline} size={0.6} color="#858B98" />
                </div>
                <div className="asetup-iv-card-list">
                  {INTERVIEW_OPTIONS.map((opt) => (
                    <InterviewCard
                      key={opt.id}
                      option={opt}
                      selected={selected === opt.id}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Right content — swaps per step */}
          <main className="asetup-content">
            {step === 0 ? <DetailCard /> : <AutomationSettings />}
          </main>
        </div>

        {/* Footer */}
        <footer className="asetup-footer">
          <span className="asetup-footer-note">
            <Icon path={mdiAlertOutline} size={0.7} color="#9D6309" />
            Invites will only be sent to candidates with valid email addresses
          </span>
          <div className="asetup-footer-actions">
            {step === 1 && (
              <Button
                variant={ButtonVariant.Neutral}
                size={ButtonSize.Large}
                text="Back"
                onClick={() => setStep(0)}
              />
            )}
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              text={step === 0 ? 'Next: Automation settings' : 'Launch automation'}
              onClick={() => (step === 0 ? setStep(1) : onClose())}
              classNames="asetup-next-btn"
            />
          </div>
        </footer>
      </div>
    </>
  );
}
