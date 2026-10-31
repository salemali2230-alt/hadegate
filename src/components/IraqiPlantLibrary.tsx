import React from 'react';
import { Sparkles, BookOpen, ExternalLink, Download, Droplets, Sun, Calendar } from 'lucide-react';
import { SAMPLE_IRAQI_PLANTS, SamplePlantItem } from '../data/samplePlants';
import { exportToWord } from '../utils/exportReport';

interface IraqiPlantLibraryProps {
  onSelectPlant: (item: SamplePlantItem) => void;
}

export const IraqiPlantLibrary: React.FC<IraqiPlantLibraryProps> = ({ onSelectPlant }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            الموسوعة التراثية والبيئية العراقية
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            مكتبة أشهر النباتات والزهور في العراق
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            دليل موثق لأشهر الأشجار ونباتات الزينة التي تعيش وتزدهر في الحدائق والشوارع العراقية مع أسمائها الدارجة محلياً وجداول رعايتها الكاملة.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/30 px-4 py-3 rounded-2xl backdrop-blur-md">
          <span className="text-2xl">🇮🇶</span>
          <div className="text-right">
            <span className="block text-xs text-stone-300 font-medium">أصناف مختارة</span>
            <span className="text-sm font-bold text-emerald-300">متحملة لمناخ العراق</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_IRAQI_PLANTS.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Image banner */}
              <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={plant.image}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-xl">
                    {plant.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                {/* Iraqi Name highlight */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                  <span>🇮🇶</span>
                  <span>الاسم العراقي: {plant.iraqiName}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg leading-snug">
                    {plant.name}
                  </h3>
                  <p className="text-xs text-stone-600 italic font-mono pt-0.5" dir="ltr">
                    {plant.scientificName}
                  </p>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {plant.summary}
                </p>

                {/* Quick specs pill badges */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-600">
                  <div className="flex flex-col items-center bg-stone-50 p-2 rounded-xl text-center">
                    <Droplets className="w-3.5 h-3.5 text-sky-600 mb-1" />
                    <span className="text-[10px] text-stone-600 font-medium">الري</span>
                    <span className="truncate w-full font-bold text-stone-800">منتظم</span>
                  </div>

                  <div className="flex flex-col items-center bg-stone-50 p-2 rounded-xl text-center">
                    <Sun className="w-3.5 h-3.5 text-orange-500 mb-1" />
                    <span className="text-[10px] text-stone-600 font-medium">الإضاءة</span>
                    <span className="truncate w-full font-bold text-stone-800">شمس قوية</span>
                  </div>

                  <div className="flex flex-col items-center bg-stone-50 p-2 rounded-xl text-center">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 mb-1" />
                    <span className="text-[10px] text-stone-600 font-medium">الموسم</span>
                    <span className="truncate w-full font-bold text-stone-800">الربيع/الخريف</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => exportToWord(plant.data, plant.image)}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition text-xs flex items-center gap-1 font-semibold"
                title="تصدير ملف Word (.doc) لهذا النبات"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تحميل Word</span>
              </button>

              <button
                onClick={() => onSelectPlant(plant)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>عرض التقرير والجدول</span>
                <ExternalLink className="w-3.5 h-3.5 mr-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
