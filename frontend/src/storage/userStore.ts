// frontend/src/storage/userStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "ysma:user";

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export type LearningGoal = {
  id: string;        // "p2-3"
  label: string;     // "I know my allergies"
  done: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  age: number;

  phase: PhaseId;                // 1..5
  plan: LearningGoal[];          // personalized checklist

  hasCompletedAssessment: boolean;
  lastAssessmentScore: number | null;
  lastAssessmentAt: string | null;
};

// map age -> phase bucket
function pickPhaseFromAge(age: number): PhaseId {
  if (age <= 15) return 1;        // ~14-15
  if (age <= 17) return 2;        // ~16-17
  if (age <= 19) return 3;        // ~18-19
  if (age <= 22) return 4;        // ~20-22
  return 5;                       // older / guardianship planning
}

// UPDATED topics per phase
// these lines become the user's "plan" and show in Plan + Home
const PHASE_TOPICS: Record<PhaseId, string[]> = {
  1: [
    "I can explain my condition and symptoms.",
    "I know my allergies.",
    "I know my medicines and what they do.",
    "I understand I can talk alone with my doctor.",
    "I spend part of my visit without my parent in the room.",
    "I know who my emergency contact is and how to reach them.",
  ],
  2: [
    "I can use the patient portal / MyChart.",
    "I know possible side effects of my meds.",
    "I remember to take my meds on time.",
    "I know the dose and how often I take each medicine.",
    "I can give my own shots (if I need to).",
    "I know what changes at age 18 for privacy.",
    "I can talk about getting myself places / driving.",
    "I can talk about birth control / pregnancy safety if I need to.",
    "I know which pharmacy I use to get my meds.",
  ],
  3: [
    "I can call for refills myself.",
    "I can make and cancel my own appointments.",
    "I know my insurance situation.",
    "I know my family medical history.",
    "I know where to go when the clinic is closed.",
    "I have or am choosing an adult primary care doctor.",
    "I can plan my own rides to clinic.",
    "I know where to go (urgent care / ER) if something is serious.",
  ],
  4: [
    "I have or am setting up my adult specialist.",
    "I handle my own insurance or benefits.",
    "I can get meds even if they need special approval.",
    "I can explain my insurance or benefits when someone asks.",
  ],
  5: [
    "I have adult care / decision support set up if I need a guardian.",
    "I have a plan for who helps make medical choices if I can't.",
  ],
};

// convert the bullet list above into checklist objects
function buildPlanForPhase(phase: PhaseId): LearningGoal[] {
  return PHASE_TOPICS[phase].map((label, i) => ({
    id: `p${phase}-${i}`,
    label,
    done: false,
  }));
}

// ---------------- core storage helpers ----------------

export async function getCurrentUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

// create a brand new account
export async function createAccount(
  name: string,
  email: string,
  age: number
): Promise<UserProfile> {
  const phase = pickPhaseFromAge(age);

  const profile: UserProfile = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age,
    phase,
    plan: buildPlanForPhase(phase),

    hasCompletedAssessment: false,
    lastAssessmentScore: null,
    lastAssessmentAt: null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
  return profile;
}

// "login": load saved profile that matches email (you can later enforce pw if you want)
export async function signIn(email: string, pw?: string): Promise<UserProfile | null> {
  const u = await getCurrentUser();
  if (!u) return null;

  if (u.email === email.trim().toLowerCase()) {
    // if you later add password checking to profile, you'd compare pw here
    return u;
  }
  return null;
}

// patch the currently saved profile
export async function updateCurrentUser(
  patch: Partial<UserProfile>
): Promise<UserProfile | null> {
  const existing = await getCurrentUser();
  if (!existing) return null;
  const updated: UserProfile = { ...existing, ...patch };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

// allow a screen to update the learning plan (marking done, etc.)
export async function saveLearningPlan(
  newPlan: LearningGoal[]
): Promise<UserProfile | null> {
  return await updateCurrentUser({ plan: newPlan });
}

// mark a single learning item done
export async function markGoalDone(goalId: string) {
  const u = await getCurrentUser();
  if (!u) return;
  const newPlan = u.plan.map((g) =>
    g.id === goalId ? { ...g, done: true } : g
  );
  await saveLearningPlan(newPlan);
}
