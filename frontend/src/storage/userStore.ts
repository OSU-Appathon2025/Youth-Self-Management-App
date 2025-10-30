// frontend/src/storage/userStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "ysma:user";
const ASSESS_KEY = "ysma:assessmentDone";

export type User = {
  id: string;
  name: string;
  email: string;

  // --- new fields for onboarding / assessment tracking ---
  hasCompletedAssessment?: boolean; // did they pass the first assessment?
  lastAssessmentScore?: number;     // most recent % score
  lastAssessmentAt?: string;        // ISO timestamp string like "2025-10-29T17:22:00Z"
};

// read the current user object from storage
export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

// helper to write a full user object back
async function saveUser(user: User) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

// create new account
export async function signUp(name: string, email: string, _pw: string) {
  // in real app: call backend. here: save locally.
  const user: User = {
    id: `u_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    hasCompletedAssessment: false,
  };

  await saveUser(user);
  // explicitly mark assessment incomplete
  await AsyncStorage.setItem(ASSESS_KEY, JSON.stringify(false));
  return user;
}

// log in / or auto-create if doesn't exist
export async function signIn(email: string, _pw: string) {
  // try to get whoever's already logged in
  const existing = await getCurrentUser();

  // if someone is stored and it's the same email, just "log them in"
  if (existing && existing.email === email.toLowerCase()) {
    return existing;
  }

  // otherwise create a lightweight user from email
  const nameFromEmail = email.split("@")[0] || "Friend";

  const newUser: User = {
    id: `u_${Date.now()}`,
    name: capitalize(nameFromEmail),
    email: email.toLowerCase(),
    hasCompletedAssessment: false,
  };

  await saveUser(newUser);
  await AsyncStorage.setItem(ASSESS_KEY, JSON.stringify(false));

  return newUser;
}

// log out (clear current user only)
export async function signOut() {
  await AsyncStorage.removeItem(USER_KEY);
  // we could leave ASSESS_KEY alone or clear it, up to product decision
  // await AsyncStorage.removeItem(ASSESS_KEY);
}

// check whether they've passed the assessment already
export async function isAssessmentDone(): Promise<boolean> {
  // prefer reading from user if available, fall back to ASSESS_KEY for backward compat
  const u = await getCurrentUser();
  if (u?.hasCompletedAssessment === true) return true;

  const raw = await AsyncStorage.getItem(ASSESS_KEY);
  return raw ? JSON.parse(raw) : false;
}

// set / override assessment completion
export async function setAssessmentDone(done: boolean) {
  // update both: legacy flag + user object
  await AsyncStorage.setItem(ASSESS_KEY, JSON.stringify(done));

  const u = await getCurrentUser();
  if (u) {
    const updated: User = {
      ...u,
      hasCompletedAssessment: done,
    };
    await saveUser(updated);
  }
}

// *** THIS is the missing piece that Assess.tsx is calling ***
// merge partial fields into whatever user is saved now
export async function updateCurrentUser(patch: Partial<User>) {
  const u = await getCurrentUser();
  if (!u) {
    // no user yet? create a placeholder so we don't crash
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: patch.name ?? "Friend",
      email: patch.email ?? "unknown@example.com",
      ...patch,
    };
    await saveUser(newUser);

    // keep ASSESS_KEY in sync if assessment-related data came in
    if (patch.hasCompletedAssessment !== undefined) {
      await AsyncStorage.setItem(
        ASSESS_KEY,
        JSON.stringify(patch.hasCompletedAssessment)
      );
    }
    return newUser;
  }

  // merge old and new
  const updated: User = {
    ...u,
    ...patch,
  };

  await saveUser(updated);

  // update ASSESS_KEY too if caller changed that flag
  if (patch.hasCompletedAssessment !== undefined) {
    await AsyncStorage.setItem(
      ASSESS_KEY,
      JSON.stringify(patch.hasCompletedAssessment)
    );
  }

  return updated;
}

// util
function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
