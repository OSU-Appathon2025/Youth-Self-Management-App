// frontend/src/storage/learnStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ModuleId = "appointments" | "meds" | "insurance" | "self-advocacy";
export type QuizKind = "initial" | "module" | "final";

export type Module = {
  id: ModuleId;
  title: string;
  description: string;
};

export type Plan = {
  // modules the learner still needs to complete (ordered)
  targets: ModuleId[];
  // overall state
  status: "not-started" | "in-progress" | "ready-final" | "completed";
};

export type QuizResult = {
  quizId: string;
  kind: QuizKind;
  moduleId?: ModuleId; // set for module quizzes
  total: number;
  correct: number;
  percent: number; // 0..100
  at: number; // timestamp
};

export type Progress = {
  points: number;
  // last known mastery % per module (0..100)
  mastery: Record<ModuleId, number>;
  // finished modules
  completed: ModuleId[];
  // last quiz attempts
  history: QuizResult[];
  // gates
  tookInitial: boolean;
  unlockedFinal: boolean;
  finishedAll: boolean;
};

const PROG = "ysma:learn:progress";
const PLAN = "ysma:learn:plan";

// ---- static “catalog” of modules you teach ----
export const MODULES: Module[] = [
  {
    id: "appointments",
    title: "Appointments & Scheduling",
    description: "Booking, preparing, and showing up.",
  },
  {
    id: "meds",
    title: "Medications",
    description: "Names, doses, refills, and reminders.",
  },
  {
    id: "insurance",
    title: "Insurance Basics",
    description: "Cards, copays, networks, authorizations.",
  },
  {
    id: "self-advocacy",
    title: "Self-Advocacy",
    description: "Sharing history, asking questions, consent.",
  },
];

// ---- default progress for a new learner ----
export function defaultProgress(): Progress {
  return {
    points: 0,
    mastery: {
      appointments: 0,
      meds: 0,
      insurance: 0,
      "self-advocacy": 0,
    },
    completed: [],
    history: [],
    tookInitial: false,
    unlockedFinal: false,
    finishedAll: false,
  };
}

export async function loadProgress(): Promise<Progress> {
  const raw = await AsyncStorage.getItem(PROG);
  return raw ? (JSON.parse(raw) as Progress) : defaultProgress();
}

export async function saveProgress(p: Progress) {
  await AsyncStorage.setItem(PROG, JSON.stringify(p));
}

export async function loadPlan(): Promise<Plan | null> {
  const raw = await AsyncStorage.getItem(PLAN);
  return raw ? (JSON.parse(raw) as Plan) : null;
}

export async function savePlan(plan: Plan) {
  await AsyncStorage.setItem(PLAN, JSON.stringify(plan));
}

// --- simple rule engine: build plan from initial scores ---
// Any module mastery < 80 becomes a target.
export function buildPlanFromMastery(mastery: Record<ModuleId, number>): Plan {
  const targets = (Object.keys(mastery) as ModuleId[])
    .filter((m) => mastery[m] < 80);

  const status: Plan["status"] =
    targets.length === 0 ? "ready-final" : "in-progress";

  return { targets, status };
}

// --- update mastery from a quiz ---
// For module quizzes: simple moving blend (max keeps improving).
export function updateMastery(
  mastery: Record<ModuleId, number>,
  moduleId: ModuleId | undefined,
  percent: number,
  kind: QuizKind
) {
  if (!moduleId) return mastery;
  const prev = mastery[moduleId] ?? 0;
  const next =
    kind === "initial"
      ? Math.max(prev, percent)
      : Math.round(Math.max(prev * 0.6 + percent * 0.4, percent));
  return { ...mastery, [moduleId]: Math.min(100, next) };
}
