// frontend/src/screens/Plan.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getPlan } from "../storage/progressStore";

type PlanShape = {
  topics?: {
    [topicId: string]: {
      quiz?: boolean; // true when TopicDetails marks it done
    };
  };
};

const TOPICS: { id: string; label: string; subtitle?: string }[] = [
  { id: "insurance_card", label: "I can show my insurance card if someone asks." },
  { id: "meds", label: "I know my medicines and what they do." },
  { id: "appointments", label: "I can prepare for and manage my appointments." },
  { id: "records", label: "I understand my health records and how to access them." },
  { id: "rights", label: "I know my rights and privacy protections." },
  { id: "billing", label: "I understand bills and payment options." },
];

export default function Plan({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanShape | null>(null);

  async function load() {
    try {
      const p = await getPlan();
      setPlan(p || {});
    } catch {
      setPlan({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    load(); // first load
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <View style={styles.wrapper}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.header}>Learning Plan</Text>
        </View>

        <Text style={styles.sub}>Phase 1 (age 14)</Text>

        <Text style={styles.sectionTitle}>Still learning</Text>
        <Text style={styles.sectionSub}>These are skills you’re still building.</Text>

        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator />
          </View>
        ) : (
          TOPICS.map((t) => {
            const done = !!plan?.topics?.[t.id]?.quiz;
            return (
              <Pressable
                key={t.id}
                style={[styles.row, done && styles.rowDone]}
                onPress={() =>
                  navigation.navigate("TopicDetails", {
                    topicId: t.id,
                    title: t.label,
                    passPct: 80,
                  })
                }
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      borderColor: done ? "#10B981" : "#ef4444",
                      backgroundColor: done ? "#10B981" : "transparent",
                    },
                  ]}
                />
                <Text style={styles.rowText}>{t.label}</Text>
              </Pressable>
            );
          })
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Already handled</Text>
        <Text style={styles.sectionSub}>You’ve said you can already do these.</Text>

        {/* Render already-complete here if you track a separate list */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginRight: 8,
  },
  backBtnText: { fontWeight: "700", color: "#111827" },
  header: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  sub: { color: "#64748B", marginBottom: 16 },

  sectionTitle: { fontWeight: "800", color: "#111827", marginTop: 8 },
  sectionSub: { color: "#6B7280", marginBottom: 12 },

  row: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2", // red-100
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  rowDone: {
    borderColor: "#D1FAE5", // emerald-100
    backgroundColor: "#F0FDF4",
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    marginRight: 10,
  },
  rowText: { color: "#111827", fontWeight: "600", flexShrink: 1 },
});
