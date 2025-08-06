import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
}

interface ParticleSystemProps {
  count?: number;
  speed?: number;
  size?: { min: number; max: number };
  colors?: string[];
  className?: string;
}

export default function ParticleSystem({ 
  count = 50, 
  speed = 0.5, 
  size = { min: 1, max: 3 },
  colors = ["#6366F1", "#8B5CF6", "#EC4899"],
  className = ""
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 1000,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          vz: (Math.random() - 0.5) * speed,
          size: Math.random() * (size.max - size.min) + size.min,
          opacity: Math.random() * 0.7 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0) particle.z = 1000;
        if (particle.z > 1000) particle.z = 0;
        
        // Calculate perspective
        const perspective = 1000 / (1000 - particle.z);
        const projectedX = particle.x * perspective;
        const projectedY = particle.y * perspective;
        const projectedSize = particle.size * perspective;
        
        // Create gradient based on depth
        const gradient = ctx.createRadialGradient(
          projectedX, projectedY, 0,
          projectedX, projectedY, projectedSize
        );
        
        const alpha = particle.opacity * (particle.z / 1000);
        gradient.addColorStop(0, `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${particle.color}00`);
        
        // Draw particle
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, projectedSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [count, speed, size, colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
