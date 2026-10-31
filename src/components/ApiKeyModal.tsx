import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Trash2, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  X, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { 
  getCustomApiKey, 
  setCustomApiKey, 
  removeCustomApiKey, 
  maskApiKey, 
  testApiKeyValidity 
} from '../utils/geminiClient';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange?: (newKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyChange
}) => {
  const [currentSavedKey, setCurrentSavedKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getCustomApiKey();
      setCurrentSavedKey(saved);
      setInputKey(saved);
      setTestResult(null);
      setActionNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setActionNotice({ type: 'error', message: 'يرجى إدخال مفتاح API أولاً أو الضغط على مسح المفتاح.' });
      return;
    }

    setCustomApiKey(trimmed);
    setCurrentSavedKey(trimmed);
    setActionNotice({ type: 'success', message: 'تم حفظ مفتاح Gemini API بنجاح في متصفحك!' });
    setTestResult(null);
    if (onKeyChange) onKeyChange(trimmed);
  };

  const handleClear = () => {
    removeCustomApiKey();
    setCurrentSavedKey('');
    setInputKey('');
    setTestResult(null);
    setActionNotice({ type: 'success', message: 'تم مسح وحذف المفتاح المحفوظ بنجاح!' });
    if (onKeyChange) onKeyChange('');
  };

  const handleTestKey = async () => {
    const keyToTest = (inputKey || currentSavedKey).trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'يرجى كتابة أو لصق المفتاح لفحصه.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testApiKeyValidity(keyToTest);
    setIsTesting(false);

    if (res.valid) {
      setTestResult({ success: true, message: 'المفتاح صالح ويعمل بكفاءة مع خوادم Gemini!' });
    } else {
      setTestResult({ success: false, message: res.error || 'المفتاح غير صالح أو منتهي الصلاحية.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">إدارة مفتاح الذكاء الاصطناعي (Gemini)</h3>
              <p className="text-xs text-stone-300">تحديث أو مسح المفتاح المحفوظ على هذا الجهاز</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 text-stone-300 hover:text-white rounded-xl transition"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Current Saved Status Badge */}
          <div className="p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm bg-stone-50 border-stone-200">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentSavedKey ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span className="font-semibold text-stone-700">حالة المفتاح الحالي:</span>
            </div>
            {currentSavedKey ? (
              <span className="font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs" dir="ltr">
                {maskApiKey(currentSavedKey)}
              </span>
            ) : (
              <span className="text-stone-500 text-xs">لا يوجد مفتاح محفوظ</span>
            )}
          </div>

          {/* Action Notices */}
          {actionNotice && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
          )}

          {/* Input field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 block">
                مفتاح Gemini API:
              </label>
              <button
                type="button"
                onClick={() => setShowKeyText(!showKeyText)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition"
              >
                {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKeyText ? 'إخفاء' : 'إظهار الأحرف'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showKeyText ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setActionNotice(null);
                  setTestResult(null);
                }}
                placeholder="ألصق المفتاح هنا (يبدأ بـ AIzaSy...)"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-left bg-stone-50/50"
                dir="ltr"
              />
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" />
              <span>حفظ المفتاح</span>
            </button>

            {/* Test Button */}
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !inputKey.trim()}
              className="w-full sm:w-auto py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-95 disabled:opacity-50 text-stone-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition border border-stone-200"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> : <Sparkles className="w-4 h-4 text-emerald-600" />}
              <span>فحص صلاحية المفتاح</span>
            </button>

            {/* Clear Button */}
            {currentSavedKey && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition border border-rose-200"
                title="مسح المفتاح وحذفه نهائياً"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح المفتاح</span>
              </button>
            )}
          </div>

          {/* Help Box on getting free API key */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 text-xs text-stone-700 space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>كيف أحصل على مفتاح Gemini API جديد ومجاني 100%؟</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 leading-relaxed pr-1 text-[11px] sm:text-xs">
              <li>ادخل إلى موقع <strong>Google AI Studio</strong> بحسابك في Google.</li>
              <li>اضغط على زر <strong>Get API key</strong> ثم <strong>Create API key</strong>.</li>
              <li>انسخ المفتاح الذي يبدأ بـ <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200 text-emerald-800">AIzaSy...</code> وضعه في هذه الخانة واضغط <strong>حفظ</strong>.</li>
            </ol>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold underline pt-1"
            >
              <span>انتقل للحصول على مفتاحك مجاناً من Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-800 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
