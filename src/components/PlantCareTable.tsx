import React from 'react';
import { 
  Calendar, 
  FlaskConical, 
  Droplets, 
  Sun, 
  Layers, 
  ThermometerSun, 
  Sprout, 
  Scissors, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { CareTable } from '../types/plant';

interface PlantCareTableProps {
  careTable: CareTable;
  gardenUses?: string;
}

export const PlantCareTable: React.FC<PlantCareTableProps> = ({ careTable, gardenUses }) => {
  const tableRows = [
    {
      title: 'موعد الزراعة والشتل',
      value: careTable.plantingSeason,
      icon: Calendar,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'الموسم الأنسب',
    },
    {
      title: 'التسميد والمغذيات',
      value: careTable.fertilization,
      icon: FlaskConical,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: 'جدول التسميد',
    },
    {
      title: 'جدول وطريقة السقاية',
      value: careTable.watering,
      icon: Droplets,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      badge: 'الري صيفاً وشتاءً',
    },
    {
      title: 'متطلبات الشمس والإضاءة',
      value: careTable.sunlight,
      icon: Sun,
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      badge: 'التعرض للضوء',
    },
    {
      title: 'نوع التربة وتصريفها',
      value: careTable.soilType,
      icon: Layers,
      color: 'text-yellow-800 bg-yellow-50 border-yellow-200',
      badge: 'الوسط الزراعي',
    },
    {
      title: 'تحمل درجات الحرارة والمناخ',
      value: careTable.temperatureAndClimate,
      icon: ThermometerSun,
      color: 'text-red-700 bg-red-50 border-red-200',
      badge: 'المناخ والحرارة',
    },
    {
      title: 'طرق الإكثار والتكاثر',
      value: careTable.propagation,
      icon: Sprout,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      badge: 'التكثير',
    },
    {
      title: 'موعد وطريقة التقليم',
      value: careTable.pruning,
      icon: Scissors,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badge: 'التهذيب والقص',
    },
    {
      title: 'السمية للأطفال والحيوانات الأليفة',
      value: careTable.toxicity,
      icon: ShieldAlert,
      color: careTable.toxicity.includes('سام') 
        ? 'text-rose-700 bg-rose-50 border-rose-200' 
        : 'text-green-700 bg-green-50 border-green-200',
      badge: 'معيار الأمان',
    },
  ];

  return (
    <div className="w-full my-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <h4 className="font-bold text-stone-900 text-base sm:text-lg">
            جدول بيانات وظروف زراعة النبات
          </h4>
        </div>
        <span className="text-xs text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
          معلومات شاملة ومفصلة
        </span>
      </div>

      {/* Styled Responsive Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-semibold text-stone-600">
              <th className="py-3.5 px-4 w-1/3 sm:w-1/4">المعيار الزراعي</th>
              <th className="py-3.5 px-4 w-2/3 sm:w-3/4">التفاصيل والتوصيات العملية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {tableRows.map((row, idx) => {
              const Icon = row.icon;
              return (
                <tr 
                  key={idx}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="py-3 px-4 align-top font-medium text-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${row.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-900 text-sm">{row.title}</span>
                        <span className="text-[11px] text-stone-600 font-normal">{row.badge}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-700 leading-relaxed text-sm">
                    {row.value}
                  </td>
                </tr>
              );
            })}

            {gardenUses && (
              <tr className="hover:bg-emerald-50/30 transition-colors bg-stone-50/40">
                <td className="py-3 px-4 align-top font-medium text-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg border text-amber-700 bg-amber-50 border-amber-200 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-900 text-sm">أفضل الاستخدامات</span>
                      <span className="text-[11px] text-stone-600 font-normal">المكان المناسب</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-stone-700 leading-relaxed text-sm font-medium">
                  {gardenUses}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
