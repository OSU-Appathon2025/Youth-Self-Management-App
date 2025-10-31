// frontend/src/screens/Module.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { MODULES, TopicId } from "../data/curriculum";
import { awardPoints, markLessonDone, getPlan, setPlan } from "../storage/progressStore";

export default function ModuleScreen({ route, navigation }: any) {
  const topic: TopicId = route.params?.topic;
  const mod = MODULES.find((m) => m.id === topic);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const p = await getPlan();
      setDone(p.lessonsDone || {});
    })();
  }, []);

  if (!mod) {
    return (
      <SafeAreaView><Text>Module not found.</Text></SafeAreaView>
    );
  }

  const toggle = async (lessonId: string) => {
    const already = !!done[lessonId];
    const next = { ...done, [lessonId]: !already };
    setDone(next);
    await markLessonDone(lessonId);
    if (!already) await awardPoints(5);
  };

  const finishModule = async () => {
    // bump that topic’s score a bit as practice effect (toy logic)
    const p = await getPlan();
    const cur = p.topicScores[topic] ?? 0;
    const bumped = Math.min(100, cur + 10);
    p.topicScores[topic] = bumped;

    // If score now ≥ 75, remove from plan
    if (bumped >= 75) {
      p.topicsNeedingWork = p.topicsNeedingWork.filter((t) => t !== topic);
    }
    await setPlan(p);
    await awardPoints(20);
    navigation.replace("Plan");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>{mod.title}</Text>
        <Text style={s.desc}>{mod.description}</Text>

        {mod.lessons.map((L) => {
          const isDone = !!done[L.id];
          return (
            <Pressable key={L.id} onPress={() => toggle(L.id)} style={[s.lesson, isDone && s.lessonDone]}>
              <Text style={[s.lessonText, isDone && s.lessonTextDone]}>
                {isDone ? "✓ " : "○ "} {L.title}
              </Text>
            </Pressable>
          );
        })}

        <Pressable onPress={finishModule} style={s.primary}>
          <Text style={s.primaryText}>I practiced this topic</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  desc: { color: "#475569", marginBottom: 6 },
  lesson: { backgroundColor: "white", borderRadius: 12, padding: 12 },
  lessonDone: { backgroundColor: "#ECFDF5" },
  lessonText: { color: "#0F172A", fontWeight: "700" },
  lessonTextDone: { color: "#047857" },
  primary: { backgroundColor: "#2563EB", padding: 12, borderRadius: 12, alignItems: "center" },
  primaryText: { color: "white", fontWeight: "800" },
});
