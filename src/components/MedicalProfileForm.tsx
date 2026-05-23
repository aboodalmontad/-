import React, { useState } from "react";
import { MedicalProfile } from "../types";
import { ClipboardList, User, ShieldAlert, BadgeInfo, Scale, Activity } from "lucide-react";

interface Props {
  profile: MedicalProfile;
  onSave: (updated: MedicalProfile) => Promise<void> | void;
  dbSynced: boolean;
}

export default function MedicalProfileForm({ profile, onSave, dbSynced }: Props) {
  const [age, setAge] = useState<number>(profile.age || 30);
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(profile.gender || "male");
  const [weight, setWeight] = useState<number>(profile.weight || 75);
  const [chronicConditions, setChronicConditions] = useState<string[]>(profile.chronicConditions || []);
  const [customConditions, setCustomConditions] = useState<string>(profile.customConditions || "");
  const [pregnancyStatus, setPregnancyStatus] = useState<"none" | "pregnant" | "lactating">(profile.pregnancyStatus || "none");
  const [medications, setMedications] = useState<string>(profile.medications || "");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableConditions = [
    { id: "diabetes", label: "مرض السكري (Diabetes)", description: "يرتبط ارتباطاً وثيقاً بزيادة العطش Polydipsia والتبول المتكرر Polyuria." },
    { id: "kidney_stones", label: "حصوات الكلى / المسالك البولية (Kidney Stones)", description: "تتطلب تناول كميات وفيرة جداً من المياه بشكل منتظم للمساعدة في إذابتها ومنع تكونها." },
    { id: "hypertension", label: "ارتفاع ضغط الدم (Hypertension)", description: "قد يتم صرف أدوية مدرة للبول لتصريف السوائل مما يزيد الحاجة للتبول." },
    { id: "prostate", label: "تضخم أو مشاكل البروستاتا (Prostate Problems)", description: "خاص بالذكور؛ قد يسبب صعوبة بدء التبول، ضعف دفق البول، أو الاستيقاظ الليلي المتكرر." },
    { id: "uti", label: "التهابات المسالك البولية المتكررة (UTIs)", description: "تتميز بالشعور برغبة طارئة ملحة وحرقان مستمر أثناء التبول." }
  ];

  const handleToggleCondition = (conditionId: string) => {
    if (chronicConditions.includes(conditionId)) {
      setChronicConditions(chronicConditions.filter(c => c !== conditionId));
    } else {
      setChronicConditions([...chronicConditions, conditionId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updatedProfile: MedicalProfile = {
        age: Number(age),
        gender,
        weight: Number(weight),
        chronicConditions,
        customConditions,
        pregnancyStatus: gender === "female" ? pregnancyStatus : "none",
        medications
      };
      await onSave(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Medical baseline calculations
  const recommendedWaterIntake = Math.round(weight * 35); // 35 ml per kg is standard clinical recommendation for normal adult

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6" id="medical-profile-form">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          <ClipboardList className="w-5 h-5 animate-pulse" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            الملف الشخصي والبيانات الطبية المخصصة
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أدخل مواصفاتك الحيوية والظروف الصحية لتمكين الذكاء الاصطناعي (Gemini) من صياغة تقارير طبية وتوصيات ترطيب تتطابق تمامًا مع حالتك.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Demographics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Age Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-500" />
              العمر (بالسنوات) *
            </label>
            <input
              type="number"
              min="1"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-semibold"
            />
            <p className="text-[10px] text-slate-400">مثال: يتم تقييم السعة التخزينية للمثانة بناءً على معايير العمر.</p>
          </div>

          {/* Gender Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              الجنس *
            </label>
            <select
              required
              value={gender}
              onChange={(e) => {
                const val = e.target.value as any;
                setGender(val);
                if (val !== "female") {
                  setPregnancyStatus("none");
                }
              }}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-semibold"
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
              <option value="other">آخر / غير محدد</option>
            </select>
            <p className="text-[10px] text-slate-400">ضروري لحسابات ترطيب الجسم ومشاكل البروستاتا أو الحمل.</p>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-500" />
              الوزن الحالي (كجم) *
            </label>
            <input
              type="number"
              min="10"
              max="250"
              required
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-semibold"
            />
            <p className="text-[10px] text-slate-400">
              احتياجك المائي التقريبي: <span className="text-blue-600 dark:text-blue-400 font-bold">{recommendedWaterIntake} مل</span> يومياً.
            </p>
          </div>
        </div>

        {/* Conditional Option for Females */}
        {gender === "female" && (
          <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/40 dark:border-pink-900/40 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-pink-700 dark:text-pink-400 flex items-center gap-1.5">
              <BadgeInfo className="w-4 h-4" />
              الحالة الطبية والفيزيولوجية الخاصة بالنساء:
            </h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="pregnancyStatus"
                  checked={pregnancyStatus === "none"}
                  onChange={() => setPregnancyStatus("none")}
                  className="w-4 h-4 text-pink-600"
                />
                لا يوجد تفرّد حالي (طبيعي)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="pregnancyStatus"
                  checked={pregnancyStatus === "pregnant"}
                  onChange={() => setPregnancyStatus("pregnant")}
                  className="w-4 h-4 text-pink-600"
                />
                حامل (ضغط الرحم على المثانة)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="pregnancyStatus"
                  checked={pregnancyStatus === "lactating"}
                  onChange={() => setPregnancyStatus("lactating")}
                  className="w-4 h-4 text-pink-600"
                />
                مرضعة (تستلزم كمية إضافية للسوائل)
              </label>
            </div>
          </div>
        )}

        {/* Chronic Conditions Checklist */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            الحالات الصحية والأمراض المزمنة ذات الصلة طبياً بنظام المسالك البولية والمياه:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableConditions.map((cond) => {
              // Hide prostate choice for female
              if (cond.id === "prostate" && gender === "female") return null;

              const isChecked = chronicConditions.includes(cond.id);
              return (
                <div
                  key={cond.id}
                  onClick={() => handleToggleCondition(cond.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? "bg-slate-50 dark:bg-slate-800/40 border-blue-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-slate-400 mt-1 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {cond.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-relaxed mt-0.5">
                      {cond.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Medications */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            الأدوية والعلاجات الحالية (خصوصاً مدرات البول أو أدوية السكر والبروستات)
          </label>
          <input
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="مثال: لازيكس (Lasix)، حبوب ضغط مدرة للبول، فورسيجا (Forxiga)، علاج بروستات إلخ..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-xs placeholder-slate-400 font-semibold"
          />
          <p className="text-[10px] text-slate-400">بصفتها مدرة للبول، تفرز هذه الأدوية سوائل إضافية للمسالك، وهو ما يحتاجه الذكاء الاصطناعي لفهم التبول المتكرر.</p>
        </div>

        {/* Custom conditions text area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            ظروف صحية أو تفاصيل طبية أخرى ترغب في مشاركتها:
          </label>
          <textarea
            value={customConditions}
            onChange={(e) => setCustomConditions(e.target.value)}
            rows={2}
            placeholder="مثال: حامل تاريخي لحصوات الأكسالات، ضعف خفيف في وظائف الكلى، فرط نشاط المثانة المشخص طبياً..."
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-xs placeholder-slate-400 font-semibold resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            تُحفظ كافة البيانات الطبية محلياً بحسب بروتوكولات الخصوصية وتُرسل بشكل مشفر لـ Gemini للتقرير فقط.
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
              saving
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {saving ? "جاري الحفظ..." : "حفظ وتحديث الملف الطبي"}
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 rounded-xl text-xs font-bold text-center">
            ✔ تم تحديث ومزامنة البيانات الطبية والبيولوجية الخاصة في قاعدة البيانات بنجاح! سيتم ربطها فوراً بتقرير التحليل القادم.
          </div>
        )}

      </form>
    </div>
  );
}
