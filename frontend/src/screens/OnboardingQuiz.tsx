// frontend/src/screens/OnboardingQuiz.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { ONBOARDING_QUESTIONS, TOPIC_TITLES, Question, TopicId } from "../data/curriculum";
import { getPlan, setPlan, awardPoints } from "../storage/progressStore";

export default function OnboardingQuiz({ navigation }: any) {
  const questions = useMemo(() => ONBOARDING_QUESTIONS, []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[index];

  const pick = (qid: string, choiceId: string) => {
    setAnswers((a) => ({ ...a, [qid]: choiceId }));
  };

  const next = async () => {
    if (!answers[q.id]) {
      Alert.alert("Pick an answer to continue.");
      return;
    }
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Finished — score per topic
    const perTopic: Record<TopicId, { correct: number; total: number }> = {} as any;
    for (const item of questions) {
      const chosen = answers[item.id];
      const found = item.choices.find((c) => c.id === chosen);
      const ok = !!found?.correct;
      if (!perTopic[item.topic]) perTopic[item.topic] = { correct: 0, total: 0 };
      perTopic[item.topic].total += 1;
      if (ok) perTopic[item.topic].correct += 1;
    }

    const topicScores: Record<TopicId, number> = {} as any;
    const needs: TopicId[] = [];
    for (const t in perTopic) {
      const { correct, total } = perTopic[t as TopicId];
      const pct = Math.round((correct / total) * 100);
      topicScores[t as TopicId] = pct;
      if (pct < 75) needs.push(t as TopicId);
    }

    const base = await getPlan();
    const updated = {
      ...base,
      topicScores,
      topicsNeedingWork: needs,
    };
    await setPlan(updated);

    // award small points for just finishing the quiz
    await awardPoints(25);

    navigation.replace("Plan"); // show the personalized plan
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Getting to know you</Text>
        <Text style={s.subtitle}>
          Question {index + 1} of {questions.length}
        </Text>

        <View style={s.card}>
          <Text style={s.topic}>{TOPIC_TITLES[q.topic]}</Text>
          <Text style={s.prompt}>{q.prompt}</Text>

          {q.choices.map((c) => {
            const selected = answers[q.id] === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => pick(q.id, c.id)}
                style={[s.choice, selected && s.choiceActive]}
              >
                <Text style={[s.choiceText, selected && s.choiceTextActive]}>{c.label}</Text>
              </Pressable>
            );
          })}

          <Pressable onPress={next} style={s.primary}>
            <Text style={s.primaryText}>{index === questions.length - 1 ? "See my plan" : "Next"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { color: "#64748B", marginBottom: 8 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 10 },
  topic: { fontWeight: "800", color: "#2563EB" },
  prompt: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginVertical: 4 },
  choice: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    backgroundColor: "#F8FAFC",
  },
  choiceActive: { backgroundColor: "#2563EB" },
  choiceText: { color: "#111827", fontWeight: "600" },
  choiceTextActive: { color: "white" },
  primary: { backgroundColor: "#2563EB", padding: 12, borderRadius: 12, alignItems: "center", marginTop: 10 },
  primaryText: { color: "white", fontWeight: "800" },
});
