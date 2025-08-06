import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ParticleSystem, setupLights, createResponsiveCamera, handleResize } from "@/lib/three-helpers";

interface EnhancedParticlesProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  interactive?: boolean;
}

export default function EnhancedParticles({ 
  className = "", 
  particleCount = 100,
  colors = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"],
  interactive = true
}: EnhancedParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const particleSystemRef = useRef<ParticleSystem>();
  const animationIdRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = createResponsiveCamera(container.clientWidth / container.clientHeight);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Setup lights
    setupLights(scene);

    // Create particle system
    const particleSystem = new ParticleSystem({
      count: particleCount,
      size: { min: 1, max: 4 },
      speed: { min: 0.1, max: 0.5 },
      colors,
      opacity: { min: 0.3, max: 0.8 }
    });

    scene.add(particleSystem.getMesh());

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    particleSystemRef.current = particleSystem;

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const deltaTime = clock.getDelta();
      
      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      if (interactive && cameraRef.current) {
        // Smooth camera movement based on mouse position
        cameraRef.current.position.x += (mouseRef.current.x * 2 - cameraRef.current.position.x) * 0.02;
        cameraRef.current.position.y += (mouseRef.current.y * 2 - cameraRef.current.position.y) * 0.02;
        cameraRef.current.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (cameraRef.current && rendererRef.current) {
        handleResize(cameraRef.current, rendererRef.current, container);
      }
    });

    resizeObserver.observe(container);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      resizeObserver.disconnect();
      
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [particleCount, colors, interactive]);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
