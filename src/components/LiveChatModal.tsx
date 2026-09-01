import React, { useState, useRef, useEffect } from 'react';
import { SUPPORT_AVATAR } from '../data/mockData';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderProduct?: (productName: string) => void;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello Alex! I am Dr. Morgan, your FertilizerPro agronomy specialist. How can I help optimize your crop nutrition and soil yields today?',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'When should I top-dress Urea on Rice?',
    'How to prevent blossom end rot in Tomatoes?',
    'What NPK ratio is best for Sowing Wheat?',
    'How do I interpret high soil pH (7.8)?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "That is a great agronomic question! Based on typical Midwest soil profiles and standard crop recommendations:";
      
      const lower = text.toLowerCase();
      if (lower.includes('rice') || lower.includes('urea')) {
        botResponse = "For Rice (Oryza sativa), apply Basal NPK (15:15:15) during puddling, then top-dress Urea (46-0-0) at 50-60 lbs/acre during the active tillering stage (15-25 days post-transplanting). Maintain a 2-3 inch water layer for optimal urea dissolution.";
      } else if (lower.includes('tomato') || lower.includes('rot') || lower.includes('calcium')) {
        botResponse = "Blossom end rot in tomatoes is caused by localized calcium deficiency during rapid fruit cell expansion. We recommend foliar applications of Bio-Calcium booster combined with uniform drip irrigation to prevent moisture fluctuations.";
      } else if (lower.includes('wheat') || lower.includes('dap')) {
        botResponse = "For Wheat, apply DAP (Diammonium Phosphate 18-46-0) at sowing right beside/below the seed drill for strong crown root anchoring. Follow up with Urea top-dressing at the Crown Root Initiation (CRI) and Booting stages for higher grain protein.";
      } else if (lower.includes('ph') || lower.includes('soil')) {
        botResponse = "At pH 7.8, phosphorus and micronutrients like Zinc and Iron tend to bind to calcium carbonate and become unavailable. Consider banding ammonium-based fertilizers and using chelated micronutrient sprays.";
      } else {
        botResponse = "I have logged your request. For tailored prescription application rates on your acreage, you can also book a 1-on-1 soil consultation from our Support tab or order our certified NPK blends directly!";
      }

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-lg h-[600px] max-h-[90vh] shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col text-[#F1F5F2]">
        {/* Chat Header */}
        <div className="p-4 bg-[#16241A] text-[#F1F5F2] flex justify-between items-center shrink-0 border-b-2 border-[#1E2E21]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={SUPPORT_AVATAR}
                alt="Dr. Morgan"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#84CC16]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#84CC16] border-2 border-[#111A13] rounded-full" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-sm font-extrabold text-[#F1F5F2]">
                Dr. Morgan • Senior Agronomist
              </h3>
              <p className="text-[11px] text-[#9CAFA0] font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] animate-pulse" />
                24/7 Field Support Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-[#16241A] p-2.5 border-b-2 border-[#1E2E21] flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] bg-[#111A13] hover:bg-[#84CC16] hover:text-[#0B110D] px-3 py-1.5 rounded-full border-2 border-[#1E2E21] whitespace-nowrap shrink-0 transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="p-4 overflow-y-auto flex-grow space-y-3 bg-[#0B110D]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed border-2 ${
                  m.sender === 'user'
                    ? 'bg-[#84CC16] text-[#0B110D] border-[#84CC16] rounded-br-none font-bold'
                    : 'bg-[#16241A] text-[#F1F5F2] border-[#1E2E21] rounded-bl-none font-medium'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] font-bold text-[#9CAFA0] mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 bg-[#16241A] text-[#84CC16] p-3 rounded-2xl w-24 border-2 border-[#1E2E21] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-[#16241A] border-t-2 border-[#1E2E21] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about fertilizer timing, dosages, or symptoms..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-grow bg-[#111A13] border-2 border-[#1E2E21] rounded-xl px-4 py-2.5 text-xs text-[#F1F5F2] font-bold outline-none focus:border-[#84CC16] transition-colors placeholder:text-[#9CAFA0]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="bg-[#84CC16] text-[#0B110D] disabled:opacity-50 p-2.5 rounded-xl hover:bg-[#99E321] transition-colors active:scale-95 shrink-0 border-2 border-[#84CC16]"
          >
            <span className="material-symbols-outlined text-[20px] block font-bold">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
