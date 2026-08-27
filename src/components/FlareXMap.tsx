'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Plus, Minus, RotateCcw, Crosshair, Layers, Radio, Flame } from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';
import { INDUSTRIAL_FACILITIES, Hotspot } from '../data/mockData';

export const FlareXMap: React.FC = () => {
  const {
    selectedHotspot,
    selectHotspot,
    filteredHotspots,
    activeLayers,
    toggleLayer,
    focusActiveIncident,
    resetMapView,
    zoomIn,
    zoomOut,
    setMapInstance,
    addToast,
  } = useIntelligence();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const facilityMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Render Hotspot DOM Markers with real live coordinates & smooth ripple animations
  const renderHotspotMarkers = useCallback(
    (map: maplibregl.Map, list: Hotspot[], selected: Hotspot | null) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      list.forEach((spot) => {
        const isSelected = selected?.id === spot.id;
        const isCritical = spot.severity === 'critical';
        const isHigh = spot.severity === 'high';
        const isMedium = spot.severity === 'medium';
        const isPersistent = spot.classification === 'Persistent Thermal Source' || spot.persistenceScore > 50;

        let dotColor = '#faad14'; // low
        let glowShadow = '0 0 10px rgba(250, 173, 20, 0.6)';
        if (isCritical) {
          dotColor = '#ff4949';
          glowShadow = '0 0 15px rgba(255, 73, 73, 0.9)';
        } else if (isPersistent) {
          dotColor = '#fa8c16';
          glowShadow = '0 0 12px rgba(250, 140, 22, 0.7)';
        } else if (isHigh) {
          dotColor = '#ff7a45';
          glowShadow = '0 0 12px rgba(255, 122, 69, 0.7)';
        } else if (isMedium) {
          dotColor = '#ffa940';
          glowShadow = '0 0 10px rgba(255, 169, 64, 0.6)';
        }

        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto select-none';

        if (isSelected) {
          // Selected Marker: 2 Expanding Rings + Solid Core + Tooltip
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div class="selected-ring-2" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid ${dotColor}; background: ${dotColor}22; pointer-events: none;"></div>
              <div class="selected-ring-1" style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${dotColor}; background: ${dotColor}33; pointer-events: none;"></div>
              <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: ${dotColor}; border: 2px solid #ffffff; box-shadow: ${glowShadow}; z-index: 20;"></div>
              <div style="position: absolute; top: -28px; left: 50%; transform: translateX(-50%); padding: 2px 7px; border-radius: 6px; background: rgba(24, 10, 6, 0.95); color: #fff; font-size: 10px; font-weight: 700; border: 1px solid rgba(255, 106, 61, 0.35); white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); z-index: 30; pointer-events: none; display: flex; align-items: center; gap: 4px;">
                <span>${spot.name}</span>
                <span style="color: ${dotColor}; font-family: monospace;">${spot.frp}MW</span>
              </div>
            </div>
          `;
        } else {
          // Non-selected: Crisp glowing marker with hover effect
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;" class="group">
              ${isCritical ? `<div style="position: absolute; width: 18px; height: 18px; border-radius: 50%; background: ${dotColor}; opacity: 0.5; animation: dangerPulse 1.4s infinite; pointer-events: none;"></div>` : ''}
              <div style="width: 11px; height: 11px; border-radius: 50%; background: ${dotColor}; border: 1.5px solid #ffffff; box-shadow: ${glowShadow}; transition: transform 0.15s ease; z-index: 10;"></div>
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

  // Render Industrial Facility Markers
  const renderIndustrialFacilityMarkers = useCallback((map: maplibregl.Map) => {
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    INDUSTRIAL_FACILITIES.forEach((facility) => {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto';

      el.innerHTML = `
        <div style="padding: 4px 8px; border-radius: 8px; background: rgba(20, 9, 6, 0.9); border: 1px solid rgba(255, 106, 61, 0.35); box-shadow: 0 4px 14px rgba(0,0,0,0.6); font-size: 9.5px; font-weight: 700; color: #fef8f6; display: flex; align-items: center; gap: 5px; transition: transform 0.18s ease; backdrop-filter: blur(12px);">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: #ff7a45; box-shadow: 0 0 6px #ff7a45;"></span>
          <span>${facility.name.split(' ')[0]}</span>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        addToast(`Industrial Facility: ${facility.name} (${facility.sector})`, 'info');
        map.flyTo({
          center: facility.coordinates,
          zoom: 7.8,
          pitch: 25,
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

  // Initialize MapLibre with High-Res Satellite, Inertia & Smooth Physics
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
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-contrast': 0.16,
              'raster-saturation': 0.25,
              'raster-brightness-max': 0.94,
            },
          },
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
              'raster-opacity': 0.7,
            },
          },
        ],
      },
      center: [80.5, 21.0],
      zoom: 4.25,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      dragRotate: true,
      maxPitch: 60,
      minZoom: 3.5,
      maxZoom: 16,
      // Fluid kinetic panning & zooming
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

  // Update Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('boundaries-layer')) {
      map.setLayoutProperty(
        'boundaries-layer',
        'visibility',
        activeLayers.boundaries ? 'visible' : 'none'
      );
    }

    if (activeLayers.industrial) {
      renderIndustrialFacilityMarkers(map);
    } else {
      facilityMarkersRef.current.forEach((m) => m.remove());
      facilityMarkersRef.current = [];
    }
  }, [activeLayers, renderIndustrialFacilityMarkers]);

  // Re-render markers on state change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    renderHotspotMarkers(map, filteredHotspots, selectedHotspot);
  }, [filteredHotspots, selectedHotspot, renderHotspotMarkers]);

  return (
    <div className="map-wrapper">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Live Map Telemetry Badge */}
      <div className="live-map-indicator">
        <span className="live-dot" />
        <span>LIVE SATELLITE RADAR • PAN-INDIA</span>
      </div>

      {/* Floating Map Controls */}
      <div className="map-controls">
        {/* Zoom In */}
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom In (+)"
        >
          <Plus size={16} />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom Out (-)"
        >
          <Minus size={16} />
        </button>

        {/* Focus on Selected Incident */}
        <button
          type="button"
          onClick={focusActiveIncident}
          title="Focus on Active Incident (Target Lock)"
          className="text-[#ff5a3c]"
        >
          <Crosshair size={16} />
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={resetMapView}
          title="Reset Camera View to India Overview"
        >
          <RotateCcw size={16} />
        </button>

        {/* Layer Toggle */}
        <button
          type="button"
          onClick={() => {
            toggleLayer('boundaries');
          }}
          className={activeLayers.boundaries ? 'active' : ''}
          title="Toggle GIS Borders & Infrastructure Layer"
        >
          <Layers size={16} />
        </button>
      </div>
    </div>
  );
};

export default FlareXMap;
