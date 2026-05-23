import { useState, useEffect, FormEvent } from "react";
import { UrinationLog } from "../types";
import { PlusCircle, Clock, Volume2, Droplets, AlertTriangle, ListFilter, MessageSquare, Coffee, X, Play, Square, Timer } from "lucide-react";

interface UrinationFormProps {
  onAddLog: (log: Omit<UrinationLog, "id">) => void;
  onClose?: () => void;
}

const URINE_COLORS = [
  { scale: 1, name: "شفاف", hex: "#E8F5E9", textHex: "#2E7D32", desc: "ترطيب مفرط أو ممتاز" },
  { scale: 2, name: "أصفر فاتح", hex: "#FFFDE7", textHex: "#F57F17", desc: "ترطيب مثالي وصحي" },
  { scale: 3, name: "أصفر داكن", hex: "#FFF59D", textHex: "#F57F17", desc: "صحي، ويفضل شرب المياه" },
  { scale: 4, name: "كهرماني", hex: "#FFE082", textHex: "#E65100", desc: "جفاف خفيف، يرجى تعويض السوائل" },
  { scale: 5, name: "برتقالي", hex: "#FFCC80", textHex: "#E65100", desc: "قد يشير للجفاف أو تناول أدوية" },
  { scale: 6, name: "بني", hex: "#D7CCC8", textHex: "#4E342E", desc: "جفاف شديد أو مشاكل في الكبد" },
  { scale: 7, name: "أحمر / وردي", hex: "#FFCDD2", textHex: "#C62828", desc: "تنبيه هام جداً: قد يشير لوجود دم المجهري" },
  { scale: 8, name: "غائم", hex: "#ECEFF1", textHex: "#37474F", desc: "قد يدل على التهابات في المسالك البولية" }
] as const;

export default function UrinationForm({ onAddLog, onClose }: UrinationFormProps) {
  // Local states
  const [datetime, setDatetime] = useState(() => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  });

  const [frequencySelect, setFrequencySelect] = useState<number>(6);
  const [durationSeconds, setDurationSeconds] = useState<number>(20); // Default is 20s
  const [selectedColorScale, setSelectedColorScale] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrinationLog["urgency"]>("لا");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptomsText, setOtherSymptomsText] = useState("");
  const [fluidType, setFluidType] = useState<UrinationLog["fluidType"]>("لا توجد سوائل");
  const [fluidAmount, setFluidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Stopwatch Logic
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerId, setTimerId] = useState<any>(null);

  const startStopwatch = () => {
    if (timerActive) return;
    setDurationSeconds(0);
    setTimerActive(true);
    const id = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);
    setTimerId(id);
  };

  const stopStopwatch = () => {
    if (!timerActive) return;
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setTimerActive(false);
  };

  const toggleStopwatch = () => {
    if (timerActive) {
      stopStopwatch();
    } else {
      startStopwatch();
    }
  };

  // Clean on unmount
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  const symptomOptions = [
    { id: "burning", label: "حرقان أثناء التبول" },
    { id: "pain", label: "ألم في الحوض أو أسفل البطن" },
    { id: "pressure", label: "ضغط شديد أسفل البطن" },
    { id: "difficulty", label: "صعوبة/تردد في بدء التبول" }
  ];

  const fluidTypes: UrinationLog["fluidType"][] = [
    "ماء",
    "قهوة",
    "شاي",
    "عصير",
    "مشروب غازي",
    "كحول",
    "لا توجد سوائل"
  ];

  // Live trigger warning flag
  const isSelectedColorDanger = selectedColorScale === 7; // Red / Pink
  const hasBurningOrPain = selectedSymptoms.includes("burning") || selectedSymptoms.includes("pain") || selectedSymptoms.includes("ألم") || selectedSymptoms.includes("حرقان");

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const colorObj = URINE_COLORS.find(c => c.scale === selectedColorScale) || URINE_COLORS[1];

    // Format structural symptoms list with label text
    const symptomsList: string[] = [];
    if (selectedSymptoms.includes("burning")) symptomsList.push("حرقان");
    if (selectedSymptoms.includes("pain")) symptomsList.push("ألم");
    if (selectedSymptoms.includes("pressure")) symptomsList.push("ضغط أسفل البطن");
    if (selectedSymptoms.includes("difficulty")) symptomsList.push("صعوبة في البدء");

    onAddLog({
      datetime,
      frequencySelect,
      durationSeconds,
      colorScale: selectedColorScale,
      colorName: colorObj.name as any,
      urgency,
      symptoms: symptomsList,
      otherSymptomsText,
      fluidType,
      fluidAmount,
      notes
    });

    if (onClose) {
      onClose();
    }
  };

  const getUrgentStyles = () => {
    if (isSelectedColorDanger || hasBurningOrPain) {
      return "border-2 border-red-400 bg-red-50/50 dark:bg-red-950/20";
    }
    return "border border-slate-200 dark:border-slate-800";
  };

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 transition-all shadow-xl max-w-2xl mx-auto ${getUrgentStyles()}`} id="urine-log-form-container">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="text-blue-500 w-6 h-6" />
          تسجيل تبول جديد
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Immediate Visual Warning Panel */}
      {(isSelectedColorDanger || hasBurningOrPain) && (
        <div className="mb-6 p-4 rounded-xl bg-red-100 border-r-4 border-red-500 text-red-800 dark:bg-red-950/50 dark:text-red-300 text-sm flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">تنبيه فوري:</span>
            {isSelectedColorDanger && <p>• تم تحديد لون البول (أحمر / وردي) مما قد يحير باحتمالية وجود دم بالبول.</p>}
            {hasBurningOrPain && <p>• تم تحديد أعراض حرقان أو ألم والتي قد ترتبط بالتهابات المسالك البولية.</p>}
            <p className="mt-1 text-xs underline font-medium">إذا استمرت هذه الأعراض، يُنصح بشدة بإجراء فحص بول سريع واستشارة طبيب مختص.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            التاريخ والوقت
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-sans text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            id="log-datetime"
          />
        </div>

        {/* Daily Frequency (Estimated) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-slate-500" />
            توقعك لعدد مرات التبول الإجمالي اليوم (1 إلى 20+)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min="1"
              max="20"
              value={frequencySelect}
              onChange={(e) => setFrequencySelect(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
              id="log-frequency"
            />
            <span className="w-14 text-center font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-sm shrink-0">
              {frequencySelect >= 20 ? "20+" : frequencySelect} م
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">الرقم المعتدل الطبيعي للشخص البالغ هو من 4 إلى 8 مرات يوميًا.</p>
        </div>

        {/* Urination Duration (Stopwatch & Slider) */}
        <div className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30">
          <label className="block text-sm font-bold text-slate-850 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <Timer className="w-5 h-5 text-blue-500 animate-pulse" />
            كمية التبول (محسوبة بالثواني المستغرقة)
          </label>
          
          {/* Stopwatch Timing Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm mb-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">المؤقت الحي / ساعة إيقاف التبول ⏱️</span>
            
            <div className="flex items-center gap-4 my-2">
              <span className={`text-4xl font-extrabold font-mono tracking-tight transition-all duration-300 ${timerActive ? "text-rose-550 scale-105 animate-pulse" : "text-slate-800 dark:text-white"}`}>
                {durationSeconds} <span className="text-sm font-semibold text-slate-550 dark:text-slate-400">ثانية</span>
              </span>
            </div>

            <div className="flex gap-2.5 mt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={toggleStopwatch}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${
                  timerActive
                    ? "bg-rose-600 hover:bg-rose-700 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {timerActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    اضغط هنا لإيقاف العداد وحفظ الثواني
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    اضغط هنا لبدء احتساب الثواني
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-2.5">
              سهلة ومريحة: اضغط ضغطة واحدة للبدء فور بدء التبول واضغط نفس الزر مجدداً فور الانتهاء ليقيد الزمن دقيقًا.
            </p>
          </div>

          {/* Manual Slider adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-medium">تعديل العداد يدويًا:</span>
              <span className="font-extrabold bg-blue-100 dark:bg-blue-900/50 text-blue-850 dark:text-blue-200 px-2 py-0.5 rounded-md font-mono">
                {durationSeconds} ثانية
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
            />
            
            {/* Clinical interpretation of the seconds */}
            <div className="mt-3 p-3 bg-slate-100/60 dark:bg-slate-850/60 rounded-xl text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">تفسير المدة حيوياً (قاعدة الـ 21 ثانية للتبول):</span>
              {durationSeconds <= 9 && (
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  ⚠️ تدفّق قصير جداً ({durationSeconds} ثوانٍ): كمية بول شحيحة جداً، أو إلحاح كاذب ومزعج بالمسالك.
                </p>
              )}
              {durationSeconds >= 10 && durationSeconds <= 15 && (
                <p className="text-blue-700 dark:text-blue-400">
                  💧 تدفق معتدل ({durationSeconds} ثوانٍ): كمية بول متوسطة طبيعية.
                </p>
              )}
              {durationSeconds >= 16 && durationSeconds <= 25 && (
                <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                  ✨ تدفق مثالي ({durationSeconds} ثانية): هذا هو المتوسط الطبيعي والصحي لإراقة مثانة ممتلئة تماماً.
                </p>
              )}
              {durationSeconds >= 26 && durationSeconds <= 35 && (
                <p className="text-indigo-700 dark:text-indigo-400">
                  🌊 تدفق طويل وسعة ممتلئة ({durationSeconds} ثانية): كمية بول وفيرة وتدفق صحي وقوي.
                </p>
              )}
              {durationSeconds >= 36 && (
                <p className="text-amber-700 dark:text-amber-400 font-semibold">
                  ⚠️ تدفق طويل جداً ومتبلد ({durationSeconds} ثانية): قد تشير لبطء أو تردد دفق البول (تضخم غدة البروستات أو توتر العضلات القابضة).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Urine Color Circle Chooser */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-slate-500" />
            لون البول (المقياس المرجعي 1 - 8)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-3">
            {URINE_COLORS.map((col) => (
              <button
                key={col.scale}
                type="button"
                onClick={() => setSelectedColorScale(col.scale)}
                className={`relative aspect-square rounded-full flex flex-col items-center justify-center p-1 border-2 transition-all ${
                  selectedColorScale === col.scale
                    ? "border-blue-600 scale-110 shadow-md ring-4 ring-blue-500/10"
                    : "border-slate-100 dark:border-slate-800 hover:scale-105"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                <span className="text-xs font-bold" style={{ color: col.textHex }}>
                  #{col.scale}
                </span>
                <span className="text-[9px] font-semibold block" style={{ color: col.textHex }}>
                  {col.name}
                </span>
              </button>
            ))}
          </div>
          {/* Active color helper desc */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex justify-between items-center transition-all">
            <span className="text-slate-500">طبيعة اللون الحالي:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {URINE_COLORS[selectedColorScale - 1]?.desc}
            </span>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            هل كان التبول ملحًّا ومفاجئًا؟ (الرغبة الملحة)
          </label>
          <div className="flex gap-4">
            {(["لا", "أحيانًا", "نعم"] as const).map((urg) => (
              <label key={urg} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="urgency"
                  value={urg}
                  checked={urgency === urg}
                  onChange={() => setUrgency(urg)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                {urg}
              </label>
            ))}
          </div>
        </div>

        {/* Symptoms check-badge */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            الأعراض المصاحبة الجسدية (اختر ما تشعر به)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {symptomOptions.map((sym) => {
              const checked = selectedSymptoms.includes(sym.id);
              return (
                <button
                  type="button"
                  key={sym.id}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    checked
                      ? "bg-red-500 text-white border-red-500 dark:bg-red-600"
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {checked && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  {sym.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="أعراض أخرى؟ مثل: ألم ظهر، شعور بعدم الإفراغ الكامل..."
            value={otherSymptomsText}
            onChange={(e) => setOtherSymptomsText(e.target.value)}
            className="w-full mt-2 p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Fluid Intake */}
        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/40">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-blue-500" />
            السوائل المتناولة في آخر ساعتين
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">نوع المشروب</label>
              <select
                value={fluidType}
                onChange={(e) => {
                  const type = e.target.value as UrinationLog["fluidType"];
                  setFluidType(type);
                  if (type === "لا توجد سوائل") setFluidAmount(0);
                  else if (fluidAmount === 0) setFluidAmount(250); // standard cup default
                }}
                className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              >
                {fluidTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {fluidType !== "لا توجد سوائل" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">الكمية التقديرية (مل)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    step="50"
                    value={fluidAmount}
                    onChange={(e) => setFluidAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">مل</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            ملاحظات إضافية (اختياري)
          </label>
          <textarea
            placeholder="مثال: شربت لتر ماء دفعة واحدة، أو بذلت مجهود بدني شاق..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-sans text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Action button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex justify-center items-center gap-2 text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          تأكيد وحفظ السجل الجديد
        </button>
      </form>
    </div>
  );
}
