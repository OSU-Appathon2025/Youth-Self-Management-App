// frontend/src/screens/FinalAssessment.tsx

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
import ConfettiCannon from "react-native-confetti-cannon";

// If these functions don't exist yet in your progressStore,
// comment this import + the places they're used.
import { setFinalPassed, awardPoints } from "../storage/progressStore";

// DO NOT export this.
// DO NOT import FINAL_QUESTIONS from anywhere else.
const FINAL_QUESTIONS = [
  {
    id: "q1",
    text: "Why do you get a medical bill?",
    choices: [
      {
        id: "q1a",
        text: "It's just a random number hospitals send for fun.",
        correct: false,
      },
      {
        id: "q1b",
        text: "It shows what was done, what insurance paid, and what you still owe.",
        correct: true,
      },
      {
        id: "q1c",
        text: "It's only for tax filing and not for payment.",
        correct: false,
      },
    ],
  },
  {
    id: "q2",
    text: "If you're not sure about a charge on your bill, what can you do?",
    choices: [
      {
        id: "q2a",
        text: "Nothing. You're not allowed to ask questions.",
        correct: false,
      },
      {
        id: "q2b",
        text: "Call the billing number on the bill and ask them to explain line by line.",
        correct: true,
      },
      {
        id: "q2c",
        text: "Pay immediately without looking at it.",
        correct: false,
      },
    ],
  },
  {
    id: "q3",
    text: "What is a payment plan?",
    choices: [
      {
        id: "q3a",
        text: "Paying a little over time instead of one huge amount.",
        correct: true,
      },
      {
        id: "q3b",
        text: "A way to ignore the bill forever.",
        correct: false,
      },
      {
        id: "q3c",
        text: "Insurance paying 100% of the cost.",
        correct: false,
      },
    ],
  },
  {
    id: "q4",
    text: "When booking an appointment, what info should you say first?",
    choices: [
      {
        id: "q4a",
        text: "Your name and date of birth.",
        correct: true,
      },
      {
        id: "q4b",
        text: "Your favorite color.",
        correct: false,
      },
      {
        id: "q4c",
        text: "Your friend's birthday.",
        correct: false,
      },
    ],
  },
  {
    id: "q5",
    text: "What does a prescription label tell you?",
    choices: [
      {
        id: "q5a",
        text: "The med name, dose, and how often to take it.",
        correct: true,
      },
      {
        id: "q5b",
        text: "The pharmacist's favorite snack.",
        correct: false,
      },
      {
        id: "q5c",
        text: "Only the pharmacy address.",
        correct: false,
      },
    ],
  },
];

// Types for clarity
interface Question {
  id: string;
  text: string;
  choices: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
}

export default function FinalAssessment({ navigation }: any) {
  // Right now we just use all questions
  const pool: Question[] = useMemo(() => FINAL_QUESTIONS.slice(), []);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  function pick(qid: string, choiceId: string) {
    if (submitted) return; // lock answers after submit
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  }

  async function submit() {
    if (submitted) return;

    // grade it
    let correctCount = 0;
    pool.forEach((qq) => {
      const chosenId = answers[qq.id];
      const chosen = qq.choices.find((c) => c.id === chosenId);
      if (chosen?.correct) correctCount += 1;
    });

    const pct = Math.round((correctCount / pool.length) * 100);
    const didPass = pct >= 80;

    setSubmitted(true);
    setPassed(didPass);

    // save "final passed" state in your app data
    try {
      await setFinalPassed(didPass);
    } catch (e) {
      // if setFinalPassed isn't ready yet it's fine
    }

    if (didPass) {
      try {
        await awardPoints(200); // bonus
      } catch (e) {}
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      Alert.alert(
        "Almost",
        "You scored below 80%. We'll show you what to review."
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <Text style={styles.header}>Final Check</Text>
        <Text style={styles.sub}>
          Answer these. If you score 80% or higher, you’re done!
        </Text>

        {pool.map((q, idx) => (
          <View style={styles.card} key={q.id}>
            <Text style={styles.qIndex}>Q{idx + 1}</Text>
            <Text style={styles.qText}>{q.text}</Text>

            {q.choices.map((c) => {
              const chosen = answers[q.id] === c.id;
              const show = submitted;
              const isCorrect = show && c.correct;
              const isWrongChosen = show && chosen && !c.correct;

              return (
                <Pressable
                  key={c.id}
                  onPress={() => pick(q.id, c.id)}
                  style={[
                    styles.choice,
                    chosen &&
                      !show && {
                        borderColor: "#2563EB",
                        backgroundColor: "#EFF6FF",
                      },
                    isCorrect && {
                      borderColor: "#10B981",
                      backgroundColor: "#ECFDF5",
                    },
                    isWrongChosen && {
                      borderColor: "#DC2626",
                      backgroundColor: "#FEF2F2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      isCorrect && {
                        color: "#065F46",
                        fontWeight: "700",
                      },
                      isWrongChosen && {
                        color: "#DC2626",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {c.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        {!submitted ? (
          <Pressable style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryBtnText}>Submit answers</Text>
          </Pressable>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={styles.resultStrip}>
              <Text style={styles.resultText}>
                {passed
                  ? "You passed 🎉"
                  : "You need a bit more practice"}
              </Text>
            </View>

            {passed ? (
              <Pressable
                style={[
                  styles.primaryBtn,
                  { backgroundColor: "#10B981" },
                ]}
                onPress={() => navigation.replace("Home")}
              >
                <Text style={styles.primaryBtnText}>Go to Home</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.primaryBtn}
                onPress={() => navigation.replace("Plan")}
              >
                <Text style={styles.primaryBtnText}>
                  See what to review
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {showConfetti ? (
          <ConfettiCannon
            key="final-pass-confetti"
            count={180}
            origin={{ x: 0, y: 0 }}
            fadeOut
            autoStart
          />
        ) : null}

        <View style={{ height: 40 }} />
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
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 16,
  },
  qIndex: {
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
  },
  qText: {
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
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
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  resultStrip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  resultText: {
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 16,
  },
});
