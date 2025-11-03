// frontend/src/storage/progressStore.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { TopicId } from "../data/curriculum";
import { getCurrentUser, type UserProfile } from "./userStore";

/*
  SINGLE STORAGE KEY
*/
const KEY = "ysma:progress:v2";

/*
  TYPES
  -------------------------------------------------
*/

export type LearningGoal = {
  id: string;
  text: string;
  topic: TopicId;
  complete: boolean;
};

export type ProgressSnapshot = {
  phaseLabel: string;
  stillLearning: LearningGoal[];
  alreadyHandled: LearningGoal[];
};

export type Visit = {
  id: string;
  date: string;
  time: string;
  provider: string;
  reason: string;
};

export type HealthProfile = {
  fullName: string;
  conditions: string;
  meds: string;
  allergies: string;
  insurance: string;
  emergencyContact: string;
};

export type TopicCompletionMap = {
  insurance: boolean;
  meds: boolean;
  appointments: boolean;
  records: boolean;
  rights: boolean;
  payments: boolean;
};

export type ProgressState = {
  // learning stuff / historical quiz stuff
  topicsNeedingWork: TopicId[];
  topicScores: Record<TopicId, number>;
  points: number;
  lessonsDone: Record<string, boolean>;
  finalPassed: boolean;

  // which “big topics” are considered complete
  topicComplete: TopicCompletionMap;

  // prevent double-awarding lesson points
  lessonPointsAwarded: Record<string, boolean>;

  // appointments
  visits: Visit[];

  // My Info screen
  healthProfile: HealthProfile;
};

/*
  DEFAULT STATE
*/
const DEFAULT_STATE: ProgressState = {
  topicsNeedingWork: [],
  topicScores: {
    insurance: 0,
    appointments: 0,
    meds: 0,
    records: 0,
    rights: 0,
    payments: 0,
  },
  points: 0,
  lessonsDone: {},
  finalPassed: false,

  topicComplete: {
    insurance: false,
    meds: false,
    appointments: false,
    records: false,
    rights: false,
    payments: false,
  },

  lessonPointsAwarded: {},

  visits: [
    {
      id: "seed1",
      date: "2025-10-29",
      time: "3:00 PM",
      provider: "Dr. Nguyen",
      reason: "Check-up",
    },
  ],

  healthProfile: {
    fullName: "",
    conditions: "",
    meds: "",
    allergies: "",
    insurance: "",
    emergencyContact: "",
  },
};

/* ===================================================
   INTERNAL HELPERS
   ===================================================*/

async function readProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(raw) as Partial<ProgressState>;

    const mergedTopicScores: Record<TopicId, number> = {
      ...DEFAULT_STATE.topicScores,
      ...(parsed.topicScores as Record<TopicId, number> | undefined),
    };

    return {
      topicsNeedingWork: parsed.topicsNeedingWork ?? [],
      topicScores: mergedTopicScores,
      points: parsed.points ?? 0,
      lessonsDone: parsed.lessonsDone ?? {},
      finalPassed: parsed.finalPassed ?? false,

      topicComplete: parsed.topicComplete ?? {
        insurance: false,
        meds: false,
        appointments: false,
        records: false,
        rights: false,
        payments: false,
      },

      lessonPointsAwarded: parsed.lessonPointsAwarded ?? {},

      visits: parsed.visits ?? DEFAULT_STATE.visits,

      healthProfile: parsed.healthProfile ?? DEFAULT_STATE.healthProfile,
    };
  } catch (err) {
    console.warn("progressStore.readProgress() failed, using default", err);
    return { ...DEFAULT_STATE };
  }
}

async function writeProgress(state: ProgressState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

/* ===================================================
   CORE HELPERS (new API)
   ===================================================*/

/**
 * Build data for the Plan screen
 */
export async function getProgress(): Promise<ProgressSnapshot> {
  const full = await readProgress();

  const user: UserProfile | null = await getCurrentUser();

  const phaseText =
    user && user.phase !== undefined && user.phase !== null
      ? `Phase ${user.phase}`
      : "Phase ?";

  const ageText =
    user && user.age !== undefined && user.age !== null
      ? `${user.age}`
      : "?";

  const phaseLabel = `${phaseText} (age ${ageText})`;

  const allGoals: LearningGoal[] = [
    {
      id: "g_insurance_card",
      text: "I can show my insurance card if someone asks.",
      topic: "insurance",
      complete: !!full.topicComplete.insurance,
    },
    {
      id: "g_meds",
      text: "I know my medicines and what they do.",
      topic: "meds",
      complete: !!full.topicComplete.meds,
    },
    {
      id: "g_appointments",
      text: "I can prepare for and manage my appointments.",
      topic: "appointments",
      complete: !!full.topicComplete.appointments,
    },
    {
      id: "g_records",
      text: "I understand my health records and how to access them.",
      topic: "records",
      complete: !!full.topicComplete.records,
    },
    {
      id: "g_rights",
      text: "I know my rights and privacy protections.",
      topic: "rights",
      complete: !!full.topicComplete.rights,
    },
    {
      id: "g_payments",
      text: "I understand bills and payment options.",
      topic: "payments",
      complete: !!full.topicComplete.payments,
    },
  ];

  const stillLearning = allGoals.filter((g) => !g.complete);
  const alreadyHandled = allGoals.filter((g) => g.complete);

  return {
    phaseLabel,
    stillLearning,
    alreadyHandled,
  };
}

/**
 * Mark one lesson complete, and mark that topic complete.
 * Also keeps lessonsDone map updated.
 */
export async function markLessonDone(
  lessonId: string,
  topic: TopicId
) {
  const full = await readProgress();

  const newLessonsDone = {
    ...full.lessonsDone,
    [lessonId]: true,
  };

  const newTopicComplete: TopicCompletionMap = {
    ...full.topicComplete,
    [topic]: true,
  };

  const merged: ProgressState = {
    ...full,
    lessonsDone: newLessonsDone,
    topicComplete: newTopicComplete,
  };

  await writeProgress(merged);
  return merged;
}

/**
 * Give the user points (for e.g. finishing a lesson/quiz/etc.)
 */
export async function awardPoints(amount: number) {
  const full = await readProgress();
  const merged: ProgressState = {
    ...full,
    points: full.points + amount,
  };
  await writeProgress(merged);
  return merged.points;
}

/**
 * Save which topics they struggle with (onboarding quiz),
 * and average topic scores.
 */
export async function setTopicsNeedingWork(
  topicsNeedingWork: TopicId[],
  topicScores: Record<TopicId, number>
) {
  const full = await readProgress();
  const normalizedScores: Record<TopicId, number> = {
    ...DEFAULT_STATE.topicScores,
    ...topicScores,
  };
  const merged: ProgressState = {
    ...full,
    topicsNeedingWork,
    topicScores: normalizedScores,
  };
  await writeProgress(merged);
  return merged;
}

/**
 * Final assessment passed
 */
export async function setFinalPassed(passed: boolean) {
  const full = await readProgress();
  const merged: ProgressState = {
    ...full,
    finalPassed: passed,
  };
  await writeProgress(merged);
  return merged;
}

/* ===================================================
   VISITS (Appointments tab)
   ===================================================*/

export async function getVisits() {
  const full = await readProgress();
  return full.visits;
}

export async function addVisit(v: Omit<Visit, "id">) {
  const full = await readProgress();

  const newVisit: Visit = {
    id: "v_" + Date.now().toString(),
    ...v,
  };

  const merged: ProgressState = {
    ...full,
    visits: [...full.visits, newVisit],
  };

  await writeProgress(merged);
  return merged.visits;
}

export async function removeVisit(id: string) {
  const full = await readProgress();
  const filtered = full.visits.filter((visit) => visit.id !== id);

  const merged: ProgressState = {
    ...full,
    visits: filtered,
  };

  await writeProgress(merged);
  return merged.visits;
}

/* ===================================================
   HEALTH PROFILE ("My Info")
   ===================================================*/

export async function getHealthProfile(): Promise<HealthProfile> {
  const full = await readProgress();
  return full.healthProfile;
}

export async function saveHealthProfile(profile: HealthProfile) {
  const full = await readProgress();

  const merged: ProgressState = {
    ...full,
    healthProfile: profile,
  };

  await writeProgress(merged);
  return merged.healthProfile;
}

/* ===================================================
   COMPAT SHIMS (old API calls other screens still use)
   ===================================================*/

/**
 * getPlan()
 * Old code expected a "plan" object. We now return the same data
 * that Plan.tsx is using: phaseLabel + the two goal lists.
 * This way old screens that call getPlan() won't explode.
 */
export async function getPlan() {
  const snap = await getProgress();
  const full = await readProgress();
  return {
    phaseLabel: snap.phaseLabel,
    stillLearning: snap.stillLearning,
    alreadyHandled: snap.alreadyHandled,
    // plus some legacy fields in case old code looks for them:
    lessonsDone: full.lessonsDone,
  };
}

/**
 * markLessonDone(lessonId, topicId)
 * Old code used (lessonId, topicId). Our new markLessonDone()
 * already takes (lessonId, topic: TopicId), so this is basically
 * just a pass-through to keep older screens happy.
 */
export async function legacyMarkLessonDone(
  lessonId: string,
  topicId: TopicId
) {
  return await markLessonDone(lessonId, topicId);
}
