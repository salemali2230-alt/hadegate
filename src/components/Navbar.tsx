import { Leaf, Camera, BookOpen, Bookmark, Key } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'library' | 'saved';
  onTabChange: (tab: 'scanner' | 'library' | 'saved') => void;
  savedCount: number;
  onOpenKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  onOpenKeyModal,
  hasCustomKey
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onTabChange('scanner')}
          className="flex items-center gap-3 text-right group text-inherit hover:opacity-95 transition"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl text-stone-900 tracking-tight">نباتاتي</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                🇮🇶 دليل العراق
              </span>
            </div>
            <p className="text-[11px] text-stone-600 hidden sm:block">كاشف النباتات والرعاية بالأسماء الدارجة</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Scanner Tab */}
          <button
            onClick={() => onTabChange('scanner')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 ${
              activeTab === 'scanner'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>كاشف النباتات</span>
          </button>

          {/* Library Tab */}
          <button
            onClick={() => onTabChange('library')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 ${
              activeTab === 'library'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">الموسوعة العراقية</span>
            <span className="sm:hidden">الموسوعة</span>
          </button>

          {/* Saved Reports Tab */}
          <button
            onClick={() => onTabChange('saved')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 relative ${
              activeTab === 'saved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">تقاريري المحفوظة</span>
            <span className="sm:hidden">تقاريري</span>
            {savedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'saved' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* API Key Settings Button */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 border ${
              hasCustomKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
            }`}
            title="إدارة مفتاح Gemini API"
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">مفتاح API</span>
            {hasCustomKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="مفتاح محفوظ" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
