import { useState } from 'react';
import Oda4ComparePanel from './components/Oda4ComparePanel';
import { candidates } from './data/candidates';
import './LandingPage.css';

/**
 * Landing page that renders the Oda4ComparePanel as-is.
 * The panel is a right-anchored slide-in (push mode); here it opens on load
 * over a neutral backdrop with a sample comparison prompt and candidates.
 */
export default function LandingPage() {
  const [open, setOpen] = useState(true);

  // Sample comparison set with a spread of match scores.
  const selected = [
    candidates.find((c) => c.id === '3'), // Kabir Gupta — 5
    candidates.find((c) => c.id === '1'), // Sandhya Thota — 4
    candidates.find((c) => c.id === '2'), // Cara Cook — 3.5
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="landing-root">
      {!open && (
        <button type="button" className="landing-launcher" onClick={() => setOpen(true)}>
          Compare candidates
        </button>
      )}

      <Oda4ComparePanel
        open={open}
        onClose={() => setOpen(false)}
        prompt="Compare their overall interview performance"
        selectedCandidates={selected}
      />
    </div>
  );
}
