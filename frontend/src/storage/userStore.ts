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
  // Import API client (lazy import to avoid circular dependencies)
  const { registerUser, getUserProfile } = await import("../services/api");

  // Calculate date of birth from age (approximate)
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const dateOfBirth = `${birthYear}-01-01`; // Simple approximation

  // Call backend API
  const registerResult = await registerUser(email, password, name, dateOfBirth);

  if (!registerResult.ok) {
    return {
      ok: false,
      error: registerResult.error || "Registration failed",
    };
  }

  // Fetch the full profile from backend
  const profileResult = await getUserProfile();

  if (!profileResult.ok || !profileResult.data) {
    // Auth succeeded but couldn't get profile - still create local profile
    const phase = pickPhaseFromAge(age);
    const localProfile: UserProfile = {
      id: registerResult.data!.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      age,
      password,
      phase,
      plan: buildPlanForPhase(phase),
      hasCompletedAssessment: false,
      lastAssessmentScore: null,
      lastAssessmentAt: null,
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(localProfile));
    return { ok: true, user: localProfile };
  }

  // Create local profile from backend data
  const backendProfile = profileResult.data.profile;
  const phase = pickPhaseFromAge(age);

  const newUser: UserProfile = {
    id: backendProfile.id,
    name: backendProfile.full_name || name,
    email: backendProfile.email,
    age,
    password,
    phase,
    plan: buildPlanForPhase(phase),
    hasCompletedAssessment: false,
    lastAssessmentScore: null,
    lastAssessmentAt: null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
  return { ok: true, user: newUser };
}

// "log in": authenticate with backend and return profile
export async function signIn(
  email: string,
  password: string
): Promise<{ ok: boolean; user?: UserProfile; error?: string }> {
  // Import API client (lazy import to avoid circular dependencies)
  const { loginUser, getUserProfile } = await import("../services/api");

  // Call backend login API
  const loginResult = await loginUser(email, password);

  if (!loginResult.ok) {
    return {
      ok: false,
      error: loginResult.error || "Login failed",
    };
  }

  // Fetch the full profile from backend
  const profileResult = await getUserProfile();

  if (!profileResult.ok || !profileResult.data) {
    return {
      ok: false,
      error: "Could not fetch user profile",
    };
  }

  // Check if we have a local profile to get age/phase info
  const localProfile = await getCurrentUser();

  // Calculate age from date_of_birth if available
  let age = localProfile?.age || 18; // default
  if (profileResult.data.profile.date_of_birth) {
    const birthDate = new Date(profileResult.data.profile.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
  }

  const backendProfile = profileResult.data.profile;
  const phase = pickPhaseFromAge(age);

  const user: UserProfile = {
    id: backendProfile.id,
    name: backendProfile.full_name || "User",
    email: backendProfile.email,
    age,
    password,
    phase,
    plan: localProfile?.plan || buildPlanForPhase(phase),
    hasCompletedAssessment: localProfile?.hasCompletedAssessment || false,
    lastAssessmentScore: localProfile?.lastAssessmentScore || null,
    lastAssessmentAt: localProfile?.lastAssessmentAt || null,
  };

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return { ok: true, user };
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
