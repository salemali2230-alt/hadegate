import { PlantData } from '../types/plant';

/**
 * Generates and downloads a rich Microsoft Word document (.doc) with complete Arabic RTL formatting,
 * embedded image thumbnail, styled botanical tables, and daily care tips.
 */
export function exportToWord(plant: PlantData, imageBase64OrUrl: string) {
  const fileName = `${plant.iraqiLocalName || plant.commonNameArabic}_تقرير_نباتاتي.doc`.replace(/[/\\?%*:|"<>]/g, '-');

  const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${plant.commonNameArabic} - تقرير العناية بالنبات</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      text-align: right;
      background-color: #ffffff;
      color: #1f2937;
      margin: 20px;
    }
    .header-box {
      border-bottom: 3px solid #059669;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .badge-iraqi {
      display: inline-block;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #10b981;
      padding: 6px 14px;
      font-size: 14pt;
      font-weight: bold;
      border-radius: 6px;
      margin-top: 8px;
    }
    .plant-title {
      color: #065f46;
      font-size: 24pt;
      font-weight: bold;
      margin: 0 0 5px 0;
    }
    .scientific {
      font-style: italic;
      color: #4b5563;
      font-size: 13pt;
      direction: ltr;
      display: inline-block;
    }
    .image-container {
      margin: 15px 0;
      text-align: center;
    }
    .plant-img {
      max-width: 420px;
      max-height: 320px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }
    .section-title {
      font-size: 15pt;
      font-weight: bold;
      color: #047857;
      border-right: 5px solid #059669;
      padding-right: 10px;
      margin: 20px 0 10px 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      direction: rtl;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #d1d5db;
      padding: 10px 14px;
      text-align: right;
      font-size: 11pt;
    }
    table.data-table th {
      background-color: #f0fdf4;
      color: #064e3b;
      font-weight: bold;
      width: 25%;
    }
    table.data-table td {
      background-color: #ffffff;
      color: #1f2937;
    }
    ul.tips-list {
      margin: 10px 0;
      padding-right: 25px;
    }
    ul.tips-list li {
      font-size: 11pt;
      line-height: 1.6;
      margin-bottom: 8px;
      color: #374151;
    }
    .climate-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 12px 18px;
      margin: 15px 0;
    }
    .footer {
      margin-top: 35px;
      border-top: 1px solid #e5e7eb;
      padding-top: 10px;
      font-size: 9pt;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div style="font-size: 10pt; color: #059669; font-weight: bold;">نباتاتي - كاشف ودليل النباتات العراقي الشامل</div>
    <h1 class="plant-title">${plant.commonNameArabic}</h1>
    <div>
      <span class="badge-iraqi">🇮🇶 التسمية المحلية بالعراقي: ${plant.iraqiLocalName || 'نفس الاسم الشائع'}</span>
    </div>
    <div style="margin-top: 8px;">
      <strong>الاسم العلمي:</strong> <span class="scientific">${plant.scientificName}</span> | 
      <strong>الفصيلة:</strong> ${plant.family} | 
      <strong>التصنيف:</strong> ${plant.category}
    </div>
  </div>

  ${plant.iraqiNameExplanation ? `
  <div class="climate-box" style="background-color: #ecfdf5; border-color: #a7f3d0;">
    <strong style="color: #065f46;">المكانة في الحدائق والتراث العراقي:</strong>
    <p style="margin: 5px 0 0 0; color: #047857; font-size: 11pt;">${plant.iraqiNameExplanation}</p>
  </div>
  ` : ''}

  ${imageBase64OrUrl ? `
  <div class="image-container">
    <img src="${imageBase64OrUrl}" alt="${plant.commonNameArabic}" class="plant-img" />
  </div>
  ` : ''}

  <div class="section-title">نبذة وتعريف بالنبات</div>
  <p style="font-size: 11pt; line-height: 1.6; color: #374151;">${plant.description}</p>

  <div class="section-title">جدول بيانات ورعاية النبات</div>
  <table class="data-table">
    <tr>
      <th>موعد الزراعة والشتل</th>
      <td>${plant.careTable.plantingSeason}</td>
    </tr>
    <tr>
      <th>التسميد والمغذيات</th>
      <td>${plant.careTable.fertilization}</td>
    </tr>
    <tr>
      <th>جدول السقاية والري</th>
      <td>${plant.careTable.watering}</td>
    </tr>
    <tr>
      <th>متطلبات الشمس والإضاءة</th>
      <td>${plant.careTable.sunlight}</td>
    </tr>
    <tr>
      <th>نوع التربة وتصريفها</th>
      <td>${plant.careTable.soilType}</td>
    </tr>
    <tr>
      <th>تحمل درجات الحرارة والمناخ</th>
      <td>${plant.careTable.temperatureAndClimate}</td>
    </tr>
    <tr>
      <th>طرق الإكثار</th>
      <td>${plant.careTable.propagation}</td>
    </tr>
    <tr>
      <th>موعد وطريقة التقليم</th>
      <td>${plant.careTable.pruning}</td>
    </tr>
    <tr>
      <th>درجة السمية</th>
      <td>${plant.careTable.toxicity}</td>
    </tr>
    <tr>
      <th>الاستخدامات المفضلة</th>
      <td>${plant.gardenUses || 'الحدائق المنزلية والسنادين'}</td>
    </tr>
  </table>

  <div class="section-title">نصائح العناية اليومية والأسبوعية</div>
  <ul class="tips-list">
    ${plant.dailyCareTips.map(tip => `<li>${tip}</li>`).join('')}
  </ul>

  ${plant.iraqiClimateAdvice && plant.iraqiClimateAdvice.length > 0 ? `
  <div class="section-title">إرشادات خاصة بالصيف والمناخ في العراق</div>
  <div class="climate-box">
    <ul class="tips-list" style="margin: 0; padding-right: 20px;">
      ${plant.iraqiClimateAdvice.map(advice => `<li style="color: #92400e;">${advice}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${plant.commonPestsAndDiseases && plant.commonPestsAndDiseases.length > 0 ? `
  <div class="section-title">الآفات والمشاكل الشائعة والوقاية منها</div>
  <table class="data-table">
    <thead>
      <tr style="background-color: #fef2f2;">
        <th style="color: #991b1b; width: 30%;">المشكلة / الآفة</th>
        <th style="color: #991b1b; width: 35%;">الأعراض الملاحظة</th>
        <th style="color: #991b1b; width: 35%;">العلاج والوقاية</th>
      </tr>
    </thead>
    <tbody>
      ${plant.commonPestsAndDiseases.map(pest => `
        <tr>
          <td><strong>${pest.issue}</strong></td>
          <td>${pest.symptoms}</td>
          <td>${pest.treatment}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    تم استخراج هذا التقرير آلياً بواسطة تطبيق نباتاتي | تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-IQ')}
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Triggers optimized browser PDF printing for the plant report
 */
export function printReportAsPdf() {
  window.print();
}

/**
 * Copies a compact summary of the plant to the user's clipboard
 */
export async function copyPlantSummary(plant: PlantData): Promise<boolean> {
  const summaryText = `🌿 تقرير نباتي: ${plant.commonNameArabic}
🇮🇶 الاسم العراقي: ${plant.iraqiLocalName || 'نفس الاسم الشائع'}
🔬 الاسم العلمي: ${plant.scientificName} (${plant.family})

📅 موعد الزراعة: ${plant.careTable.plantingSeason}
💧 السقاية: ${plant.careTable.watering}
☀️ الإضاءة: ${plant.careTable.sunlight}
🧪 التسميد: ${plant.careTable.fertilization}
🌡️ المناخ: ${plant.careTable.temperatureAndClimate}
✂️ التقليم: ${plant.careTable.pruning}
🌱 الإكثار: ${plant.careTable.propagation}

💡 نصيحة يومية:
${plant.dailyCareTips.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n')}

من تطبيق نباتاتي - دليل النباتات والأسماء العراقية`;

  try {
    await navigator.clipboard.writeText(summaryText);
    return true;
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return false;
  }
}
