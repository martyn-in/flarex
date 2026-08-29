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
  const starsRef = useRef<THREE.Points | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  // Rotation focused on India/Asia and surrounding continents facing front
  const targetRotationRef = useRef({ x: 0.16, y: 4.68 });
  const currentRotationRef = useRef({ x: 0.16, y: 4.68 });
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

    // 3. EARTH GROUP (Positioned on the RIGHT side on desktop, centered on mobile)
    const earthGroup = new THREE.Group();
    const xPos = isDesktop ? 1.05 : 0;
    const yPos = isDesktop ? 0.0 : -0.35;
    earthGroup.position.set(xPos, yPos, 0);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. NATURAL HIGH RESOLUTION SATELLITE TEXTURE (ZERO BORDER, ZERO ARTIFICIAL RIMS)
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/cinematic/earth_natural_clarity.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.wrapS = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });

    // 5. NATURAL EARTH SPHERE (Standard MeshBasicMaterial - seamless blend with space)
    const earthRadius = isDesktop ? 1.75 : 1.5;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 96, 96);

    const earthMaterial = new THREE.MeshBasicMaterial({
      map: earthTexture,
      transparent: false,
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 6. SUBTLE CELESTIAL BACKGROUND STARS (Clean & Natural)
    const starCount = 120;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = earthRadius + 0.6 + Math.random() * 2.5;
      const theta = Math.PI * 0.05 + Math.random() * Math.PI * 1.9;
      const phi = (Math.random() - 0.5) * Math.PI * 1.1;

      starPositions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi);
      starPositions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

      starColors[i * 3] = 0.85 + Math.random() * 0.15;
      starColors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
      starColors[i * 3 + 2] = 1.0;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    earthGroup.add(stars);
    starsRef.current = stars;

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

    // 7. RENDER & NATURAL CELESTIAL DRIFT
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
      starGeometry.dispose();
      starMaterial.dispose();
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
