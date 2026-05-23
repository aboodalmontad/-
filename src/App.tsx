import { useState, useEffect } from "react";
import { UrinationLog, WaterLog, MedicalProfile } from "./types";
import { initialLogs, initialWaterLogs } from "./data";
import UrinationForm from "./components/UrinationForm";
import DashboardStats from "./components/DashboardStats";
import WaterTracker, { WATER_BENEFITS } from "./components/WaterTracker";
import MedicalProfileForm from "./components/MedicalProfileForm";
import {
  FileText,
  Activity,
  PlusCircle,
  FileDown,
  RefreshCw,
  Clock,
  Droplet,
  Coffee,
  AlertTriangle,
  Info,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Moon,
  Trash2,
  ListPlus,
  ClipboardList
} from "lucide-react";

export default function App() {
  // State for urination logs
  const [urdLogs, setUrdLogs] = useState<UrinationLog[]>([]);
  // State for water intake logs
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  // State for medical profile
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    age: 30,
    gender: "male",
    weight: 75,
    chronicConditions: [],
    customConditions: "",
    pregnancyStatus: "none",
    medications: ""
  });

  // UI state managers
  const [activeTab, setActiveTab] = useState<"urination" | "water">("urination");
  const [showLogModal, setShowLogModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMedicalCenter, setShowMedicalCenter] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // DB Sync state indicator
  const [dbSynced, setDbSynced] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string>("");

  // Load from server-side database or fallback to localStorage cache
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const response = await fetch("/api/database");
        if (!response.ok) throw new Error("Could not fetch local database.");
        const data = await response.json();
        
        setUrdLogs(data.urinationLogs || []);
        setWaterLogs(data.waterLogs || []);
        if (data.medicalProfile) {
          setMedicalProfile(data.medicalProfile);
          localStorage.setItem("medical_profile", JSON.stringify(data.medicalProfile));
        }
        setDbSynced(true);
        localStorage.setItem("urine_logs", JSON.stringify(data.urinationLogs));
        localStorage.setItem("water_logs", JSON.stringify(data.waterLogs));
      } catch (err: any) {
        console.warn("Server DB loading failed, falling back to local storage cache:", err);
        setDbError("تعذر تحميل قاعدة البيانات النشطة؛ المستخدم المتصفحي في وضع الحفظ الاحتياطي.");
        
        const savedUrination = localStorage.getItem("urine_logs");
        const savedWater = localStorage.getItem("water_logs");
        const savedMedical = localStorage.getItem("medical_profile");

        if (savedMedical) {
          try {
            setMedicalProfile(JSON.parse(savedMedical));
          } catch (e) {}
        }

        if (savedUrination) {
          try {
            setUrdLogs(JSON.parse(savedUrination));
          } catch (e) {
            setUrdLogs(initialLogs);
          }
        } else {
          setUrdLogs(initialLogs);
        }

        if (savedWater) {
          try {
            setWaterLogs(JSON.parse(savedWater));
          } catch (e) {
            setWaterLogs(initialWaterLogs);
          }
        } else {
          setWaterLogs(initialWaterLogs);
        }
      }
    };

    fetchDatabase();
  }, []);

  // Sync utilities back to database api & local client state
  const handleAddUrinationLog = async (newLog: Omit<UrinationLog, "id">) => {
    const freshLog: UrinationLog = {
      ...newLog,
      id: "u-log-" + Date.now()
    };
    
    // Reactively update current local state for instant UX
    const updated = [freshLog, ...urdLogs];
    setUrdLogs(updated);
    localStorage.setItem("urine_logs", JSON.stringify(updated));

    try {
      const res = await fetch("/api/urination-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshLog)
      });
      if (!res.ok) throw new Error("فشل الحفظ في قاعدة البيانات على الخادم.");
      setDbSynced(true);
    } catch (err) {
      console.error(err);
      setDbSynced(false);
    }
    setShowLogModal(false);
  };

  // Delete Urination Log
  const handleDeleteUrinationLog = async (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً من قاعدة البيانات المحلية؟")) {
      const updated = urdLogs.filter(item => item.id !== id);
      setUrdLogs(updated);
      localStorage.setItem("urine_logs", JSON.stringify(updated));

      try {
        const res = await fetch(`/api/urination-logs/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("فشل الحذف من الخادم");
        setDbSynced(true);
      } catch (err) {
        console.error(err);
        setDbSynced(false);
      }
    }
  };

  // Add Water Log
  const handleAddWaterLog = async (newWl: Omit<WaterLog, "id">) => {
    const freshWl: WaterLog = {
      ...newWl,
      id: "w-log-" + Date.now()
    };
    const updated = [...waterLogs, freshWl];
    setWaterLogs(updated);
    localStorage.setItem("water_logs", JSON.stringify(updated));

    try {
      const res = await fetch("/api/water-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(freshWl)
      });
      if (!res.ok) throw new Error("فشل الإضافة في الخادم");
      setDbSynced(true);
    } catch (err) {
      console.error(err);
      setDbSynced(false);
    }
  };

  // Delete Water Log
  const handleDeleteWaterLog = async (id: string) => {
    const updated = waterLogs.filter(item => item.id !== id);
    setWaterLogs(updated);
    localStorage.setItem("water_logs", JSON.stringify(updated));

    try {
      const res = await fetch(`/api/water-logs/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("فشل مسح الزجاجة من قاعدة البيانات");
      setDbSynced(true);
    } catch (err) {
      console.error(err);
      setDbSynced(false);
    }
  };

  // Sync / save medical profile to state and database
  const handleUpdateMedicalProfile = async (updated: MedicalProfile) => {
    setMedicalProfile(updated);
    localStorage.setItem("medical_profile", JSON.stringify(updated));

    try {
      const res = await fetch("/api/medical-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("فشل حفظ الملف الطبي على الخادم.");
      setDbSynced(true);
    } catch (err) {
      console.error(err);
      setDbSynced(false);
    }
  };

  // Trigger AI analysis report
  const handleGenerateReport = async () => {
    setAiLoading(true);
    setAiError("");
    setAiReport("");

    try {
      const response = await fetch("/api/analyze-habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          logs: urdLogs,
          waterLogs: waterLogs,
          medicalProfile: medicalProfile
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل الاتصال بالمعالج الذكي للتقرير.");
      }
      setAiReport(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "عذرًا، حدث خطأ غير متوقع أثناء توليد التقرير الطبي.");
    } finally {
      setAiLoading(false);
    }
  };

  // Export data as text file
  const handleExportData = () => {
    const dataObj = {
      urinationLogs: urdLogs,
      waterLogs: waterLogs,
      exportedAt: new Date().toISOString()
    };
    const fileData = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `تقرير_عادات_التبول_والترطيب_${new Date().toISOString().split("T")[0]}.json`;
    link.href = url;
    link.click();
  };

  // Clear/Reset entire database (تصفير البيانات)
  const handleResetAllData = async () => {
    try {
      const res = await fetch("/api/reset-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("فشل تصفير قاعدة البيانات من الخادم.");
      
      // Update local state
      setUrdLogs([]);
      setWaterLogs([]);
      setMedicalProfile({
        age: 30,
        gender: "male",
        weight: 75,
        chronicConditions: [],
        customConditions: "",
        pregnancyStatus: "none",
        medications: ""
      });

      // Clear localStorage
      localStorage.removeItem("urine_logs");
      localStorage.removeItem("water_logs");
      localStorage.removeItem("medical_profile");

      setDbSynced(true);
      setShowResetConfirm(false);
      setAiReport("");
    } catch (err: any) {
      console.error(err);
      setDbError("عذرًا، حدث خطأ أثناء تصفير البيانات: " + err.message);
    }
  };

  // Convert Color Scale to color hex
  const getColorHex = (scale: number) => {
    switch (scale) {
      case 1: return "#E8F5E9"; // transparent
      case 2: return "#FFFDE7"; // light yellow
      case 3: return "#FFF59D"; // yellow
      case 4: return "#FFE082"; // amber
      case 5: return "#FFCC80"; // orange
      case 6: return "#D7CCC8"; // brown
      case 7: return "#FFCDD2"; // red/pink
      case 8: return "#ECEFF1"; // cloudy
      default: return "#FFF";
    }
  };

  const getTextColorHex = (scale: number) => {
    switch (scale) {
      case 1: return "#2E7D32";
      case 2: return "#F57F17";
      case 3: return "#E65100";
      case 4: return "#E65100";
      case 5: return "#9E0D00";
      case 6: return "#4E342E";
      case 7: return "#C62828";
      case 8: return "#37474F";
      default: return "#333";
    }
  };

  // Check critical symptoms logged recently
  const lastLogsWithRed = urdLogs.filter(l => l.colorScale === 7).slice(0, 3);
  const lastLogsWithPain = urdLogs.filter(l => l.symptoms.includes("حرقان") || l.symptoms.includes("ألم") || l.symptoms.includes("pain") || l.symptoms.includes("burning")).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased pb-12" dir="rtl" id="applet-root">
      
      {/* PERSISTENT HEADER MEDICAL WARNING */}
      <div className="bg-amber-500 text-white text-xs py-2.5 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-sm relative z-50">
        <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
        <span>
          تنبيه إلزامي: هذا التطبيق هو لأغراض مراقبة عادات التبول والترطيب الشخصية فقط. لا يقدم تشخيصًا طبيًا بديلًا عن الطبيب المختص. التبول المفرط أو المتكرر أو المؤلم المستمر قد يرتبط بحالات صحية بحاجة لفحص سريري.
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Head */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
                <Activity className="w-6 h-6 animate-pulse" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                مراقب عادات التبول والترطيب الذكي
              </h1>

              {/* Database Status Indicator Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                dbSynced
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dbSynced ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {dbSynced ? "قاعدة البيانات المحلية: متصلة 🟢" : "جاري المزامنة مع قاعدة البيانات المحلية..."}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
              متابعة كميات ولون البول، مستويات الترطيب وشرب الماء الطبيعي، وربط المواعيد والفوائد بتقرير الذكاء الاصطناعي.
            </p>
            {dbError && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                ⚠️ {dbError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 align-middle"
            >
              <PlusCircle className="w-4 h-4" />
              تسجيل تبول جديد
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all hover:bg-slate-50 flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-emerald-500" />
              تصدير البيانات
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              تصفير البيانات 🗑️
            </button>
          </div>
        </header>

        {/* Quick Crisis Alerts */}
        {(lastLogsWithRed.length > 0 || lastLogsWithPain.length > 0) && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-r-4 border-red-500 dark:bg-red-950/20 dark:border-red-800 text-red-900 dark:text-red-300 text-xs md:text-sm space-y-1">
            <h4 className="font-bold flex items-center gap-1 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              رصد عوارض تستدعي استشارة طبية عاجلة:
            </h4>
            {lastLogsWithRed.length > 0 && (
              <p>• تم رصد تلون البول باللون <strong>الأحمر / الوردي</strong> في آخر السجلات المضافة وهو مؤشر لوجود دم مجهري أو مرئي.</p>
            )}
            {lastLogsWithPain.length > 0 && (
              <p>• تم رصد عوارض <strong>ألم أو حرقان أثناء التبول</strong> والتي قد تشير لالتهابات حادة في المسالك البولية.</p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-semibold">
              * ننصحك بطباعة هذا السجل وتقرير الذكاء الاصطناعي واصطحابه لطبيبك لعمل تحليل بول روتيني ومزرعة بكتيرية.
            </p>
          </div>
        )}

        {/* TAB SWITCHER NAVBAR - ONLY 2 SIMPLIFIED PAGES */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl max-w-md mx-auto shadow-inner" dir="rtl">
          <button
            onClick={() => setActiveTab("urination")}
            className={`flex-1 py-3 px-4 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "urination"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            صحيفة التبول 🚽
          </button>
          <button
            onClick={() => setActiveTab("water")}
            className={`flex-1 py-3 px-4 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "water"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Droplet className="w-4 h-4" />
            شرب الماء 💧
          </button>
        </div>

        {/* ACTIVE TABS GRAPH PANEL */}
        <main className="space-y-6">
          
          {/* TAB 1: URINATION MANAGEMENT PAGE */}
          {activeTab === "urination" && (
            <div className="space-y-6" id="tab-urination-view">
              
              <DashboardStats logs={urdLogs} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Right Column: Direct live stopwatch & logging form */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-blue-500 animate-pulse" />
                        حساب وتسجيل تبول جديد 🚽
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        استخدم المؤقت بضغطة واحدة وحفظ الحالة لملاحظة عادات الإفراغ ومطابقتها.
                      </p>
                    </div>
                    <UrinationForm onAddLog={handleAddUrinationLog} />
                  </div>
                </div>

                {/* Left Column: Records history logs & detailed list */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Detailed Urination Log table inline */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">جدول تاريخ تسجيلات التبول اليومية</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">تفقد تصنيف اللّون، فترات التفريغ، والعلامات الطبية المضافة.</p>
                    </div>

                    {urdLogs.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        لا توجد أي سجلات تبول مضافة بعد. يرجى البدء من الاستمارة على اليمين!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                              <th className="p-3 text-right whitespace-nowrap">التاريخ والوقت</th>
                              <th className="p-3 text-right">المدة (بالثواني)</th>
                              <th className="p-3 text-right">اللون والعينة</th>
                              <th className="p-3 text-right">الرغبة</th>
                              <th className="p-3 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                            {urdLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  {new Date(log.datetime).toLocaleDateString("ar-EG", { month: "numeric", day: "numeric" })}{" "}
                                  {new Date(log.datetime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                                </td>
                                <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                                  {log.durationSeconds} ثانية
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span
                                    className="px-2 py-1 rounded font-bold text-[10px]"
                                    style={{ backgroundColor: getColorHex(log.colorScale), color: getTextColorHex(log.colorScale) }}
                                  >
                                    {log.colorName}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap font-bold">
                                  {log.urgency === "نعم" ? (
                                    <span className="text-red-500">مفاجئة ⚠️</span>
                                  ) : (
                                    <span className="text-slate-400">طبيعي</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteUrinationLog(log.id)}
                                    className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* AI Assistant & Medical Profile Combined inside collapsible box */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300 font-sans">
                    <button
                      type="button"
                      onClick={() => setShowMedicalCenter(!showMedicalCenter)}
                      className="w-full p-5 flex justify-between items-center text-right font-bold text-slate-800 dark:text-white hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all border-b border-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-indigo-500" />
                        <div>
                          <span className="block text-sm font-extrabold text-slate-800 dark:text-white">الملف الصحّي والتقرير التحليلي الذكي (AI) 🧠</span>
                          <span className="block text-[10px] text-slate-400 font-normal">خصص حالتك المرضية، واستخرج نصائح طبية مخصصة من السجلات.</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform text-slate-400 ${showMedicalCenter ? "rotate-90" : "rotate-180"}`} />
                    </button>

                    {showMedicalCenter && (
                      <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-3 duration-200 text-right" dir="rtl">
                        {/* Medical profile form component */}
                        <div className="border-b border-slate-200/50 dark:border-slate-800 pb-6">
                          <MedicalProfileForm
                            profile={medicalProfile}
                            onSave={handleUpdateMedicalProfile}
                            dbSynced={dbSynced}
                          />
                        </div>

                        {/* Analysis execution reporting */}
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                استشارة الفرز الصحي الذكي (Gemini AI)
                              </h4>
                              <p className="text-[10px] text-slate-400">تحليل فوري لقدرة المثانة واستجابة الترطيب.</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateReport}
                              disabled={aiLoading}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-[11px] font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                            >
                              {aiLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  جاري القراءة الفورية...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  توليد التقرير الطبي الذكي
                                </>
                              )}
                            </button>
                          </div>

                          {aiLoading && (
                            <div className="py-8 text-center space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div className="w-8 h-8 rounded-full border-4 border-t-indigo-600 border-indigo-200 animate-spin mx-auto" />
                              <p className="text-xs text-slate-500 font-medium">يقوم الخبير الطبي بدراسة عادات ترطيبك وتردد الإفراغ ثانية بثانية...</p>
                            </div>
                          )}

                          {aiError && (
                            <div className="p-3 text-xs bg-red-100 text-red-850 border border-red-200 rounded-xl">
                              {aiError}
                            </div>
                          )}

                          {!aiLoading && !aiReport && !aiError && (
                            <div className="py-6 text-center text-[11px] text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                              اضغط على زر التوليد لمراجعة ومطابقة مستويات التبول والمياه بالذكاء الاصطناعي.
                            </div>
                          )}

                          {!aiLoading && aiReport && (
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 text-right text-xs leading-relaxed max-h-[350px] overflow-y-auto font-sans">
                              {/* Simple AI block print */}
                              {aiReport.split("\n").map((line, idx) => {
                                if (line.trim().length === 0) return <div key={idx} className="h-1.5" />;
                                if (line.startsWith("### ")) {
                                  return <h5 key={idx} className="text-xs font-extrabold text-indigo-600 dark:text-indigo-450 mt-3 mb-1">{line.replace("### ", "")}</h5>;
                                } else if (line.startsWith("## ") || line.startsWith("# ")) {
                                  return <h4 key={idx} className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-4 mb-1.5 pb-0.5 border-b border-blue-50/50 dark:border-blue-900/10">{line.replace("## ", "").replace("# ", "")}</h4>;
                                }
                                return <p key={idx} className="mb-1 text-slate-700 dark:text-slate-300">{line}</p>;
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: WATER DRINKING PAGE */}
          {activeTab === "water" && (
            <div id="tab-water-view">
              <WaterTracker
                waterLogs={waterLogs}
                onAddWater={handleAddWaterLog}
                onDeleteWater={handleDeleteWaterLog}
              />
            </div>
          )}

        </main>
      </div>

      {/* QUICK LOG POPUP DIALOG MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <UrinationForm
              onAddLog={handleAddUrinationLog}
              onClose={() => setShowLogModal(false)}
            />
          </div>
        </div>
      )}

      {/* RESET DATABASE CONFIRM MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" id="reset-confirm-modal">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6 border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4 border-b border-rose-150/30 dark:border-rose-900/20 pb-3">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450">
                <Trash2 className="w-5 h-5 animate-bounce" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                تصفير وحذف جميع البيانات؟
              </h3>
            </div>

            <div className="space-y-3 my-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-rose-600 dark:text-rose-450">
                ⚠️ ينطوي هذا الإجراء على حذف كامل وشامل لكافة البيانات المسجلة على هذا التطبيق بشكل نهائي وبلا عودة!
              </p>
              
              <ul className="list-disc list-inside space-y-1.5 pr-2 border-r-2 border-slate-200 dark:border-slate-800 text-right">
                <li>إزالة جميع <strong>يوميات وسجلات التبول بالثواني</strong>.</li>
                <li>إزالة جميع <strong>سجلات شرب وتعويض المياه والفوائد</strong>.</li>
                <li>إعادة ضبط <strong>الملف الطبي والبيانات الصحية</strong> للقيم الافتراضية.</li>
                <li>مسح التقارير السابقة والتحاليل من الذاكرة والملف المحلي.</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                تراجع وإلغاء الأمر
              </button>
              <button
                onClick={handleResetAllData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                نعم، تصفير البيانات بالتأكيد 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACCREDITATION */}
      <footer className="mt-16 text-center text-xs text-slate-400 dark:text-slate-600 max-w-2xl mx-auto px-4 border-t border-slate-200 dark:border-slate-850 pt-6">
        <p className="leading-relaxed">
          تطبيق مراقبة عادات التبول والترطيب © ٢٠٢٦. تم التطوير لدعم الإشعار الذكي والترشيد الصحي. 
        </p>
        <p className="mt-2 text-[10px] text-amber-500 dark:text-amber-600 font-bold">
          تنبيه: محتوى هذا التطبيق ليس مرجعًا طبيًا ولا يغني عن تشخيص الطبيب المختص أو التحاليل المخبرية.
        </p>
      </footer>

    </div>
  );
}
