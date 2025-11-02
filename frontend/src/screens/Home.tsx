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

import {
  getCurrentUser,
  UserProfile,
} from "../storage/userStore";

export default function Home({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // helper: load user from storage
  async function load() {
    const u = await getCurrentUser();
    setUser(u);
  }

  // load on mount
  useEffect(() => {
    load();
  }, []);

  // also reload every time Home comes back into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  // if no user, shove them to Auth screen
  useEffect(() => {
    if (user === null) return;
    if (!user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
    }
  }, [user, navigation]);

  if (!user) {
    // basic loading state / or redirect
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={{ color: "#64748B" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  // compute progress / points
  const goalsDone = user.plan.filter((g) => g.done).length;
  const totalGoals = user.plan.length;
  const progressPct =
    totalGoals === 0
      ? 0
      : Math.round((goalsDone / totalGoals) * 100);

  // super basic “points” model:
  const points = goalsDone * 10;

  // To-Do = goals that are NOT done yet
  const remainingGoals = user.plan.filter((g) => !g.done);

  // show assessment banner if they haven't passed yet
  const needsAssessment = !user.hasCompletedAssessment;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarText}>
                {user.name?.[0]?.toUpperCase() || "Y"}
              </Text>
            </View>
            <View>
              <Text style={styles.hello}>
                Hey {user.name?.split(" ")[0] || "there"} 👋
              </Text>
              <Text style={styles.subtitle}>
                You’re doing great
              </Text>
            </View>
          </View>

          <View style={styles.pointsPill}>
            <Text>⚡</Text>
            <Text style={styles.pointsText}>{points}</Text>
            <Text style={styles.pointsSub}>pts</Text>
          </View>
        </View>

        {/* If they didn't pass onboarding/assessment yet, put a banner */}
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
                Take a quick quiz so we know what
                to help you learn.
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle"
              size={28}
              color="#2563EB"
            />
          </Pressable>
        ) : (
          // otherwise show their weekly progress card
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>This Week</Text>
                <Text style={styles.muted}>
                  Keep up the momentum!
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
                style={[
                  styles.progressBar,
                  { width: `${progressPct}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Coming Up (placeholder for now) */}
        <Text style={styles.sectionTitle}>Coming Up</Text>
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>
            Next Appointment
          </Text>

          <Row icon="calendar-outline" text="Tuesday, Oct 29" />
          <Row icon="time-outline" text="3:00 PM" />
          <Row icon="person-outline" text="Dr. Nguyen" />

          <Text style={[styles.muted, { marginTop: 6 }]}>
            Check-up
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={() => navigation.navigate("Appointments")}
          >
            <Text style={styles.primaryBtnText}>
              Start Prep  →
            </Text>
          </Pressable>
        </View>

        {/* To-Do / Goals */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>
            Your Goals
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
              You’ve finished everything in your plan 🎉
            </Text>
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 12, backgroundColor: "#10B981" },
              ]}
              onPress={() => navigation.navigate("Plan")}
            >
              <Text style={styles.primaryBtnText}>
                View full plan
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
                      <Text style={styles.chipText}>
                        Goal
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.todoTitle}>
                    {g.label}
                  </Text>
                </View>

                <Pressable
                  style={styles.startBtn}
                  onPress={() =>
                    navigation.navigate("Plan")
                  }
                >
                  <Text style={styles.startBtnText}>
                    Work on it
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.quickGrid}>
          <SquareAction
            color="#2563EB"
            icon={
              <Ionicons
                name="calendar"
                size={22}
                color="white"
              />
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
                name="play-circle"
                size={22}
                color="white"
              />
            }
            label="Learn"
            onPress={() => navigation.navigate("Learn")}
          />
        </View>

        {/* Shop teaser */}
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>
            Visit the Shop!
          </Text>
          <Text style={styles.shopSub}>
            You have {points} points to spend on cool
            stuff
          </Text>
          <Pressable
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Rewards")}
          >
            <Text style={styles.shopBtnText}>
              Shop Now
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Little row for appointment info
function Row({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.apptRow}>
      <Ionicons
        name={icon}
        size={18}
        color="#2563EB"
      />
      <Text style={styles.apptText}>{text}</Text>
    </View>
  );
}

// Square quick action button
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  hello: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pointsText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  pointsSub: {
    color: "#64748B",
    marginLeft: 2,
    fontSize: 12,
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
  muted: { color: "#64748B" },

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
  },
  square: {
    flex: 1,
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
