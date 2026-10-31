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
    if (key && key.trim()) {
      localStorage.setItem(API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

export function removeCustomApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
}

export async function testApiKeyValidity(key: string): Promise<{ valid: boolean; error?: string }> {
  if (!key || !key.trim()) {
    return { valid: false, error: 'يرجى كتابة أو لصق المفتاح أولاً' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key.trim()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'قل كلمة: جاهز' }] }]
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || 'المفتاح غير صالح أو منتهي الصلاحية';
      return { valid: false, error: msg };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || 'تعذر الاتصال بخوادم Google Gemini' };
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

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
    const errorMessage = err?.error?.message || '';
    if (res.status === 400 || res.status === 403 || errorMessage.toLowerCase().includes('api key')) {
      throw new Error(`مفتاح Gemini API المدخل غير صالح أو انتهت صلاحيته (${res.status}). يرجى مسح المفتاح وإدخال مفتاح جديد.`);
    }
    throw new Error(errorMessage || 'فشل الاتصال بـ Gemini API. تأكد من صحة المفتاح.');
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('لم يتم استلام رد من النموذج');
  }

  return JSON.parse(text);
}
