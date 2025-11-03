// frontend/src/data/curriculum.ts
export type TopicId =
  | "insurance"
  | "meds"
  | "appointments"
  | "records"
  | "rights"
  | "payments";

export type Choice = { id: string; label: string; correct?: boolean; weight?: number };

export type Question = {
  id: string;
  topic: TopicId;
  prompt: string;
  choices: Choice[];
};

export type Module = {
  id: string;             // same as topic for simplicity
  title: string;
  description: string;
  lessons: { id: string; title: string }[];
};

export const TOPIC_TITLES: Record<TopicId, string> = {
  insurance: "Insurance Basics",
  meds: "Medications & Refills",
  appointments: "Appointments & Prep",
  records: "My Health Records",
  rights: "My Rights & Privacy",
  payments: "Bills & Payments",
};

// 20 questions across topics (sample; add more later)
export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "insurance",
    prompt: "What is a 'copay'?",
    choices: [
      { id: "a", label: "Money you pay each visit", correct: true },
      { id: "b", label: "Your monthly premium" },
      { id: "c", label: "A type of doctor" },
      { id: "d", label: "A snack" },
    ],
  },
  {
    id: "q2",
    topic: "insurance",
    prompt: "Where on the card is your Member ID usually found?",
    choices: [
      { id: "a", label: "Front of card, labeled 'Member ID'", correct: true },
      { id: "b", label: "Back, near the barcode" },
      { id: "c", label: "It’s your birthday" },
      { id: "d", label: "There is no Member ID" },
    ],
  },
  {
    id: "q3",
    topic: "meds",
    prompt: "If you miss a dose, what should you do first?",
    choices: [
      { id: "a", label: "Double the next dose" },
      { id: "b", label: "Ask pharmacist/doctor instructions", correct: true },
      { id: "c", label: "Stop the med completely" },
      { id: "d", label: "Panic" },
    ],
  },
  {
    id: "q4",
    topic: "meds",
    prompt: "Who can help set up automatic refills?",
    choices: [
      { id: "a", label: "Your pharmacist", correct: true },
      { id: "b", label: "Your gym coach" },
      { id: "c", label: "School principal" },
      { id: "d", label: "No one" },
    ],
  },
  {
    id: "q5",
    topic: "appointments",
    prompt: "Before an appointment, what’s most helpful?",
    choices: [
      { id: "a", label: "Bring questions & ID/insurance card", correct: true },
      { id: "b", label: "Skip eating for 3 days" },
      { id: "c", label: "Only bring a friend" },
      { id: "d", label: "Arrive exactly at time" },
    ],
  },
  {
    id: "q6",
    topic: "appointments",
    prompt: "Where can you see upcoming visits?",
    choices: [
      { id: "a", label: "The portal / your calendar", correct: true },
      { id: "b", label: "On TV" },
      { id: "c", label: "At the grocery store" },
      { id: "d", label: "Nowhere" },
    ],
  },
  {
    id: "q7",
    topic: "records",
    prompt: "What is an immunization record?",
    choices: [
      { id: "a", label: "List of allergies" },
      { id: "b", label: "Shots you received", correct: true },
      { id: "c", label: "Doctor’s lunch menu" },
      { id: "d", label: "Payment history" },
    ],
  },
  {
    id: "q8",
    topic: "records",
    prompt: "Where do you usually download visit summaries?",
    choices: [
      { id: "a", label: "Patient portal documents", correct: true },
      { id: "b", label: "From the parking lot" },
      { id: "c", label: "From the TV remote" },
      { id: "d", label: "You can’t" },
    ],
  },
  {
    id: "q9",
    topic: "rights",
    prompt: "HIPAA helps protect…",
    choices: [
      { id: "a", label: "Your health privacy", correct: true },
      { id: "b", label: "Doctor schedules" },
      { id: "c", label: "Sports scores" },
      { id: "d", label: "Snacks" },
    ],
  },
  {
    id: "q10",
    topic: "rights",
    prompt: "If you’re 18+, you can…",
    choices: [
      { id: "a", label: "Manage your own care & records", correct: true },
      { id: "b", label: "Ban doctors forever" },
      { id: "c", label: "Edit your height" },
      { id: "d", label: "Sell the clinic" },
    ],
  },
  { id: "q11", topic: "payments", prompt: "A bill shows…", choices: [
      { id: "a", label: "Services & amounts you owe", correct: true },
      { id: "b", label: "Doctor’s favorite color" },
      { id: "c", label: "Friend list" },
      { id: "d", label: "Memes" },
    ]},
  { id: "q12", topic: "payments", prompt: "Who do you call for a billing question?", choices: [
      { id: "a", label: "Billing office/number on bill", correct: true },
      { id: "b", label: "911" },
      { id: "c", label: "Pizza place" },
      { id: "d", label: "No one" },
    ]},
  { id: "q13", topic: "insurance", prompt: "Deductible means…", choices: [
      { id: "a", label: "Amount you pay before insurance helps", correct: true },
      { id: "b", label: "Your monthly fee" },
      { id: "c", label: "The doctor’s tip" },
      { id: "d", label: "Parking fee" },
    ]},
  { id: "q14", topic: "meds", prompt: "Medication label shows…", choices: [
      { id: "a", label: "Dose & directions", correct: true },
      { id: "b", label: "Video game score" },
      { id: "c", label: "Random emojis" },
      { id: "d", label: "Nothing important" },
    ]},
  { id: "q15", topic: "appointments", prompt: "If you’re late or can’t go…", choices: [
      { id: "a", label: "Call to reschedule", correct: true },
      { id: "b", label: "Ignore it" },
      { id: "c", label: "Send a meme" },
      { id: "d", label: "Go next year" },
    ]},
  { id: "q16", topic: "records", prompt: "To share records you can…", choices: [
      { id: "a", label: "Request a release or share via portal", correct: true },
      { id: "b", label: "Yell them out" },
      { id: "c", label: "Mail a mystery box" },
      { id: "d", label: "Not possible" },
    ]},
  { id: "q17", topic: "rights", prompt: "You can invite a caregiver by…", choices: [
      { id: "a", label: "Adding proxy access in portal", correct: true },
      { id: "b", label: "Giving them your password" },
      { id: "c", label: "Nothing works" },
      { id: "d", label: "A secret handshake" },
    ]},
  { id: "q18", topic: "payments", prompt: "Payment plan is…", choices: [
      { id: "a", label: "Paying a bill over time", correct: true },
      { id: "b", label: "A party plan" },
      { id: "c", label: "A diet" },
      { id: "d", label: "A meme" },
    ]},
  { id: "q19", topic: "insurance", prompt: "Prior authorization is…", choices: [
      { id: "a", label: "Insurance approval before service", correct: true },
      { id: "b", label: "Your dad’s signature" },
      { id: "c", label: "Snack approval" },
      { id: "d", label: "Spam" },
    ]},
  { id: "q20", topic: "meds", prompt: "Keep meds safe by…", choices: [
      { id: "a", label: "Storing as labeled; don’t share", correct: true },
      { id: "b", label: "Sharing with friends" },
      { id: "c", label: "Leaving in the car heat" },
      { id: "d", label: "Guessing doses" },
    ]},
];

export const MODULES: Module[] = [
  {
    id: "insurance",
    title: TOPIC_TITLES.insurance,
    description: "Know your card, copays, deductibles & how to get help.",
    lessons: [
      { id: "i1", title: "Your Insurance Card" },
      { id: "i2", title: "Copays & Deductible" },
      { id: "i3", title: "Finding Help" },
    ],
  },
  {
    id: "meds",
    title: TOPIC_TITLES.meds,
    description: "Take meds safely, manage refills, ask questions.",
    lessons: [
      { id: "m1", title: "Reading a Label" },
      { id: "m2", title: "Missed Doses" },
      { id: "m3", title: "Auto Refills" },
    ],
  },
  {
    id: "appointments",
    title: TOPIC_TITLES.appointments,
    description: "Prep, questions, rescheduling, portals & calendars.",
    lessons: [
      { id: "a1", title: "Before Your Visit" },
      { id: "a2", title: "Questions to Ask" },
      { id: "a3", title: "Rescheduling" },
    ],
  },
  {
    id: "records",
    title: TOPIC_TITLES.records,
    description: "Immunizations, visit summaries, sharing with others.",
    lessons: [
      { id: "r1", title: "What’s in My Record" },
      { id: "r2", title: "Download a Summary" },
      { id: "r3", title: "Sharing Safely" },
    ],
  },
  {
    id: "rights",
    title: TOPIC_TITLES.rights,
    description: "Privacy (HIPAA), consent, and caregiver proxy access.",
    lessons: [
      { id: "x1", title: "Privacy & HIPAA" },
      { id: "x2", title: "Turning 18" },
      { id: "x3", title: "Proxy Access" },
    ],
  },
  {
    id: "payments",
    title: TOPIC_TITLES.payments,
    description: "Bills, payment plans, who to call for help.",
    lessons: [
      { id: "p1", title: "Understanding a Bill" },
      { id: "p2", title: "Payment Plans" },
      { id: "p3", title: "Contact Billing" },
    ],
  },
];
