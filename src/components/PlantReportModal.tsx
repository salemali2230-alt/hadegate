import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Bookmark, 
  Check, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  SunMedium, 
  Info,
  Bug,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { PlantData } from '../types/plant';
import { PlantCareTable } from './PlantCareTable';
import { PlantDoctorChat } from './PlantDoctorChat';
import { exportToWord, printReportAsPdf, copyPlantSummary } from '../utils/exportReport';
import { saveReport } from '../utils/storage';
import confetti from 'canvas-confetti';

interface PlantReportModalProps {
  plant: PlantData;
  imageDataUrl: string;
  onClose: () => void;
  onSaved?: () => void;
  alreadySavedId?: string;
  initialNotes?: string;
  initialLocation?: string;
}

export const PlantReportModal: React.FC<PlantReportModalProps> = ({
  plant,
  imageDataUrl,
  onClose,
  onSaved,
  alreadySavedId,
  initialNotes = '',
  initialLocation = '',
}) => {
  const [isSaved, setIsSaved] = useState(Boolean(alreadySavedId));
  const [copied, setCopied] = useState(false);
  const [userNotes, setUserNotes] = useState(initialNotes);
  const [userLocation, setUserLocation] = useState(initialLocation);
  const [isWordExporting, setIsWordExporting] = useState(false);

  const handleSaveToDevice = () => {
    saveReport(plant, imageDataUrl, userNotes, userLocation);
    setIsSaved(true);
    if (onSaved) onSaved();

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
    });
  };

  const handleExportWord = () => {
    setIsWordExporting(true);
    try {
      exportToWord(plant, imageDataUrl);
    } finally {
      setTimeout(() => setIsWordExporting(false), 800);
    }
  };

  const handleCopySummary = async () => {
    const success = await copyPlantSummary(plant);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-stone-200 print:shadow-none print:border-none print:max-w-full">
        {/* Top Action Bar (Hidden during print) */}
        <div className="bg-stone-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-sm sm:text-base">تقرير العناية وتفاصيل النبات</h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopySummary}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
              title="نسخ ملخص النبات"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>

            {/* Word Export Button */}
            <button
              onClick={handleExportWord}
              disabled={isWordExporting}
              className="p-2 sm:px-3 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="تصدير ملف Word (.doc)"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Word</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={printReportAsPdf}
              className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="تصدير كـ ملف PDF أو طباعة"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF</span>
            </button>

            {/* Save locally */}
            <button
              onClick={handleSaveToDevice}
              disabled={isSaved}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                isSaved
                  ? 'bg-stone-800 text-emerald-400 cursor-default'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
              title="حفظ التقرير محلياً بجهازك"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'محفوظ محلياً' : 'حفظ في جهازي'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition ml-1"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Visible Report Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-stone-200 pb-6">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  {plant.category}
                </span>
                <span className="text-xs px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  دقة التعرف: {plant.confidenceScore}%
                </span>
                <span className="text-xs px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full">
                  تم التعرف من: {plant.partIdentified}
                </span>
              </div>

              {/* Common Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                {plant.commonNameArabic}
              </h1>

              {/* PROMINENT IRAQI LOCAL NAME BADGE */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-500/40 rounded-2xl shadow-xs">
                <span className="text-lg">🇮🇶</span>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-800 block">التسمية المحلية بالعراقي:</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-950">
                    {plant.iraqiLocalName || 'لا يوجد اسم محلي خاص - معروف باسمه العربي'}
                  </span>
                </div>
              </div>

              {/* Scientific name & family */}
              <div className="text-xs sm:text-sm text-stone-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <div>
                  <span className="text-stone-600">الاسم العلمي: </span>
                  <span className="font-semibold italic text-stone-800 font-mono" dir="ltr">
                    {plant.scientificName}
                  </span>
                </div>
                <div>
                  <span className="text-stone-600">الفصيلة: </span>
                  <span className="font-semibold text-stone-800">{plant.family}</span>
                </div>
              </div>

              {plant.iraqiNameExplanation && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs sm:text-sm text-emerald-900 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">في الحدائق والتراث العراقي: </span>
                    {plant.iraqiNameExplanation}
                  </div>
                </div>
              )}
            </div>

            {/* Plant Image Thumbnail */}
            {imageDataUrl && (
              <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
                <div className="relative w-full aspect-4/3 md:aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-md group">
                  <img
                    src={imageDataUrl}
                    alt={plant.commonNameArabic}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] backdrop-blur-xs">
                    صورة النبات
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Plant Description */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm sm:text-base mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              الوصف النباتي والخصائص
            </h4>
            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
              {plant.description}
            </p>
          </div>

          {/* THE STRUCTURED CARE TABLE */}
          <PlantCareTable 
            careTable={plant.careTable} 
            gardenUses={plant.gardenUses} 
          />

          {/* Daily Care Checklist */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
            <h4 className="font-bold text-emerald-950 text-sm sm:text-base mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-700" />
              نصائح العناية اليومية والأسبوعية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plant.dailyCareTips.map((tip, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs text-xs sm:text-sm text-stone-700"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Iraqi Climate & Summer Advice */}
          {plant.iraqiClimateAdvice && plant.iraqiClimateAdvice.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
              <h4 className="font-bold text-amber-950 text-sm sm:text-base mb-3 flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-amber-600" />
                إرشادات خاصة بظروف المناخ العراقي (الحرارة الشديدة والغبار)
              </h4>
              <div className="space-y-2">
                {plant.iraqiClimateAdvice.map((advice, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200/60"
                  >
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="leading-relaxed">{advice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Pests and Diseases */}
          {plant.commonPestsAndDiseases && plant.commonPestsAndDiseases.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 sm:p-5">
              <h4 className="font-bold text-rose-950 text-sm sm:text-base mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                الآفات والمشاكل الشائعة وطرق الوقاية والعلاج
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plant.commonPestsAndDiseases.map((pest, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs space-y-1.5 text-xs sm:text-sm">
                    <div className="font-bold text-rose-800">{pest.issue}</div>
                    <div className="text-stone-600">
                      <span className="font-semibold text-stone-700">الأعراض: </span>
                      {pest.symptoms}
                    </div>
                    <div className="text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                      <span className="font-semibold text-emerald-900">طريقة العلاج: </span>
                      {pest.treatment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Notes and Location (Locally Stored) */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 print:hidden space-y-3">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              ملاحظاتي الشخصية عن هذا النبات (محفوظة بجهازك)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1">مكان زراعة النبات / الحديقة:</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-600 absolute right-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="مثال: حديقة البيت في بغداد، سندانة البلكونة..."
                    className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-600 mb-1">ملاحظات العناية والتسميد:</label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="مثال: تم التسميد بمركب NPK بتاريخ اليوم..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
            {!isSaved && (
              <button
                onClick={handleSaveToDevice}
                className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition"
              >
                حفظ التقرير مع ملاحظاتي في جهازي
              </button>
            )}
          </div>

          {/* AI Plant Doctor Chat inside the report (Hidden in print) */}
          <div className="print:hidden">
            <PlantDoctorChat plant={plant} />
          </div>

          {/* Footer watermark for print */}
          <div className="text-center text-[10px] text-stone-600 pt-4 border-t border-stone-200">
            تم استخراج هذا التقرير عبر تطبيق «نباتاتي - كاشف ودليل النباتات العراقي» | {new Date().toLocaleDateString('ar-IQ')}
          </div>
        </div>
      </div>
    </div>
  );
};
