// frontend/src/screens/Module.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { MODULES, TopicId } from "../data/curriculum";
import {
  awardPoints,
  markLessonDone,
  getPlan,
  setPlan,
  Plan,
} from "../storage/progressStore";

// route.params.topic should be a TopicId
export default function ModuleScreen({ route, navigation }: any) {
  const topic: TopicId | undefined = route?.params?.topic;

  const mod = MODULES.find((m) => m.id === topic);
  const [done, setDone] = useState<Record<string, boolean>>({});

  // load which lessons are done
  useEffect(() => {
    (async () => {
      const p = await getPlan();
      setDone(p.lessonsDone || {});
    })();
  }, []);

  if (!mod) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
        <View style={{ padding: 16 }}>
          <Text>Module not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function completeLesson(lessonId: string) {
    // update storage
    const newPlan = await markLessonDone(lessonId);

    // update local state so UI re-renders
    setDone(newPlan.lessonsDone || {});

    // tiny reward for completing lesson
    await awardPoints(5);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <Text style={styles.header}>{mod.title}</Text>
        <Text style={styles.sub}>Tap each card to read it and mark it done.</Text>

        {mod.lessons.map((lesson) => {
          const finished = done[lesson.id] === true;
          return (
            <Pressable
              key={lesson.id}
              style={[
                styles.lessonCard,
                finished && { borderColor: "#10B981", backgroundColor: "#ECFDF5" },
              ]}
              onPress={() => completeLesson(lesson.id)}
            >
              <View style={styles.rowBetween}>
                <Text
                  style={[
                    styles.lessonTitle,
                    finished && { color: "#065F46" },
                  ]}
                >
                  {lesson.title}
                </Text>
                <Text
                  style={[
                    styles.badge,
                    finished && { backgroundColor: "#10B981" },
                  ]}
                >
                  {finished ? "Done" : "Tap to complete"}
                </Text>
              </View>

              <Text style={styles.lessonBody}>{lesson.body}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  sub: {
    color: "#64748B",
    marginBottom: 16,
    fontSize: 14,
  },
  lessonCard: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  lessonTitle: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16,
    flexShrink: 1,
    paddingRight: 8,
  },
  badge: {
    fontSize: 12,
    backgroundColor: "#2563EB",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    fontWeight: "700",
  },
  lessonBody: {
    color: "#1F2937",
    fontSize: 14,
    lineHeight: 18,
  },
});
