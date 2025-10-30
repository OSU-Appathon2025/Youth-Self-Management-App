// frontend/src/screens/Plan.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { getPlan } from "../storage/progressStore";
import { MODULES, TOPIC_TITLES, TopicId } from "../data/curriculum";

export default function Plan({ navigation }: any) {
  const [topics, setTopics] = useState<TopicId[]>([]);
  const [scores, setScores] = useState<Record<TopicId, number>>({} as any);

  useEffect(() => {
    (async () => {
      const p = await getPlan();
      setTopics(p.topicsNeedingWork);
      setScores(p.topicScores);
    })();
  }, []);

  const goModule = (topic: TopicId) => navigation.navigate("Module", { topic });

  const modules = MODULES.filter((m) => topics.includes(m.id as TopicId));

  const doneAll = modules.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Your plan</Text>
        {doneAll ? (
          <>
            <Text style={s.note}>Nice! You’re ready for the final check.</Text>
            <Pressable style={s.primary} onPress={() => navigation.navigate("FinalAssessment")}>
              <Text style={s.primaryText}>Start Final Assessment</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.note}>Focus on these areas first:</Text>
            {modules.map((m) => (
              <View key={m.id} style={s.card}>
                <Text style={s.cardTitle}>{m.title}</Text>
                <Text style={s.score}>Current score: {scores[m.id as TopicId] ?? 0}%</Text>
                <Text style={s.desc}>{m.description}</Text>
                <Pressable style={s.secondary} onPress={() => goModule(m.id as TopicId)}>
                  <Text style={s.secondaryText}>Work on this</Text>
                </Pressable>
              </View>
            ))}

            <Pressable style={[s.primary, { marginTop: 12 }]} onPress={() => navigation.navigate("FinalAssessment")}>
              <Text style={s.primaryText}>Try Final Assessment</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  note: { color: "#475569" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 14 },
  cardTitle: { fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  score: { color: "#2563EB", fontWeight: "700", marginBottom: 4 },
  desc: { color: "#334155", marginBottom: 8 },
  primary: { backgroundColor: "#2563EB", padding: 12, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "white", fontWeight: "800" },
  secondary: { backgroundColor: "#EFF6FF", padding: 10, borderRadius: 10, alignItems: "center" },
  secondaryText: { color: "#1D4ED8", fontWeight: "800" },
});
