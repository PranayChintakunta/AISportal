// Mock content for the AI Academy hub. Nothing here is persisted yet — this
// stands in for the real Workshop/Quiz/Resource models until that schema
// work happens (see the page-level TODOs for what a migration would add).

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  correctIndex: number;
};

export type Workshop = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO
  seatsAvailable: number;
  seatsTotal: number;
  videoUrl: string;
  /** When the attendance-quiz for a missed workshop stops accepting submissions. */
  quizDueAt: string; // ISO
  quiz: QuizQuestion[];
  /** Only set once the workshop has happened. */
  attendance?: "attended" | "missed";
};

const SAMPLE_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const workshops: Workshop[] = [
  {
    id: "neural-networks-workshop",
    title: "Neural Networks Workshop",
    description:
      "Build and train a simple neural network from scratch using PyTorch.",
    location: "ECSW 1.355",
    startTime: "2026-09-24T19:00:00",
    seatsAvailable: 12,
    seatsTotal: 40,
    videoUrl: SAMPLE_VIDEO,
    quizDueAt: "2026-10-01T23:59:00",
    quiz: [
      {
        id: "q1",
        prompt: "What does a neuron's activation function do?",
        options: [
          "Stores the training data",
          "Introduces non-linearity into the output",
          "Deletes unused layers",
          "Compiles the model to C++",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "Which PyTorch class do most custom models subclass?",
        options: ["torch.Tensor", "torch.nn.Module", "torch.optim.SGD", "torch.utils.Data"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "intro-to-prompt-engineering",
    title: "Intro to Prompt Engineering",
    description:
      "Learn how to write clear prompts, iterate on outputs, and debug common generation issues.",
    location: "ECSW 1.315",
    startTime: "2026-09-17T18:00:00",
    seatsAvailable: 0,
    seatsTotal: 35,
    videoUrl: SAMPLE_VIDEO,
    quizDueAt: "2026-09-24T23:59:00",
    quiz: [
      {
        id: "q1",
        prompt: "Which of these usually improves a prompt's reliability most?",
        options: [
          "Making it as short as possible",
          "Giving concrete examples of the desired output",
          "Avoiding punctuation",
          "Writing it in all caps",
        ],
        correctIndex: 1,
      },
    ],
    attendance: "missed",
  },
  {
    id: "python-for-ml-deep-dive",
    title: "Python for ML Deep Dive",
    description: "A hands-on session exploring PyTorch and data visualization.",
    location: "ECSW 1.355",
    startTime: "2026-09-10T16:00:00",
    seatsAvailable: 0,
    seatsTotal: 40,
    videoUrl: SAMPLE_VIDEO,
    quizDueAt: "2026-09-17T23:59:00",
    quiz: [],
    attendance: "attended",
  },
];

export type Resource = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
};

export const resources: Resource[] = [
  {
    id: "getting-started-python",
    title: "Getting Started with Python",
    description:
      "A quick setup guide for installing Python, choosing an IDE, and running your first script.",
    tags: ["Beginner", "PDF"],
    href: "#",
  },
  {
    id: "ml-cheat-sheet",
    title: "ML Cheat Sheet",
    description: "A concise reference for key terms, formulas, and common model evaluation metrics.",
    tags: ["Reference", "PDF"],
    href: "#",
  },
  {
    id: "ai-project-templates",
    title: "AI Project Templates",
    description: "Starter notebooks and folder structures for organizing your first machine learning project.",
    tags: ["Starter Kit", "ZIP"],
    href: "#",
  },
  {
    id: "recommended-reading",
    title: "Recommended Reading List",
    description: "A curated list of articles, blogs, and books for continuing your AI education outside of class.",
    tags: ["Reading", "PDF"],
    href: "#",
  },
];

export const featuredLesson = {
  title: "Lesson 3: Data Processing in ML",
  videoUrl: SAMPLE_VIDEO,
};

export function getUpNextWorkshop(): Workshop {
  const now = Date.now();
  const upcoming = workshops
    .filter((w) => new Date(w.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  if (upcoming[0]) return upcoming[0];

  // Nothing upcoming — fall back to the most recent past workshop.
  return [...workshops].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )[0];
}

export function getWorkshop(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

export function isWorkshopPast(workshop: Workshop): boolean {
  return new Date(workshop.startTime).getTime() < Date.now();
}

export function splitWorkshops(list: Workshop[]): { upcoming: Workshop[]; past: Workshop[] } {
  const now = Date.now();
  const upcoming = list
    .filter((w) => new Date(w.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = list
    .filter((w) => new Date(w.startTime).getTime() <= now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  return { upcoming, past };
}
