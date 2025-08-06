import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createInteractiveSphere, setupLights, createResponsiveCamera, handleResize } from "@/lib/three-helpers";

interface InteractiveSphereProps {
  className?: string;
  size?: number;
  color?: string;
  wireframe?: boolean;
}

export default function InteractiveSphere({ 
  className = "", 
  size = 1,
  color = "#6366F1",
  wireframe = false
}: InteractiveSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<THREE.Mesh>();
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

    // Create interactive sphere
    const sphere = createInteractiveSphere(size);
    if (wireframe) {
      (sphere.material as THREE.MeshPhongMaterial).wireframe = true;
    }
    (sphere.material as THREE.MeshPhongMaterial).color.setHex(parseInt(color.replace('#', '0x')));
    
    scene.add(sphere);
    sphereRef.current = sphere;

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const deltaTime = clock.getDelta();
      const time = clock.getElapsedTime();
      
      if (sphereRef.current) {
        // Rotate based on time
        sphereRef.current.rotation.x = time * 0.3;
        sphereRef.current.rotation.y = time * 0.5;
        
        // Distort based on mouse position
        const distortionStrength = 0.2;
        sphereRef.current.rotation.x += mouseRef.current.y * distortionStrength;
        sphereRef.current.rotation.y += mouseRef.current.x * distortionStrength;
        
        // Pulsing effect
        const scale = 1 + Math.sin(time * 2) * 0.1;
        sphereRef.current.scale.setScalar(scale);
      }

      // Camera orbit
      const radius = 5;
      camera.position.x = Math.cos(time * 0.2) * radius + mouseRef.current.x * 2;
      camera.position.y = Math.sin(time * 0.1) * radius + mouseRef.current.y * 2;
      camera.position.z = Math.sin(time * 0.15) * radius + 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      handleResize(camera, renderer, container);
    });

    resizeObserver.observe(container);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      container.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [size, color, wireframe]);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
