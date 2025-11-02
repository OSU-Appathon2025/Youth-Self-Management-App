// frontend/src/data/curriculum.ts

// --- Topic IDs -------------------------------------------------
export type TopicId =
  | "insurance"
  | "appointments"
  | "meds"
  | "selfAdvocacy";

// Friendly names for cards / headers / etc.
export const TOPIC_TITLES: Record<TopicId, string> = {
  insurance: "Insurance & Coverage",
  appointments: "Appointments & Scheduling",
  meds: "Medications & Refills",
  selfAdvocacy: "Speaking Up / Self-Advocacy",
};

// --- Lesson modules -------------------------------------------
// Each lesson is a thing the kid can tap, read, and mark done.
export interface Lesson {
  id: string;
  title: string;
  body: string;
}

export interface ModuleDef {
  id: TopicId;
  title: string;
  lessons: Lesson[];
}

export const MODULES: ModuleDef[] = [
  {
    id: "insurance",
    title: TOPIC_TITLES.insurance,
    lessons: [
      {
        id: "ins_card",
        title: "Do you have your insurance card?",
        body:
          "Why you need an insurance card, what info is on it, and when you show it.",
      },
      {
        id: "copay_basics",
        title: "What is a copay?",
        body:
          "Copay = the small amount you pay at the visit. We'll explain how to ask what it is.",
      },
    ],
  },
  {
    id: "appointments",
    title: TOPIC_TITLES.appointments,
    lessons: [
      {
        id: "call_clinic",
        title: "How to call the clinic",
        body:
          "Step-by-step for calling or messaging to schedule an appointment.",
      },
      {
        id: "prep_visit",
        title: "How to get ready for your visit",
        body:
          "Bring your questions, meds list, insurance card, ID, anything you’re worried about.",
      },
    ],
  },
  {
    id: "meds",
    title: TOPIC_TITLES.meds,
    lessons: [
      {
        id: "know_meds",
        title: "What meds do you take?",
        body:
          "Why it's important to know your meds, doses, and when you take them.",
      },
      {
        id: "refills",
        title: "How to ask for refills",
        body:
          "Who to call / message when you're almost out and what to tell them.",
      },
    ],
  },
  {
    id: "selfAdvocacy",
    title: TOPIC_TITLES.selfAdvocacy,
    lessons: [
      {
        id: "ask_questions",
        title: "How to ask questions",
        body:
          "It's your body. You’re allowed to ask 'what does that mean' or 'can you say it simpler'.",
      },
      {
        id: "privacy",
        title: "Asking for private time",
        body:
          "You can ask the adult to step out so you can talk to the doctor alone.",
      },
    ],
  },
];

// --- Question types -------------------------------------------

export type Choice = {
  id: string;
  text: string;
  correct?: boolean; // only used in scored quizzes
};

export type Question = {
  id: string;
  topic: TopicId;
  text: string;
  choices: Choice[];
};

// This is the FIRST quiz (the “starting assessment” / onboarding).
// We don't hard-grade this, we use it to figure out which topics they need.
export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "insurance",
    text: "Do you know how to use your insurance card at an appointment?",
    choices: [
      { id: "yes", text: "Yes, I know what to do" },
      { id: "kinda", text: "Sort of / not sure" },
      { id: "no", text: "No, I have no idea" },
    ],
  },
  {
    id: "q2",
    topic: "appointments",
    text: "Can you make or reschedule your own doctor visit?",
    choices: [
      { id: "yes", text: "Yes, I can do it myself" },
      { id: "with_help", text: "I can if someone helps me" },
      { id: "no", text: "No, someone else does it" },
    ],
  },
  {
    id: "q3",
    topic: "meds",
    text: "Do you know the names of any meds you take and when to take them?",
    choices: [
      { id: "all", text: "Yes, all of them" },
      { id: "some", text: "I know some / kinda" },
      { id: "none", text: "No, not really" },
    ],
  },
  {
    id: "q4",
    topic: "selfAdvocacy",
    text: "Can you ask the doctor questions or ask for privacy if you need it?",
    choices: [
      { id: "yes", text: "Yes I'm comfortable" },
      { id: "nervous", text: "I'm nervous / not sure" },
      { id: "no", text: "No, I wouldn't do that" },
    ],
  },
];

// This is the FINAL quiz. We DO grade this (needs >=80% or 75% etc).
export const FINAL_QUESTIONS: Question[] = [
  {
    id: "f1",
    topic: "insurance",
    text: "When do you show your insurance card?",
    choices: [
      { id: "c1", text: "At the start of an appointment", correct: true },
      { id: "c2", text: "Only if I feel sick", correct: false },
      { id: "c3", text: "Never", correct: false },
    ],
  },
  {
    id: "f2",
    topic: "appointments",
    text: "What should you do if you need to reschedule?",
    choices: [
      { id: "c1", text: "Call or message the clinic", correct: true },
      { id: "c2", text: "Just not show up", correct: false },
      { id: "c3", text: "Wait and hope they call me", correct: false },
    ],
  },
  {
    id: "f3",
    topic: "meds",
    text: "You're almost out of a prescription. What do you do?",
    choices: [
      { id: "c1", text: "Nothing, it's fine", correct: false },
      {
        id: "c2",
        text: "Ask for a refill (call / portal / pharmacy request)",
        correct: true,
      },
      { id: "c3", text: "Start taking half doses", correct: false },
    ],
  },
  {
    id: "f4",
    topic: "selfAdvocacy",
    text: "If you don't understand something in your visit, what can you do?",
    choices: [
      { id: "c1", text: "Ask them to explain it in normal words", correct: true },
      { id: "c2", text: "Stay quiet", correct: false },
      { id: "c3", text: "Google it later and guess", correct: false },
    ],
  },
];
