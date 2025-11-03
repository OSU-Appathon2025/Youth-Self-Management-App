import AsyncStorage from "@react-native-async-storage/async-storage";

const HEALTH_KEY = "ysma:healthinfo:v1";

export type HealthInfo = {
  fullName: string;
  diagnoses: string;
  meds: string;
  allergies: string;
  insuranceCard: string; // could be plan/member/etc if you want to split later
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  preferredPharmacy: string;
};

const DEFAULT_HEALTH: HealthInfo = {
  fullName: "",
  diagnoses: "",
  meds: "",
  allergies: "",
  insuranceCard: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  preferredPharmacy: "",
};

export async function getHealthInfo(): Promise<HealthInfo> {
  try {
    const raw = await AsyncStorage.getItem(HEALTH_KEY);
    return raw ? (JSON.parse(raw) as HealthInfo) : { ...DEFAULT_HEALTH };
  } catch {
    return { ...DEFAULT_HEALTH };
  }
}

export async function saveHealthInfo(data: HealthInfo): Promise<void> {
  await AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(data));
}
