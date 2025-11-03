import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ysma:visits:v1";

export type Visit = {
  id: string;       // unique id
  date: string;     // "2025-11-12"
  time: string;     // "12:30 pm"
  provider: string; // "Dr. Smith"
  reason: string;   // "check-up"
};

// read all visits
export async function getVisits(): Promise<Visit[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Visit[];
  } catch (e) {
    console.warn("getVisits error", e);
    return [];
  }
}

// overwrite all visits
export async function saveVisits(all: Visit[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

// add one visit
export async function addVisit(newVisit: Omit<Visit, "id">): Promise<Visit[]> {
  const list = await getVisits();
  const withId: Visit = { id: Date.now().toString(), ...newVisit };
  const updated = [...list, withId];
  await saveVisits(updated);
  return updated;
}

// delete one visit
export async function deleteVisit(id: string): Promise<Visit[]> {
  const list = await getVisits();
  const updated = list.filter((v) => v.id !== id);
  await saveVisits(updated);
  return updated;
}

