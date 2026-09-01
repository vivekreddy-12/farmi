import React, { useState } from 'react';
import { FAQItem, ConsultationBooking } from '../types';
import { SUPPORT_CENTER_IMG } from '../data/mockData';

interface SupportScreenProps {
  faqs: FAQItem[];
  onOpenLiveChat: () => void;
  onBookConsultation: (booking: Omit<ConsultationBooking, 'id' | 'status'>) => void;
  onOpenApplicationGuides: () => void;
  onOpenVideoTutorials: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({
  faqs,
  onOpenLiveChat,
  onBookConsultation,
  onOpenApplicationGuides,
  onOpenVideoTutorials,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Soil Analysis Interpretation');
  const [preferredDate, setPreferredDate] = useState('');
  const [acreage, setAcreage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !preferredDate) return;

    onBookConsultation({
      fullName,
      email,
      topic,
      preferredDate,
      acreage,
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFullName('');
      setEmail('');
      setPreferredDate('');
      setAcreage('');
      setFormSubmitted(false);
    }, 4000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <main className="max-w-7xl mx-auto px-5 py-8 flex flex-col gap-6 pb-24 md:pb-12">
      {/* Hero Section */}
      <section className="bg-[#111A13]/90 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center border-2 border-[#1E2E21] shadow-sm relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 bg-cover bg-center mix-blend-screen"
          style={{ backgroundImage: `url('/src/assets/images/dark_farm_field_1788272012797.jpg')` }}
        />

        <div className="relative z-10 flex-1 flex flex-col gap-4">
          <div className="inline-block bg-[#84CC16] text-[#0B110D] text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit">
            Expert Advisory
          </div>
          <h1 className="font-['Space_Grotesk',sans-serif] text-3xl md:text-4xl font-extrabold text-[#F1F5F2] leading-tight tracking-tight">
            How can we help your crop thrive?
          </h1>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-base text-[#9CAFA0] leading-relaxed font-medium">
            Our certified agricultural agronomists are available 24/7 to assist with soil chemistry, spreader calibrations, and nutritional diagnostics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              className="flex items-center justify-center gap-2 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold h-12 rounded-lg px-6 hover:bg-[#99E321] border-2 border-[#84CC16] transition-colors active:scale-95 shadow-sm"
              href="tel:9391216686"
            >
              <span className="material-symbols-outlined text-[18px] fill font-bold">
                phone_in_talk
              </span>
              Direct Hotline: 9391216686
            </a>
            <button
              onClick={onOpenLiveChat}
              className="flex items-center justify-center gap-2 border-2 border-[#1E2E21] bg-[#16241A] text-[#F1F5F2] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-wider font-extrabold h-12 rounded-lg px-6 hover:border-[#84CC16] hover:text-[#84CC16] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Live Agronomist Chat
            </button>
          </div>
        </div>

        {/* Support Center Image with Active Badge */}
        <div className="relative z-10 flex-1 w-full md:w-auto h-64 rounded-xl overflow-hidden relative border-2 border-[#1E2E21] shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt="farmin Agricultural Support Center"
            src={SUPPORT_CENTER_IMG}
          />
          <div className="absolute bottom-4 left-4 bg-[#111A13]/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2.5 border-2 border-[#1E2E21] shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84CC16] animate-soft-pulse shrink-0" />
            <span className="font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider text-[#84CC16]">
              24/7 Dispatch Active
            </span>
          </div>
        </div>
      </section>

      {/* Grid Layout: Consultation Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book a Consultation Form */}
        <section className="lg:col-span-1 bg-[#111A13] rounded-xl p-6 border-2 border-[#1E2E21] shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] border-b-2 border-[#1E2E21] pb-2 inline-block">
              Book a Consultation
            </h2>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] mt-1.5 font-medium">
              Schedule a dedicated 1-on-1 session with our soil scientists.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-[#16241A] border-2 border-[#84CC16] rounded-lg p-5 text-center my-4 space-y-2 animate-fade-in-up">
              <span className="material-symbols-outlined text-4xl text-[#84CC16]">
                check_circle
              </span>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
                Session Confirmed!
              </h3>
              <p className="text-xs text-[#9CAFA0] font-medium">
                An agronomist has been assigned for {preferredDate || 'your scheduled date'}. A confirmation email was sent to {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitConsultation} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider text-[#84CC16]" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="bg-[#16241A] border-2 border-[#1E2E21] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold px-3 py-2 rounded-lg h-11 transition-colors outline-none focus:border-[#84CC16]"
                  id="name"
                  required
                  placeholder="e.g. Alex Miller"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider text-[#84CC16]" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="bg-[#16241A] border-2 border-[#1E2E21] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold px-3 py-2 rounded-lg h-11 transition-colors outline-none focus:border-[#84CC16]"
                  id="email"
                  required
                  placeholder="alex@farmcorp.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider text-[#84CC16]" htmlFor="topic">
                  Consultation Topic
                </label>
                <select
                  className="bg-[#16241A] border-2 border-[#1E2E21] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold px-3 py-2 rounded-lg h-11 transition-colors outline-none cursor-pointer focus:border-[#84CC16]"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option className="bg-[#111A13] text-[#F1F5F2]">Soil Analysis Interpretation</option>
                  <option className="bg-[#111A13] text-[#F1F5F2]">Fertilizer Application Rates</option>
                  <option className="bg-[#111A13] text-[#F1F5F2]">Crop-Specific Recommendations</option>
                  <option className="bg-[#111A13] text-[#F1F5F2]">Troubleshooting Deficiencies</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider text-[#84CC16]" htmlFor="date">
                  Preferred Date
                </label>
                <input
                  className="bg-[#16241A] border-2 border-[#1E2E21] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold px-3 py-2 rounded-lg h-11 transition-colors outline-none cursor-pointer focus:border-[#84CC16]"
                  id="date"
                  required
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-['Space_Grotesk',sans-serif] text-xs font-bold uppercase tracking-wider text-[#84CC16]" htmlFor="acreage">
                  Field Acreage (Optional)
                </label>
                <input
                  className="bg-[#16241A] border-2 border-[#1E2E21] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold px-3 py-2 rounded-lg h-11 transition-colors outline-none focus:border-[#84CC16]"
                  id="acreage"
                  placeholder="e.g. 50 Acres"
                  type="text"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                />
              </div>

              <button
                className="mt-2 bg-[#84CC16] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-extrabold h-12 rounded-lg flex items-center justify-center hover:bg-[#99E321] border-2 border-[#84CC16] transition-colors active:scale-95 shadow-sm"
                type="submit"
              >
                Schedule Session →
              </button>
            </form>
          )}
        </section>

        {/* FAQs & Resource Bento */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          {/* FAQs Container */}
          <div className="bg-[#111A13] rounded-xl p-6 border-2 border-[#1E2E21] shadow-sm">
            <h2 className="font-['Space_Grotesk',sans-serif] text-xl font-extrabold text-[#F1F5F2] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#84CC16] fill text-[24px]">
                help
              </span>
              Frequently Asked Questions
            </h2>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border-2 border-[#1E2E21] rounded-lg overflow-hidden transition-colors"
                  >
                    <button
                      className="w-full text-left px-4 py-3.5 bg-[#16241A] hover:bg-[#1A2E20] transition-colors flex justify-between items-center gap-2"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="font-['Space_Grotesk',sans-serif] text-sm font-bold text-[#F1F5F2]">
                        {faq.question}
                      </span>
                      <span className="material-symbols-outlined text-[#84CC16] shrink-0 font-bold">
                        {isOpen ? 'remove' : 'add'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3.5 bg-[#111A13] border-t border-[#1E2E21] animate-fade-in-up">
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm text-[#9CAFA0] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource Cards Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={onOpenApplicationGuides}
              className="bg-[#111A13] rounded-xl p-5 border-2 border-[#1E2E21] shadow-sm flex flex-col gap-2 hover:border-[#84CC16]/60 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#16241A] border border-[#1E2E21] rounded-lg flex items-center justify-center text-[#84CC16] group-hover:border-[#84CC16] transition-colors">
                <span className="material-symbols-outlined text-[22px]">menu_book</span>
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2] group-hover:text-[#84CC16] transition-colors">
                Application Guides
              </h3>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] leading-relaxed font-medium">
                Step-by-step spray dilution charts, spreader calibration, and timing manuals for specific crops.
              </p>
            </div>

            <div
              onClick={onOpenVideoTutorials}
              className="bg-[#111A13] rounded-xl p-5 border-2 border-[#1E2E21] shadow-sm flex flex-col gap-2 hover:border-[#84CC16]/60 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#16241A] border border-[#1E2E21] rounded-lg flex items-center justify-center text-[#84CC16] group-hover:border-[#84CC16] transition-colors">
                <span className="material-symbols-outlined text-[22px]">video_library</span>
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2] group-hover:text-[#84CC16] transition-colors">
                Video Tutorials
              </h3>
              <p className="font-['Plus_Jakarta_Sans',sans-serif] text-xs text-[#9CAFA0] leading-relaxed font-medium">
                Watch our certified agronomists demonstrate soil sampling, pH testing, and precision broadcasting.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
