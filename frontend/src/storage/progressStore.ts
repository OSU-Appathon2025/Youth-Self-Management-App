// frontend/src/storage/progressStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TopicId } from "../data/curriculum";

const KEY = "ysma:progress:v1";

export type Plan = {
  topicsNeedingWork: TopicId[]; // personalized list from onboarding
  topicScores: Record<TopicId, number>; // 0..100 per topic
  points: number;                     // shop points
  lessonsDone: Record<string, boolean>; // lessonId => done
  finalPassed: boolean;
};

const DEFAULT_PLAN: Plan = {
  topicsNeedingWork: [],
  topicScores: {} as Record<TopicId, number>,
  points: 0,
  lessonsDone: {},
  finalPassed: false,
};

export async function getPlan(): Promise<Plan> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Plan) : { ...DEFAULT_PLAN };
}

export async function setPlan(next: Plan): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function awardPoints(delta: number) {
  const p = await getPlan();
  p.points = Math.max(0, (p.points || 0) + delta);
  await setPlan(p);
}

export async function markLessonDone(lessonId: string) {
  const p = await getPlan();
  p.lessonsDone[lessonId] = true;
  await setPlan(p);
}

export async function setFinalPassed(passed: boolean) {
  const p = await getPlan();
  p.finalPassed = passed;
  await setPlan(p);
}
