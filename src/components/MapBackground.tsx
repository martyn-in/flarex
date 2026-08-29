'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIntelligence } from '../context/IntelligenceContext';
import { INDUSTRIAL_FACILITIES, Hotspot } from '../data/mockData';

export const MapBackground: React.FC = () => {
  const {
    selectedHotspot,
    selectHotspot,
    filteredHotspots,
    activeLayers,
    setMapInstance,
    addToast,
  } = useIntelligence();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const facilityMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Render Hotspot DOM Markers with high-end glass badges & multi-ring pulses
  const renderHotspotMarkers = useCallback(
    (map: maplibregl.Map, list: Hotspot[], selected: Hotspot | null) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      list.forEach((spot) => {
        const isSelected = selected?.id === spot.id;
        const isCritical = spot.severity === 'critical';
        const isHigh = spot.severity === 'high';
        const isMedium = spot.severity === 'medium';
        const isPersistent = spot.classification === 'Gas Flare' || spot.classification === 'Mining / Furnace Activity' || spot.persistenceScore > 60;

        // Color mapping
        let dotColor = '#20C997'; // low
        let glowColor = 'rgba(32, 201, 151, 0.4)';
        if (isCritical) {
          dotColor = '#FF4D4F';
          glowColor = 'rgba(255, 77, 79, 0.5)';
        } else if (isPersistent) {
          dotColor = '#A56EFF';
          glowColor = 'rgba(165, 110, 255, 0.45)';
        } else if (isHigh) {
          dotColor = '#FF8A3D';
          glowColor = 'rgba(255, 138, 61, 0.45)';
        } else if (isMedium) {
          dotColor = '#F2C94C';
          glowColor = 'rgba(242, 201, 76, 0.4)';
        }

        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto select-none group';

        if (isSelected) {
          // Selected Marker: Concentric expanding pulse rings + glowing center dot + floating badge
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-[48px] h-[48px] rounded-full selected-ring-2 pointer-events-none" style="border: 1.5px solid ${dotColor}; background-color: ${glowColor}"></div>
              <div class="absolute w-[30px] h-[30px] rounded-full selected-ring-1 pointer-events-none" style="border: 1.5px solid ${dotColor}; background-color: ${glowColor}"></div>
              <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_${dotColor}] z-20" style="background-color: ${dotColor}"></div>
              <div class="absolute -top-7 px-2 py-0.5 rounded-md glass-panel-elevated text-[10px] font-bold text-white whitespace-nowrap shadow-lg border border-white/20 z-30 pointer-events-none flex items-center gap-1">
                <span>${spot.name.split(' ')[0]}</span>
                <span style="color: ${dotColor}">${spot.frp}MW</span>
              </div>
            </div>
          `;
        } else {
          // Non-selected thermal marker: Crisp glowing dot with smooth hover magnification
          const isCriticalNonSelected = isCritical;
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              ${isCriticalNonSelected ? `<div class="absolute w-5 h-5 rounded-full pointer-events-none animate-ping opacity-60" style="background-color: ${dotColor}"></div>` : ''}
              <div class="w-3.5 h-3.5 rounded-full border border-white/80 shadow-md transition-all duration-200 group-hover:scale-150 group-hover:shadow-[0_0_12px_${dotColor}] z-10" style="background-color: ${dotColor}"></div>
              <!-- Hover Micro Tooltip -->
              <div class="absolute -top-6 px-1.5 py-0.5 rounded glass-dock text-[9px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-md border border-white/10">
                ${spot.name} (${spot.frp} MW)
              </div>
            </div>
          `;
        }

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectHotspot(spot, true);
        });

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
        })
          .setLngLat(spot.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      });
    },
    [selectHotspot]
  );

  // Render Industrial Facility Markers with Glassmorphism
  const renderIndustrialFacilityMarkers = useCallback((map: maplibregl.Map) => {
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    INDUSTRIAL_FACILITIES.forEach((facility) => {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto group';

      el.innerHTML = `
        <div class="px-2.5 py-1 rounded-lg glass-dock border border-cyan-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-[10px] font-semibold text-slate-200 flex items-center gap-1.5 transition-all hover:scale-110 hover:border-cyan-400/60 hover:text-white">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8]"></span>
          <span>${facility.name.split(' ')[0]}</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        addToast(`Industrial Facility: ${facility.name} (${facility.sector})`, 'info');
        map.flyTo({
          center: facility.coordinates,
          zoom: 7.8,
          pitch: 30,
          speed: 1.2,
          curve: 1.3,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(facility.coordinates)
        .addTo(map);

      facilityMarkersRef.current.push(marker);
    });
  }, [addToast]);

  // Initialize MapLibre with fluid kinetic options
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics',
            maxzoom: 18,
          },
          'esri-boundaries': {
            type: 'raster',
            tiles: [
              'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            maxzoom: 18,
          },
        },
        layers: [
          // Base High-Res Satellite Layer with tailored contrast
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-contrast': 0.18,
              'raster-saturation': 0.28,
              'raster-brightness-max': 0.92,
            },
          },
          // Hybrid Boundaries / Labels Layer
          {
            id: 'boundaries-layer',
            type: 'raster',
            source: 'esri-boundaries',
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: 'none',
            },
            paint: {
              'raster-opacity': 0.75,
            },
          },
        ],
      },
      center: [80.5, 22.5],
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      dragRotate: true,
      maxPitch: 60,
      minZoom: 3.5,
      maxZoom: 16,
      // Smooth kinetic interactions
      dragPan: {
        linearity: 0.25,
        maxSpeed: 1600,
        deceleration: 2400,
      } as unknown as boolean,
      scrollZoom: {
        around: 'center',
      } as unknown as boolean,
    });

    map.on('load', () => {
      mapRef.current = map;
      setMapInstance(map);
      renderHotspotMarkers(map, filteredHotspots, selectedHotspot);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      facilityMarkersRef.current.forEach((m) => m.remove());
      map.remove();
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Layers (Boundaries, Industrial Facilities)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Boundaries Layer visibility
    if (map.getLayer('boundaries-layer')) {
      map.setLayoutProperty(
        'boundaries-layer',
        'visibility',
        activeLayers.boundaries ? 'visible' : 'none'
      );
    }

    // Industrial Layer Markers
    if (activeLayers.industrial) {
      renderIndustrialFacilityMarkers(map);
    } else {
      facilityMarkersRef.current.forEach((m) => m.remove());
      facilityMarkersRef.current = [];
    }
  }, [activeLayers, renderIndustrialFacilityMarkers]);

  // Re-render markers when filteredHotspots or selectedHotspot changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    renderHotspotMarkers(map, filteredHotspots, selectedHotspot);
  }, [filteredHotspots, selectedHotspot, renderHotspotMarkers]);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#060D17]">
      <div ref={mapContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Ambient Radial Vignette for high-end command center depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(3,7,13,0.7)]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#060D17]/40 via-transparent to-[#060D17]/30" />
    </div>
  );
};
