import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ExternalLink, 
  Download, 
  Printer, 
  MapPin, 
  Calendar, 
  Sparkles,
  FileText
} from 'lucide-react';
import { SavedPlantReport } from '../types/plant';
import { deleteReport, updateReportNotes } from '../utils/storage';
import { exportToWord, printReportAsPdf } from '../utils/exportReport';

interface SavedReportsViewProps {
  reports: SavedPlantReport[];
  onReportsChange: (updated: SavedPlantReport[]) => void;
  onOpenReport: (report: SavedPlantReport) => void;
  onNavigateToScanner: () => void;
}

export const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  reports,
  onReportsChange,
  onOpenReport,
  onNavigateToScanner
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Extract unique categories
  const categories = ['الكل', ...Array.from(new Set(reports.map(r => r.plantData.category).filter(Boolean)))];

  const filtered = reports.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      r.plantData.commonNameArabic.toLowerCase().includes(q) ||
      (r.plantData.iraqiLocalName && r.plantData.iraqiLocalName.toLowerCase().includes(q)) ||
      r.plantData.scientificName.toLowerCase().includes(q) ||
      (r.userNotes && r.userNotes.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'الكل' || r.plantData.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تقرير "${name}" من جهازك؟`)) {
      const updated = deleteReport(id);
      onReportsChange(updated);
    }
  };

  const handleStartEditNotes = (report: SavedPlantReport) => {
    setEditingNoteId(report.id);
    setTempNotes(report.userNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    const updated = updateReportNotes(id, tempNotes);
    onReportsChange(updated);
    setEditingNoteId(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-emerald-200">
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            أرشيف جهازك المحلي (Offline)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">التقارير المحفوظة في جهازي</h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            يمكنك العودة إلى تقارير نباتاتك، طباعتها أو تصديرها كـ Word و PDF في أي وقت دون اتصال بالإنترنت.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-center border border-white/10">
            <span className="block text-2xl font-black text-emerald-400">{reports.length}</span>
            <span className="text-[11px] text-stone-300">تقرير محفوظ</span>
          </div>
          <button
            onClick={onNavigateToScanner}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            فحص نبات جديد
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-600 absolute right-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم العراقي، العربي، أو العلمي..."
            className="w-full pr-10 pl-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition font-medium ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-stone-800 text-lg">لم يتم العثور على أي تقارير</h3>
          <p className="text-xs sm:text-sm text-stone-600">
            {search ? 'لا توجد نتائج تطابق بحثك الحالي.' : 'لم تقم بحفظ أي نباتات حتى الآن. التقط صورة لنباتك المفضل وقم بحفظ التقرير.'}
          </p>
          <button
            onClick={onNavigateToScanner}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            افحص أول نبات الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((report) => {
            const plant = report.plantData;
            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-500/50 hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image thumbnail & category */}
                  <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                    <img
                      src={report.imageDataUrl}
                      alt={plant.commonNameArabic}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg">
                        {plant.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(report.id, plant.commonNameArabic)}
                      className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition active:scale-90"
                      title="حذف هذا التقرير"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Iraqi Local Name Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold">
                      <span>🇮🇶</span>
                      <span>{plant.iraqiLocalName || plant.commonNameArabic}</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                        {plant.commonNameArabic}
                      </h3>
                      <p className="text-xs text-stone-600 italic font-mono pt-0.5" dir="ltr">
                        {plant.scientificName}
                      </p>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                      <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {new Date(report.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                      {report.location && (
                        <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          {report.location}
                        </span>
                      )}
                    </div>

                    {/* User Notes */}
                    {editingNoteId === report.id ? (
                      <div className="pt-2 space-y-2">
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="اكتب ملاحظاتك..."
                          rows={2}
                          className="w-full p-2 text-xs border border-emerald-500 rounded-lg focus:outline-none"
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-100 rounded"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleSaveNotes(report.id)}
                            className="px-3 py-1 text-[11px] bg-emerald-600 text-white rounded font-medium"
                          >
                            حفظ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => handleStartEditNotes(report)}
                        className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 hover:border-emerald-300 cursor-pointer transition"
                        title="انقر لتعديل الملاحظات"
                      >
                        <span className="font-semibold text-stone-700 block text-[11px] mb-0.5">ملاحظاتي:</span>
                        <p className="line-clamp-2">{report.userNotes || 'لا توجد ملاحظات (انقر للإضافة)...'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportToWord(plant, report.imageDataUrl)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition"
                      title="تحميل ملف Word (.doc)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onOpenReport(report);
                        setTimeout(() => printReportAsPdf(), 400);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                      title="طباعة / PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenReport(report)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                  >
                    <span>عرض التقرير</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
