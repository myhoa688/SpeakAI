import React, { useEffect, useRef } from 'react';

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  angle: number;
  angularVelocity: number;
  distance: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track mouse position
  const mouse = useRef({ x: -1000, y: -1000, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(window.innerWidth / 5, 200); 
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < numParticles; i++) {
        const distance = Math.random() * (window.innerWidth / 1.5);
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        particles.push({
          x, y,
          baseX: x, baseY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2.5 + 0.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          angle: angle,
          angularVelocity: (Math.random() - 0.5) * 0.002,
          distance: distance
        });
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // Normal drift
        p.angle += p.angularVelocity;
        p.distance += Math.sin(p.angle) * 0.2;
        p.x += p.vx;
        p.y += p.vy;

        // --- MOUSE INTERACTION (ANTIGRAVITY REPULSION) ---
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.current.radius) {
          // Push particles away from the mouse
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.current.radius - distance) / mouse.current.radius;
          const directionX = forceDirectionX * force * 5; // Độ mạnh lực đẩy
          const directionY = forceDirectionY * force * 5;

          p.x -= directionX;
          p.y -= directionY;
        }

        // --- DRAW PARTICLES ---
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.closePath();

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.8
        // Remove pointerEvents: 'none' so canvas can capture mouse events if needed, 
        // though document-level listener also works.
      }}
    />
  );
};
