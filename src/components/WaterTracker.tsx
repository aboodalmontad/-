import { useState, FormEvent } from "react";
import { WaterLog } from "../types";
import { Plus, Coffee, Award, Trash2, Calendar, Droplet, Sun, Moon, Info, Zap } from "lucide-react";

interface WaterTrackerProps {
  waterLogs: WaterLog[];
  onAddWater: (log: Omit<WaterLog, "id">) => void;
  onDeleteWater: (id: string) => void;
}

export const WATER_BENEFITS = {
  morning: {
    title: "عند الاستيقاظ مباشرة",
    benefit: "ينشط الأعضاء الداخلية، ويطرد سموم الجسم المتراكمة ليلاً، ويحفز عملية الميتابوليزم.",
    timeDesc: "06:00 - 08:00 صباحاً",
    icon: Sun,
    colorClass: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30"
  },
  pre_meal: {
    title: "قبل الوجبة بـ 30 دقيقة",
    benefit: "يهيئ جدار المعدة لتلقي الطعام، ويدعم إفراز عصارة الهضم، ويزيد الإحساس بالشبع لضبط الوزن.",
    timeDesc: "قبل الإفطار / الغداء / العشاء",
    icon: Info,
    colorClass: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
  },
  post_meal: {
    title: "بعد الوجبة بساعة كاملة",
    benefit: "يساعد الأمعاء على امتصاص المواد الغذائية والمعادن بفاعلية عالية، دون تخفيف العصارة الهضمية.",
    timeDesc: "بعد الانتهاء من تناول الوجبة",
    icon: Award,
    colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
  },
  exercise: {
    title: "أثناء وبعد النشاط البدني",
    benefit: "يعوض السوائل المفقودة بالتعرق، ويمنع تقلص العضلات والشد العضلي، ويحافظ على مستويات الطاقة.",
    timeDesc: "قبل، خلال، أو بعد التمارين",
    icon: Zap,
    colorClass: "text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30"
  },
  before_sleep: {
    title: "قبل النوم بـ 1-2 ساعة",
    benefit: "يساعد في منع جلطات الدماغ والسكتات والنوبات القلبية ليلاً، ويحافظ على سيولة الدم الصحية.",
    warning: "تحذير: لا تشرب مباشرة قبل النوم لتفادي التبول الليلي (Nocturia) الذي يؤرق نومك.",
    timeDesc: "من الساعة 09:00 - 11:00 مساءً",
    icon: Moon,
    colorClass: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30"
  },
  general: {
    title: "شرب اعتيادي / بين الفترات",
    benefit: "ترطيب عام يحمي البشرة وحيوية الدماغ والمفاصل ويحافظ على رطوبة ولون البول باللون الفاتح.",
    timeDesc: "على مدار اليوم عند الشعور بالعطش",
    icon: Droplet,
    colorClass: "text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-slate-100 dark:border-slate-800"
  }
};

export default function WaterTracker({ waterLogs, onAddWater, onDeleteWater }: WaterTrackerProps) {
  // Goal setting (default 2500ml)
  const dailyGoal = 2500;

  // Local state for the inputs
  const [amount, setAmount] = useState<number>(250);
  const [benefitKey, setBenefitKey] = useState<WaterLog["benefitKey"]>("general");
  const [notes, setNotes] = useState("");
  const [datetime, setDatetime] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
  });
  const [notification, setNotification] = useState<string | null>(null);

  // Quick direct logger when clicking a cup
  const handleQuickAddWater = (selectedAmount: number, label: string) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const currentLocalISO = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    
    onAddWater({
      datetime: currentLocalISO,
      amount: selectedAmount,
      benefitKey: "general",
      notes: `كوب سريع: ${label}`
    });

    // Briefly flash a toast notification
    setNotification(`تمت إضافة ${label} بمقدار ${selectedAmount} مل وحُسب في العداد بنجاح! 🎉`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Calculate today's water intake
  const getTodayWaterAmount = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    return waterLogs
      .filter((wl) => wl.datetime.startsWith(todayStr))
      .reduce((sum, wl) => sum + wl.amount, 0);
  };

  const todayAmount = getTodayWaterAmount();
  const progressPercent = Math.min(100, Math.round((todayAmount / dailyGoal) * 100));

  const quickAmounts = [150, 250, 330, 500, 750];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onAddWater({
      datetime,
      amount,
      benefitKey,
      notes
    });
    // Reset fields gently but keep standard time updated
    setNotes("");
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    setDatetime((new Date(Date.now() - tzoffset)).toISOString().slice(0, 16));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="water-tracker-section">
      {/* Left pane: Logging and dynamic hydration status */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500 fill-blue-500" />
              مراقبة شرب الماء (الترطيب الذكي)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">سجل عادات شرب المياه ورتب أوقاتها لجداول صحية متوازنة.</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-lg">
            الهدف: 2.5 لتر يومياً
          </span>
        </div>

        {/* Dynamic Water wave level visual */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-slate-850 dark:to-slate-800 border border-blue-100/50 dark:border-blue-900/30 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="relative w-32 h-32 rounded-full border-4 border-blue-200 dark:border-blue-900 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-inner overflow-hidden shrink-0">
            {/* Wave animation simulation background */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-blue-400/20 dark:bg-blue-500/30 transition-all duration-500"
              style={{ height: `${progressPercent}%` }}
            />
            <Droplet className="w-8 h-8 text-blue-500 fill-blue-500 z-10 animate-pulse" />
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-white z-10">{progressPercent}%</span>
            <span className="text-[10px] text-slate-400 font-semibold z-10">من هدفك اليومي</span>
          </div>

          <div className="space-y-2 text-center md:text-right w-full">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">مجموع ترطيبك اليوم:</h4>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{todayAmount}</span>
              <span className="text-sm text-slate-400 font-semibold">مل / 2500 مل</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {progressPercent < 50
                ? "💧 ما زلت في البداية! تفضل بشرب كوب ماء الآن لتنشيط مستويات الرطوبة بجسدك."
                : progressPercent < 100
                ? "🌟 رائع! لقد تجاوزت نصف هدفك اليومي، واصل شرب رشفات منتظمة."
                : "🏆 تهانينا! لقد وصلت إلى الحد الصحي والترطيب المثالي الموصى به لليوم!"}
            </p>
          </div>
        </div>

        {/* Rapid Cup Water Logger (الواجهة البسيطة: كسة زر واحدة تسجل وتحسب فورا) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              💡 سجل شرب كوب مياه سريع بضغطة واحدة:
            </h4>
            <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
              يضاف ويحسب فوراً
            </span>
          </div>

          {notification && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="p-1 rounded-full bg-emerald-500 text-white leading-none">✓</span>
              {notification}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { amount: 150, title: "كوب صغير", subtitle: "شاي/قهوة ☕", fillPercent: 40 },
              { amount: 250, title: "كوب قياسي", subtitle: "كوب ماء عادي 🥛", fillPercent: 65 },
              { amount: 330, title: "كوب كبير", subtitle: "كوب مياه كبير 🥤", fillPercent: 85 },
              { amount: 500, title: "زجاجة مياه", subtitle: "علبة صغيرة 🧴", fillPercent: 100 },
            ].map((cup) => (
              <button
                key={cup.amount}
                type="button"
                onClick={() => handleQuickAddWater(cup.amount, cup.title)}
                className="group relative overflow-hidden flex flex-col items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm active:scale-95 hover:border-blue-400 dark:hover:border-blue-800 transition-all text-center min-h-[92px]"
              >
                {/* Visual Fluid Representation inside Button on hover */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-50 dark:bg-blue-950/30 transition-all duration-300"
                  style={{ height: `${cup.fillPercent}%` }}
                />

                <div className="relative z-10 w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/50 flex items-center justify-center shrink-0 mb-1 transition-colors">
                  <Droplet className="w-4 h-4 text-blue-500 fill-blue-500 group-hover:scale-110 transition-transform" />
                </div>

                <div className="relative z-10 text-[11px] font-sans font-extrabold text-slate-800 dark:text-slate-200">
                  {cup.title}
                </div>
                
                <div className="relative z-10 text-[9px] text-slate-400 font-semibold mb-1">
                  {cup.subtitle}
                </div>

                <div className="relative z-10 font-bold text-[11px] font-mono bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md mt-1 group-hover:scale-105 transition-transform">
                  +{cup.amount} مل
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Manual form switcher option */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
          <span className="block text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wide">
            أو استخدام خيارات التخصيص والملاحظات الإضافية:
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كمية الماء المستهلكة (مل)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            {/* DateTime Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                توقيت شرب الماء
              </label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full p-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-sans"
                required
              />
            </div>
          </div>

          {/* Quick Click Adders */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">كميات سريعة:</span>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    amount === q
                      ? "bg-blue-600 border-blue-600 text-white shadow"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  +{q} مل
                </button>
              ))}
            </div>
          </div>

          {/* Timing Habit & Benefit Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              توقيت وفائدة شرب الماء (اختر وقت العادة لتسجيل فائدتها):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(WATER_BENEFITS).map(([key, value]) => {
                const IconComponent = value.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBenefitKey(key as any)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      benefitKey === key
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {value.title}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">{value.timeDesc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Highlight Info panel of benefit */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${WATER_BENEFITS[benefitKey].colorClass}`}>
            <span className="font-bold flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
              💡 {WATER_BENEFITS[benefitKey].title}:
            </span>
            <p className="text-slate-700 dark:text-slate-300">{WATER_BENEFITS[benefitKey].benefit}</p>
            {WATER_BENEFITS[benefitKey].warning && (
              <p className="text-red-500 dark:text-red-400 font-bold mt-1.5">
                {WATER_BENEFITS[benefitKey].warning}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ملاحظات العادة (مثل: شربت ماء مثلج، أو مع ليمون...):</label>
            <input
              type="text"
              placeholder="كتابة ملاحظة حرة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow text-xs flex justify-center items-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            حفظ كوب الماء في السجلات
          </button>
        </form>
      </div>

      {/* Right pane: Water Benefits reference table and last 4 logs */}
      <div className="lg:col-span-5 space-y-6">
        {/* Dynamic Water Cheat sheet */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            مميزات وأوقات ذهبية لشرب المياه
          </h4>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {Object.entries(WATER_BENEFITS)
              .filter(([k]) => k !== "general")
              .map(([key, value]) => {
                const IconComponent = value.icon;
                return (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-5 py-2 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800 text-right transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <IconComponent className="w-3.5 h-3.5 text-blue-500" />
                        {value.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{value.timeDesc}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {value.benefit}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* List of last 4 logged waters */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            سجل مياه الشرب الأخيرة
          </h4>

          {waterLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              💧 لم تقم بتسجيل أي مياه شرب بعد.
            </div>
          ) : (
            <div className="space-y-2.5">
              {waterLogs.slice(-4).reverse().map((wl) => {
                const benefitData = WATER_BENEFITS[wl.benefitKey] || WATER_BENEFITS.general;
                const Icon = benefitData.icon;
                return (
                  <div key={wl.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/70 border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {wl.amount} مل ({benefitData.title})
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          {new Date(wl.datetime).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}{" "}
                          {new Date(wl.datetime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteWater(wl.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
