'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { HOTSPOTS_DATA, Hotspot } from '../data/mockData';
import { mapThermalEventToHotspot } from '../lib/adapters';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export type ActiveDrawerType =
  | 'incidents'
  | 'analytics'
  | 'datasources'
  | 'data'
  | 'reports'
  | 'ai'
  | 'settings'
  | null;

export interface MapLayersState {
  satellite: boolean;
  heatmap: boolean;
  industrial: boolean;
  boundaries: boolean;
}

interface IntelligenceContextType {
  selectedHotspot: Hotspot | null;
  selectHotspot: (hotspot: Hotspot | null, fly?: boolean) => void;
  focusActiveIncident: () => void;
  hotspots: Hotspot[];
  filteredHotspots: Hotspot[];
  activeFilter: 'all' | 'critical' | 'persistent' | 'high' | null;
  setFilter: (filter: 'all' | 'critical' | 'persistent' | 'high' | null) => void;
  activeDrawer: ActiveDrawerType;
  openDrawer: (drawerId: ActiveDrawerType) => void;
  closeDrawer: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  isLiveMode: boolean;
  toggleLiveMode: () => void;
  activeLayers: MapLayersState;
  toggleLayer: (layerKey: keyof MapLayersState) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  mapInstance: maplibregl.Map | null;
  setMapInstance: (map: maplibregl.Map | null) => void;
  flyToCoords: (coords: [number, number], zoom?: number, pitch?: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetMapView: () => void;
  refreshHotspots: () => Promise<void>;
  dataSourceMode: 'LIVE' | 'CACHED' | 'SYNCING';
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>(HOTSPOTS_DATA);
  const [selectedHotspot, setSelectedHotspotState] = useState<Hotspot | null>(HOTSPOTS_DATA[0]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'persistent' | 'high' | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawerType>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [dataSourceMode, setDataSourceMode] = useState<'LIVE' | 'CACHED' | 'SYNCING'>('CACHED');
  const [activeLayers, setActiveLayers] = useState<MapLayersState>({
    satellite: true,
    heatmap: false,
    industrial: true,
    boundaries: false,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  // Toast feedback
  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch real thermal records from /api/firms/latest
  const refreshHotspots = useCallback(async () => {
    try {
      setDataSourceMode('SYNCING');
      const res = await fetch('/api/firms/latest?limit=60');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.events) && json.events.length > 0) {
          const adapted = json.events.map(mapThermalEventToHotspot);
          setHotspots(adapted);
          setDataSourceMode(json.source === 'NASA_FIRMS_LIVE' ? 'LIVE' : 'CACHED');

          // Keep selected hotspot or set to most severe
          setSelectedHotspotState((prev) => {
            if (!prev) return adapted[0];
            const match = adapted.find((h: Hotspot) => h.id === prev.id);
            return match || adapted[0];
          });
        }
      }
    } catch {
      setDataSourceMode('CACHED');
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshHotspots();
  }, [refreshHotspots]);

  // Compute filtered hotspots
  const filteredHotspots = React.useMemo(() => {
    if (activeFilter === 'critical') {
      return hotspots.filter((h) => h.severity === 'critical');
    }
    if (activeFilter === 'high') {
      return hotspots.filter((h) => h.severity === 'high');
    }
    if (activeFilter === 'persistent') {
      return hotspots.filter((h) => h.classification === 'Persistent Thermal Source' || h.persistenceScore > 50);
    }
    return hotspots;
  }, [hotspots, activeFilter]);

  // Map camera controls with fluid kinetic transitions
  const flyToCoords = useCallback((coords: [number, number], zoom = 7.5, pitch = 25) => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: coords,
      zoom,
      pitch,
      speed: 1.25,
      curve: 1.3,
      essential: true,
      easing: (t) => t * (2 - t),
    });
  }, [mapInstance]);

  const zoomIn = useCallback(() => {
    if (!mapInstance) return;
    mapInstance.zoomIn({ duration: 250 });
  }, [mapInstance]);

  const zoomOut = useCallback(() => {
    if (!mapInstance) return;
    mapInstance.zoomOut({ duration: 250 });
  }, [mapInstance]);

  const resetMapView = useCallback(() => {
    if (!mapInstance) return;
    mapInstance.flyTo({
      center: [80.5, 22.5],
      zoom: 4.8,
      pitch: 0,
      bearing: 0,
      speed: 1.1,
      curve: 1.3,
      essential: true,
      easing: (t) => t * (2 - t),
    });
    addToast('Camera reset to national overview', 'info');
  }, [mapInstance, addToast]);

  // Hotspot selection
  const selectHotspot = useCallback((hotspot: Hotspot | null, fly = true) => {
    setSelectedHotspotState(hotspot);
    if (hotspot && fly) {
      flyToCoords(hotspot.coordinates, 7.5, 25);
      addToast(`Focused on: ${hotspot.name} (${hotspot.location})`, hotspot.severity === 'critical' ? 'warning' : 'info');
    }
  }, [flyToCoords, addToast]);

  // Focus active incident button handler
  const focusActiveIncident = useCallback(() => {
    if (selectedHotspot) {
      flyToCoords(selectedHotspot.coordinates, 8.2, 30);
      addToast(`Target locked: ${selectedHotspot.name} (${selectedHotspot.frp} MW)`, 'info');
    }
  }, [selectedHotspot, flyToCoords, addToast]);

  // Quick scenario triggers
  const setFilter = useCallback((filter: 'all' | 'critical' | 'persistent' | 'high' | null) => {
    setActiveFilter(filter);
    if (filter === 'critical') {
      const crit = hotspots.find((h) => h.severity === 'critical');
      if (crit) selectHotspot(crit, true);
      addToast('Filter: Showing Critical Fire Alerts', 'warning');
    } else if (filter === 'high') {
      addToast('Filter: Showing High Severity Incidents', 'warning');
    } else if (filter === 'persistent') {
      const pers = hotspots.find((h) => h.classification === 'Persistent Thermal Source' || h.persistenceScore > 50);
      if (pers) selectHotspot(pers, true);
      addToast('Filter: Showing Persistent Industrial Heat Flares', 'info');
    } else {
      resetMapView();
      addToast('Showing all thermal detections', 'info');
    }
  }, [hotspots, selectHotspot, resetMapView, addToast]);

  // Drawer management
  const openDrawer = useCallback((drawerId: ActiveDrawerType) => {
    setActiveDrawer(drawerId);
    setIsSettingsOpen(false);
    setIsNotificationsOpen(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  // Layer toggle
  const toggleLayer = useCallback((layerKey: keyof MapLayersState) => {
    setActiveLayers((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      const label =
        layerKey === 'satellite' ? 'High-Res Satellite Imagery' :
        layerKey === 'heatmap' ? 'Thermal Density Heatmap' :
        layerKey === 'industrial' ? 'Industrial Facility Clusters' : 'Administrative GIS Boundaries';
      addToast(`${label}: ${next[layerKey] ? 'ENABLED' : 'DISABLED'}`, 'info');
      return next;
    });
  }, [addToast]);

  const togglePresentationMode = useCallback(() => {
    setIsPresentationMode((prev) => !prev);
  }, []);

  const toggleLiveMode = useCallback(() => {
    setIsLiveMode((prev) => {
      const next = !prev;
      addToast(`Live Ingestion Mode: ${next ? 'STREAMING ACTIVE' : 'PAUSED'}`, next ? 'success' : 'warning');
      return next;
    });
  }, [addToast]);

  return (
    <IntelligenceContext.Provider
      value={{
        selectedHotspot,
        selectHotspot,
        focusActiveIncident,
        hotspots,
        filteredHotspots,
        activeFilter,
        setFilter,
        activeDrawer,
        openDrawer,
        closeDrawer,
        isSettingsOpen,
        setIsSettingsOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isPresentationMode,
        togglePresentationMode,
        isLiveMode,
        toggleLiveMode,
        activeLayers,
        toggleLayer,
        toasts,
        addToast,
        removeToast,
        mapInstance,
        setMapInstance,
        flyToCoords,
        zoomIn,
        zoomOut,
        resetMapView,
        refreshHotspots,
        dataSourceMode,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
};
