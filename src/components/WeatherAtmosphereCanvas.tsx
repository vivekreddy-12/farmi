import React, { useEffect, useRef } from 'react';

interface WeatherAtmosphereCanvasProps {
  condition?: string;
  isInteractive?: boolean;
}

interface AtmosphericParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  type: 'pollen' | 'mist' | 'sunbeam';
}

export function WeatherAtmosphereCanvas({
  isInteractive = true,
}: WeatherAtmosphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: AtmosphericParticle[] = [];

    // Initialize atmospheric floating dust/pollen & moisture mist
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 0.4 + 0.2, // Gentle horizontal wind drift
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.4 + 0.1,
        maxAlpha: Math.random() * 0.5 + 0.2,
        life: Math.random() * 100,
        type: Math.random() > 0.4 ? 'mist' : 'pollen',
      });
    }

    let sunAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Realistic Moving Sun Ray Caustic Beam
      sunAngle += 0.008;
      const sunX = width * 0.85 + Math.sin(sunAngle) * 20;
      const sunY = -20 + Math.cos(sunAngle) * 10;

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, width * 0.9);
      sunGlow.addColorStop(0, 'rgba(255, 245, 200, 0.18)');
      sunGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Wind Flow & Atmospheric Dust Simulation
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy + Math.sin(p.life * 0.05) * 0.15; // Natural turbulence
        p.life += 0.5;

        // Wrap around screen
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.y < -10) p.y = height + 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.type === 'pollen') {
          ctx.fillStyle = `rgba(234, 179, 8, ${p.alpha * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
        }
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Interactive spray / wind gust on pointer interaction
    const onPointerMove = (e: MouseEvent) => {
      if (!isInteractive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (mx >= 0 && mx <= width && my >= 0 && my <= height) {
        if (particles.length < 50 && Math.random() > 0.6) {
          particles.push({
            x: mx,
            y: my,
            vx: (Math.random() - 0.2) * 1.5,
            vy: (Math.random() - 0.5) * 1.2,
            size: Math.random() * 1.8 + 0.8,
            alpha: 0.7,
            maxAlpha: 0.7,
            life: 0,
            type: 'mist',
          });
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      cancelAnimationFrame(animId);
    };
  }, [isInteractive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full rounded-[inherit] overflow-hidden"
    />
  );
}
