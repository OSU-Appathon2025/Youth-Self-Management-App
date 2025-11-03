import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ONBOARDING_QUESTIONS, TopicId } from '../data/curriculum';
import { setTopicsNeedingWork, awardPoints } from '../storage/progressStore';

type RootStackParamList = {
  Plan: undefined;
};

interface OnboardingQuizProps {
  userAnswers: number[];
}

const OnboardingQuiz = ({ userAnswers }: OnboardingQuizProps) => {
  // build topicScores map {topicId: avgScore}
  const ALL_TOPICS: TopicId[] = [
    'insurance',
    'appointments',
    'meds',
    'records',
    'rights',
    'payments',
  ];

  const tempScores: Partial<Record<TopicId, number[]>> = {};

  // map a chosen choice id to a numeric score for onboarding
  function scoreForChoiceId(choiceId: string): number {
    switch (choiceId) {
      case 'yes':
      case 'all':
        return 100;
      case 'kinda':
      case 'with_help':
      case 'some':
      case 'nervous':
        return 60;
      case 'no':
      case 'none':
      default:
        return 0;
    }
  }

  ONBOARDING_QUESTIONS.forEach((qq, idx) => {
    const pickedIndex = userAnswers[idx];
    if (pickedIndex == null) return; // skip if no answer
    const choice = qq.choices[pickedIndex];
    if (!choice) return;
  if (!tempScores[qq.topic]) tempScores[qq.topic] = [];
  const arr = tempScores[qq.topic]!;
  arr.push(scoreForChoiceId(choice.id));
  });

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const topicScores: Record<TopicId, number> = Object.fromEntries(
    ALL_TOPICS.map((t) => [t, 0])
  ) as Record<TopicId, number>;

  (Object.keys(tempScores) as TopicId[]).forEach((topic) => {
    const avg =
      (tempScores[topic] || []).reduce((sum: any, n: any) => sum + n, 0) /
      ((tempScores[topic] || []).length || 1);
    topicScores[topic as TopicId] = Math.round(avg);
  });
  const topicsNeedingWork = (
    Object.keys(topicScores) as TopicId[]
  ).filter((t) => topicScores[t] < 80);

  const handleQuizCompletion = async () => {
    // save quiz result
    await setTopicsNeedingWork(topicsNeedingWork, topicScores);

    // starter points
    await awardPoints(50);

    // go to Plan
    navigation.navigate("Plan");
  };

  // auto-complete on mount after computing scores
  useEffect(() => {
    handleQuizCompletion().catch((e) => console.warn('OnboardingQuiz completion failed', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default OnboardingQuiz;

