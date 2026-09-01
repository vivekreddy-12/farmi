import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../utils/soundEffects';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'nutrient' | 'water' | 'root_absorption';
  alpha: number;
}

export function SoilAbsorptionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [soilMoisture, setSoilMoisture] = useState<number>(65); // 0 - 100%
  const [phLevel, setPhLevel] = useState<number>(6.5); // 4.5 - 8.5
  const [nutrientConcentration, setNutrientConcentration] = useState<number>(75); // 0 - 100%
  const [activeSpray, setActiveSpray] = useState<boolean>(false);

  // Absorption efficiency calculation based on pH & moisture curve
  const calcEfficiency = () => {
    // Ideal pH between 6.0 and 7.0
    const phPenalty = Math.abs(phLevel - 6.5) * 22;
    // Ideal moisture between 50% and 80%
    const moistureFactor = soilMoisture < 30 ? soilMoisture / 30 : soilMoisture > 85 ? (100 - soilMoisture) / 15 : 1;
    const eff = Math.max(15, Math.min(98, (100 - phPenalty) * moistureFactor));
    return Math.round(eff);
  };

  const efficiency = calcEfficiency();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const height = (canvas.height = 200);

    const particles: Particle[] = [];

    // Root central point
    const rootX = width / 2;
    const rootY = height * 0.75;

    const spawnParticles = () => {
      // Spawn nutrient ions (golden yellow / green) and water molecules (blue)
      if (particles.length < 90) {
        const isNutrient = Math.random() > 0.45;
        const startX = Math.random() * width;
        const startY = Math.random() * (height * 0.4);

        particles.push({
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: Math.random() * 0.8 + 0.3 * (soilMoisture / 50),
          radius: isNutrient ? Math.random() * 2.5 + 1.5 : Math.random() * 1.8 + 1,
          color: isNutrient ? '#22c55e' : '#38bdf8',
          type: isNutrient ? 'nutrient' : 'water',
          alpha: 0.8,
        });
      }
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // 1. Draw Soil Layer Gradient with realistic porous texture
      const soilGrad = ctx.createLinearGradient(0, 0, 0, height);
      soilGrad.addColorStop(0, '#1E2C20');
      soilGrad.addColorStop(0.35, '#162218');
      soilGrad.addColorStop(1, '#0D150F');
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Plant Root System (Vascular Tree)
      ctx.strokeStyle = '#84CC16';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      // Taproot
      ctx.beginPath();
      ctx.moveTo(rootX, 0);
      ctx.lineTo(rootX, rootY);

      // Lateral roots
      ctx.moveTo(rootX, rootY * 0.4);
      ctx.quadraticCurveTo(rootX - 45, rootY * 0.55, rootX - 90, rootY * 0.7);

      ctx.moveTo(rootX, rootY * 0.4);
      ctx.quadraticCurveTo(rootX + 45, rootY * 0.55, rootX + 90, rootY * 0.7);

      ctx.moveTo(rootX, rootY * 0.7);
      ctx.quadraticCurveTo(rootX - 35, rootY * 0.85, rootX - 70, rootY);

      ctx.moveTo(rootX, rootY * 0.7);
      ctx.quadraticCurveTo(rootX + 35, rootY * 0.85, rootX + 70, rootY);

      ctx.stroke();

      // Root absorption glow aura
      const aura = ctx.createRadialGradient(rootX, rootY * 0.6, 5, rootX, rootY * 0.6, 90);
      aura.addColorStop(0, `rgba(132, 204, 22, ${0.25 * (efficiency / 100)})`);
      aura.addColorStop(1, 'rgba(132, 204, 22, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(rootX, rootY * 0.6, 90, 0, Math.PI * 2);
      ctx.fill();

      // 3. Update & Draw Absorbing Particles
      spawnParticles();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Particle attraction towards nearest root section
        const dx = rootX - p.x;
        const dy = rootY * 0.65 - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          // Vascular suction pull
          const pull = (0.04 * (efficiency / 100)) / Math.max(0.2, dist * 0.05);
          p.vx += (dx / dist) * pull;
          p.vy += (dy / dist) * pull;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Absorption at root surface
        if (dist < 12) {
          p.alpha -= 0.08;
          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }
        }

        if (p.y > height || p.x < 0 || p.x > width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [soilMoisture, phLevel, nutrientConcentration, efficiency]);

  const handleSprayTrigger = () => {
    sounds.playMist();
    setActiveSpray(true);
    setNutrientConcentration((prev) => Math.min(100, prev + 15));
    setTimeout(() => setActiveSpray(false), 600);
  };

  return (
    <div className="bg-[#111A13] p-4 rounded-xl border-2 border-[#1E2E21] space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider text-[#F1F5F2]">
            Real-Time Root Nutrient Absorption Simulation
          </span>
          <p className="text-[11px] text-[#9CAFA0]">Physically simulated ion uptake & capillary flow</p>
        </div>
        <div className="text-right">
          <span className="font-['Space_Grotesk',sans-serif] text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-[#84CC16] text-[#0B110D]">
            {efficiency}% Uptake Rate
          </span>
        </div>
      </div>

      {/* Physics Canvas */}
      <div className="relative rounded-lg overflow-hidden border-2 border-[#1E2E21] bg-[#0D150F]">
        <canvas ref={canvasRef} className="w-full h-[180px] block" />
        <button
          onClick={handleSprayTrigger}
          className={`absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-md text-[10px] font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider border-2 border-[#84CC16] transition-all active:scale-95 flex items-center gap-1 shadow-sm ${
            activeSpray ? 'bg-[#84CC16] text-[#0B110D]' : 'bg-[#16241A] text-[#84CC16] hover:bg-[#84CC16] hover:text-[#0B110D]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">water_drop</span>
          Trigger Foliar Spray
        </button>
      </div>

      {/* Interactive Agronomic Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
        {/* Soil Moisture */}
        <div className="bg-[#16241A] p-2.5 rounded-lg border border-[#1E2E21]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[10px] uppercase text-[#84CC16]">Moisture:</span>
            <span className="font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2]">{soilMoisture}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            value={soilMoisture}
            onChange={(e) => {
              sounds.playClick(600);
              setSoilMoisture(Number(e.target.value));
            }}
            className="w-full accent-[#84CC16] cursor-pointer"
          />
        </div>

        {/* Soil pH */}
        <div className="bg-[#16241A] p-2.5 rounded-lg border border-[#1E2E21]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[10px] uppercase text-[#84CC16]">Soil pH:</span>
            <span className="font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2]">{phLevel.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="4.5"
            max="8.5"
            step="0.1"
            value={phLevel}
            onChange={(e) => {
              sounds.playClick(750);
              setPhLevel(Number(e.target.value));
            }}
            className="w-full accent-[#84CC16] cursor-pointer"
          />
        </div>

        {/* Nutrient Concentration */}
        <div className="bg-[#16241A] p-2.5 rounded-lg border border-[#1E2E21]">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[10px] uppercase text-[#84CC16]">Nutrient Density:</span>
            <span className="font-['Space_Grotesk',sans-serif] font-black text-[#F1F5F2]">{nutrientConcentration}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={nutrientConcentration}
            onChange={(e) => {
              sounds.playClick(900);
              setNutrientConcentration(Number(e.target.value));
            }}
            className="w-full accent-[#84CC16] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
