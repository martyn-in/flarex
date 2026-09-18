'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Plus, Minus, RotateCcw, Crosshair, Layers } from 'lucide-react';
import { MapLegend } from './MapLegend';
import { useIntelligence } from '../context/IntelligenceContext';
import { INDUSTRIAL_FACILITIES } from '../data/mockData';
import { Hotspot } from '../types';

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

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
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Check WebGL on client mount
  useEffect(() => {
    setIsWebGLAvailable(checkWebGLSupport());
  }, []);

  // Update Hotspot Markers without recreating MapLibre canvas
  const updateMarkers = useCallback(
    (map: maplibregl.Map, list: Hotspot[], selected: Hotspot | null) => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      list.forEach((spot) => {
        const isSelected = selected?.id === spot.id;
        const isCritical = spot.severity === 'critical' || spot.status === 'CRITICAL_FIRE';
        const isHigh = spot.severity === 'high' || spot.status === 'ABNORMAL';
        const isNormalFlare = spot.classification === 'Gas Flare' && spot.status === 'NORMAL';
        const isWildfire = spot.classification === 'Wildfire';
        const isAgri = spot.classification === 'Agricultural Burning';

        let dotColor = '#ea580c'; // default orange
        let glowShadow = '0 0 12px rgba(234, 88, 12, 0.7)';

        if (isCritical) {
          dotColor = '#dc2626';
          glowShadow = '0 0 16px rgba(220, 38, 38, 0.95)';
        } else if (isNormalFlare) {
          dotColor = '#16a34a';
          glowShadow = '0 0 12px rgba(22, 163, 74, 0.7)';
        } else if (isWildfire) {
          dotColor = '#d97706';
          glowShadow = '0 0 14px rgba(217, 119, 6, 0.8)';
        } else if (isAgri) {
          dotColor = '#ca8a04';
          glowShadow = '0 0 10px rgba(202, 138, 4, 0.6)';
        } else if (isHigh) {
          dotColor = '#ea580c';
          glowShadow = '0 0 14px rgba(234, 88, 12, 0.8)';
        }

        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto select-none';

        if (isSelected) {
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid ${dotColor}; background: ${dotColor}22; pointer-events: none; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid ${dotColor}; background: ${dotColor}33; pointer-events: none;"></div>
              <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: ${dotColor}; border: 2px solid #ffffff; box-shadow: ${glowShadow}; z-index: 20;"></div>
              <div style="position: absolute; top: -34px; left: 50%; transform: translateX(-50%); padding: 4px 10px; border-radius: 8px; background: rgba(14, 7, 5, 0.95); color: #fef8f6; font-size: 10.5px; font-weight: 800; border: 1px solid rgba(255, 106, 61, 0.4); white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,0.6); z-index: 30; pointer-events: none; display: flex; align-items: center; gap: 6px;">
                <span>${spot.name.split(' ')[0]}</span>
                <span style="color: ${dotColor}; font-family: monospace; font-weight: 900;">${spot.frp}MW</span>
                <span style="color: #ff9977; font-size: 9px; font-weight: 700;">(${spot.baselineRatio}×)</span>
              </div>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;" class="group">
              ${isCritical ? `<div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background: ${dotColor}; opacity: 0.5; animation: livePulse 1.4s infinite; pointer-events: none;"></div>` : ''}
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
  const updateFacilityMarkers = useCallback((map: maplibregl.Map, show: boolean) => {
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    if (!show) return;

    INDUSTRIAL_FACILITIES.forEach((facility) => {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center cursor-pointer pointer-events-auto';

      el.innerHTML = `
        <div style="padding: 3px 7px; border-radius: 7px; background: rgba(14, 7, 5, 0.9); border: 1px solid rgba(255, 106, 61, 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.5); font-size: 9px; font-weight: 800; color: #fef8f6; display: flex; align-items: center; gap: 4px; transition: transform 0.15s ease; backdrop-filter: blur(8px);">
          <span style="width: 5px; height: 5px; border-radius: 50%; background: #ea580c;"></span>
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
          essential: true,
          duration: 1200,
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

  // MapLibre Canvas Mount: Initialize ONCE
  useEffect(() => {
    if (!mapContainerRef.current || !isWebGLAvailable || mapRef.current) return;

    try {
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
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#060302',
              },
            },
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'esri-satellite',
              minzoom: 0,
              maxzoom: 19,
              paint: {
                'raster-contrast': 0.12,
                'raster-saturation': 0.18,
                'raster-brightness-max': 0.98,
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
        zoom: 4.3,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
        dragRotate: true,
        maxPitch: 60,
        minZoom: 3.5,
        maxZoom: 16,
      });

      map.on('load', () => {
        mapRef.current = map;
        setMapInstance(map);
        setMapLoaded(true);
        map.resize();
      });

      map.on('error', (e) => {
        console.warn('MapLibre error handled:', e);
      });

      // ResizeObserver to ensure 100% canvas coverage
      let resizeObserver: ResizeObserver | null = null;
      if (mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.resize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        markersRef.current.forEach((m) => m.remove());
        facilityMarkersRef.current.forEach((m) => m.remove());
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        setMapInstance(null);
        setMapLoaded(false);
      };
    } catch (err) {
      console.warn('WebGL init failed, activating SVG radar fallback:', err);
      setIsWebGLAvailable(false);
    }
  }, [isWebGLAvailable, setMapInstance]);

  // Synchronize Hotspot Markers when data or selection changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      updateMarkers(mapRef.current, filteredHotspots, selectedHotspot);
    }
  }, [filteredHotspots, selectedHotspot, mapLoaded, updateMarkers]);

  // Synchronize Facility Markers and Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('boundaries-layer')) {
      map.setLayoutProperty(
        'boundaries-layer',
        'visibility',
        activeLayers.boundaries ? 'visible' : 'none'
      );
    }

    updateFacilityMarkers(map, activeLayers.industrial);
  }, [activeLayers, mapLoaded, updateFacilityMarkers]);

  return (
    <div className="map-wrapper relative w-full h-full min-h-[460px] overflow-hidden bg-[#060302] rounded-2xl">
      {isWebGLAvailable ? (
        <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />
      ) : (
        /* Non-WebGL Canvas/SVG Vector Radar Fallback */
        <div className="w-full h-full relative bg-[#0a0504] flex items-center justify-center p-6 select-none overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-[500px] h-[500px] rounded-full border border-[rgba(255,106,61,0.2)]" />
            <div className="w-[340px] h-[340px] rounded-full border border-[rgba(255,106,61,0.2)]" />
            <div className="w-[180px] h-[180px] rounded-full border border-[rgba(255,106,61,0.2)]" />
          </div>

          <div className="relative w-full max-w-2xl h-[420px] rounded-2xl border border-[rgba(255,106,61,0.25)] bg-[rgba(20,10,7,0.95)] p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,106,61,0.2)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-bold text-white">
                  Non-WebGL Interactive Radar View (Pan-India)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#ff7a45] font-bold">
                {filteredHotspots.length} Active Feeds
              </span>
            </div>

            <div className="relative flex-1 w-full my-2 bg-[#120604] rounded-xl border border-[rgba(255,106,61,0.18)] overflow-hidden">
              {filteredHotspots.map((spot) => {
                const leftPct = ((spot.coordinates[0] - 68) / (97 - 68)) * 80 + 10;
                const topPct = 100 - (((spot.coordinates[1] - 8) / (36 - 8)) * 80 + 10);
                const isSelected = selectedHotspot?.id === spot.id;
                const isCritical = spot.severity === 'critical' || spot.status === 'CRITICAL_FIRE';

                return (
                  <div
                    key={spot.id}
                    onClick={() => selectHotspot(spot, false)}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  >
                    <div className="relative flex items-center justify-center">
                      {isCritical && (
                        <div className="absolute w-6 h-6 rounded-full bg-red-400 opacity-60 animate-ping" />
                      )}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125 ${
                          isSelected
                            ? 'bg-[#ff5533] ring-2 ring-[#ff7a45]'
                            : isCritical
                            ? 'bg-red-600'
                            : 'bg-[#ff5533]'
                        }`}
                      />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex px-2 py-1 rounded-lg bg-[#140a07] border border-[rgba(255,106,61,0.3)] shadow-lg text-[10px] font-bold text-white whitespace-nowrap z-30">
                        {spot.name.split(' ')[0]} ({spot.frp} MW)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10.5px] text-[#7c2d12] pt-1">
              <span>Click any thermal node on the radar grid to load incident dossier.</span>
              <span className="font-mono font-bold text-[#ea580c]">Geospatial Engine v1.2</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <MapLegend />

      {/* Live Map Telemetry Badge */}
      <div className="live-map-indicator">
        <span className="live-dot" />
        <span>FLAREX SATELLITE RADAR • PAN-INDIA</span>
      </div>

      {/* Floating Map Controls */}
      <div className="map-controls">
        <button type="button" onClick={zoomIn} title="Zoom In (+)">
          <Plus size={16} />
        </button>
        <button type="button" onClick={zoomOut} title="Zoom Out (-)">
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={focusActiveIncident}
          title="Focus on Active Incident (Target Lock)"
          className="text-[#ea580c]"
        >
          <Crosshair size={16} />
        </button>
        <button type="button" onClick={resetMapView} title="Reset Camera View to India Overview">
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          onClick={() => toggleLayer('boundaries')}
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
