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

import { updateCurrentUser } from "../storage/userStore";

// TYPES ----------------------------------------------------------------
type Choice = { id: string; text: string; isCorrect?: boolean };
type Question = {
  id: string;
  text: string;
  topic: string; // e.g. "Insurance", "Appointments"
  choices: Choice[];
};

// TEMP QUESTIONS (we'll replace with real curriculum later) -----------
// Make sure exactly ONE choice per question has isCorrect: true
const QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "Insurance",
    text: "What is a health insurance card mainly used for?",
    choices: [
      { id: "a", text: "To prove you graduated high school" },
      {
        id: "b",
        text: "To show at the doctor so they know how to bill your visit",
        isCorrect: true,
      },
      { id: "c", text: "To buy medicine without a prescription" },
      { id: "d", text: "To get into concerts for free" },
    ],
  },
  {
    id: "q2",
    topic: "Appointments",
    text: "If you can't make your appointment, what should you do?",
    choices: [
      {
        id: "a",
        text: "Call the clinic and tell them so you can reschedule",
        isCorrect: true,
      },
      { id: "b", text: "Just don't show up" },
      { id: "c", text: "Send your friend instead of you" },
      { id: "d", text: "Pretend you forgot" },
    ],
  },
  {
    id: "q3",
    topic: "Medication",
    text: "When you pick up a new prescription, what's important to know?",
    choices: [
      { id: "a", text: "What it tastes like" },
      {
        id: "b",
        text: "What it’s for and how / when you’re supposed to take it",
        isCorrect: true,
      },
      { id: "c", text: "If the bottle is cute" },
      { id: "d", text: "If your friend also wants some" },
    ],
  },
  {
    id: "q4",
    topic: "Independence",
    text: "Who is mainly responsible for keeping track of YOUR health info as you get older?",
    choices: [
      { id: "a", text: "Only your parents" },
      { id: "b", text: "Only the school nurse" },
      {
        id: "c",
        text: "You, with help from parents/doctor until you can do it by yourself",
        isCorrect: true,
      },
      { id: "d", text: "Some random person on TikTok" },
    ],
  },
  {
    id: "q5",
    topic: "Insurance",
    text: "If a clinic asks 'Who is your insurance provider?', what are they asking?",
    choices: [
      { id: "a", text: "Which streaming services you pay for" },
      { id: "b", text: "Your favorite shoe brand" },
      {
        id: "c",
        text: "The company that helps pay your medical bills",
        isCorrect: true,
      },
      { id: "d", text: "Whether you have cash today" },
    ],
  },
];

// you can add more later until it's 20+ questions

// ---------------------------------------------------------------------

export default function Assess({ navigation }: any) {
  // which answer did the kid pick for each question
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // did they hit submit yet
  const [submitted, setSubmitted] = useState(false);

  // turn on confetti when they pass
  const [fireConfetti, setFireConfetti] = useState(false);

  // used to shake the screen if they skipped something
  const shake = useRef(new Animated.Value(0)).current;

  // pull question list
  const questions: Question[] = useMemo(() => QUESTIONS, []);

  // progress bar
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct =
    total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  // after submit, how many correct
  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    let ok = 0;
    for (const q of questions) {
      const picked = answers[q.id];
      const pickedChoice = q.choices.find((c) => c.id === picked);
      if (pickedChoice?.isCorrect) ok++;
    }
    return ok;
  }, [answers, questions, submitted]);

  // score %
  const scorePct =
    total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const passed = submitted && scorePct >= 75;

  // user taps on answer
  function selectChoice(qid: string, cid: string) {
    if (submitted) return; // lock after submit
    setAnswers((prev) => ({ ...prev, [qid]: cid }));
  }

  async function submit() {
    // check if any question not answered
    const anyBlank = questions.some((q) => !answers[q.id]);
    if (anyBlank) {
      // shake side to side if missing answers
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

    // lock it in
    setSubmitted(true);

    // save result to local storage "profile"
    try {
      await updateCurrentUser({
        hasCompletedAssessment: scorePct >= 75,
        lastAssessmentScore: scorePct,
        lastAssessmentAt: new Date().toISOString(),
      });
    } catch {
        // ignore storage errors in demo mode
    }

    // if they passed, shoot confetti
    if (scorePct >= 75) {
      setFireConfetti(true);
      setTimeout(() => setFireConfetti(false), 2500);
    }
  }

  function retake() {
    setSubmitted(false);
    setFireConfetti(false);
    setAnswers({});
  }

  // animation value -> pixels left/right
  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  // UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          {/* Title */}
          <Text style={styles.title}>Transition Readiness Check</Text>

          {/* Progress */}
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

          {/* Questions */}
          {questions.map((q, idx) => (
            <View key={q.id} style={styles.qCard}>
              <Text style={styles.qIndex}>
                Q{idx + 1} · {q.topic}
              </Text>
              <Text style={styles.qText}>{q.text}</Text>

              {q.choices.map((c) => {
                const chosen = answers[q.id] === c.id;
                const showResult = submitted;
                const isRight = showResult && c.isCorrect;
                const isWrongChosen = showResult && chosen && !c.isCorrect;

                return (
                  <Pressable
                    key={c.id}
                    onPress={() => selectChoice(q.id, c.id)}
                    style={[
                      styles.choice,
                      // before submit, highlight the selected one
                      chosen &&
                        !showResult && {
                          borderColor: "#2563EB",
                          backgroundColor: "#EFF6FF",
                        },
                      // after submit, show green if correct
                      isRight && {
                        borderColor: "#16A34A",
                        backgroundColor: "#F0FDF4",
                      },
                      // after submit, show red if they chose wrong
                      isWrongChosen && {
                        borderColor: "#DC2626",
                        backgroundColor: "#FEF2F2",
                      },
                    ]}
                  >
                    {/* left side: radio + answer text */}
                    <View style={styles.choiceLeft}>
                      <View
                        style={[
                          styles.radio,
                          chosen && { borderColor: "#2563EB" },
                          (isRight || isWrongChosen) && {
                            borderColor: isRight ? "#16A34A" : "#DC2626",
                          },
                        ]}
                      >
                        {chosen && (
                          <View
                            style={[
                              styles.dot,
                              isRight && { backgroundColor: "#16A34A" },
                            ]}
                          />
                        )}
                      </View>

                      <Text style={styles.choiceText}>{c.text}</Text>
                    </View>

                    {/* right side: only show ✅ / ❌ after submit */}
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

          {/* Bottom area */}
          {!submitted ? (
            <Pressable style={styles.primaryBtn} onPress={submit}>
              <Text style={styles.primaryBtnText}>Submit answers</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 10 }}>
              {/* Score summary */}
              <View style={styles.scoreStrip}>
                <Text style={styles.scoreText}>Score: {scorePct}%</Text>
                <Text
                  style={[
                    styles.scoreText,
                    { color: passed ? "#16A34A" : "#DC2626" },
                  ]}
                >
                  {passed ? "Passed 🎉" : "Try again"}
                </Text>
              </View>

              {/* Next action */}
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
                <Pressable style={styles.primaryBtn} onPress={retake}>
                  <Text style={styles.primaryBtnText}>
                    Retake assessment
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Confetti on pass */}
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

// STYLES ----------------------------------------------------------------
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
