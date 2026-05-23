import { UrinationLog } from "../types";
import { Activity, AlertOctagon, Flame, Droplet, Coffee, Clock, Heart, ShieldAlert } from "lucide-react";

interface DashboardStatsProps {
  logs: UrinationLog[];
}

export default function DashboardStats({ logs }: DashboardStatsProps) {
  if (logs.length === 0) return null;

  // Group logs by date (YYYY-MM-DD)
  const logsByDate: { [date: string]: UrinationLog[] } = {};
  logs.forEach(log => {
    const dateStr = log.datetime.split("T")[0];
    if (!logsByDate[dateStr]) {
      logsByDate[dateStr] = [];
    }
    logsByDate[dateStr].push(log);
  });

  const uniqueDays = Object.keys(logsByDate).length || 1;
  const totalLogs = logs.length;

  // 1. Calculate actual daily average frequency
  const avgFrequency = Math.round((totalLogs / uniqueDays) * 10) / 10;

  // 2. Nocturia Tracker (waking up > 2 times between 22:00 and 06:00)
  let maxNocturnalWakes = 0;
  let nocturiaAlertCount = 0;

  Object.values(logsByDate).forEach(dayLogs => {
    let nocturnalCount = 0;
    dayLogs.forEach(l => {
      const timePart = l.datetime.split("T")[1];
      if (timePart) {
        const hour = parseInt(timePart.split(":")[0]);
        // define nocturnal as 10 PM to 6 AM (between 22:00 and 6:00)
        if (hour >= 22 || hour < 6) {
          nocturnalCount++;
        }
      }
    });
    if (nocturnalCount > maxNocturnalWakes) {
      maxNocturnalWakes = nocturnalCount;
    }
    if (nocturnalCount >= 2) {
      nocturiaAlertCount++;
    }
  });

  // 3. Dehydration Index based on last 5 entries or all entries
  const recentLogs = logs.slice(0, 5);
  const avgColorScale = recentLogs.reduce((acc, current) => acc + current.colorScale, 0) / recentLogs.length;

  let hydrationStatus = "ترطيب مثالي";
  let hydrationColorClass = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
  if (avgColorScale >= 4 && avgColorScale < 6) {
    hydrationStatus = "جفاف خفيف (انتبه لترطيبك)";
    hydrationColorClass = "text-amber-600 bg-amber-50 dark:bg-amber-950/20";
  } else if (avgColorScale >= 6) {
    hydrationStatus = "جفاف شديد أو تلوّن غير طبيعي";
    hydrationColorClass = "text-red-600 bg-red-50 dark:bg-red-950/20";
  }

  // 4. Diuretic fluid correlation (coffee/tea count vs urgency)
  const diureticLogs = logs.filter(l => ["قهوة", "شاي", "مشروب غازي", "كحول"].includes(l.fluidType));
  const diureticWithUrgency = diureticLogs.filter(l => l.urgency === "نعم" || l.urgency === "أحيانًا").length;
  const diureticUrgencyRatio = diureticLogs.length
    ? Math.round((diureticWithUrgency / diureticLogs.length) * 100)
    : 0;

  // 5. Critical warnings check
  const hasPersistentRed = logs.filter(l => l.colorScale === 7).length > 0;
  const hasPersistentPain = logs.some(l => l.symptoms.includes("ألم") || l.symptoms.includes("حرقان") || l.symptoms.includes("pain") || l.symptoms.includes("burning"));
  const hasExtremelyFrequent = avgFrequency > 10;

  return (
    <div className="space-y-6" id="dashboard-statistics">
      {/* Critical alerts */}
      {(hasPersistentRed || hasPersistentPain || hasExtremelyFrequent || nocturiaAlertCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-yellow-950/10 border border-amber-200 dark:border-yellow-900/40 text-amber-900 dark:text-amber-200">
          <h4 className="font-bold flex items-center gap-1.5 text-sm md:text-base mb-2">
            <Heart className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
            أنماط وعلامات تستدعي المراقبة:
          </h4>
          <ul className="text-xs space-y-1.5 leading-relaxed">
            {hasExtremelyFrequent && (
              <li className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                <span>التبول المفرط (أكثر من 10 مرات باليوم): متوسط تبولك هو <strong className="text-red-600">{avgFrequency}</strong> مرات.</span>
              </li>
            )}
            {nocturiaAlertCount > 0 && (
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                <span>الاستيقاظ الليلي (Nocturia): تستيقظ للتبول ليلاً بمعدل يصل لـ <strong className="text-red-500">{maxNocturnalWakes}</strong> مرات.</span>
              </li>
            )}
            {hasPersistentRed && (
              <li className="flex items-center gap-1.5 text-red-600 dark:text-red-300 font-semibold animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                <span>وجود تلون أحمر/وردي: تم تسجيل بول أحمر اللون في تاريخ عاداتك البولية مما قد يشير إلى بيلة دموية خفيفة.</span>
              </li>
            )}
            {hasPersistentPain && (
              <li className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
                <span>أعراض حرقان أو ألم أثناء التبول: قد تكون دليلاً لعدوى بكتيرية أو التهاب بمجرى البول.</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Daily Urination Frequency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">معدل التبول اليومي</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-white">{avgFrequency}</span>
            <span className="text-xs text-slate-400">مرات / يوم</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px]">
            {avgFrequency >= 4 && avgFrequency <= 8 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold">بالمعدل الطبيعي</span>
            ) : avgFrequency > 10 ? (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold">مفرط جداً</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold">خارج النطاق المعتاد</span>
            )}
            <span className="text-slate-400">(المعدل الطبيعي: 4-8)</span>
          </div>
        </div>

        {/* Card 2: Hydration Status */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مؤشر ومستوى الترطيب</span>
            <Droplet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
            {hydrationStatus}
          </div>
          <div className="mt-2">
            <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${hydrationColorClass}`}>
              مقياس اللون: {Math.round(avgColorScale * 10) / 10} / 8
            </span>
          </div>
        </div>

        {/* Card 3: Diuretic Impact */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">تأثير الكافيين والمنبهات</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-white">{diureticUrgencyRatio}%</span>
            <span className="text-xs text-slate-400">معدل تحفيز الإلحاح</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 truncate">
            {diureticLogs.length} مشروب مدرّ للبول تم تسجيله باليومين الماضيين
          </p>
        </div>

        {/* Card 4: Nocturia Night Wakes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">التبول الليلي (Nocturia)</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-800 dark:text-white">{maxNocturnalWakes}</span>
            <span className="text-xs text-slate-400">أقصى استيقاظ ليلي</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 truncate">
            {nocturiaAlertCount > 0 ? `تم رصد التبول الليلي في ${nocturiaAlertCount} أيام.` : "عادات نوم وتبول صحية ليلاً."}
          </p>
        </div>
      </div>
    </div>
  );
}
