import type { FeedbackQuestion } from './feedbackForm';

export type PendingEdit =
  | { kind: 'text'; newAnswer: string }
  | { kind: 'rating'; newStars: number; newLabel: string }
  | { kind: 'radio'; newSelected: string }
  | { kind: 'checkboxGroup'; newSelected: string[] }
  | { kind: 'select'; newValue: string }
  | { kind: 'yesNo'; newSelected: 'Yes' | 'No' };

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const NUMBER_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };

function extractStarCount(text: string): number | null {
  const digit = text.match(/\b([1-5])\b/);
  if (digit) return Number(digit[1]);
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) return value;
  }
  return null;
}

function capitalize(text: string): string {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function findIndexByType(questions: FeedbackQuestion[], type: FeedbackQuestion['type']): number {
  return questions.findIndex((q) => q.type === type);
}

const TEXT_TOPICS: { topic: RegExp; targetsQuestion: RegExp }[] = [
  { topic: /experience|years/i, targetsQuestion: /years of relevant experience/i },
  { topic: /project/i, targetsQuestion: /recent project/i },
  { topic: /education|degree|qualification/i, targetsQuestion: /educational qualification/i },
  { topic: /certif/i, targetsQuestion: /certifications/i },
];

/**
 * Heuristic, keyword-based "agent" for the feedback-form editing demo — it stands in for a
 * real LLM call so the edit-preview flow can be prototyped without a backend.
 */
export function parseFeedbackInstruction(
  instruction: string,
  questions: FeedbackQuestion[]
): Map<number, PendingEdit> {
  const edits = new Map<number, PendingEdit>();
  const text = instruction.trim();
  if (!text) return edits;
  const lower = text.toLowerCase();

  // Rating stars
  if (/star|proficien|rating/i.test(lower)) {
    const stars = extractStarCount(lower);
    const idx = findIndexByType(questions, 'rating');
    if (stars && idx >= 0) {
      edits.set(idx, { kind: 'rating', newStars: stars, newLabel: RATING_LABELS[stars - 1] });
    }
  }

  // Individual contributor vs managing teams
  const radioIdx = findIndexByType(questions, 'radio');
  if (radioIdx >= 0) {
    if (/individual contributor/i.test(lower)) {
      edits.set(radioIdx, { kind: 'radio', newSelected: 'Individual contributor' });
    } else if (/manag(e|ing)\s+(a\s+)?team/i.test(lower)) {
      edits.set(radioIdx, { kind: 'radio', newSelected: 'Managing teams' });
    }
  }

  // Relocation / remote / hybrid yes-no
  const yesNoIdx = findIndexByType(questions, 'yesNo');
  if (yesNoIdx >= 0 && /relocat|remote|hybrid/i.test(lower)) {
    const negative = /\b(not|isn't|is not|won't|wont|no|unable)\b/i.test(lower);
    edits.set(yesNoIdx, { kind: 'yesNo', newSelected: negative ? 'No' : 'Yes' });
  }

  // Next round (select)
  const selectIdx = findIndexByType(questions, 'select');
  const roundMatch = lower.match(/([a-z][a-z\s]{2,30}?)\s+round\b/i);
  if (selectIdx >= 0 && roundMatch) {
    const roundName = roundMatch[1].trim();
    if (roundName && !/^(the|next|this|that|which)$/i.test(roundName)) {
      edits.set(selectIdx, { kind: 'select', newValue: `${capitalize(roundName)} round` });
    }
  }

  // Checkbox group ("What's great about this candidate?")
  const checkboxIdx = questions.findIndex((q) => q.type === 'checkboxGroup');
  if (checkboxIdx >= 0) {
    const question = questions[checkboxIdx] as { type: 'checkboxGroup'; options: string[]; selected: string[] };
    const remove = /\b(remove|uncheck|drop|not a)\b/i.test(lower);
    const selected = new Set(question.selected);
    let changed = false;
    for (const option of question.options) {
      const distinctive = option.split(' ').slice(-2).join(' ').toLowerCase();
      if (lower.includes(option.toLowerCase()) || lower.includes(distinctive)) {
        if (remove) {
          if (selected.delete(option)) changed = true;
        } else if (!selected.has(option)) {
          selected.add(option);
          changed = true;
        }
      }
    }
    if (changed) {
      edits.set(checkboxIdx, { kind: 'checkboxGroup', newSelected: Array.from(selected) });
    }
  }

  // Text fields — quoted string wins outright; otherwise append or shorten
  const quotedMatch = text.match(/"([^"]+)"|'([^']+)'/);
  const quoted = quotedMatch ? quotedMatch[1] ?? quotedMatch[2] : null;
  const mentionMatch = text.match(/(?:mention|add|note|include)(?: that)?\s+(.+)/i);
  const shorten = /shorten|make.*shorter|trim/i.test(lower);
  const setMatch = text.match(/(?:change|set|update|rewrite).*?\bto\s+(.+)/i);

  for (const { topic, targetsQuestion } of TEXT_TOPICS) {
    if (!topic.test(lower)) continue;
    const idx = questions.findIndex((q) => q.type === 'text' && targetsQuestion.test(q.question));
    if (idx < 0) continue;
    const current = (questions[idx] as { type: 'text'; answer: string }).answer;

    if (setMatch) {
      const replacement = quoted ?? setMatch[1].replace(/["']/g, '').trim();
      edits.set(idx, { kind: 'text', newAnswer: capitalize(replacement) });
    } else if (shorten) {
      const firstSentence = current.split('.')[0].trim();
      edits.set(idx, { kind: 'text', newAnswer: firstSentence ? `${firstSentence}.` : current });
    } else if (quoted) {
      const addition = quoted.endsWith('.') ? quoted : `${quoted}.`;
      edits.set(idx, { kind: 'text', newAnswer: `${current} ${addition}` });
    } else if (mentionMatch) {
      const clause = capitalize(mentionMatch[1].replace(/["']/g, '').trim());
      const addition = clause.endsWith('.') ? clause : `${clause}.`;
      edits.set(idx, { kind: 'text', newAnswer: `${current} ${addition}` });
    }
  }

  return edits;
}

export const AGENTIC_EDIT_SUGGESTIONS = [
  'Bump proficiency to 4 stars',
  "Mark them as open to relocating",
  'Add "Good growth trajectory" to strengths',
  'Change next round to Onsite round',
];
