import { useEffect, useRef } from "react";

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'circle' | 'triangle' | 'square';
  color: string;
}

interface FloatingElementsProps {
  count?: number;
  speed?: number;
  className?: string;
}

export default function FloatingElements({ 
  count = 20, 
  speed = 0.3,
  className = ""
}: FloatingElementsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"];
    const types: ('circle' | 'triangle' | 'square')[] = ['circle', 'triangle', 'square'];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createElements = () => {
      const elements: FloatingElement[] = [];
      
      for (let i = 0; i < count; i++) {
        elements.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 20 + 10,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.3 + 0.1,
          type: types[Math.floor(Math.random() * types.length)],
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      elementsRef.current = elements;
    };

    const drawCircle = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      ctx.beginPath();
      ctx.arc(element.x, element.y, element.size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTriangle = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const size = element.size / 2;
      ctx.save();
      ctx.translate(element.x, element.y);
      ctx.rotate(element.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size * 0.866, size * 0.5);
      ctx.lineTo(size * 0.866, size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSquare = (ctx: CanvasRenderingContext2D, element: FloatingElement) => {
      const size = element.size / 2;
      ctx.save();
      ctx.translate(element.x, element.y);
      ctx.rotate(element.rotation);
      ctx.fillRect(-size, -size, size * 2, size * 2);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      elementsRef.current.forEach((element) => {
        // Update position
        element.x += element.speedX;
        element.y += element.speedY;
        element.rotation += element.rotationSpeed;
        
        // Wrap around edges
        if (element.x < -element.size) element.x = canvas.width + element.size;
        if (element.x > canvas.width + element.size) element.x = -element.size;
        if (element.y < -element.size) element.y = canvas.height + element.size;
        if (element.y > canvas.height + element.size) element.y = -element.size;
        
        // Set style
        ctx.fillStyle = `${element.color}${Math.floor(element.opacity * 255).toString(16).padStart(2, '0')}`;
        
        // Draw based on type
        switch (element.type) {
          case 'circle':
            drawCircle(ctx, element);
            break;
          case 'triangle':
            drawTriangle(ctx, element);
            break;
          case 'square':
            drawSquare(ctx, element);
            break;
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createElements();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createElements();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [count, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: "transparent", opacity: 0.6 }}
    />
  );
}
