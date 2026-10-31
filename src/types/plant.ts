export interface CareTable {
  plantingSeason: string;
  fertilization: string;
  watering: string;
  sunlight: string;
  soilType: string;
  temperatureAndClimate: string;
  propagation: string;
  pruning: string;
  toxicity: string;
}

export interface PestIssue {
  issue: string;
  symptoms: string;
  treatment: string;
}

export interface PlantData {
  isPlant: boolean;
  commonNameArabic: string;
  iraqiLocalName: string;
  iraqiNameExplanation: string;
  scientificName: string;
  family: string;
  category: string;
  description: string;
  confidenceScore: number;
  partIdentified: string;
  careTable: CareTable;
  dailyCareTips: string[];
  iraqiClimateAdvice: string[];
  commonPestsAndDiseases: PestIssue[];
  gardenUses: string;
}

export interface SavedPlantReport {
  id: string;
  createdAt: string;
  imageDataUrl: string;
  plantData: PlantData;
  userNotes?: string;
  location?: string;
}
