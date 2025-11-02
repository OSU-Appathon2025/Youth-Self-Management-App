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
  markGoalDone,
  UserProfile,
  LearningGoal,
} from "../storage/userStore";

export default function Plan({ navigation }: any) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    const u = await getCurrentUser();
    setUser(u);
  }

  // load when screen mounts
  useEffect(() => {
    load();
  }, []);

  // also reload when screen is focused again
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={{ color: "#64748B" }}>Loading plan…</Text>
      </SafeAreaView>
    );
  }

  const { phase, plan } = user;

  // mark a goal done in storage then reload
  async function complete(goalId: string) {
    setUpdatingId(goalId);
    await markGoalDone(goalId);
    await load();
    setUpdatingId(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header / intro */}
        <Text style={styles.title}>
          Your Learning Plan
        </Text>
        <Text style={styles.subtitle}>
          Phase {phase}: Things you should be able to do
        </Text>

        <View style={{ height: 12 }} />

        {plan.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.muted}>
              No items in your plan yet. (This usually
              means we didn’t collect your age. Try
              logging out and making a new account.)
            </Text>
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 12 },
              ]}
              onPress={() => navigation.navigate("Auth")}
            >
              <Text style={styles.primaryBtnText}>
                Go to Sign In
              </Text>
            </Pressable>
          </View>
        ) : (
          plan.map((goal: LearningGoal) => {
            const done = goal.done;
            const loadingThis = updatingId === goal.id;

            return (
              <View key={goal.id} style={styles.goalRow}>
                <View style={styles.goalLeft}>
                  <View
                    style={[
                      styles.checkCircle,
                      done && styles.checkCircleDone,
                    ]}
                  >
                    {done ? (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#fff"
                      />
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.goalText,
                      done && styles.goalTextDone,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </View>

                {!done ? (
                  <Pressable
                    style={styles.completeBtn}
                    disabled={loadingThis}
                    onPress={() => complete(goal.id)}
                  >
                    <Text
                      style={styles.completeBtnText}
                    >
                      {loadingThis
                        ? "Saving..."
                        : "Mark done"}
                    </Text>
                  </Pressable>
                ) : (
                  <Text
                    style={[
                      styles.doneTag,
                      { color: "#16A34A" },
                    ]}
                  >
                    Done
                  </Text>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    backgroundColor: "#F6F8FB",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 4,
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
  muted: {
    color: "#64748B",
  },

  goalRow: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#1F2937",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 12,
  },

  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkCircleDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  goalText: {
    color: "#0F172A",
    fontWeight: "600",
    flexShrink: 1,
  },
  goalTextDone: {
    color: "#6EE7B7",
    textDecorationLine: "line-through",
  },

  completeBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeBtnText: {
    color: "white",
    fontWeight: "700",
  },

  doneTag: {
    fontWeight: "700",
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
  },
});
