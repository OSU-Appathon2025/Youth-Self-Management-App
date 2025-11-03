// frontend/src/screens/Home.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { getCurrentUser, UserProfile } from "../storage/userStore";

// reuse visit storage so "Coming Up" can show correct next appointment
import AsyncStorage from "@react-native-async-storage/async-storage";
const VISITS_KEY = "ysma:visits";

type Visit = {
  id: string;
  date: string; // "2025-11-13"
  time: string; // "12:30 pm"
  provider: string;
  reason: string;
};

export default function Home({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);

  // helper to load user
  async function loadUser() {
    const u = await getCurrentUser();
    setUser(u);
  }

  // helper to load visits
  async function loadVisits() {
    try {
      const raw = await AsyncStorage.getItem(VISITS_KEY);
      if (raw) {
        const parsed: Visit[] = JSON.parse(raw);
        setVisits(parsed);
      } else {
        setVisits([]);
      }
    } catch {
        setVisits([]);
    }
  }

  // load once on mount
  useEffect(() => {
    loadUser();
    loadVisits();
  }, []);

  // reload every time Home comes back into focus
  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadVisits();
    }, [])
  );

  // if we *know* there's no saved user, kick to auth choice
  useEffect(() => {
    if (user === null) return; // still loading
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "AuthChoice" }],
      });
    }
  }, [user, navigation]);

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={{ color: "#64748B" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  // ------------------
  // derived stuff
  // ------------------

  // be defensive in case user.plan is missing or not an array
  const planArray = Array.isArray(user.plan) ? user.plan : [];

  const goalsDone = planArray.filter((g) => g.done).length;
  const totalGoals = planArray.length;
  const progressPct =
    totalGoals === 0 ? 0 : Math.round((goalsDone / totalGoals) * 100);

  // “points” for now = 10 per completed item
  const points = goalsDone * 10;

  // stuff they still need to work on
  const remainingGoals = planArray.filter((g) => !g.done);

  // show "Coming Up" card info using the *soonest* future visit if any
  // (right now we're not doing real date math, just "first in list")
  const nextVisit = visits.length > 0 ? visits[0] : null;

  // banner logic: show "Start your self-check" if they haven't done assessment
  const needsAssessment = !user.hasCompletedAssessment;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeftRow}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarText}>
                {user.name?.[0]?.toUpperCase() || "Y"}
              </Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.helloText}>
                hey {user.name?.split(" ")[0] || "there"} 👋
              </Text>
              <Text style={styles.subHelloText}>
                here’s your health stuff for today
              </Text>
            </View>
          </View>

          <View style={styles.pointsPill}>
            <Text style={styles.pointsNum}>{points}</Text>
            <Text style={styles.pointsPts}>pts</Text>
          </View>
        </View>

        {/* either self-check banner OR your weekly progress */}
        {needsAssessment ? (
          <Pressable
            style={styles.assessmentBanner}
            onPress={() => navigation.navigate("Assess")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                Start your self-check
              </Text>
              <Text style={styles.bannerSub}>
                Quick questions so we know what to help you learn.
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color="#2563EB"
            />
          </Pressable>
        ) : (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>This Week</Text>
                <Text style={styles.muted}>
                  Keep building your independence.
                </Text>
              </View>
              <View style={styles.ring}>
                <Text style={styles.ringText}>
                  {progressPct}%
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[styles.progressBar, { width: `${progressPct}%` }]}
              />
            </View>
          </View>
        )}

        {/* Coming Up */}
        <Text style={styles.sectionTitle}>Coming Up</Text>
        <View style={styles.card}>
          {nextVisit ? (
            <>
              <Text style={styles.cardSubtitle}>Next Appointment</Text>

              <Row icon="calendar-outline" text={nextVisit.date} />
              <Row icon="time-outline" text={nextVisit.time} />
              <Row icon="person-outline" text={nextVisit.provider} />

              <Text style={[styles.muted, { marginTop: 6 }]}>
                {nextVisit.reason}
              </Text>

              <Pressable
                style={[styles.primaryBtn, { marginTop: 14 }]}
                onPress={() => navigation.navigate("Appointments")}
              >
                <Text style={styles.primaryBtnText}>
                  Start Prep  →
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.cardSubtitle}>No upcoming visits</Text>
              <Text style={styles.muted}>
                Add your next appointment so you can get ready.
              </Text>
              <Pressable
                style={[styles.primaryBtn, { marginTop: 14 }]}
                onPress={() => navigation.navigate("Appointments")}
              >
                <Text style={styles.primaryBtnText}>
                  Add a visit  →
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Skills / Plan preview */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>
            Your Skills
          </Text>

          <View style={styles.itemsPill}>
            <Text style={styles.itemsPillText}>
              {remainingGoals.length} left
            </Text>
          </View>
        </View>

        {remainingGoals.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.muted}>
              You’re caught up on everything in your plan.
            </Text>
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 12, backgroundColor: "#10B981" },
              ]}
              onPress={() => navigation.navigate("Plan")}
            >
              <Text style={styles.primaryBtnText}>
                View your plan
              </Text>
            </Pressable>
          </View>
        ) : (
          remainingGoals.slice(0, 2).map((g) => (
            <View key={g.id} style={styles.card}>
              <View style={styles.todoHeader}>
                <View style={styles.radioEmpty} />
                <View style={{ flex: 1 }}>
                  <View style={styles.todoLine1}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>next step</Text>
                    </View>
                  </View>

                  <Text style={styles.todoTitle}>{g.label}</Text>
                </View>

                <Pressable
                  style={styles.startBtn}
                  onPress={() => navigation.navigate("Plan")}
                >
                  <Text style={styles.startBtnText}>
                    Open plan
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickGrid}>
          <SquareAction
            color="#2563EB"
            icon={
              <Ionicons name="calendar" size={22} color="white" />
            }
            label="My Visits"
            onPress={() => navigation.navigate("Appointments")}
          />

          <SquareAction
            color="#10B981"
            icon={
              <Ionicons
                name="shield-checkmark"
                size={22}
                color="white"
              />
            }
            label="My Info"
            onPress={() => navigation.navigate("MyHealthInfo")}
          />

          <SquareAction
            color="#7C3AED"
            icon={
              <Ionicons
                name="document-text-outline"
                size={22}
                color="white"
              />
            }
            label="Summary"
            onPress={() => navigation.navigate("Summary")}
          />

          <SquareAction
            color="#0284C7"
            icon={
              <Ionicons
                name="book-outline"
                size={22}
                color="white"
              />
            }
            label="Learn"
            onPress={() => navigation.navigate("Learn")}
          />
        </View>

        {/* Shop / Rewards */}
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>
            Rewards
          </Text>
          <Text style={styles.shopSub}>
            You have {points} points to use.
          </Text>
          <Pressable
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Rewards")}
          >
            <Text style={styles.shopBtnText}>
              Open Rewards
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.apptRow}>
      <Ionicons name={icon} size={18} color="#2563EB" />
      <Text style={styles.apptText}>{text}</Text>
    </View>
  );
}

function SquareAction({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.square, { backgroundColor: color }]}
    >
      <View style={{ alignItems: "center" }}>{icon}</View>
      <Text style={styles.squareLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },

  loadingWrap: {
    flex: 1,
    backgroundColor: "#F6F8FB",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  avatarBubble: {
    backgroundColor: "#E0F2FE",
    borderRadius: 24,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  helloText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  subHelloText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  pointsPill: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: "center",
  },
  pointsNum: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
  },
  pointsPts: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 14,
    textAlign: "center",
  },

  assessmentBanner: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  bannerTitle: {
    fontWeight: "800",
    color: "#1E3A8A",
    fontSize: 16,
    marginBottom: 4,
  },
  bannerSub: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "500",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#1F2937",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  muted: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },

  ring: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#BFDBFE",
  },
  ringText: {
    fontWeight: "700",
    color: "#2563EB",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563EB",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 6,
  },

  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  apptText: {
    color: "#111827",
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
  },

  itemsPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemsPillText: {
    color: "#065F46",
    fontWeight: "700",
  },

  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  todoLine1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  chipText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "lowercase",
  },
  todoTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  startBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
    flexWrap: "wrap",
  },
  square: {
    flexGrow: 1,
    flexBasis: "48%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  squareLabel: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },

  shopCard: {
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#6366F1",
    overflow: "hidden",
    marginTop: 8,
  },
  shopTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  shopSub: {
    color: "white",
    opacity: 0.9,
    marginBottom: 12,
    fontWeight: "600",
  },
  shopBtn: {
    backgroundColor: "white",
    borderRadius: 24,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shopBtnText: {
    color: "#3730A3",
    fontWeight: "800",
  },
});
