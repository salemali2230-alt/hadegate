import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  FileImage, 
  Flower2, 
  Leaf, 
  TreePine, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { PlantData } from '../types/plant';
import { SAMPLE_IRAQI_PLANTS, SamplePlantItem } from '../data/samplePlants';
import { getCustomApiKey, setCustomApiKey, identifyPlantDirectClient } from '../utils/geminiClient';

interface ImageScannerProps {
  onPlantIdentified: (plant: PlantData, imageBase64: string) => void;
  onSelectSamplePlant: (sample: SamplePlantItem) => void;
}

export const ImageScanner: React.FC<ImageScannerProps> = ({
  onPlantIdentified,
  onSelectSamplePlant
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');

  const handleIdentify = async (overrideApiKey?: string) => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let plantData: PlantData | null = null;
      const isGitHubPages = window.location.hostname.includes('github.io');
      const activeKey = overrideApiKey || getCustomApiKey();

      // If running on GitHub Pages (static host without backend) and we have an API key, use direct client
      if (isGitHubPages && activeKey) {
        plantData = await identifyPlantDirectClient(selectedImage, activeKey, userNote.trim() || undefined);
      } else {
        // Try server API route first
        try {
          const response = await fetch('/api/identify-plant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: selectedImage,
              userNote: userNote.trim() || undefined,
            }),
          });

          if (response.status === 404 && isGitHubPages) {
            // Static host detected
            if (activeKey) {
              plantData = await identifyPlantDirectClient(selectedImage, activeKey, userNote.trim() || undefined);
            } else {
              setShowKeyModal(true);
              setIsAnalyzing(false);
              return;
            }
          } else if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'فشل التعرف على النبات، يرجى المحاولة مرة أخرى.');
          } else {
            plantData = await response.json();
          }
        } catch (fetchErr: any) {
          if (isGitHubPages) {
            if (activeKey) {
              plantData = await identifyPlantDirectClient(selectedImage, activeKey, userNote.trim() || undefined);
            } else {
              setShowKeyModal(true);
              setIsAnalyzing(false);
              return;
            }
          } else {
            throw fetchErr;
          }
        }
      }

      if (!plantData || !plantData.isPlant) {
        setErrorMessage('لم يتم العثور على نبات واضح في هذه الصورة. يرجى التقاط صورة لأوراق، أزهار، أو أغصان النبات.');
        setIsAnalyzing(false);
        return;
      }

      onPlantIdentified(plantData, selectedImage);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي. يرجى المحاولة بصورة أوضح.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-700/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            ذكاء اصطناعي متخصص في البيئة والنباتات العراقية
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            تعرّف على أي نبات فـوراً <br className="hidden sm:inline" />
            مع <span className="text-emerald-300">الاسم العراقي</span> والدليل الزراعي الشامل
          </h1>
          <p className="text-stone-300 text-xs sm:text-base leading-relaxed">
            التقط صورة لورقة النبات، أزهاره أو شكله العام عبر الكاميرا أو ارفع صورة، وسيقوم التطبيق بتحديد اسمه العراقي الدارج، مواعيد زراعته وتسميده، وظروف العناية اليومية وتصديرها كتقرير Word أو PDF.
          </p>
        </div>

        {/* Feature badges */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-white/10 text-xs text-stone-200">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>من الورقة أو الزهرة</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl">
            <span className="text-base">🇮🇶</span>
            <span>الأسماء الدارجة بالعراق</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl">
            <TreePine className="w-4 h-4 text-teal-400 shrink-0" />
            <span>جدول الزراعة والتسميد</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs p-2.5 rounded-xl">
            <FileImage className="w-4 h-4 text-amber-400 shrink-0" />
            <span>تصدير Word و PDF</span>
          </div>
        </div>

        {/* Background decorative circles */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Upload / Camera Area */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        {!selectedImage ? (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center transition-all bg-stone-50/50 hover:bg-emerald-50/20 flex flex-col items-center justify-center space-y-4"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                  <Leaf className="w-7 h-7" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-inner">
                  <Flower2 className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-1 max-w-md">
                <h3 className="font-bold text-stone-800 text-lg sm:text-xl">
                  اختر صورة النبات أو التقطها مباشرة بالكاميرا
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  يمكن التعرف بدقة عالية من خلال أوراق الشجر، الأزهار المتفتحة، الثمار، أو شكل الشجرة الكلي.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-600/20"
                >
                  <Camera className="w-5 h-5" />
                  <span>فتح الكاميرا والالتقاط</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2.5 transition border border-stone-200"
                >
                  <Upload className="w-5 h-5 text-stone-600" />
                  <span>اختيار صورة من جهازي</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="text-[11px] text-stone-600 pt-2">
                يدعم صيغ JPG، PNG، WebP حتى 20 ميغابايت
              </div>
            </div>
          </div>
        ) : (
          /* Preview and confirmation */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Image preview */}
              <div className="relative w-full md:w-80 aspect-4/3 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md group">
                <img
                  src={selectedImage}
                  alt="النبات المختار"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  disabled={isAnalyzing}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs rounded-xl backdrop-blur-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تغيير الصورة</span>
                </button>
              </div>

              {/* Action Form & Note */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم التقاط / تحميل الصورة بنجاح!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    ملاحظة إضافية (اختياري - مثلاً: أعراض تراها، مكان الزراعة في العراق):
                  </label>
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="مثال: النبات مزروع في سندانة داخلية وبدأت أوراقه تذبل..."
                    disabled={isAnalyzing}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => handleIdentify()}
                    disabled={isAnalyzing}
                    className="w-full sm:flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-600/25"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>جاري فحص النبات وتحضير التقرير...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-emerald-200" />
                        <span>فحص النبات واستخراج التقرير والاسم العراقي</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedImage(null)}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto py-3.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs sm:text-sm font-semibold transition"
                  >
                    إلغاء
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2 animate-pulse">
                    <div className="font-bold flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>يقوم الذكاء الاصطناعي الآن بـ:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px] pr-2">
                      <li>تحليل بنية الأوراق، الأزهار أو الساق وتحديد الفصيلة النباتية.</li>
                      <li>البحث عن التسمية المحلية الدارجة في العراق (مشاتل وحدائق بلاد الرافدين).</li>
                      <li>توليد جدول مواعيد الزراعة، التسميد، السقاية، وتحمل درجات حرارة الصيف العراقي.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">تنبيه: </span>
              {errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* Quick Test / Explore Iconic Iraqi Plants */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇶</span>
            <div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                أو جرّب فحص نبات عراقي شهير بنقرة واحدة
              </h3>
              <p className="text-xs text-stone-600">
                اختر نبتة لتجربة التقرير الفوري، جدول الرعاية، والتصدير لـ Word و PDF:
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-200 hidden sm:inline">
            جاهز للاستكشاف
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {SAMPLE_IRAQI_PLANTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSamplePlant(sample)}
              className="flex flex-col items-center p-3 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-md transition group text-right active:scale-95 bg-stone-50/50"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-stone-200">
                <img
                  src={sample.image}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="font-bold text-stone-900 text-xs truncate w-full text-center">
                {sample.iraqiName}
              </span>
              <span className="text-[10px] text-stone-600 truncate w-full text-center font-mono" dir="ltr">
                {sample.scientificName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(capturedBase64) => {
            setSelectedImage(capturedBase64);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* GitHub Pages Gemini Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-right">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-lg text-stone-900">تشغيل الذكاء الاصطناعي عبر GitHub Pages</h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              أنت تستخدم التطبيق عبر استضافة <strong>GitHub Pages</strong> الثابتة. لتفعيل التعرف التلقائي على الصور الجديدة عبر الذكاء الاصطناعي مباشرة من جهازك، يرجى إدخال مفتاح <strong>Gemini API</strong> المجاني:
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">مفتاح Gemini API (مجاني):</label>
              <input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-left"
                dir="ltr"
              />
              <span className="text-[11px] text-stone-500 block pt-1">
                المفتاح يُحفظ محلياً في متصفح جهازك فقط ولا يغادره. يمكنك الحصول على مفتاح مجاناً من Google AI Studio.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (customKeyInput.trim()) {
                    setCustomApiKey(customKeyInput.trim());
                    setShowKeyModal(false);
                    handleIdentify(customKeyInput.trim());
                  }
                }}
                disabled={!customKeyInput.trim()}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition"
              >
                حفظ وبدء الفحص
              </button>

              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
