// frontend/src/screens/Goals.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert,
} from "react-native";

type Goal = {
  id: string;
  title: string;
  done: boolean;
};

export default function Goals() {
  const [title, setTitle] = useState("");
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", title: "Carry insurance card daily", done: false },
    { id: "g2", title: "Add emergency contact", done: true },
  ]);

  const total = goals.length;
  const completed = goals.filter((g) => g.done).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const addGoal = () => {
    const t = title.trim();
    if (!t) return Alert.alert("Add a goal", "Type a goal first.");
    const id = "g" + Math.random().toString(36).slice(2, 7);
    setGoals((old) => [{ id, title: t, done: false }, ...old]);
    setTitle("");
  };

  const toggle = (id: string) =>
    setGoals((old) => old.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));

  const remove = (id: string) =>
    setGoals((old) => old.filter((g) => g.id !== id));

  const sorted = useMemo(
    () => [...goals].sort((a, b) => Number(a.done) - Number(b.done)),
    [goals]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text style={styles.h1}>My Goals</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{pct}%</Text>
          <View style={styles.track}><View style={[styles.bar, { width: `${pct}%` }]} /></View>
        </View>

        {/* Add */}
        <View style={styles.addCard}>
          <Text style={styles.label}>New goal</Text>
          <View style={styles.addRow}>
            <TextInput
              placeholder="Ex: Call to schedule my check-up"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <Pressable style={styles.addBtn} onPress={addGoal}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
          <Text style={styles.tip}>Tip: Keep goals small and specific.</Text>
        </View>

        {/* List */}
        <Text style={styles.sectionTitle}>Goals</Text>
        {sorted.length === 0 ? (
          <View style={styles.empty}><Text style={{ color: "#64748B" }}>No goals yet. Add one above.</Text></View>
        ) : (
          sorted.map((g) => (
            <View key={g.id} style={[styles.goalRow, g.done && styles.goalDone]}>
              <Pressable onPress={() => toggle(g.id)} style={[styles.check, g.done && styles.checkOn]}>
                {g.done ? <Text style={styles.checkMark}>✓</Text> : null}
              </Pressable>
              <Text style={[styles.goalText, g.done && styles.goalTextDone]}>{g.title}</Text>
              <Pressable onPress={() => remove(g.id)} style={styles.del}><Text style={styles.delText}>Delete</Text></Pressable>
            </View>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  progressText: { fontWeight: "800", color: "#2563EB" },
  track: { flex: 1, height: 8, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" },
  bar: { height: "100%", backgroundColor: "#2563EB" },

  addCard: {
    backgroundColor: "white", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12,
  },
  label: { fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  addRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, backgroundColor: "#F3F4F6", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E5E7EB", color: "#111827" },
  addBtn: { backgroundColor: "#2563EB", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "white", fontWeight: "800" },
  tip: { color: "#6B7280", marginTop: 6 },

  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 8, marginTop: 6 },
  empty: { backgroundColor: "white", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },

  goalRow: {
    backgroundColor: "white", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E5E7EB",
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10,
  },
  goalDone: { opacity: 0.8 },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#93C5FD", alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: "#DBEAFE", borderColor: "#60A5FA" },
  checkMark: { color: "#1E3A8A", fontWeight: "800" },
  goalText: { flex: 1, color: "#111827", fontWeight: "600" },
  goalTextDone: { textDecorationLine: "line-through", color: "#6B7280" },
  del: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#FEE2E2", borderRadius: 8 },
  delText: { color: "#991B1B", fontWeight: "800" },
});
