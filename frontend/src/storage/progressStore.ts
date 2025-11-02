// frontend/src/storage/progressStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TopicId } from "../data/curriculum";

// where we save progress in local storage
const KEY = "ysma:progress:v1";

// This is everything we track per kid locally
export type Plan = {
  // which topics still need practice
  topicsNeedingWork: TopicId[];

  // per topic, 0..100 confidence/skill score
  topicScores: Record<TopicId, number>;

  // "points" for rewards shop
  points: number;

  // which lesson IDs they've checked off inside modules
  lessonsDone: Record<string, boolean>;

  // did they beat the final test?
  finalPassed: boolean;
};

// default state if they’re brand new
const DEFAULT_PLAN: Plan = {
  topicsNeedingWork: [],
  topicScores: {} as Record<TopicId, number>,
  points: 0,
  lessonsDone: {},
  finalPassed: false,
};

// load plan from AsyncStorage
export async function getPlan(): Promise<Plan> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Plan) : { ...DEFAULT_PLAN };
  } catch {
    return { ...DEFAULT_PLAN };
  }
}

// save plan to AsyncStorage
export async function setPlan(p: Plan) {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}

// give points
export async function awardPoints(amount: number) {
  const p = await getPlan();
  const next: Plan = { ...p, points: p.points + amount };
  await setPlan(next);
  return next;
}

// mark a lesson complete
export async function markLessonDone(lessonId: string) {
  const p = await getPlan();
  const updatedLessons = { ...p.lessonsDone, [lessonId]: true };
  const next: Plan = { ...p, lessonsDone: updatedLessons };
  await setPlan(next);
  return next;
}

// save which topics they still need work on after onboarding quiz
export async function setTopicsNeedingWork(
  topicsNeedingWork: TopicId[],
  topicScores: Record<TopicId, number>
) {
  const p = await getPlan();
  const next: Plan = {
    ...p,
    topicsNeedingWork,
    topicScores,
  };
  await setPlan(next);
  return next;
}

// after the FINAL quiz
export async function setFinalPassed(passed: boolean) {
  const p = await getPlan();
  const next: Plan = { ...p, finalPassed: passed };
  await setPlan(next);
  return next;
}
