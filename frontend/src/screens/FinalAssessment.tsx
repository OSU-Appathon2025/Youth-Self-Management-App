// frontend/src/screens/FinalAssessment.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { ONBOARDING_QUESTIONS } from "../data/curriculum";
import { awardPoints, setFinalPassed } from "../storage/progressStore";

// FYI: For web, the confetti package is optional—if you don’t want it, remove the component & dependency.
// Install:  npm i react-native-confetti-cannon

export default function FinalAssessment({ navigation }: any) {
  const pool = useMemo(() => ONBOARDING_QUESTIONS.slice().sort(() => Math.random() - 0.5).slice(0, 15), []);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [passed, setPassed] = useState<boolean | null>(null);

  const q = pool[idx];

  const pick = (id: string) => setAnswers((a) => ({ ...a, [q.id]: id }));

  const submit = async () => {
    let correct = 0;
    pool.forEach((qq) => {
      const c = qq.choices.find((x) => x.id === answers[qq.id]);
      if (c?.correct) correct += 1;
    });
    const pct = Math.round((correct / pool.length) * 100);
    const didPass = pct >= 80;
    setPassed(didPass);
    await setFinalPassed(didPass);
    if (didPass) await awardPoints(100);
  };

  if (passed !== null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB", justifyContent: "center", alignItems: "center", padding: 16 }}>
        {passed && <ConfettiCannon count={150} origin={{ x: -10, y: 0 }} fadeOut />}
        <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 10 }}>
          {passed ? "You did it! 🎉" : "Almost there!"}
        </Text>
        <Text style={{ color: "#475569", textAlign: "center", marginBottom: 16 }}>
          {passed
            ? "You passed the final check. Great job!"
            : "Score < 80%. We’ll highlight sections to review and you can try again."}
        </Text>
        <Pressable style={styles.primary} onPress={() => navigation.replace(passed ? "Home" : "Plan")}>
          <Text style={styles.primaryText}>{passed ? "Go Home" : "See my plan"}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Final Assessment</Text>
        <Text style={styles.subtitle}>Question {idx + 1} of {pool.length}</Text>

        <View style={styles.card}>
          <Text style={styles.prompt}>{q.prompt}</Text>
          {q.choices.map((c) => {
            const selected = answers[q.id] === c.id;
            return (
              <Pressable key={c.id} onPress={() => pick(c.id)} style={[styles.choice, selected && styles.choiceActive]}>
                <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{c.label}</Text>
              </Pressable>
            );
          })}
          {idx < pool.length - 1 ? (
            <Pressable style={styles.primary} onPress={() => setIdx((i) => i + 1)}>
              <Text style={styles.primaryText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.primary} onPress={submit}>
              <Text style={styles.primaryText}>Submit</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { color: "#64748B" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 10 },
  prompt: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  choice: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, backgroundColor: "#F8FAFC", marginTop: 6 },
  choiceActive: { backgroundColor: "#2563EB" },
  choiceText: { color: "#111827", fontWeight: "600" },
  choiceTextActive: { color: "white" },
  primary: { backgroundColor: "#2563EB", padding: 12, borderRadius: 12, alignItems: "center", marginTop: 10 },
  primaryText: { color: "white", fontWeight: "800" },
});
