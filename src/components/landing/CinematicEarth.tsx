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
  const particlesRef = useRef<THREE.Points | null>(null);
  const flareCoronaRef = useRef<THREE.Sprite | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 3.84 }); // Exact India alignment
  const currentRotationRef = useRef({ x: 0.1, y: 3.84 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.7);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ROOT GROUP
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -0.72, 0); // Positioned so Earth arch dominates center-bottom
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();
    
    // High-resolution night map with India illuminated
    const nightTexture = textureLoader.load('/cinematic/earth_night_map.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });

    const heroTexture = textureLoader.load('/cinematic/flarex_earth_hero.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
    });

    // 1. HUGE CINEMATIC EARTH SPHERE
    const earthRadius = 2.18;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: heroTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(-0.78, 0.62, 0.45).normalize() },
        thermalGlowColor: { value: new THREE.Color(0xff6015) },
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
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform vec3 thermalGlowColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          float sunDot = dot(normal, sunDirection);
          float dayFactor = clamp(sunDot * 1.6 + 0.15, 0.0, 1.0);
          
          // Night side city lights & thermal hotspots
          vec3 baseColor = mix(nightColor.rgb * 1.4 + dayColor.rgb * 0.1, dayColor.rgb * 0.9, dayFactor);
          
          // Warm thermal radiance boost
          float nightLuma = dot(nightColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 thermalGlow = thermalGlowColor * pow(nightLuma, 1.6) * 1.8;
          
          // Horizon rim atmospheric edge
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 3.6);
          float sunLimb = max(0.0, dot(normal, sunDirection));
          vec3 rimGlow = mix(vec3(0.9, 0.15, 0.02), vec3(1.0, 0.7, 0.2), pow(sunLimb, 1.2)) * fresnel * 2.8;
          
          gl_FragColor = vec4(baseColor + thermalGlow + rimGlow, 1.0);
        }
      `,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 2. GLOWING UPPER-LEFT ATMOSPHERIC CORONA (FRESNEL RIM)
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.025, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xff4a15) },
        sunDirection: { value: new THREE.Vector3(-0.78, 0.62, 0.45).normalize() },
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
          
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.2);
          float sunBias = max(0.0, dot(normal, sunDirection));
          
          // Radiant orange-red corona concentrated on the illuminated upper-left horizon
          float intensity = fresnel * (0.1 + 3.6 * pow(sunBias, 2.0));
          vec3 fieryColor = mix(vec3(1.0, 0.18, 0.02), vec3(1.0, 0.85, 0.35), pow(sunBias, 1.5));
          
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

    // 3. UPPER-LEFT SOLAR FLARE BURST SPRITE
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 128;
    flareCanvas.height = 128;
    const fctx = flareCanvas.getContext('2d');
    if (fctx) {
      const grad = fctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
      grad.addColorStop(0.2, 'rgba(255, 170, 40, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 60, 15, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, 128, 128);
    }
    const flareTexture = new THREE.CanvasTexture(flareCanvas);
    const flareMaterial = new THREE.SpriteMaterial({
      map: flareTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });
    const flareCorona = new THREE.Sprite(flareMaterial);
    flareCorona.scale.set(1.8, 1.8, 1);
    flareCorona.position.set(-1.45, 1.05, 0.1);
    earthGroup.add(flareCorona);
    flareCoronaRef.current = flareCorona;

    // 4. FLOATING 3D THERMAL EMBER PARTICLES
    const particleCount = 320;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount * 3);

    const baseColors = [
      new THREE.Color(0xff3315),
      new THREE.Color(0xff6a1a),
      new THREE.Color(0xffaa33),
      new THREE.Color(0xffe082),
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = earthRadius + 0.05 + Math.random() * 2.2;
      const theta = (Math.PI * 0.35) + (Math.random() * Math.PI * 1.3);
      const phi = (Math.random() - 0.45) * Math.PI * 0.9;

      const x = radius * Math.cos(phi) * Math.sin(theta);
      const y = radius * Math.sin(phi) + 0.2;
      const z = radius * Math.cos(phi) * Math.cos(theta);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const c = baseColors[Math.floor(Math.random() * baseColors.length)];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSizes[i] = Math.random() * 16 + 5;
      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.003;
      particleSpeeds[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
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
      grad.addColorStop(0.25, 'rgba(255, 160, 45, 0.9)');
      grad.addColorStop(0.55, 'rgba(255, 55, 15, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // SET INITIAL ROTATION
    earthGroup.rotation.x = currentRotationRef.current.x;
    earthGroup.rotation.y = currentRotationRef.current.y;

    // RESIZE LISTENER
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

      targetRotationRef.current.y += deltaX * 0.003;
      targetRotationRef.current.x = Math.max(
        -0.3,
        Math.min(0.4, targetRotationRef.current.x + deltaY * 0.002)
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

    // Touch handlers
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
        -0.3,
        Math.min(0.4, targetRotationRef.current.x + deltaY * 0.0025)
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

      // Subtle Idle auto-rotation keeping India in center field
      if (isIdleRef.current) {
        targetRotationRef.current.y += 0.0005;
      }

      // Smooth inertia damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      if (earthGroup) {
        earthGroup.rotation.x = currentRotationRef.current.x;
        earthGroup.rotation.y = currentRotationRef.current.y;
      }

      // Flare pulse
      if (flareCoronaRef.current) {
        const pulse = 1.8 + Math.sin(elapsedTime * 2.0) * 0.12;
        flareCoronaRef.current.scale.set(pulse, pulse, 1);
      }

      // Particle dynamics
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleSpeeds[i * 3 + 1];
          positions[i * 3] += particleSpeeds[i * 3] + Math.sin(elapsedTime + i) * 0.0007;

          if (positions[i * 3 + 1] > 3.2) {
            positions[i * 3 + 1] = -1.5;
            positions[i * 3] = (Math.random() - 0.5) * 4.0;
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

  // CINEMATIC TRANSITION WHEN EXPLORE IS CLICKED
  useEffect(() => {
    if (!isTransitioning || !cameraRef.current || !earthGroupRef.current) return;

    const camera = cameraRef.current;
    const earthGroup = earthGroupRef.current;

    const tl = gsap.timeline();

    // Camera accelerates toward Earth into the India thermal basin
    tl.to(camera.position, {
      z: 1.45,
      y: 0.15,
      duration: 3.8,
      ease: 'power3.inOut',
    });

    tl.to(
      earthGroup.position,
      {
        y: -0.2,
        duration: 3.8,
        ease: 'power2.inOut',
      },
      0
    );

    if (particlesRef.current) {
      tl.to(
        particlesRef.current.scale,
        {
          x: 2.6,
          y: 2.6,
          z: 2.6,
          duration: 3.2,
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
        background: `radial-gradient(circle at 50% 55%, rgba(255, 75, 20, 0.07) 0%, rgba(10, 4, 3, 0.45) 45%, #020101 100%)`,
      }}
    />
  );
};
