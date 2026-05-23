/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UrinationLog {
  id: string;
  datetime: string; // ISO string or local date-time string
  frequencySelect: number; // Daily frequency count choice (1-20+)
  durationSeconds: number; // مدة التبول بالثواني (مقياس كمية البول الجديد)
  colorScale: number; // 1 to 8
  colorName: "شفاف" | "أصفر فاتح" | "أصفر داكن" | "كهرماني" | "بني" | "أحمر / وردي" | "غائم";
  urgency: "نعم" | "لا" | "أحيانًا";
  symptoms: string[]; // e.g., ["حرقان", "ألم", "ضغط أسفل البطن", "صعوبة في البدء"]
  otherSymptomsText?: string;
  fluidType: "ماء" | "قهوة" | "شاي" | "عصير" | "مشروب غازي" | "كحول" | "لا توجد سوائل";
  fluidAmount: number; // in ml
  notes?: string;
}

export interface UserSettings {
  dailyReminder: boolean;
  reminderTime: string; // "HH:MM"
}

export interface WaterLog {
  id: string;
  datetime: string;
  amount: number; // in ml
  benefitKey: "morning" | "pre_meal" | "post_meal" | "exercise" | "before_sleep" | "general";
  notes?: string;
}

export interface MedicalProfile {
  age: number;
  gender: "male" | "female" | "other" | "";
  weight: number; // in kg - useful for ideal water calculation
  chronicConditions: string[]; // e.g., ["diabetes", "kidney_stones", "hypertension", "prostate", "uti"]
  customConditions: string; // other conditions
  pregnancyStatus: "none" | "pregnant" | "lactating"; // for females
  medications: string; // e.g., diuretic drugs
}

