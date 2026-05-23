import { UrinationLog } from "./types";

// Generate highly realistic mock logs for the past 3 days
export const initialLogs: UrinationLog[] = [
  {
    id: "mock-1",
    datetime: "2026-05-20T08:30:00",
    frequencySelect: 6,
    durationSeconds: 18,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 300,
    notes: "شربت كوبين ماء بعد الاستيقاظ مباشرة."
  },
  {
    id: "mock-2",
    datetime: "2026-05-20T11:15:00",
    frequencySelect: 6,
    durationSeconds: 26,
    colorScale: 1,
    colorName: "شفاف",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 500,
    notes: "شربت زجاجة مياه كاملة قبل ساعة."
  },
  {
    id: "mock-3",
    datetime: "2026-05-20T14:45:00",
    frequencySelect: 6,
    durationSeconds: 8,
    colorScale: 3,
    colorName: "أصفر داكن",
    urgency: "نعم",
    symptoms: ["ضغط أسفل البطن"],
    fluidType: "قهوة",
    fluidAmount: 200,
    notes: "شربت كوب إسبريسو مزدوج بعد الغداء مباشرة."
  },
  {
    id: "mock-4",
    datetime: "2026-05-20T18:00:00",
    frequencySelect: 6,
    durationSeconds: 17,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "أحيانًا",
    symptoms: [],
    fluidType: "عصير",
    fluidAmount: 250,
    notes: "شربت عصير برتقال طبيعي."
  },
  {
    id: "mock-5",
    datetime: "2026-05-20T21:30:00",
    frequencySelect: 6,
    durationSeconds: 29,
    colorScale: 1,
    colorName: "شفاف",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 400,
    notes: "شربت مياه قبل النوم لتفادي العطش."
  },
  {
    id: "mock-6",
    datetime: "2026-05-20T23:55:00",
    frequencySelect: 6,
    durationSeconds: 7,
    colorScale: 4,
    colorName: "كهرماني",
    urgency: "نعم",
    symptoms: ["صعوبة في البدء"],
    fluidType: "قهوة",
    fluidAmount: 150,
    notes: "استيقظت من النوم ملهوفًا واستغرقت دقيقة للبدء."
  },
  {
    // Day 2
    id: "mock-7",
    datetime: "2026-05-21T07:20:00",
    frequencySelect: 8,
    durationSeconds: 19,
    colorScale: 3,
    colorName: "أصفر داكن",
    urgency: "لا",
    symptoms: [],
    fluidType: "شاي",
    fluidAmount: 250,
    notes: "كوب شاي أحمر مع حليب في الصباح."
  },
  {
    id: "mock-8",
    datetime: "2026-05-21T10:00:00",
    frequencySelect: 8,
    durationSeconds: 4,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "نعم",
    symptoms: ["حرقان", "ضغط أسفل البطن"],
    fluidType: "قهوة",
    fluidAmount: 200,
    notes: "تبول مؤلم وقليل جداً بعد القهوة الثانية."
  },
  {
    id: "mock-9",
    datetime: "2026-05-21T13:10:00",
    frequencySelect: 8,
    durationSeconds: 21,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 300,
    notes: "حاولت شرب مياه لتقليل الحرقان."
  },
  {
    id: "mock-10",
    datetime: "2026-05-21T15:40:00",
    frequencySelect: 8,
    durationSeconds: 9,
    colorScale: 3,
    colorName: "أصفر داكن",
    urgency: "أحيانًا",
    symptoms: [],
    fluidType: "مشروب غازي",
    fluidAmount: 330,
    notes: "علبة بيبسي مثلجة."
  },
  {
    id: "mock-11",
    datetime: "2026-05-21T19:00:00",
    frequencySelect: 8,
    durationSeconds: 18,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 300,
    notes: "ترطيب معتدل في المساء."
  },
  {
    id: "mock-12",
    datetime: "2026-05-21T21:40:00",
    frequencySelect: 8,
    durationSeconds: 28,
    colorScale: 2,
    colorName: "أصفر فاتح",
    urgency: "لا",
    symptoms: [],
    fluidType: "ماء",
    fluidAmount: 500,
    notes: "شربت كمية ماء جيدة."
  },
  {
    id: "mock-13",
    datetime: "2026-05-21T23:50:00",
    frequencySelect: 8,
    durationSeconds: 8,
    colorScale: 5,
    colorName: "بني",
    urgency: "نعم",
    symptoms: ["ضغط أسفل البطن"],
    fluidType: "لا توجد سوائل",
    fluidAmount: 0,
    notes: "استيقاظ أول ليلا، اللون داكن جداً ومائل للبني."
  },
  {
    id: "mock-14",
    datetime: "2026-05-22T02:30:00",
    frequencySelect: 8,
    durationSeconds: 3,
    colorScale: 6,
    colorName: "أحمر / وردي",
    urgency: "نعم",
    symptoms: ["ألم"],
    fluidType: "لا توجد سوائل",
    fluidAmount: 0,
    notes: "استيقاظ ثانٍ في نفس الليلة مع ألم ملحوظ ولون وردي مقلق!"
  }
];

export const initialWaterLogs: any[] = [
  // Day 1: 2026-05-20
  {
    id: "water-1",
    datetime: "2026-05-20T07:15:00",
    amount: 500,
    benefitKey: "morning",
    notes: "ترطيب الصباح الممتاز بمياه دافئة."
  },
  {
    id: "water-2",
    datetime: "2026-05-20T12:00:00",
    amount: 300,
    benefitKey: "pre_meal",
    notes: "قبل الغداء بنصف ساعة."
  },
  {
    id: "water-3",
    datetime: "2026-05-20T15:30:00",
    amount: 500,
    benefitKey: "exercise",
    notes: "أثناء جلسة المشي السريع."
  },
  {
    id: "water-4",
    datetime: "2026-05-20T19:30:00",
    amount: 300,
    benefitKey: "post_meal",
    notes: "بعد العشاء بساعة."
  },
  {
    id: "water-5",
    datetime: "2026-05-20T21:00:00",
    amount: 250,
    benefitKey: "before_sleep",
    notes: "كوب أخير قبل النوم بـ ساعتين لتفادي الجفاف."
  },
  // Day 2: 2026-05-21
  {
    id: "water-6",
    datetime: "2026-05-21T06:55:00",
    amount: 500,
    benefitKey: "morning",
    notes: "تنشيط فوري بعد النوم."
  },
  {
    id: "water-7",
    datetime: "2026-05-21T12:30:00",
    amount: 350,
    benefitKey: "pre_meal",
    notes: "كوبين ماء لتقليل حجم الوجبة."
  },
  {
    id: "water-8",
    datetime: "2026-05-21T16:00:00",
    amount: 250,
    benefitKey: "general",
    notes: ""
  },
  {
    id: "water-9",
    datetime: "2026-05-21T18:30:00",
    amount: 300,
    benefitKey: "post_meal",
    notes: ""
  },
  {
    id: "water-10",
    datetime: "2026-05-21T21:30:00",
    amount: 600,
    benefitKey: "before_sleep",
    notes: "شربت زجاجة كاملة دفعة واحدة قبل النوم بساعة! (سبب استيقاظي الليلي المتكرر)."
  },
  // Day 3: 2026-05-22 (Today)
  {
    id: "water-11",
    datetime: "2026-05-22T08:00:00",
    amount: 400,
    benefitKey: "morning",
    notes: "ترطيب الصباح التأسيسي."
  }
];

