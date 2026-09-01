import React, { useRef, useState } from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  glareOpacity?: number;
  className?: string;
  enableTilt?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 8,
  glareOpacity = 0.15,
  className = '',
  enableTilt = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: 'transform 0.1s ease-out',
    });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setGlareStyle({
      opacity: glareOpacity,
      background: `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.8), transparent 70%)`,
      transition: 'opacity 0.2s ease',
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.4s ease',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`relative transform-gpu will-change-transform ${className}`}
      {...props}
    >
      {children}
      {/* Specular Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden mix-blend-overlay z-10"
        style={glareStyle}
      />
    </div>
  );
}
