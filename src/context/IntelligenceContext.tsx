'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { HOTSPOTS_DATA } from '../data/mockData';
import { Hotspot, AIAssistantMessage } from '../types';
import { mapThermalEventToHotspot } from '../lib/adapters';
import { generateAssistantResponse } from '../services/intelligence/assistant';

export interface Toast {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export type ActiveDrawerType =
  | 'incidents'
  | 'industrial_fires'
  | 'persistent_sources'
  | 'alerts'
  | 'analytics'
  | 'datasources'
  | 'data'
  | 'reports'
  | 'ai'
  | 'settings'
  | null;

export type HotspotFilterType =
  | 'all'
  | 'industrial_fires'
  | 'persistent_sources'
  | 'critical'
  | 'high'
  | 'wildfires'
  | 'agricultural'
  | null;

export interface MapLayersState {
  satellite: boolean;
  heatmap: boolean;
  industrial: boolean;
  boundaries: boolean;
}

export interface CalculatedStats {
  totalEvents: number;
  industrialFires: number;
  persistentSources: number;
  criticalAlerts: number;
  abnormalSources: number;
  averageConfidence: number;
  totalFrp: number;
  lastSyncTime: string;
}

interface IntelligenceContextType {
  selectedHotspot: Hotspot | null;
  selectHotspot: (hotspot: Hotspot | null, fly?: boolean) => void;
  focusActiveIncident: () => void;
  hotspots: Hotspot[];
  filteredHotspots: Hotspot[];
  activeFilter: HotspotFilterType;
  setFilter: (filter: HotspotFilterType) => void;
  calculatedStats: CalculatedStats;
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
  chatMessages: AIAssistantMessage[];
  sendChatMessage: (text: string) => void;
  isAITyping: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

const INITIAL_AI_MESSAGES: AIAssistantMessage[] = [
  {
    id: 'msg-0',
    sender: 'assistant',
    timestamp: '18:50',
    text: `👋 Hello! I am the **FlameX AI Copilot**, grounded directly in our active NASA FIRMS satellite feed, OpenStreetMap industrial corridors, and ESA WorldCover baseline database.\n\nAsk me anything about current thermal anomalies or abnormal industrial facility emissions.`,
    suggestedActions: [
      { label: 'Which facilities are abnormal?', actionKey: 'QUERY_ABNORMAL' },
      { label: 'Summarize Industrial Fires', actionKey: 'FILTER_FIRES' },
      { label: 'Check Persistent Sources', actionKey: 'FILTER_PERSISTENT' },
    ],
  },
];

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>(HOTSPOTS_DATA);
  const [selectedHotspot, setSelectedHotspotState] = useState<Hotspot | null>(HOTSPOTS_DATA[0]);
  const [activeFilter, setActiveFilter] = useState<HotspotFilterType>(null);
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
  const [chatMessages, setChatMessages] = useState<AIAssistantMessage[]>(INITIAL_AI_MESSAGES);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Sync theme with localStorage and documentElement data-theme / class
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flarex_theme');
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
        document.documentElement.classList.toggle('dark', saved === 'dark');
        document.documentElement.classList.toggle('light', saved === 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('flarex_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      document.documentElement.classList.toggle('light', newTheme === 'light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('flarex_theme', next);
        document.documentElement.setAttribute('data-theme', next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        document.documentElement.classList.toggle('light', next === 'light');
      }
      return next;
    });
  }, []);

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

  // Dynamically compute real stats from active data
  const calculatedStats = useMemo<CalculatedStats>(() => {
    const totalEvents = hotspots.length;
    const industrialFires = hotspots.filter((h) => h.classification === 'Industrial Fire').length;
    const persistentSources = hotspots.filter(
      (h) => h.classification === 'Gas Flare' || h.classification === 'Mining / Furnace Activity' || h.persistenceScore >= 50
    ).length;
    const criticalAlerts = hotspots.filter((h) => h.severity === 'critical' || h.status === 'CRITICAL_FIRE' || h.status === 'ABNORMAL').length;
    const abnormalSources = hotspots.filter((h) => h.status === 'ABNORMAL' || h.baselineRatio >= 2.0).length;
    const totalConf = hotspots.reduce((acc, h) => acc + h.confidence, 0);
    const averageConfidence = totalEvents > 0 ? Math.round(totalConf / totalEvents) : 92;
    const totalFrp = hotspots.reduce((acc, h) => acc + h.frp, 0);

    return {
      totalEvents,
      industrialFires,
      persistentSources,
      criticalAlerts,
      abnormalSources,
      averageConfidence,
      totalFrp: Math.round(totalFrp * 10) / 10,
      lastSyncTime: '18:57 IST',
    };
  }, [hotspots]);

  // Compute filtered hotspots
  const filteredHotspots = useMemo(() => {
    if (activeFilter === 'industrial_fires') {
      return hotspots.filter((h) => h.classification === 'Industrial Fire');
    }
    if (activeFilter === 'persistent_sources') {
      return hotspots.filter(
        (h) => h.classification === 'Gas Flare' || h.classification === 'Mining / Furnace Activity' || h.persistenceScore >= 50
      );
    }
    if (activeFilter === 'critical') {
      return hotspots.filter((h) => h.severity === 'critical' || h.status === 'CRITICAL_FIRE');
    }
    if (activeFilter === 'high') {
      return hotspots.filter((h) => h.severity === 'high' || h.status === 'ABNORMAL');
    }
    if (activeFilter === 'wildfires') {
      return hotspots.filter((h) => h.classification === 'Wildfire');
    }
    if (activeFilter === 'agricultural') {
      return hotspots.filter((h) => h.classification === 'Agricultural Burning');
    }
    return hotspots;
  }, [hotspots, activeFilter]);

  // Map camera controls
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
      center: [80.5, 21.0],
      zoom: 4.25,
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

  const focusActiveIncident = useCallback(() => {
    if (selectedHotspot) {
      flyToCoords(selectedHotspot.coordinates, 8.2, 30);
      addToast(`Target locked: ${selectedHotspot.name} (${selectedHotspot.frp} MW)`, 'info');
    }
  }, [selectedHotspot, flyToCoords, addToast]);

  // Filter selection
  const setFilter = useCallback((filter: HotspotFilterType) => {
    setActiveFilter(filter);
    if (filter === 'industrial_fires') {
      const fire = hotspots.find((h) => h.classification === 'Industrial Fire');
      if (fire) selectHotspot(fire, true);
      addToast('Filter: Showing Confirmed Industrial Fires', 'warning');
    } else if (filter === 'persistent_sources') {
      const pers = hotspots.find((h) => h.classification === 'Gas Flare' || h.persistenceScore >= 50);
      if (pers) selectHotspot(pers, true);
      addToast('Filter: Showing Persistent Industrial Heat Flares', 'info');
    } else if (filter === 'critical') {
      const crit = hotspots.find((h) => h.severity === 'critical');
      if (crit) selectHotspot(crit, true);
      addToast('Filter: Showing Critical Fire Alerts', 'warning');
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

  // AI Assistant Chat function
  const sendChatMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: AIAssistantMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAITyping(true);

    setTimeout(() => {
      const botResponse = generateAssistantResponse(text, {
        hotspots,
        selectedHotspot,
      });

      setChatMessages((prev) => [...prev, botResponse]);
      setIsAITyping(false);
    }, 450);
  }, [hotspots, selectedHotspot]);

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
        calculatedStats,
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
        chatMessages,
        sendChatMessage,
        isAITyping,
        theme,
        setTheme,
        toggleTheme,
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
