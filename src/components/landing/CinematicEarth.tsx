'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CinematicEarthProps {
  isTransitioning: boolean;
}

export const CinematicEarth: React.FC<CinematicEarthProps> = ({ isTransitioning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  // Rotation focused on India/Asia and Pacific/Australia night lights
  const targetRotationRef = useRef({ x: 0.18, y: 4.12 });
  const currentRotationRef = useRef({ x: 0.18, y: 4.12 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isDesktop = width >= 1024;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    cameraRef.current = camera;

    // 2. RENDERER WITH HIGH QUALITY ANISOTROPY & COLOR SPACE
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. EARTH GROUP (Positioned on the RIGHT side on desktop, centered on mobile)
    const earthGroup = new THREE.Group();
    const xPos = isDesktop ? 1.05 : 0;
    const yPos = isDesktop ? 0.0 : -0.35;
    earthGroup.position.set(xPos, yPos, 0);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. HIGH RESOLUTION NIGHT SATELLITE TEXTURE WITH GLOWING ANOMALIES
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/cinematic/earth_hd_clarity.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.wrapS = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });

    // 5. EARTH SPHERE MESH
    const earthRadius = isDesktop ? 1.75 : 1.5;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 96, 96);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: earthTexture },
        sunDirection: { value: new THREE.Vector3(0.75, 0.55, 0.4).normalize() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          vec4 tex = texture2D(map, vUv);
          
          // Enhanced crystal clarity terrain & glowing warm amber fire clusters
          vec3 earthBase = pow(tex.rgb, vec3(0.88)) * 1.65;
          
          // Atmospheric limb glow along upper & outer horizon
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.2);
          float sunLimb = max(0.0, dot(normal, sunDirection));
          
          // Warm solar limb & atmospheric rim
          vec3 rimGlow = mix(vec3(0.2, 0.45, 0.95), vec3(1.0, 0.65, 0.25), pow(sunLimb, 1.2)) * fresnel * (0.4 + 2.8 * pow(sunLimb, 1.5));
          
          vec3 finalColor = earthBase + rimGlow;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 6. ATMOSPHERIC CORONA RING
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.012, 96, 96);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: new THREE.Vector3(0.75, 0.55, 0.4).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.8);
          float sunBias = max(0.0, dot(normal, sunDirection));
          
          // Radiant glowing blue to amber corona along outer edge
          float intensity = fresnel * (0.18 + 3.2 * pow(sunBias, 1.8));
          vec3 atmosphericColor = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.7, 0.3), pow(sunBias, 1.5));
          
          gl_FragColor = vec4(atmosphericColor, intensity * 0.95);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });

    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 7. FLOATING 3D THERMAL EMBER PARTICLES
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount * 3);

    const baseColors = [
      new THREE.Color(0xff3315),
      new THREE.Color(0xff6a1a),
      new THREE.Color(0xffaa33),
      new THREE.Color(0xffe082),
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = earthRadius + 0.1 + Math.random() * 1.6;
      const theta = Math.PI * 0.1 + Math.random() * Math.PI * 1.8;
      const phi = (Math.random() - 0.5) * Math.PI * 0.95;

      const x = radius * Math.cos(phi) * Math.sin(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.cos(theta);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = baseColors[Math.floor(Math.random() * baseColors.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.0015;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.0025 + 0.0008;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pctx = particleCanvas.getContext('2d');
    if (pctx) {
      const grad = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 160, 45, 0.9)');
      grad.addColorStop(0.7, 'rgba(255, 55, 15, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    earthGroup.add(particles);
    particlesRef.current = particles;

    // INITIAL ROTATION
    earthGroup.rotation.x = currentRotationRef.current.x;
    earthGroup.rotation.y = currentRotationRef.current.y;

    // RESIZE
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera || !earthGroupRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const isD = w >= 1024;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      earthGroupRef.current.position.set(isD ? 1.05 : 0, isD ? 0.0 : -0.35, 0);
    };
    window.addEventListener('resize', handleResize);

    // MOUSE DRAG WITH SMOOTH DAMPING
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      isIdleRef.current = false;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.003;
      targetRotationRef.current.x = Math.max(
        -0.25,
        Math.min(0.35, targetRotationRef.current.x + deltaY * 0.002)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
      }, 3000);
    };

    // Touch
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        isIdleRef.current = false;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.0035;
      targetRotationRef.current.x = Math.max(
        -0.25,
        Math.min(0.35, targetRotationRef.current.x + deltaY * 0.0025)
      );

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
      }, 3000);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 8. RENDER & SLOW CELESTIAL DRIFT
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isIdleRef.current && !isTransitioning) {
        targetRotationRef.current.y += 0.0006;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      if (earthGroupRef.current) {
        earthGroupRef.current.rotation.x = currentRotationRef.current.x;
        earthGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Animate floating ember particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += particleSpeeds[i * 3];
          positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
          positions[i * 3 + 2] += particleSpeeds[i * 3 + 2];

          // Reset if drifting too far
          if (positions[i * 3 + 1] > earthRadius + 1.8) {
            positions[i * 3 + 1] = -earthRadius * 0.5;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
    };
  }, [isTransitioning]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
};

export default CinematicEarth;
