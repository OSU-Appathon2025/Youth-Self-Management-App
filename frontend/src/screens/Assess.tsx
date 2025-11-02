// frontend/src/screens/Assess.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ConfettiCannon from "react-native-confetti-cannon";

// NOTE: this assessment is an in-app knowledge check.
// It's separate from onboarding quiz and final quiz.
// You can later swap this question set for whatever you want.

type Choice = { id: string; text: string; isCorrect?: boolean };
type Question = {
  id: string;
  text: string;
  topic: string;
  choices: Choice[];
};

// temporary hardcoded assessment questions
// you can expand these to match the PDF survey later
const ASSESS_QUESTIONS: Question[] = [
  {
    id: "a1",
    topic: "insurance",
    text: "Do you know when to show your insurance card?",
    choices: [
      {
        id: "c1",
        text: "At the start of the appointment / check-in desk.",
        isCorrect: true,
      },
      { id: "c2", text: "Only if they ask about money.", isCorrect: false },
      { id: "c3", text: "You never need it.", isCorrect: false },
    ],
  },
  {
    id: "a2",
    topic: "appointments",
    text: "If you need to change your appointment time, what do you do?",
    choices: [
      {
        id: "c1",
        text: "Call or message the clinic to reschedule.",
        isCorrect: true,
      },
      { id: "c2", text: "Just skip it and go next time.", isCorrect: false },
      {
        id: "c3",
        text: "Wait and hope they text you something else.",
        isCorrect: false,
      },
    ],
  },
  {
    id: "a3",
    topic: "meds",
    text: "You're almost out of a prescription. What's the right move?",
    choices: [
      {
        id: "c1",
        text: "Ask for a refill (call / portal / pharmacy request).",
        isCorrect: true,
      },
      { id: "c2", text: "Just stop taking it.", isCorrect: false },
      {
        id: "c3",
        text: "Cut pills in half so it lasts longer.",
        isCorrect: false,
      },
    ],
  },
];

export default function Assess({ navigation }: any) {
  // which choice the kid picked for each question
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // has the user hit submit yet
  const [submitted, setSubmitted] = useState(false);
  // should we fire confetti
  const [fireConfetti, setFireConfetti] = useState(false);

  // shake anim when they try to submit with blanks
  const shake = useRef(new Animated.Value(0)).current;

  // progress bar math
  const total = ASSESS_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct =
    total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  // score math (only after submit)
  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    let ok = 0;
    for (const q of ASSESS_QUESTIONS) {
      const picked = answers[q.id];
      const choice = q.choices.find((c) => c.id === picked);
      if (choice?.isCorrect) ok++;
    }
    return ok;
  }, [answers, submitted]);

  const scorePct =
    total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = submitted && scorePct >= 75; // pass bar for this quiz

  // user taps an answer
  function selectChoice(qid: string, cid: string) {
    if (submitted) return; // lock after submit
    setAnswers((prev) => ({ ...prev, [qid]: cid }));
  }

  // submit button
  async function submit() {
    // block if any blank
    const anyBlank = ASSESS_QUESTIONS.some((q) => !answers[q.id]);
    if (anyBlank) {
      // little shake
      Animated.sequence([
        Animated.timing(shake, {
          toValue: -1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        "Almost there!",
        "Please answer every question before submitting."
      );
      return;
    }

    setSubmitted(true);

    // celebrate if passed
    if (scorePct >= 75) {
      setFireConfetti(true);
      setTimeout(() => setFireConfetti(false), 2500);
    }
  }

  // retake button
  function retake() {
    setSubmitted(false);
    setFireConfetti(false);
    setAnswers({});
  }

  // map shake value to small left/right nudge
  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          {/* title */}
          <Text style={styles.title}>Insurance Basics Assessment</Text>

          {/* progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPct}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPctText}>{progressPct}%</Text>
          </View>

          {/* questions */}
          {ASSESS_QUESTIONS.map((q, idx) => (
            <View key={q.id} style={styles.qCard}>
              <Text style={styles.qIndex}>Q{idx + 1}</Text>
              <Text style={styles.qText}>{q.text}</Text>

              {q.choices.map((c) => {
                const chosen = answers[q.id] === c.id;
                const showResult = submitted;
                const isRight = showResult && c.isCorrect;
                const isWrongChosen =
                  showResult && chosen && !c.isCorrect;

                return (
                  <Pressable
                    key={c.id}
                    onPress={() => selectChoice(q.id, c.id)}
                    style={[
                      styles.choice,
                      // selected pre-submit
                      chosen &&
                        !showResult && {
                          borderColor: "#2563EB",
                          backgroundColor: "#EFF6FF",
                        },
                      // correct after submit
                      isRight && {
                        borderColor: "#16A34A",
                        backgroundColor: "#F0FDF4",
                      },
                      // wrong (but chosen) after submit
                      isWrongChosen && {
                        borderColor: "#DC2626",
                        backgroundColor: "#FEF2F2",
                      },
                    ]}
                  >
                    {/* left side: little radio + text */}
                    <View style={styles.choiceLeft}>
                      <View
                        style={[
                          styles.radio,
                          chosen && { borderColor: "#2563EB" },
                          (isRight || isWrongChosen) && {
                            borderColor: isRight
                              ? "#16A34A"
                              : "#DC2626",
                          },
                        ]}
                      >
                        {chosen && (
                          <View
                            style={[
                              styles.dot,
                              isRight && {
                                backgroundColor: "#16A34A",
                              },
                            ]}
                          />
                        )}
                      </View>

                      <Text style={styles.choiceText}>{c.text}</Text>
                    </View>

                    {/* right side icon only AFTER submit */}
                    {showResult ? (
                      <Ionicons
                        name={
                          isRight
                            ? "checkmark-circle"
                            : isWrongChosen
                            ? "close-circle"
                            : "ellipse-outline"
                        }
                        size={20}
                        color={
                          isRight
                            ? "#16A34A"
                            : isWrongChosen
                            ? "#DC2626"
                            : "#94A3B8"
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* bottom action area */}
          {!submitted ? (
            <Pressable style={styles.primaryBtn} onPress={submit}>
              <Text style={styles.primaryBtnText}>Submit answers</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 10 }}>
              {/* score strip */}
              <View style={styles.scoreStrip}>
                <Text style={styles.scoreText}>
                  Score: {scorePct}%
                </Text>
                <Text
                  style={[
                    styles.scoreText,
                    {
                      color: passed ? "#16A34A" : "#DC2626",
                    },
                  ]}
                >
                  {passed ? "Passed 🎉" : "Try again"}
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
                  <Text style={styles.primaryBtnText}>
                    Continue to Home
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={retake}
                >
                  <Text style={styles.primaryBtnText}>
                    Retake assessment
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* confetti */}
          {submitted && fireConfetti ? (
            <ConfettiCannon
              key={`confetti-${scorePct}`}
              count={180}
              origin={{ x: 0, y: 0 }}
              fadeOut
              autoStart
            />
          ) : null}

          <View style={{ height: 28 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },

  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  progressPctText: {
    fontWeight: "700",
    color: "#0F172A",
  },

  qCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  choiceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  choiceText: {
    color: "#0F172A",
    fontWeight: "600",
    flexShrink: 1,
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "800",
  },

  scoreStrip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreText: {
    fontWeight: "800",
    color: "#1F2937",
  },
});
