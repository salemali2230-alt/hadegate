import { SavedPlantReport, PlantData } from '../types/plant';
import { SAMPLE_IRAQI_PLANTS } from '../data/samplePlants';

const STORAGE_KEY = 'nabatati_saved_reports_v1';

export function getSavedReports(): SavedPlantReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with two starter Iraqi plants as default archived reports so the user can immediately experience the history feature
      const initial: SavedPlantReport[] = [
        {
          id: 'init-raziqi-1',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          imageDataUrl: SAMPLE_IRAQI_PLANTS[0].image,
          plantData: SAMPLE_IRAQI_PLANTS[0].data,
          userNotes: 'نبتة الرازقي في سندانة الباحة الخلفية - سقي يومي صباحاً ورش أوراق مسائي',
          location: 'بغداد - الكرادة',
        },
        {
          id: 'init-nabq-2',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          imageDataUrl: SAMPLE_IRAQI_PLANTS[1].image,
          plantData: SAMPLE_IRAQI_PLANTS[1].data,
          userNotes: 'شجرة سدر كنار تفاحي في حديقة البيت، تم التكريب وإضافة السماد العضوي',
          location: 'البصرة',
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read saved reports:', e);
    return [];
  }
}

export function saveReport(plantData: PlantData, imageDataUrl: string, userNotes = '', location = ''): SavedPlantReport {
  const current = getSavedReports();
  const newReport: SavedPlantReport = {
    id: 'report_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    imageDataUrl,
    plantData,
    userNotes,
    location,
  };

  const updated = [newReport, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return newReport;
}

export function deleteReport(id: string): SavedPlantReport[] {
  const current = getSavedReports();
  const filtered = current.filter(r => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to update localStorage:', e);
  }
  return filtered;
}

export function updateReportNotes(id: string, notes: string, location?: string): SavedPlantReport[] {
  const current = getSavedReports();
  const updated = current.map(r => {
    if (r.id === id) {
      return {
        ...r,
        userNotes: notes,
        location: location !== undefined ? location : r.location
      };
    }
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update notes:', e);
  }
  return updated;
}
