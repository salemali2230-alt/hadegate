/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageScanner } from './components/ImageScanner';
import { IraqiPlantLibrary } from './components/IraqiPlantLibrary';
import { SavedReportsView } from './components/SavedReportsView';
import { PlantReportModal } from './components/PlantReportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PlantData, SavedPlantReport } from './types/plant';
import { getSavedReports } from './utils/storage';
import { getCustomApiKey } from './utils/geminiClient';
import { SamplePlantItem } from './data/samplePlants';
import { Leaf, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'library' | 'saved'>('scanner');
  const [savedReports, setSavedReports] = useState<SavedPlantReport[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  
  // Active modal report state
  const [activeModalData, setActiveModalData] = useState<{
    plant: PlantData;
    imageDataUrl: string;
    alreadySavedId?: string;
    userNotes?: string;
    location?: string;
  } | null>(null);

  // Load saved reports and API key status on mount
  useEffect(() => {
    const list = getSavedReports();
    setSavedReports(list);
    setHasCustomKey(Boolean(getCustomApiKey()));
  }, []);

  const handlePlantIdentified = (plant: PlantData, imageBase64: string) => {
    setActiveModalData({
      plant,
      imageDataUrl: imageBase64,
    });
  };

  const handleSelectSample = (sample: SamplePlantItem) => {
    setActiveModalData({
      plant: sample.data,
      imageDataUrl: sample.image,
    });
  };

  const handleOpenSavedReport = (report: SavedPlantReport) => {
    setActiveModalData({
      plant: report.plantData,
      imageDataUrl: report.imageDataUrl,
      alreadySavedId: report.id,
      userNotes: report.userNotes,
      location: report.location,
    });
  };

  const handleSavedReportUpdated = () => {
    const list = getSavedReports();
    setSavedReports(list);
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-950/3 text-stone-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedReports.length}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasCustomKey={hasCustomKey}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === 'scanner' && (
          <ImageScanner
            onPlantIdentified={handlePlantIdentified}
            onSelectSamplePlant={handleSelectSample}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
          />
        )}

        {activeTab === 'library' && (
          <IraqiPlantLibrary onSelectPlant={handleSelectSample} />
        )}

        {activeTab === 'saved' && (
          <SavedReportsView
            reports={savedReports}
            onReportsChange={setSavedReports}
            onOpenReport={handleOpenSavedReport}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}
      </main>

      {/* Detailed Plant Report Modal */}
      {activeModalData && (
        <PlantReportModal
          plant={activeModalData.plant}
          imageDataUrl={activeModalData.imageDataUrl}
          alreadySavedId={activeModalData.alreadySavedId}
          initialNotes={activeModalData.userNotes}
          initialLocation={activeModalData.location}
          onClose={() => setActiveModalData(null)}
          onSaved={handleSavedReportUpdated}
        />
      )}

      {/* Gemini API Key Management Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyChange={(k) => setHasCustomKey(Boolean(k))}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-8 px-4 text-center text-xs text-stone-600 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="font-bold text-stone-800">نباتاتي - كاشف ودليل النباتات العراقي</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="text-stone-600 hover:text-emerald-700 transition underline underline-offset-2 flex items-center gap-1"
            >
              <span>إدارة مفتاح Gemini API</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              التقارير محفوظة محلياً في جهازك 100%
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              تصدير Word و PDF فوري
            </span>
          </div>

          <div className="text-stone-600">
            صُمم لخدمة البستانيين وعشاق النباتات في العراق والوطن العربي
          </div>
        </div>
      </footer>
    </div>
  );
}
