'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicEarthProps {
  isTransitioning: boolean;
}

export const CinematicEarth: React.FC<CinematicEarthProps> = ({ isTransitioning }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  // Perfect orientation: India facing camera
  const targetRotationRef = useRef({ x: 0.12, y: 3.86 });
  const currentRotationRef = useRef({ x: 0.12, y: 3.86 });
  const isIdleRef = useRef(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.85);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. EARTH GROUP (PERFECT PROPORTIONS & CENTERED COMPOSITION)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -0.16, 0);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. TEXTURE LOADING
    const textureLoader = new THREE.TextureLoader();
    const nightMap = textureLoader.load('/cinematic/earth_night_map.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });

    // 5. EARTH SPHERE
    const earthRadius = 1.18; // Perfect balanced size
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        nightMap: { value: nightMap },
        sunDirection: { value: new THREE.Vector3(-0.76, 0.64, 0.42).normalize() },
        thermalColor: { value: new THREE.Color(0xff6015) },
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
        uniform sampler2D nightMap;
        uniform vec3 sunDirection;
        uniform vec3 thermalColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          vec4 nightTex = texture2D(nightMap, vUv);
          float nightLuma = dot(nightTex.rgb, vec3(0.299, 0.587, 0.114));
          
          // Glowing city lights & industrial thermal nodes in India & Asia
          vec3 cityLights = nightTex.rgb * 1.6;
          vec3 hotThermal = thermalColor * pow(nightLuma, 1.35) * 2.4;
          
          // Deep oceanic base tone
          vec3 basePlanet = vec3(0.025, 0.035, 0.06);
          
          // Horizon atmospheric rim glow (Fresnel)
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.6);
          float sunBias = max(0.0, dot(normal, sunDirection));
          
          // Radiant orange atmospheric edge concentrated on upper-left
          vec3 rimGlow = mix(vec3(0.85, 0.15, 0.02), vec3(1.0, 0.72, 0.22), pow(sunBias, 1.25)) * fresnel * 2.8;
          
          gl_FragColor = vec4(basePlanet + cityLights + hotThermal + rimGlow, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // 6. RAZOR-SHARP ATMOSPHERIC FIRE RIM
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.016, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xff4514) },
        sunDirection: { value: new THREE.Vector3(-0.76, 0.64, 0.42).normalize() },
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
        uniform vec3 glowColor;
        uniform vec3 sunDirection;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.6);
          float sunBias = max(0.0, dot(normal, sunDirection));
          
          float intensity = fresnel * (0.05 + 3.9 * pow(sunBias, 2.2));
          vec3 fieryColor = mix(vec3(1.0, 0.2, 0.03), vec3(1.0, 0.88, 0.38), pow(sunBias, 1.5));
          
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

    // 7. FLOATING 3D THERMAL EMBER PARTICLES
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount * 3);

    const baseColors = [
      new THREE.Color(0xff3315),
      new THREE.Color(0xff7a22),
      new THREE.Color(0xffb545),
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = earthRadius + 0.08 + Math.random() * 1.2;
      const theta = (Math.PI * 0.3) + (Math.random() * Math.PI * 1.4);
      const phi = (Math.random() - 0.45) * Math.PI * 0.85;

      particlePositions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) + 0.1;
      particlePositions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

      const c = baseColors[Math.floor(Math.random() * baseColors.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSizes[i] = Math.random() * 12 + 4;
      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.0015;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.0035 + 0.001;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.0015;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const pctx = particleCanvas.getContext('2d');
    if (pctx) {
      const grad = pctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(255, 165, 45, 0.85)');
      grad.addColorStop(0.6, 'rgba(255, 55, 15, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

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

    // MOUSE INTERACTION
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

      targetRotationRef.current.y += deltaX * 0.0025;
      targetRotationRef.current.x = Math.max(
        -0.2,
        Math.min(0.3, targetRotationRef.current.x + deltaY * 0.0018)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
      }, 2500);
    };

    // TOUCH SUPPORT
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

      targetRotationRef.current.y += deltaX * 0.003;
      targetRotationRef.current.x = Math.max(
        -0.2,
        Math.min(0.3, targetRotationRef.current.x + deltaY * 0.002)
      );

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
      }, 2500);
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

      // Gentle auto-rotation
      if (isIdleRef.current) {
        targetRotationRef.current.y += 0.00035;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      if (earthGroup) {
        earthGroup.rotation.x = currentRotationRef.current.x;
        earthGroup.rotation.y = currentRotationRef.current.y;
      }

      // Particle subtle turbulence
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
          positions[i * 3] += particleSpeeds[i * 3] + Math.sin(elapsedTime + i) * 0.0005;

          if (positions[i * 3 + 1] > 2.2) {
            positions[i * 3 + 1] = -1.0;
            positions[i * 3] = (Math.random() - 0.5) * 2.8;
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

  // GLITCH-FREE SMOOTH CAMERA DIVE
  useEffect(() => {
    if (!isTransitioning || !cameraRef.current || !earthGroupRef.current) return;

    const camera = cameraRef.current;
    const earthGroup = earthGroupRef.current;

    const tl = gsap.timeline();

    // Camera zooms smoothly from 3.85 to 2.8 (SAFELY OUTSIDE sphere radius 1.18)
    tl.to(camera.position, {
      z: 2.8,
      duration: 1.1,
      ease: 'power2.inOut',
    });

    tl.to(
      earthGroup.position,
      {
        y: -0.05,
        duration: 1.1,
        ease: 'power2.inOut',
      },
      0
    );
  }, [isTransitioning]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing z-0"
    />
  );
};
