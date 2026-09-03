export type FeedbackQuestion =
  | { type: 'text'; question: string; answer: string; allowComment?: boolean }
  | {
      type: 'rating';
      question: string;
      stars: number;
      label: string;
      comment: string;
    }
  | { type: 'radio'; question: string; options: string[]; selected: string | null }
  | {
      type: 'checkboxGroup';
      question: string;
      options: string[];
      selected: string[];
      allowComment?: boolean;
    }
  | { type: 'select'; question: string; value: string }
  | { type: 'yesNo'; question: string; selected: 'Yes' | 'No'; allowComment?: boolean }
  | { type: 'openComment'; question: string; placeholder: string };

export const FEEDBACK_META = {
  interviewerName: 'James Bob',
  interviewerRole: 'Recruiter',
  interviewType: 'Profile screening',
  interviewDate: 'Jan 11, 2024',
  submittedDate: 'Dec 11, 2024',
};

export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  {
    type: 'text',
    question: "What is the candidate's total years of relevant experience for this role?",
    answer: 'Over 13 years of relevant experience.',
    allowComment: true,
  },
  {
    type: 'rating',
    question: 'How proficient is the candidate with research methodologies?',
    stars: 3,
    label: 'Good',
    comment: 'Candidate had conducted both qualitative and quantitative research in their past experience',
  },
  {
    type: 'radio',
    question: 'Is the candidate currently managing teams or working as an individual contributor?',
    options: ['Managing teams', 'Individual contributor'],
    selected: null,
  },
  {
    type: 'checkboxGroup',
    question: "What's great about this candidate?",
    options: ['Relevant experience', 'Relevant skills', 'Relevant overall experience', 'Good growth trajectory'],
    selected: [],
    allowComment: true,
  },
  {
    type: 'select',
    question: 'Which round should we have next?',
    value: 'Technical round',
  },
  {
    type: 'text',
    question:
      'What was the recent project the candidate described, and how does it demonstrate their skills and experience relevant to this role?',
    answer:
      "The recent project described by the candidate is the 'Regulatory Mapping' project, where they developed a regulatory mapping database using technologies such as Java 8, AWS Lambda, and PostgreSQL. This demonstrates their skills in microservices architecture and cloud technologies, which are highly relevant to the Senior Software Engineer role at John.",
    allowComment: true,
  },
  {
    type: 'text',
    question: "What is the candidate's highest educational qualification?",
    answer: "Bachelor's in Engineering (Computer Science & Engineering) from Govt Engineering College Kota, Rajasthan University.",
    allowComment: true,
  },
  {
    type: 'text',
    question: 'Does the candidate hold any certifications relevant to this position?',
    answer: 'Yes, the candidate is a Certified Appian Programmer.',
    allowComment: true,
  },
  {
    type: 'yesNo',
    question: 'Is the candidate open to relocating or working in a hybrid/remote setup as required?',
    selected: 'Yes',
    allowComment: true,
  },
  {
    type: 'openComment',
    question: 'Any other comments',
    placeholder: 'Anything more about the reason for your decision',
  },
];
