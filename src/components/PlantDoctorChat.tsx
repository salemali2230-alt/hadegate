import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { PlantData } from '../types/plant';

interface PlantDoctorChatProps {
  plant: PlantData;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const PlantDoctorChat: React.FC<PlantDoctorChatProps> = ({ plant }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `مرحباً بك! أنا طبيب النباتات. يسعدني الإجابة عن أي استفسار أو مشكلة تواجهك مع نبتة "${plant.iraqiLocalName || plant.commonNameArabic}". يمكنك سؤالي عن أعراض معينة أو جدول الري والتسميد المناسب لمنطقتك.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickQuestions = [
    'كيف أحمي هذا النبات من شمس تموز الحارقة؟',
    'ما سبب اصفرار وتساقط الأوراق؟',
    'ما هو أفضل سماد متوفر في المشاتل العراقية؟',
    'كم مرة أسقيه في الصيف؟'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    setError(null);
    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', text: query }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantContext: plant,
          message: query,
          chatHistory: messages.slice(-6)
        })
      });

      if (!res.ok) {
        throw new Error('حدث خطأ في الرد، يرجى المحاولة لاحقاً');
      }

      const data = await res.json();
      setMessages([...updatedMessages, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'تعذر الاتصال بخبير النباتات حالياً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 mt-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm sm:text-base">استشارة طبيب وخبير النباتات</h4>
            <p className="text-xs text-stone-600">اسأل أي سؤال إضافي عن رعاية هذا النبات في العراق</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          مساعد فوري
        </span>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-1.5 my-3">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition active:scale-95 text-right disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="space-y-3 max-h-72 overflow-y-auto p-2 bg-white rounded-xl border border-stone-200/80 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-start flex-row-reverse' : 'justify-start'}`}
          >
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                m.role === 'user'
                  ? 'bg-stone-800 text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                  : 'bg-stone-50 border border-stone-200/70 text-stone-800 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-600 text-xs py-2 px-3 bg-stone-50 rounded-xl w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>طبيب النباتات يكتب الرد...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-800 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 mt-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اطرح سؤالك هنا (مثلاً: نباتي في أصيص صغير هل أنقله الآن؟)..."
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <span>إرسال</span>
          <Send className="w-3.5 h-3.5 rotate-180" />
        </button>
      </form>
    </div>
  );
};
