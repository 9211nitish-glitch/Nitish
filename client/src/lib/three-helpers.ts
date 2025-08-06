import * as THREE from 'three';

export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  colors: string[];
  opacity: { min: number; max: number };
}

export interface WaveConfig {
  amplitude: number;
  frequency: number;
  speed: number;
  segments: number;
}

export class ParticleSystem {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private velocities: Float32Array;
  private config: ParticleConfig;

  constructor(config: ParticleConfig) {
    this.config = config;
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    this.createParticles();
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  private createParticles() {
    const positions = new Float32Array(this.config.count * 3);
    const colors = new Float32Array(this.config.count * 3);
    this.velocities = new Float32Array(this.config.count * 3);

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;

      // Positions
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;

      // Velocities
      this.velocities[i3] = (Math.random() - 0.5) * this.config.speed.max;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * this.config.speed.max;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * this.config.speed.max;

      // Colors
      const color = new THREE.Color(
        this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
      );
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }

  update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;

      positions[i3] += this.velocities[i3] * deltaTime;
      positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
      positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

      // Wrap around boundaries
      if (positions[i3] > 1000) positions[i3] = -1000;
      if (positions[i3] < -1000) positions[i3] = 1000;
      if (positions[i3 + 1] > 1000) positions[i3 + 1] = -1000;
      if (positions[i3 + 1] < -1000) positions[i3 + 1] = 1000;
      if (positions[i3 + 2] > 1000) positions[i3 + 2] = -1000;
      if (positions[i3 + 2] < -1000) positions[i3 + 2] = 1000;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  getMesh() {
    return this.particles;
  }
}

export class WaveGeometry extends THREE.PlaneGeometry {
  private config: WaveConfig;
  private time: number = 0;

  constructor(width: number, height: number, config: WaveConfig) {
    super(width, height, config.segments, config.segments);
    this.config = config;
  }

  update(deltaTime: number) {
    this.time += deltaTime * this.config.speed;
    const positions = this.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      
      positions[i + 2] = Math.sin(
        x * this.config.frequency + this.time
      ) * this.config.amplitude + Math.cos(
        y * this.config.frequency + this.time
      ) * this.config.amplitude * 0.5;
    }

    this.attributes.position.needsUpdate = true;
  }
}

export const createGradientTexture = (colors: string[], size: number = 256): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 1;
  
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, size, 0);
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, 1);
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  
  return texture;
};

export const createFloatingElements = (count: number): THREE.Group => {
  const group = new THREE.Group();
  
  const geometries = [
    new THREE.SphereGeometry(0.5, 8, 6),
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.TetrahedronGeometry(0.8),
  ];
  
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'];
  
  for (let i = 0; i < count; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.6,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = (Math.random() - 0.5) * 200;
    mesh.position.y = (Math.random() - 0.5) * 200;
    mesh.position.z = (Math.random() - 0.5) * 200;
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.rotation.z = Math.random() * Math.PI;
    
    mesh.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      },
      floatSpeed: Math.random() * 0.5 + 0.5,
      floatOffset: Math.random() * Math.PI * 2,
    };
    
    group.add(mesh);
  }
  
  return group;
};

export const animateFloatingElements = (group: THREE.Group, time: number) => {
  group.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    const userData = mesh.userData;
    
    mesh.rotation.x += userData.rotationSpeed.x;
    mesh.rotation.y += userData.rotationSpeed.y;
    mesh.rotation.z += userData.rotationSpeed.z;
    
    mesh.position.y += Math.sin(time * userData.floatSpeed + userData.floatOffset) * 0.1;
  });
};

export const createInteractiveSphere = (radius: number = 1): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: '#6366F1',
    transparent: true,
    opacity: 0.8,
    shininess: 100,
  });
  
  return new THREE.Mesh(geometry, material);
};

export const setupLights = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0x6366F1, 0.8, 100);
  pointLight.position.set(0, 0, 10);
  scene.add(pointLight);
  
  const pointLight2 = new THREE.PointLight(0x8B5CF6, 0.6, 100);
  pointLight2.position.set(-10, -10, 5);
  scene.add(pointLight2);
};

export const createResponsiveCamera = (
  aspect: number,
  fov: number = 75,
  near: number = 0.1,
  far: number = 1000
): THREE.PerspectiveCamera => {
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 5;
  return camera;
};

export const handleResize = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  container: HTMLElement
) => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};
