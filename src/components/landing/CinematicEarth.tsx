'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicEarthProps {
  isTransitioning: boolean;
  onTransitionReady?: () => void;
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
  const warpStarsRef = useRef<THREE.Points | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  // Fine-tuned rotation to center India directly facing the camera
  const targetRotationRef = useRef({ x: 0.15, y: 4.65 });
  const currentRotationRef = useRef({ x: 0.15, y: 4.65 });
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

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, -0.05, 4.3);
    cameraRef.current = camera;

    // 2. RENDERER WITH HIGH QUALITY ANISOTROPY
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. EARTH GROUP (Positioned in center with perfect curvature)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -0.42, 0);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. ULTRA-SHARP TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();
    
    // High clarity map
    const earthTexture = textureLoader.load('/cinematic/earth_hd_clarity.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });

    const nightBackupTexture = textureLoader.load('/cinematic/earth_night_map.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.wrapS = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });

    // 5. EARTH SPHERE WITH CRYSTAL CLARITY SHADER
    const earthRadius = 1.55;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 96, 96);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: earthTexture },
        nightMap: { value: nightBackupTexture },
        sunDirection: { value: new THREE.Vector3(-0.85, 0.65, 0.45).normalize() },
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
        uniform sampler2D nightMap;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          vec4 hdColor = texture2D(map, vUv);
          vec4 nightColor = texture2D(nightMap, vUv);
          
          // Blend crisp HD continental features with intense golden night lights
          vec3 earthBase = mix(hdColor.rgb, nightColor.rgb * 1.3, 0.35);
          
          // High clarity contrast enhancement
          earthBase = pow(earthBase, vec3(0.92)) * 1.35;
          
          // Solar Rim along upper-left horizon (incandescent fiery corona)
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.8);
          float sunLimb = max(0.0, dot(normal, sunDirection));
          
          // Fiery molten gold to crimson horizon rim
          vec3 rimGlow = mix(vec3(0.95, 0.18, 0.02), vec3(1.0, 0.85, 0.35), pow(sunLimb, 1.3)) * fresnel * (0.35 + 3.8 * pow(sunLimb, 1.6));
          
          // Subtle warm atmosphere wrap
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
        sunDirection: { value: new THREE.Vector3(-0.85, 0.65, 0.45).normalize() },
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
          
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);
          float sunBias = max(0.0, dot(normal, sunDirection));
          
          // Radiant orange-red corona on the upper-left horizon
          float intensity = fresnel * (0.15 + 3.8 * pow(sunBias, 2.0));
          vec3 fieryColor = mix(vec3(1.0, 0.18, 0.02), vec3(1.0, 0.88, 0.38), pow(sunBias, 1.3));
          
          gl_FragColor = vec4(fieryColor, intensity * 0.95);
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
    const particleCount = 240;
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
      const theta = (Math.PI * 0.3) + (Math.random() * Math.PI * 1.4);
      const phi = (Math.random() - 0.45) * Math.PI * 0.9;

      const x = radius * Math.cos(phi) * Math.sin(theta);
      const y = radius * Math.sin(phi) + 0.15;
      const z = radius * Math.cos(phi) * Math.cos(theta);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = baseColors[Math.floor(Math.random() * baseColors.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.002;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.0035 + 0.0015;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
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
      size: 0.055,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. WARP SPEED PARTICLES FOR DIVE SEQUENCE
    const warpCount = 300;
    const warpPositions = new Float32Array(warpCount * 3);
    const warpColors = new Float32Array(warpCount * 3);

    for (let i = 0; i < warpCount; i++) {
      warpPositions[i * 3] = (Math.random() - 0.5) * 6.0;
      warpPositions[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
      warpPositions[i * 3 + 2] = Math.random() * 5.0 - 2.5;

      const c = baseColors[Math.floor(Math.random() * baseColors.length)];
      warpColors[i * 3] = c.r;
      warpColors[i * 3 + 1] = c.g;
      warpColors[i * 3 + 2] = c.b;
    }

    const warpGeometry = new THREE.BufferGeometry();
    warpGeometry.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3));
    warpGeometry.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));

    const warpMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const warpStars = new THREE.Points(warpGeometry, warpMaterial);
    scene.add(warpStars);
    warpStarsRef.current = warpStars;

    // INITIAL ROTATION
    earthGroup.rotation.x = currentRotationRef.current.x;
    earthGroup.rotation.y = currentRotationRef.current.y;

    // RESIZE
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // MOUSE DRAG WITH INERTIA
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
    window.addEventListener('touchend', handleTouchEnd);

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle Idle auto-rotation keeping India in center
      if (isIdleRef.current) {
        targetRotationRef.current.y += 0.0004;
      }

      // Smooth inertia damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      if (earthGroup) {
        earthGroup.rotation.x = currentRotationRef.current.x;
        earthGroup.rotation.y = currentRotationRef.current.y;
      }

      // Particles drift
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
          positions[i * 3] += particleSpeeds[i * 3] + Math.sin(elapsedTime + i) * 0.0005;

          if (positions[i * 3 + 1] > 2.8) {
            positions[i * 3 + 1] = -1.2;
            positions[i * 3] = (Math.random() - 0.5) * 3.2;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

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
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // EPIC DIVE INSIDE THE GLOBE ON EXPLORE CLICK
  useEffect(() => {
    if (!isTransitioning || !cameraRef.current || !earthGroupRef.current) return;

    const camera = cameraRef.current;
    const earthGroup = earthGroupRef.current;

    const tl = gsap.timeline();

    // 1. Camera accelerates and zooms deep toward India's coordinate
    tl.to(camera.position, {
      z: 1.8,
      y: 0.15,
      duration: 1.8,
      ease: 'power3.in',
    });

    // 2. Earth expands outward symmetrically as camera dives in
    tl.to(
      earthGroup.scale,
      {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 1.8,
        ease: 'power3.in',
      },
      0
    );

    // 3. Warp stars activate during dive
    if (warpStarsRef.current) {
      tl.to(
        (warpStarsRef.current.material as THREE.PointsMaterial),
        {
          opacity: 0.9,
          duration: 0.6,
          ease: 'power2.in',
        },
        0.4
      );
    }
  }, [isTransitioning]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing z-0"
      style={{
        background: `radial-gradient(circle at 50% 50%, rgba(255, 75, 20, 0.06) 0%, rgba(8, 3, 2, 0.5) 50%, #020101 100%)`,
      }}
    />
  );
};
