// frontend/src/screens/TopicDetails.tsx
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { TopicId } from "../data/curriculum";
import { markLessonDone, awardPoints } from "../storage/progressStore";
import { Video, ResizeMode } from "expo-av";

// ---- Types ----
type Choice = { id: string; text: string; correct: boolean };
type Question = { id: string; text: string; choices: Choice[] };

type TopicParams = {
  topicId?: string;          // REQUIRED to update plan
  title?: string;
  subtitle?: string;
  passPct?: number;          // default 80
  questions?: Question[];    // 3–4+ questions; if missing we use defaults
  videoSource?: any;         // ✅ Optional video source
};

const DEFAULT_PASS_PCT = 80;

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "Why do you get a medical bill?",
    choices: [
      { id: "q1a", text: "Random number for fun.", correct: false },
      {
        id: "q1b",
        text: "It shows what was done, what insurance paid, and what you owe.",
        correct: true,
      },
      { id: "q1c", text: "Only for taxes.", correct: false },
    ],
  },
  {
    id: "q2",
    text: "If a charge is confusing, what can you do?",
    choices: [
      { id: "q2a", text: "Nothing.", correct: false },
      {
        id: "q2b",
        text: "Call billing and ask them to explain line by line.",
        correct: true,
      },
      { id: "q2c", text: "Pay immediately without checking.", correct: false },
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
      { id: "q3b", text: "A way to ignore the bill forever.", correct: false },
      { id: "q3c", text: "Insurance pays 100% of the cost.", correct: false },
    ],
  },
  {
    id: "q4",
    text: "What do prescription labels tell you?",
    choices: [
      {
        id: "q4a",
        text: "Med name, dose, and how often to take it.",
        correct: true,
      },
      { id: "q4b", text: "Pharmacist's favorite snack.", correct: false },
      { id: "q4c", text: "Only the pharmacy address.", correct: false },
    ],
  },
];

export default function TopicDetails({ navigation, route }: any) {
  // ----- Params / data -----
  const params: TopicParams = route?.params || {};
  const topicId = (params.topicId ?? "billing") as TopicId;
  const title = params.title ?? "I understand bills and payment options.";
  const subtitle =
    params.subtitle ??
    "Read a bill without panicking. Know what's covered and what's your part.";
  const passPct = params.passPct ?? DEFAULT_PASS_PCT;
  const videoSource = params.videoSource; // ✅ Get video source from params

  // Use provided questions if valid, else defaults (need at least 3)
  const questions: Question[] = useMemo(
    () =>
      Array.isArray(params.questions) && params.questions.length >= 3
        ? params.questions
        : DEFAULT_QUESTIONS,
    [params.questions]
  );

  // ----- Quiz state -----
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePct, setScorePct] = useState<number | null>(null);
  const passed = scorePct !== null ? scorePct >= passPct : false;

  function choose(qid: string, choiceId: string) {
    if (submitted) return; // lock answers after submit
    setAnswers((a) => ({ ...a, [qid]: choiceId }));
  }

  function submitQuiz() {
    if (submitted) return;

    // require all answered (optional but nicer UX)
    const allAnswered = questions.every((q) => !!answers[q.id]);
    if (!allAnswered) {
      Alert.alert("Almost there", "Answer every question before submitting.");
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      const chosenId = answers[q.id];
      const chosen = q.choices.find((c) => c.id === chosenId);
      if (chosen?.correct) correct += 1;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScorePct(pct);
    setSubmitted(true);

    if (pct < passPct) {
      Alert.alert(
        "Keep going",
        `You scored ${pct}%. You need at least ${passPct}% to pass this topic.`
      );
    }
  }

  function markDone() {
    if (!submitted || !passed) return;
    try {
      markLessonDone(topicId);
      awardPoints(50);
    } catch {}
    Alert.alert("Nice!", `You passed with ${scorePct}% and earned XP.`);
    navigation?.goBack?.();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </Pressable>
      </View>

      {/* Header */}
      <Text style={styles.topicHeader}>{title}</Text>
      <Text style={styles.topicSub}>{subtitle}</Text>

      {/* STEP 1: Video (only if videoSource is provided) */}
      {videoSource && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Watch this</Text>
          <Video
            source={videoSource}
            style={styles.videoPlaceholder}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
          <Text style={styles.cardHint}>
            Quick explainer to help you understand this topic better.
          </Text>
        </View>
      )}

      {/* STEP 2: Key Points */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {videoSource ? "Step 2: Key things to know" : "Step 1: Key things to know"}
        </Text>
        <Text style={styles.cardIntro}>
          A bill should explain money, not hide it. You'll usually see:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletText}>• What happened (visit, test, x-ray)</Text>
          <Text style={styles.bulletText}>• How much the clinic/hospital charged</Text>
          <Text style={styles.bulletText}>• What insurance already paid</Text>
          <Text style={styles.bulletText}>• What you still owe (your part)</Text>
          <Text style={styles.bulletText}>
            • A billing phone number — call and ask them to explain a line item
          </Text>
          <Text style={styles.bulletText}>• Payment plan options if needed</Text>
        </View>
      </View>

      {/* STEP 3: Quiz */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {videoSource ? "Step 3: Quick check" : "Step 2: Quick check"}
        </Text>
        <Text style={styles.quizNote}>Pass with at least {passPct}%.</Text>

        {questions.map((q, qi) => {
          const submittedNow = submitted;
          return (
            <View key={q.id} style={styles.qBlock}>
              <Text style={styles.qIndex}>Q{qi + 1}</Text>
              <Text style={styles.qText}>{q.text}</Text>

              {q.choices.map((c) => {
                const chosen = answers[q.id] === c.id;
                const isCorrect = submittedNow && c.correct;
                const isWrongChosen = submittedNow && chosen && !c.correct;

                return (
                  <Pressable
                    key={c.id}
                    onPress={() => choose(q.id, c.id)}
                    style={[
                      styles.choice,
                      chosen &&
                        !submittedNow && {
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
                        isCorrect && { color: "#065F46", fontWeight: "700" },
                        isWrongChosen && { color: "#DC2626", fontWeight: "700" },
                      ]}
                    >
                      {c.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {!submitted ? (
          <Pressable style={styles.primaryBtn} onPress={submitQuiz}>
            <Text style={styles.primaryBtnText}>Submit answers</Text>
          </Pressable>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={styles.resultStrip}>
              <Text style={styles.resultText}>
                {scorePct !== null ? `Score: ${scorePct}%` : ""}
              </Text>
            </View>
            {!passed && (
              <Text style={styles.retryHint}>
                You need at least {passPct}%. Change your answers and submit again.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* STEP 4: Mark Done only if passed */}
      {submitted && passed && (
        <Pressable style={styles.doneBtn} onPress={markDone}>
          <Text style={styles.doneBtnText}>Mark done / Claim XP</Text>
        </Pressable>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16, rowGap: 16 },

  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
  },
  backBtnText: { fontWeight: "700", color: "#111827" },

  topicHeader: { fontSize: 22, fontWeight: "700", color: "#111827", marginTop: 8 },
  topicSub: { fontSize: 14, color: "#6b7280", lineHeight: 20, marginBottom: 8 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 8 },
  cardHint: { fontSize: 12, color: "#6b7280", marginTop: 8, lineHeight: 18 },
  cardIntro: { fontSize: 14, color: "#4b5563", marginBottom: 12, lineHeight: 20 },

  bulletList: { rowGap: 8 },
  bulletText: { fontSize: 14, color: "#374151", lineHeight: 20 },

  videoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "black",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  quizNote: { color: "#6b7280", marginBottom: 8 },
  qBlock: { marginBottom: 12 },
  qIndex: { fontWeight: "800", color: "#334155", marginBottom: 4 },
  qText: { color: "#111827", fontWeight: "600", marginBottom: 6 },

  choice: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "white",
  },
  choiceText: { fontSize: 14, color: "#0F172A", lineHeight: 20 },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 },

  resultStrip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  resultText: { color: "#1F2937", fontWeight: "700", fontSize: 16 },
  retryHint: { color: "#991b1b", fontWeight: "600" },

  doneBtn: {
    backgroundColor: "#10B981",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  doneBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});