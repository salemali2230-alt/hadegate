import { PlantData } from '../types/plant';

const API_KEY_STORAGE = 'nabatati_custom_gemini_key';

export function getCustomApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setCustomApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

export async function identifyPlantDirectClient(
  imageBase64: string,
  apiKey: string,
  userNote?: string
): Promise<PlantData> {
  const cleanBase64 = imageBase64.includes(';base64,')
    ? imageBase64.split(';base64,')[1]
    : imageBase64;
  const mime = imageBase64.includes('data:image/png') ? 'image/png' : 'image/jpeg';

  const systemPrompt = `أنت خبير نباتي وبستاني عربي متخصص في النباتات العراقية والعربية والعالمية.
مهمتك: فحص صورة النبات وتحديد نوعه باللغة العربية بدقة، وإعطاء التسمية المحلية بالعراقي (الاسم العراقي الدارج مثل رازقي، نبق، ورد جوري، ياس، قلمطوز، دفلة، عين البزون، نازناز، ديدونيا، شب الليل، نخلة برحي، خبازي، فلفل كاذب، كاردينيا، الخ)، وإذا لم يتوفر اسم عراقي مخصص، اذكر التسمية الدارجة في مشاتل العراق أو اكتب بوضوح أنه معروف باسمه العربي الشائع.
املأ جدول الرعاية ومواعيد الزراعة والتسميد والري وظروف المناخ العراقي بدقة بنسق JSON التالي فقط:
{
  "isPlant": true,
  "commonNameArabic": "...",
  "iraqiLocalName": "...",
  "iraqiNameExplanation": "...",
  "scientificName": "...",
  "family": "...",
  "category": "...",
  "description": "...",
  "confidenceScore": 95,
  "partIdentified": "...",
  "careTable": {
    "plantingSeason": "...",
    "fertilization": "...",
    "watering": "...",
    "sunlight": "...",
    "soilType": "...",
    "temperatureAndClimate": "...",
    "propagation": "...",
    "pruning": "...",
    "toxicity": "..."
  },
  "dailyCareTips": ["...", "..."],
  "iraqiClimateAdvice": ["...", "..."],
  "commonPestsAndDiseases": [{"issue": "...", "symptoms": "...", "treatment": "..."}],
  "gardenUses": "..."
}`;

  const promptText = `يرجى فحص صورة هذا النبات وإرجاع النتيجة بتنسيق JSON الصارم كما هو محدد.
${userNote ? `ملاحظة إضافية: "${userNote}"` : ''}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mime,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'فشل الاتصال بـ Gemini API. تأكد من صحة المفتاح.');
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('لم يتم استلام رد من النموذج');
  }

  return JSON.parse(text);
}
