// frontend/src/screens/OnboardingQuiz.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";

import {
  ONBOARDING_QUESTIONS,
  TOPIC_TITLES,
  TopicId,
  Question,
} from "../data/curriculum";
import {
  getPlan,
  setPlan,
  setTopicsNeedingWork,
  awardPoints,
} from "../storage/progressStore";

export default function OnboardingQuiz({ navigation }: any) {
  const questions: Question[] = useMemo(
    () => ONBOARDING_QUESTIONS,
    []
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[index];

  function pick(qid: string, choiceId: string) {
    setAnswers((old) => ({ ...old, [qid]: choiceId }));
  }

  async function next() {
    // force answer
    if (!answers[q.id]) {
      Alert.alert("Pick an answer to continue.");
      return;
    }

    // if there are more questions, go to next
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }

    // we are done with the intake quiz
    // figure out which topics they struggled with
    // simple rule:
    //   if answer is the most "confident" option -> score 100
    //   middle -> 60
    //   lowest -> 30
    //   lower score = needs work
    const topicScores: Record<TopicId, number> = {} as any;

    for (const qq of questions) {
      const choiceId = answers[qq.id];
      // map each answer id to confidence score
      let scoreGuess = 30;
      if (choiceId === "yes" || choiceId === "all") scoreGuess = 100;
      else if (choiceId === "kinda" || choiceId === "with_help" || choiceId === "some" || choiceId === "nervous") {
        scoreGuess = 60;
      } else {
        scoreGuess = 30;
      }

      // if topic already has a score, average them
      if (topicScores[qq.topic] === undefined) {
        topicScores[qq.topic] = scoreGuess;
      } else {
        topicScores[qq.topic] = Math.round(
          (topicScores[qq.topic] + scoreGuess) / 2
        );
      }
    }

    // topicsNeedingWork = any topic under 80
    const topicsNeedingWork = (Object.keys(topicScores) as TopicId[]).filter(
      (t) => topicScores[t] < 80
    );

    // save into plan
    await setTopicsNeedingWork(topicsNeedingWork, topicScores);

    // give them starter points for finishing onboarding
    await awardPoints(50);

    // nav -> Plan (or Home)
    navigation.replace("Plan");
  }

  // small helper for pretty text like "Insurance & Coverage"
  const topicName = TOPIC_TITLES[q.topic];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <Text style={styles.header}>Let's get to know you</Text>
        <Text style={styles.sub}>
          Question {index + 1} of {questions.length}
        </Text>

        <View style={styles.card}>
          <Text style={styles.topicLabel}>{topicName}</Text>
          <Text style={styles.qText}>{q.text}</Text>

          {q.choices.map((c) => {
            const chosen = answers[q.id] === c.id;
            return (
              <Pressable
                key={c.id}
                style={[
                  styles.choice,
                  chosen && {
                    borderColor: "#2563EB",
                    backgroundColor: "#EFF6FF",
                  },
                ]}
                onPress={() => pick(q.id, c.id)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    chosen && { color: "#1D4ED8" },
                  ]}
                >
                  {c.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>
            {index === questions.length - 1 ? "Finish" : "Next"}
          </Text>
        </Pressable>
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
  sub: { color: "#64748B", marginBottom: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20,
  },
  topicLabel: {
    fontWeight: "700",
    color: "#6366F1",
    fontSize: 14,
    marginBottom: 8,
  },
  qText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 16,
    marginBottom: 12,
  },
  choice: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  choiceText: {
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
});
