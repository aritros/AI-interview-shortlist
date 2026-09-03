import { useState } from 'react';
import { Icon } from '@mdi/react';
import { mdiClose, mdiCreation } from '@mdi/js';
import './EnableAutomationModal.css';

type ExpandedPanel = 'filters' | 'guide' | null;

interface StepInfo {
  num: number;
  title: string;
  desc: string;
  linkLabel: string | null;
  panel: ExpandedPanel;
}

const STEPS: StepInfo[] = [
  {
    num: 1,
    title: '57 candidates ready for AI interview',
    desc: 'Filtered based on your hiring patterns',
    linkLabel: 'View filters',
    panel: 'filters',
  },
  {
    num: 2,
    title: 'Interview guide selected',
    desc: 'Selected based on position requirements',
    linkLabel: 'View guide',
    panel: 'guide',
  },
  {
    num: 3,
    title: 'AI will send invite and share feedback',
    desc: 'Receive top candidates for review and stage advance',
    linkLabel: null,
    panel: null,
  },
];

const PANEL_CONTENT: Record<Exclude<ExpandedPanel, null>, { title: string; desc: string }> = {
  filters: {
    title: 'Hiring pattern filters',
    desc: 'Candidates are matched against your historical hiring patterns for this role.',
  },
  guide: {
    title: 'Interview guide',
    desc: 'The interview guide selected for this position, based on its requirements.',
  },
};

interface EnableAutomationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EnableAutomationModal({ open, onClose }: EnableAutomationModalProps) {
  const [expanded, setExpanded] = useState<ExpandedPanel>(null);

  if (!open) return null;

  return (
    <div className="eam-overlay">
      <div className={`eam-modal${expanded ? ' eam-modal--expanded' : ''}`}>
        <div className="eam-main">
          <div className="eam-main-inner">
            <h2 className="eam-title">Enable automation for this position</h2>
            <p className="eam-subtitle">AI does everything, you take the final decision</p>

            <ol className="eam-steps">
              {STEPS.map((step, i) => (
                <li className="eam-step" key={step.num}>
                  <div className="eam-step-rail">
                    <span className="eam-step-num">{step.num}</span>
                    {i < STEPS.length - 1 && <span className="eam-step-line" />}
                  </div>
                  <div className="eam-step-body">
                    <div className="eam-step-title">{step.title}</div>
                    <div className="eam-step-desc">
                      {step.desc}
                      {step.linkLabel && (
                        <>
                          {' '}
                          <span className="eam-step-sep">·</span>{' '}
                          <button
                            type="button"
                            className="eam-link"
                            onClick={() => setExpanded(step.panel)}
                          >
                            {step.linkLabel}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="eam-actions">
              <button type="button" className="eam-skip-btn" onClick={onClose}>
                Skip
              </button>
              <button type="button" className="eam-launch-btn" onClick={onClose}>
                <Icon path={mdiCreation} size={0.65} />
                Launch automation
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="eam-side-panel">
            <button
              type="button"
              className="eam-side-close"
              aria-label="Close"
              onClick={() => setExpanded(null)}
            >
              <Icon path={mdiClose} size={0.8} />
            </button>
            <div className="eam-side-content">
              <h3 className="eam-side-title">{PANEL_CONTENT[expanded].title}</h3>
              <p className="eam-side-desc">{PANEL_CONTENT[expanded].desc}</p>
              <div className="eam-side-placeholder" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
