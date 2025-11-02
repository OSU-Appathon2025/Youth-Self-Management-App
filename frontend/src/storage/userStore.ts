// frontend/src/storage/userStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "ysma:user";

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export type LearningGoal = {
  id: string;        // "p2-3"
  label: string;     // "Know my allergies"
  done: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  age: number;

  // NEW: store pw locally for now (not secure, but fine for prototype)
  password: string;

  phase: PhaseId;                // 1-5
  plan: LearningGoal[];          // personalized checklist

  hasCompletedAssessment: boolean;
  lastAssessmentScore: number | null;
  lastAssessmentAt: string | null;
};

// pick phase based on age ranges from the clinic roadmap
function pickPhaseFromAge(age: number): PhaseId {
  if (age <= 15) return 1;        // 14-15
  if (age <= 17) return 2;        // 16-17
  if (age <= 19) return 3;        // 18-19
  if (age <= 22) return 4;        // 20-22
  return 5;                       // older / guardianship planning
}

// these are the “what you should know at this age” bullets
// pulled from the phase expectations
const PHASE_TOPICS: Record<PhaseId, string[]> = {
  1: [
    "I can explain my condition and symptoms.",
    "I know my allergies.",
    "I know my medicines and what they do.",
    "I understand that I can talk alone with my doctor.",
    "I spend part of my visit without my parent in the room.",
  ],
  2: [
    "I can use the patient portal / MyChart.",
    "I know med side effects.",
    "I remember to take meds on time.",
    "I know doses and how often I take them.",
    "I can give my own shots (if needed).",
    "I know what changes at age 18 for privacy.",
    "I can talk about driving / getting myself places.",
    "I can talk about birth control / pregnancy safety if I need to.",
  ],
  3: [
    "I can call for refills myself.",
    "I can make and cancel my own appointments.",
    "I know my insurance situation.",
    "I know my family medical history.",
    "I know where to go when clinic is closed.",
    "I have/will have an adult primary care doctor.",
    "I can plan my own rides to clinic.",
  ],
  4: [
    "I have or am setting up an adult specialist.",
    "I handle my own insurance or benefits.",
    "I can get meds even if they require special approval.",
  ],
  5: [
    "I have adult care/decision support set up if I need a guardian.",
  ],
};

// turn phase into checklist objects
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

// LOW-LEVEL create and save user to storage
async function createAccountInternal(
  name: string,
  email: string,
  age: number,
  password: string
): Promise<UserProfile> {
  const phase = pickPhaseFromAge(age);

  const profile: UserProfile = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    age,
    password, // store plain text JUST for prototype (not production-safe)

    phase,
    plan: buildPlanForPhase(phase),

    hasCompletedAssessment: false,
    lastAssessmentScore: null,
    lastAssessmentAt: null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
  return profile;
}

// HIGH-LEVEL sign up (this is what the UI should call)
export async function signUp(
  name: string,
  age: number,
  email: string,
  password: string
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  const existing = await getCurrentUser();

  // if we already have a saved user AND the email matches,
  // don't silently overwrite — tell them to log in instead
  if (
    existing &&
    existing.email === email.trim().toLowerCase()
  ) {
    return {
      ok: false,
      error: "You already made an account. Please log in.",
    };
  }

  const newUser = await createAccountInternal(
    name,
    email,
    age,
    password
  );

  return { ok: true, user: newUser };
}

// "log in": return the saved profile if email matches.
// (Optional pw check: we can require matching password later)
export async function signIn(
  email: string,
  password?: string
): Promise<UserProfile | null> {
  const u = await getCurrentUser();
  if (!u) return null;

  const matchesEmail = u.email === email.trim().toLowerCase();
  if (!matchesEmail) return null;

  // if you want to force password match, uncomment:
  // if (password != null && u.password !== password) return null;

  return u;
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

// allow a screen to save a new plan (or update done flags)
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
