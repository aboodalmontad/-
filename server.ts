import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initialLogs, initialWaterLogs } from "./src/data";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json());

// --- Database Configuration & Local persistent Storage ---
// Support Vercel serverless read/write filesystem capability using the writable ephemeral /tmp folder
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "local_database.json")
  : path.join(process.cwd(), "local_database.json");

const defaultMedicalProfile = {
  age: 30,
  gender: "male",
  weight: 75,
  chronicConditions: [],
  customConditions: "",
  pregnancyStatus: "none",
  medications: ""
};

function readDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDb = {
        urinationLogs: initialLogs,
        waterLogs: initialWaterLogs,
        medicalProfile: defaultMedicalProfile
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
      return defaultDb;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    
    // Ensure medicalProfile structure exists
    if (!parsed.medicalProfile) {
      parsed.medicalProfile = defaultMedicalProfile;
    }
    return parsed;
  } catch (error) {
    console.error("Error reading database file: ", error);
    return { urinationLogs: [], waterLogs: [], medicalProfile: defaultMedicalProfile };
  }
}

function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file: ", error);
  }
}

// REST APIs for local database
app.get("/api/database", (req, res) => {
  const db = readDatabase();
  res.json(db);
});

// GET Medical Profile
app.get("/api/medical-profile", (req, res) => {
  const db = readDatabase();
  res.json(db.medicalProfile || defaultMedicalProfile);
});

// POST Medical Profile
app.post("/api/medical-profile", (req, res) => {
  try {
    const db = readDatabase();
    const updatedProfile = req.body;
    if (!updatedProfile) {
      return res.status(400).json({ error: "بيانات الملف الطبي غير صالحة." });
    }
    db.medicalProfile = {
      ...defaultMedicalProfile,
      ...updatedProfile
    };
    writeDatabase(db);
    res.json({ success: true, medicalProfile: db.medicalProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Post Urination Log
app.post("/api/urination-logs", (req, res) => {
  try {
    const db = readDatabase();
    const newLog = req.body;
    if (!newLog || !newLog.id) {
      return res.status(400).json({ error: "بيانات السجل غير صالحة." });
    }
    // Prepend log
    db.urinationLogs = [newLog, ...db.urinationLogs];
    writeDatabase(db);
    res.json({ success: true, log: newLog });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Urination Log
app.delete("/api/urination-logs/:id", (req, res) => {
  try {
    const db = readDatabase();
    const { id } = req.params;
    db.urinationLogs = db.urinationLogs.filter((l: any) => l.id !== id);
    writeDatabase(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Post Water Log
app.post("/api/water-logs", (req, res) => {
  try {
    const db = readDatabase();
    const newWl = req.body;
    if (!newWl || !newWl.id) {
      return res.status(400).json({ error: "بيانات كوب الماء غير صالحة." });
    }
    db.waterLogs = [...db.waterLogs, newWl];
    writeDatabase(db);
    res.json({ success: true, log: newWl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Water Log
app.delete("/api/water-logs/:id", (req, res) => {
  try {
    const db = readDatabase();
    const { id } = req.params;
    db.waterLogs = db.waterLogs.filter((w: any) => w.id !== id);
    writeDatabase(db);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database
app.post("/api/reset-database", (req, res) => {
  try {
    const db = {
      urinationLogs: [],
      waterLogs: [],
      medicalProfile: defaultMedicalProfile
    };
    writeDatabase(db);
    res.json({ success: true, message: "تم تصفير جميع البيانات بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lazy-initialized Gemini Client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("MESSAGING WARNING: GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || ""
    });
  }
  return aiClient;
}

// AI Analysis Endpoint
app.post("/api/analyze-habits", async (req, res) => {
  try {
    const { logs, waterLogs, medicalProfile } = req.body;

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: "لا توجد بيانات كافية لإجراء التحليل." });
    }

    const ai = getAi();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "مفتاح API الخاص بـ Gemini غير مهيأ. يرجى تهيئته عبر Secrets panel في صفحة AI Studio."
      });
    }

    // Format urination logs for LLM
    const logsDescription = logs.map((log, index) => {
      return `
السجل رقم ${index + 1}:
- التاريخ والوقت: ${log.datetime}
- كمية البول (مدة التبول بالثواني المستغرقة): ${log.durationSeconds} ثانية (المعدل الطبيعي لإفراغ مثانة ممتلئة للشخص السليم هو 16-25 ثانية)
- لون البول: ${log.colorName} (مقياس: ${log.colorScale}/8)
- رغبة ملحة مفاجئة: ${log.urgency}
- الأعراض المصاحبة: ${log.symptoms?.join("، ") || "لا توجد أعراض مصاحبة"}
- السوائل المتناولة في آخر ساعتين: ${log.fluidType || "لا يوجد"}، الكمية: ${log.fluidAmount || 0} مل
- ملاحظات إضافية: ${log.notes || "لا توجد ملاحظات"}
      `.trim();
    }).join("\n\n");

    // Format water logs for LLM
    let waterDescription = "لا توجد سجلات خاصة بشرب الماء اليومية المدخلة مستقلة.";
    if (waterLogs && Array.isArray(waterLogs) && waterLogs.length > 0) {
      const getBenefitLabel = (key: string) => {
        switch (key) {
          case "morning": return "عند الاستيقاظ (فوائده: طرد السموم وتنشيط الأعضاء)";
          case "pre_meal": return "قبل الوجبة بـ 30 دقيقة (فوائده: تيسير الهضم والتحكم بالشهية)";
          case "post_meal": return "بعد الوجبة بساعة (فوائده: امتصاص مثالي للمغذيات)";
          case "exercise": return "أثناء/بعد النشاط البدني (فوائده: تعويض السوائل ومنع الشد العضلي)";
          case "before_sleep": return "قبل النوم بـ 1-2 ساعة (فوائده: منع النوبات القلبية - ولكن قد يسبب الاستيقاظ الليلي)";
          default: return "شرب ماء عام/بين الفترات";
        }
      };

      waterDescription = waterLogs.map((wl, index) => {
        return `
سجل شرب الماء #${index + 1}:
- التاريخ والوقت: ${wl.datetime}
- الكمية: ${wl.amount} مل
- التوقيت والميزة: ${getBenefitLabel(wl.benefitKey)}
- ملاحظات: ${wl.notes || "لا يوجد"}
        `.trim();
      }).join("\n\n");
    }

    // Format Medical Profile details for LLM
    let medicalProfileDescription = "لم يتم ملء ملف البيانات الطبية للمستخدم، ينصح بمعاملته كبالغ طبيعي.";
    if (medicalProfile) {
      const getGenderAr = (g: string) => {
        if (g === "male") return "ذكر";
        if (g === "female") return "أنثى";
        return "غير محدد";
      };

      const getConditionLabel = (c: string) => {
        switch (c) {
          case "diabetes": return "مرض السكري (قد يسبب كثرة العطش والبول)";
          case "kidney_stones": return "حصوات الكلى / المسالك البولية (تتطلب شرب كميات كافية جداً من الماء)";
          case "hypertension": return "ارتفاع ضغط الدم";
          case "prostate": return "مشاكل أو تضخم البروستات (قد يسبب صعوبة تبول، حصر أو تقطع البول)";
          case "uti": return "التهابات مسالك بولية متكررة (تسبب حرقان، رغبة ملحة)";
          default: return c;
        }
      };

      const conditionsFormatted = (medicalProfile.chronicConditions && medicalProfile.chronicConditions.length > 0)
        ? medicalProfile.chronicConditions.map(getConditionLabel).join("، ")
        : "لا توجد حالات صحية مزمنة مسجلة";

      let pregnancyText = "";
      if (medicalProfile.gender === "female" && medicalProfile.pregnancyStatus && medicalProfile.pregnancyStatus !== "none") {
        pregnancyText = `- الحالة الأنثوية: ${medicalProfile.pregnancyStatus === "pregnant" ? "حامل (قد يضغط الجنين على المثانة مما يزيد عدد مرات التبول)" : "مرضعة (تحتاج إلى زيادة معتبرة في مستويات السوائل اليومية)"}`;
      }

      medicalProfileDescription = `
- العمر: ${medicalProfile.age} سنة
- الجنس: ${getGenderAr(medicalProfile.gender)}
- الوزن: ${medicalProfile.weight} كجم (مما يعني أن احتياجه الطبي لترطيب المياه الأساسي هو حوالي ${Math.round(medicalProfile.weight * 35)} مل يومياً)
- الحالات الطبية المزمنة أو الشائعة التي تم رصدها: ${conditionsFormatted}
- ظروف صحية أخرى مدخلة يدوياً: ${medicalProfile.customConditions || "لا توجد"}
${pregnancyText}
- الأدوية الحالية المتناولة (خصوصاً مدرات البول أو السكر): ${medicalProfile.medications || "لا توجد"}
      `.trim();
    }

    const prompt = `
أنت الآن مساعد صحي شخصي ومستشار طبي في طب المسالك البولية وعادات شرب المياه والترطيب الصحي. مهمتك هي تقديم تحليل مفصل وذكي باللغة العربية يربط بين عادات التبول وعادات شرب المياه والبيانات الطبية البيولوجية للمستخدم المذكورة أدناه ليتمكن من فهم أسباب التبول الكثير لديه أو الجفاف أو الرغبة الملحة وتنظيم شرب السوائل بذكاء بما يتناسب مع حالته الصحية وعمره وجنسه ووزنه وأي ظروف طبية أو أدوية يتناولها.

إليك بيانات الملف الطبي الحيوي للمستخدم:
${medicalProfileDescription}

إليك بيانات سجلات عادات التبول:
${logsDescription}

إليك بيانات سجلات شرب وتعويض المياه وعادات التوقيت والفوائد:
${waterDescription}

مطلوب منك تقديم تحليل أسبوعي/دوري شامل ومخصّص بالكامل بناءً على مجمل هذه البيانات، يشمل النقاط التالية بدقة:
1. تحليل متوسط عدد مرات التبول اليومي مقارنة بالمعدل الطبيعي (4-8 مرات يوميًا) للبالغين، مع الإشارة المناسبة لعمر المستخدم وجنسه ووزنه.
2. ربط عادات شرب الماء والسوائل (خصوصاً الكافيين والقهوة والشاي والمشروبات الأخرى) مباشرة بعادات التبول؛ وتحديد ما إذا كان هناك فرط أو تفريط، وربط ذلك بالحالة الطبية كمرض السكري أو تضخم البروستات أو التهابات المسالك البولية.
3. تفصيل أهمية وعوائق أوقات شرب الماء المدخلة (مثل مدح شرب الماء عند الاستيقاظ أو لفت انتباهه إذا كان يشرب كميات كبيرة جداً قبل النوم مباشرة مما يسبب الاستيقاظ الليلي Nocturia).
4. مراقبة لون البول كدليل على الجفاف أو فرط الترطيب، والتحذير فوراً في حالة وجود ألوان غير طبيعية مثل البني الداكن أو الأحمر أو الوردي، أو وجود أعراض مثل حرقان أو ألم، وخصوصاً بالتوافق مع تاريخه المرضي (كالحصوات أو الالتهابات).
5. تقديم توصيات مخصصة وعملية لضبط عادات شرب الماء (الأوقات الصحيحة، الكميات المناسبة لكل فترة والابتعاد عن مدرات البول والمنبهات) بالتوافق تماماً مع وضعه الطبي الخاص وسنّه الحالي ومؤشرات كتلة وزنه.
6. مقارنة الإحصاءات العامة واستنتاج التوجه العام في شكل خلاصة سريعة.

شروط هامة جدًا في توليد التقرير:
- ابدأ التقرير فورًا بدون أي مقدمات ترحيبية عامة.
- يجب أن تكون لهجة التقرير مهنية، داعمة، واضحة وصحية.
- استخدم تنسيق Markdown رائع مع عناوين ملونة وجداول أو قوائم نقطية منسقة لتسهيل القراءة.
- التزم بوضع التحذير الطبي الإلزامي التالي بنصّه الحرفي في نهاية التقرير في صندوق مميز أو بشكل عريض:
«تنبيه طبي هام: هذا التحليل ليس تشخيصًا طبيًا. التبول المفرط المستمر قد يكون علامة على السكري (النوع 1 أو 2)، فرط نشاط المثانة، مشكلة بالكلى، أو تأثير أدوية. يُنصح بشدة بمراجعة طبيب باطني أو اختصاصي مسالك بولية، واصطحاب هذا التقرير معك.»
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + error.message });
  }
});

// Configure Vite or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export default app for serverless platforms like Vercel
export default app;

if (process.env.VERCEL !== "1") {
  startServer();
}
