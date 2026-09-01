import React, { useState } from 'react';

interface VideoTutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoTutorialsModal: React.FC<VideoTutorialsModalProps> = ({ isOpen, onClose }) => {
  const [playingId, setPlayingId] = useState<number | null>(null);

  if (!isOpen) return null;

  const videos = [
    {
      id: 1,
      title: 'Precision Broadcasting: Calibrating Granular Nitrogen Spreaders',
      duration: '8:45',
      instructor: 'Dr. Morgan, Chief Agronomist',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmwpAb6GYB5LlgaHLQIm44gGQaPfUoatPNz6MTqJivnPswQ0ybUGGdslFlJpckGofYwH9sgO6m8gby6oxlLOMFFnczCPKHoPp7v4MszT0HsxAHsb9hm6_iDkwzz8e9PQQO70pK92I5vV_DMENE9Ld6JLa9r2zuqdaSoLAzgjp02X1Pl8KgsaIHfnnQyKzwJY9V5ScK1CnjExJZ4UdxMB66R-YQYDv1dRqZ8Z0GQen0GSy8LygDAnp1MA',
    },
    {
      id: 2,
      title: 'Rice Tillering Mastery: Shallow Water Urea Top-Dressing Protocol',
      duration: '6:20',
      instructor: 'Elena Vance, Crop Specialist',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfnWnfF3ST7gbZHNG5Mb0hhbVmm7hwRE0_bnEf7qxfLS3TbyveuWaduK0xfsYf9UWSnEgbFQkTuOHi4llQn7JPe0jgl13Ev_qbbqYK5i-Ecud79PB1QfA7yP5dMeDKQ1eOKdJ3OZSbEgBxCOaia_s93IaAHMAdoOMEbyi8YTwIiGTLAhCNjg034Kqzmx11SiFQF9IpbcdsvZ_HnZ1VfJqKwM7pNYdKYt9KKJAY_rKsr0gwoil45dApSw',
    },
    {
      id: 3,
      title: 'Preventing Blossom End Rot: Calcium Chelation Foliar Sprays',
      duration: '11:10',
      instructor: 'Marcus Reed, Greenhouse Director',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC9-UYKZPzko9UNUdTIP-nbmV9tIBgHlapPAzWKwH3i_T75PSV5FvHdeEX4WinQ01cuYwlkGh43SShr66-SGvyp7v-3vXOuUp-U-JPgGK0CYFClDuvqG99A8wtlH0OcR6fNexMxW5oVzCNYP8CZNjcoqbsl15wWOzB4R2OoKs955pMVeOqv9UlJ-XvlxSDynXL5d5SvZWxOClP5miXy0AITzZWSWmXCqJZBeoNmuiKB_t39v_qoNqrsw',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[90vh] text-[#F1F5F2]">
        <div className="p-5 bg-[#16241A] border-b-2 border-[#1E2E21] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#84CC16] text-[#0B110D] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">video_library</span>
            </div>
            <h3 className="font-['Space_Grotesk',sans-serif] text-base font-extrabold text-[#F1F5F2]">
              Agronomy Video Tutorials
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#111A13] text-[#9CAFA0] hover:text-[#F1F5F2] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {playingId ? (
            <div className="bg-[#16241A] rounded-xl p-6 text-[#F1F5F2] text-center space-y-3 border-2 border-[#1E2E21]">
              <div className="w-16 h-16 bg-[#84CC16] text-[#0B110D] rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-3xl font-bold">play_arrow</span>
              </div>
              <h4 className="font-['Space_Grotesk',sans-serif] font-extrabold text-base text-[#F1F5F2]">
                Playing: {videos.find((v) => v.id === playingId)?.title}
              </h4>
              <p className="text-xs text-[#9CAFA0] font-['Plus_Jakarta_Sans',sans-serif]">
                Interactive demo stream loaded. Showing calibrated spreader patterns and application rates.
              </p>
              <button
                onClick={() => setPlayingId(null)}
                className="px-4 py-2 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] font-extrabold uppercase tracking-wider rounded-lg hover:bg-[#99E321] transition-colors"
              >
                Back to Video Library
              </button>
            </div>
          ) : (
            videos.map((v) => (
              <div
                key={v.id}
                onClick={() => setPlayingId(v.id)}
                className="flex flex-col sm:flex-row gap-3 bg-[#16241A] border-2 border-[#1E2E21] rounded-xl overflow-hidden hover:border-[#84CC16] transition-all cursor-pointer shadow-xs group"
              >
                <div className="sm:w-48 h-28 relative bg-[#111A13] shrink-0">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <span className="w-10 h-10 rounded-full bg-[#84CC16] text-[#0B110D] flex items-center justify-center shadow-md border border-[#84CC16]">
                      <span className="material-symbols-outlined text-[20px] font-bold">play_arrow</span>
                    </span>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-[#0B110D] text-[#84CC16] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#1E2E21]">
                    {v.duration}
                  </span>
                </div>
                <div className="p-3 flex flex-col justify-between flex-grow">
                  <div>
                    <h4 className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm text-[#F1F5F2] group-hover:text-[#84CC16] transition-colors line-clamp-2">
                      {v.title}
                    </h4>
                    <span className="text-[11px] text-[#9CAFA0] block mt-1 font-medium">
                      Instructor: {v.instructor}
                    </span>
                  </div>
                  <span className="text-[11px] font-['Space_Grotesk',sans-serif] font-bold text-[#84CC16] flex items-center gap-1 mt-2">
                    Watch Full Tutorial →
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-[#16241A] border-t-2 border-[#1E2E21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#84CC16] text-[#0B110D] text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-extrabold rounded-lg hover:bg-[#99E321] transition-colors border-2 border-[#84CC16]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
