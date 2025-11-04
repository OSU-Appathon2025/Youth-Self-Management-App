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
import BackHeader from "../components/BackHeader";
import { setHasCompletedAssessment, awardPoints } from "../storage/progressStore";

// Initial assessment questions
const ASSESSMENT_QUESTIONS = [
  {
    id: "q1",
    text: "Have you ever scheduled your own medical appointment?",
    choices: [
      { id: "q1a", text: "Yes, I do it myself", points: 3 },
      { id: "q1b", text: "Sometimes with help", points: 2 },
      { id: "q1c", text: "No, someone else does it", points: 1 },
    ],
  },
  {
    id: "q2",
    text: "Do you know how to refill your prescriptions?",
    choices: [
      { id: "q2a", text: "Yes, I can do it independently", points: 3 },
      { id: "q2b", text: "I need some help", points: 2 },
      { id: "q2c", text: "I don't know how", points: 1 },
    ],
  },
  {
    id: "q3",
    text: "Can you explain what your insurance covers?",
    choices: [
      { id: "q3a", text: "Yes, I understand my coverage", points: 3 },
      { id: "q3b", text: "I know a little", points: 2 },
      { id: "q3c", text: "I don't understand it", points: 1 },
    ],
  },
  {
    id: "q4",
    text: "Do you know what to do if you receive a medical bill?",
    choices: [
      { id: "q4a", text: "Yes, I know how to read and pay it", points: 3 },
      { id: "q4b", text: "I'm not sure", points: 2 },
      { id: "q4c", text: "No, someone else handles it", points: 1 },
    ],
  },
  {
    id: "q5",
    text: "Can you describe your medical conditions to a new doctor?",
    choices: [
      { id: "q5a", text: "Yes, I can explain everything", points: 3 },
      { id: "q5b", text: "I know some but not all", points: 2 },
      { id: "q5c", text: "I don't know my conditions well", points: 1 },
    ],
  },
];

export default function Assess({ navigation }: any) {
  const questions = useMemo(() => ASSESSMENT_QUESTIONS.slice(), []);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionId: string, choiceId: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  async function handleSubmit() {
    if (submitted) return;

    // Check if all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }

    // Calculate total score
    let totalPoints = 0;
    questions.forEach((q) => {
      const chosenId = answers[q.id];
      const choice = q.choices.find((c) => c.id === chosenId);
      if (choice) {
        totalPoints += choice.points;
      }
    });

    const maxPoints = questions.length * 3;
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    setSubmitted(true);

    // Mark assessment as completed
    try {
      await setHasCompletedAssessment(true);
      // Award points for completing assessment
      await awardPoints(50);
    } catch (e) {
      console.error("Error saving assessment:", e);
    }

    // Show results
    Alert.alert(
      "Assessment Complete! 🎉",
      `You scored ${percentage}%\n\nYou earned 50 points! Now let's create your personalized learning plan.`,
      [
        {
          text: "Continue",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <BackHeader title="Self-Check" navigation={navigation} />

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Let's see where you're at! 📋</Text>
          <Text style={styles.introText}>
            Answer these questions honestly. This helps us create a personalized plan just for you.
            There are no wrong answers!
          </Text>
        </View>

        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionNumber}>
                <Text style={styles.questionNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.questionText}>{q.text}</Text>
            </View>

            <View style={styles.choicesContainer}>
              {q.choices.map((choice) => {
                const isSelected = answers[q.id] === choice.id;

                return (
                  <Pressable
                    key={choice.id}
                    onPress={() => selectAnswer(q.id, choice.id)}
                    style={[
                      styles.choiceButton,
                      isSelected && styles.choiceButtonSelected,
                    ]}
                  >
                    <View style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[
                      styles.choiceText,
                      isSelected && styles.choiceTextSelected,
                    ]}>
                      {choice.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {!submitted && (
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Assessment</Text>
          </Pressable>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  introCard: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#93C5FD",
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  questionNumber: {
    backgroundColor: "#EEF2FF",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 22,
  },
  choicesContainer: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
    gap: 12,
  },
  choiceButtonSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#2563EB",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  choiceTextSelected: {
    color: "#1E40AF",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});