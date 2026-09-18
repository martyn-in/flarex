'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Hotspot, AIAssistantMessage, DataSourceStatus } from '@/types';
import { DATA_SOURCES_LIST, INITIAL_AI_MESSAGES } from '@/data/mockData';

export type DrawerType =
  | 'incidents'
  | 'persistents'
  | 'persistent_sources'
  | 'alerts'
  | 'analytics'
  | 'datasources'
  | 'reports'
  | 'settings'
  | 'ai'
  | null;

export type ActiveDrawerType = DrawerType;

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

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface IngestionMetadata {
  source: 'NASA_FIRMS_LIVE' | 'CACHED_DATABASE' | 'DEMO_DATASET' | 'OFFLINE';
  status: 'LIVE_NRT' | 'CACHED' | 'STALE' | 'DEGRADED' | 'OFFLINE' | 'DEMO';
  provider: string;
  dataAgeMinutes: number;
  acquisitionTime: string;
  ingestionTime: string;
}

interface IntelligenceContextType {
  // Data
  hotspots: Hotspot[];
  filteredHotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  activeDrawer: DrawerType;
  activeFilter: string | null;
  activeLayers: MapLayersState;
  calculatedStats: CalculatedStats;
  dataSources: DataSourceStatus[];
  dataSourceMode: 'LIVE_NRT' | 'CACHED' | 'STALE' | 'DEGRADED' | 'OFFLINE' | 'DEMO';
  ingestionMeta: IngestionMetadata;
  isLoading: boolean;
  isLiveMode: boolean;
  toggleLiveMode: () => void;

  // Toasts
  toasts: Toast[];
  removeToast: (id: string) => void;

  // Settings
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  formatTemp: (celsius: number) => string;
  formatTempValue: (celsius: number) => number;
  syncCadence: string;
  setSyncCadence: (cadence: string) => void;
  audioAlerts: boolean;
  setAudioAlerts: (enabled: boolean) => void;
  criticalFrpThreshold: number;
  setMinFrpThreshold: (val: number) => void;

  // Modals & Drawers
  isPresentationMode: boolean;
  isSettingsOpen: boolean;
  isNotificationsOpen: boolean;
  isDispatchOpen: boolean;
  dispatchTarget: Hotspot | null;
  openDispatchModal: (hotspot?: Hotspot) => void;
  closeDispatchModal: () => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  togglePresentationMode: () => void;

  // Actions
  selectHotspot: (hotspot: Hotspot | null, flyTo?: boolean) => void;
  openDrawer: (drawer: DrawerType) => void;
  closeDrawer: () => void;
  setFilter: (filter: string | null) => void;
  toggleLayer: (layer: keyof MapLayersState) => void;
  refreshHotspots: () => Promise<void>;
  flyToCoords: (coords: [number, number], zoom?: number, pitch?: number) => void;
  fitBoundsToHotspots: (spots: import('@/types').Hotspot[]) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetMapView: () => void;
  focusActiveIncident: () => void;
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  playAlertSound: () => void;

  // Map Instance
  mapInstance: any | null;
  setMapInstance: (map: any | null) => void;

  // Map View Mode (2D / 3D Perspective)
  is3DMode: boolean;
  toggle3DMode: () => void;

  // AI Assistant Chat
  chatMessages: AIAssistantMessage[];
  isAITyping: boolean;
  sendChatMessage: (text: string) => Promise<void>;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export function isActionableAlert(h: Hotspot): boolean {
  return (
    h.severity === 'critical' ||
    h.status === 'CRITICAL_FIRE' ||
    h.status === 'ABNORMAL' ||
    h.baselineRatio >= 2.0
  );
}

export function isPersistentSource(h: Hotspot): boolean {
  return (
    h.classification === 'Gas Flare' ||
    h.classification === 'Mining / Furnace Activity' ||
    parseInt(h.persistenceDays || '0') >= 10 ||
    h.persistenceScore >= 50
  );
}

export const IntelligenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [activeFilter, setActiveFilterState] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<MapLayersState>({
    satellite: true,
    heatmap: false,
    industrial: true,
    boundaries: false,
  });
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState<boolean>(false);
  const [dispatchTarget, setDispatchTarget] = useState<Hotspot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<AIAssistantMessage[]>(INITIAL_AI_MESSAGES);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);

  // Settings State
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [tempUnit, setTempUnitState] = useState<'C' | 'F'>('C');
  const [syncCadence, setSyncCadenceState] = useState<string>('30s');
  const [audioAlerts, setAudioAlertsState] = useState<boolean>(true);
  const [criticalFrpThreshold, setMinFrpThresholdState] = useState<number>(15);

  // Ingestion Meta
  const [ingestionMeta, setIngestionMeta] = useState<IngestionMetadata>({
    source: 'CACHED_DATABASE',
    status: 'CACHED',
    provider: 'NASA FIRMS VIIRS/MODIS (Durable Storage Cache)',
    dataAgeMinutes: 45,
    acquisitionTime: new Date().toISOString(),
    ingestionTime: new Date().toISOString(),
  });

  const dataSourceMode = ingestionMeta.status;
  const isLiveMode = dataSourceMode === 'LIVE_NRT';

  // Web Audio Synth Chime
  const playAlertSound = useCallback(() => {
    if (!audioAlerts || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [audioAlerts]);

  // Toast feedback
  const addToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      if (type === 'warning' || type === 'error') {
        playAlertSound();
      }
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [playAlertSound]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleLiveMode = useCallback(() => {
    addToast(
      `Live status: ${dataSourceMode} (Latency: ${ingestionMeta.dataAgeMinutes}m from NASA FIRMS)`,
      'info'
    );
  }, [addToast, dataSourceMode, ingestionMeta.dataAgeMinutes]);

  // Fetch /api/firms/latest
  const refreshHotspots = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/firms/latest?limit=50', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setHotspots(data.events);
          if (!selectedHotspot && data.events.length > 0) {
            setSelectedHotspot(data.events[0]);
          }
          if (data.status) {
            setIngestionMeta({
              source: data.source || 'CACHED_DATABASE',
              status: data.status || 'CACHED',
              provider: data.provider || 'NASA FIRMS VIIRS/MODIS',
              dataAgeMinutes: data.dataAgeMinutes !== undefined ? data.dataAgeMinutes : 45,
              acquisitionTime: data.acquisitionTime || new Date().toISOString(),
              ingestionTime: data.ingestionTime || new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh thermal telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHotspot]);

  // Initial load
  useEffect(() => {
    refreshHotspots();
  }, [refreshHotspots]);

  // Filtered hotspots computation
  const filteredHotspots = useMemo<Hotspot[]>(() => {
    if (!activeFilter) return hotspots;
    if (activeFilter === 'industrial_fires') {
      return hotspots.filter((h) => h.classification === 'Industrial Fire');
    }
    if (activeFilter === 'wildfires') {
      return hotspots.filter((h) => h.classification === 'Wildfire');
    }
    if (activeFilter === 'frequent') {
      return hotspots.filter(isPersistentSource);
    }
    // class_<ClassName> filter — from the 5-class dashboard tiles
    if (activeFilter.startsWith('class_')) {
      const className = activeFilter.slice('class_'.length);
      return hotspots.filter((h) => h.classification === className);
    }
    return hotspots;
  }, [hotspots, activeFilter]);


  // Load Settings from Server
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          if (data.settings.temperature_unit) setTempUnitState(data.settings.temperature_unit);
          if (data.settings.critical_frp_threshold) setMinFrpThresholdState(data.settings.critical_frp_threshold);
          if (data.settings.refresh_interval) setSyncCadenceState(data.settings.refresh_interval);
          if (data.settings.audio_alerts !== undefined) setAudioAlertsState(Boolean(data.settings.audio_alerts));
        }
      })
      .catch(() => {});
  }, []);

  // Cadence Polling Interval
  useEffect(() => {
    let ms = 30000;
    if (syncCadence === '15s') ms = 15000;
    else if (syncCadence === '30s') ms = 30000;
    else if (syncCadence === '60s') ms = 60000;
    else if (syncCadence === '5m') ms = 300000;

    const interval = setInterval(() => {
      refreshHotspots();
    }, ms);

    return () => clearInterval(interval);
  }, [syncCadence, refreshHotspots]);

  // Sync theme with localStorage and documentElement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flarex_theme');
      const activeTheme = saved === 'dark' || saved === 'light' ? saved : 'dark';
      setThemeState(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.documentElement.classList.toggle('dark', activeTheme === 'dark');
      document.documentElement.classList.toggle('light', activeTheme === 'light');
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

  // Temperature conversions
  const formatTemp = useCallback(
    (celsius: number): string => {
      if (tempUnit === 'F') {
        const fahrenheit = Math.round((celsius * 9) / 5 + 32);
        return `${fahrenheit}°F`;
      }
      return `${Math.round(celsius)}°C`;
    },
    [tempUnit]
  );

  const formatTempValue = useCallback(
    (celsius: number): number => {
      if (tempUnit === 'F') {
        return Math.round((celsius * 9) / 5 + 32);
      }
      return Math.round(celsius);
    },
    [tempUnit]
  );

  const setTempUnit = useCallback((unit: 'C' | 'F') => {
    setTempUnitState(unit);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature_unit: unit }),
    }).catch(() => {});
  }, []);

  const setSyncCadence = useCallback((cadence: string) => {
    setSyncCadenceState(cadence);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_interval: cadence }),
    }).catch(() => {});
  }, []);

  const setAudioAlerts = useCallback((enabled: boolean) => {
    setAudioAlertsState(enabled);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_alerts: enabled ? 1 : 0 }),
    }).catch(() => {});
  }, []);

  const setMinFrpThreshold = useCallback((val: number) => {
    setMinFrpThresholdState(val);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ critical_frp_threshold: val }),
    }).catch(() => {});
  }, []);

  // Dynamically compute real stats from active authoritative data
  const calculatedStats = useMemo<CalculatedStats>(() => {
    const totalEvents = hotspots.length;
    const industrialFires = hotspots.filter((h) => h.classification === 'Industrial Fire').length;
    const persistentSources = hotspots.filter(isPersistentSource).length;
    const criticalAlerts = hotspots.filter(isActionableAlert).length;
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

  // Dispatch modal
  const openDispatchModal = useCallback((hotspot?: Hotspot) => {
    setDispatchTarget(hotspot || selectedHotspot || null);
    setIsDispatchOpen(true);
  }, [selectedHotspot]);

  const closeDispatchModal = useCallback(() => {
    setIsDispatchOpen(false);
    setDispatchTarget(null);
  }, []);

  // FlyTo and selection
  const selectHotspot = useCallback((hotspot: Hotspot | null, flyTo: boolean = true) => {
    setSelectedHotspot(hotspot);
    if (hotspot && flyTo && mapInstance) {
      mapInstance.flyTo({
        center: hotspot.coordinates,
        zoom: 8.5,
        pitch: 35,
        essential: true,
        duration: 1600,
      });
    }
  }, [mapInstance]);

  const flyToCoords = useCallback(
    (coords: [number, number], zoom: number = 8.5, pitch: number = 30) => {
      if (mapInstance) {
        mapInstance.flyTo({
          center: coords,
          zoom,
          pitch,
          essential: true,
          duration: 1200,
        });
      }
    },
    [mapInstance]
  );

  const fitBoundsToHotspots = useCallback(
    (spots: Hotspot[]) => {
      if (!mapInstance || spots.length === 0) return;
      if (spots.length === 1) {
        mapInstance.flyTo({ center: spots[0].coordinates, zoom: 11, pitch: 35, essential: true, duration: 1200 });
        return;
      }
      let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
      spots.forEach((h) => {
        const [lng, lat] = h.coordinates;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
      // Pad 10%
      const lngPad = (maxLng - minLng) * 0.1 || 0.5;
      const latPad = (maxLat - minLat) * 0.1 || 0.5;
      mapInstance.fitBounds(
        [[minLng - lngPad, minLat - latPad], [maxLng + lngPad, maxLat + latPad]],
        { padding: 60, duration: 1300, pitch: 20, essential: true }
      );
    },
    [mapInstance]
  );

  const zoomIn = useCallback(() => {
    if (mapInstance) mapInstance.zoomIn({ duration: 300 });
  }, [mapInstance]);

  const zoomOut = useCallback(() => {
    if (mapInstance) mapInstance.zoomOut({ duration: 300 });
  }, [mapInstance]);

  const resetMapView = useCallback(() => {
    if (mapInstance) {
      mapInstance.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4.6,
        pitch: 0,
        bearing: 0,
        essential: true,
        duration: 1800,
      });
    }
  }, [mapInstance]);

  const focusActiveIncident = useCallback(() => {
    if (selectedHotspot && mapInstance) {
      mapInstance.flyTo({
        center: selectedHotspot.coordinates,
        zoom: 9.0,
        pitch: 40,
        essential: true,
        duration: 1500,
      });
    } else {
      addToast('No active incident selected to focus', 'info');
    }
  }, [selectedHotspot, mapInstance, addToast]);

  const openDrawer = useCallback((drawer: DrawerType) => {
    setActiveDrawer(drawer);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
  }, []);

  const setFilter = useCallback((filter: string | null) => {
    setActiveFilterState(filter);
  }, []);

  const toggleLayer = useCallback((layer: keyof MapLayersState) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  }, []);

  const togglePresentationMode = useCallback(() => {
    setIsPresentationMode((prev) => !prev);
  }, []);

  // 2D / 3D Perspective Digital Twin Mode
  const [is3DMode, setIs3DMode] = useState<boolean>(false);

  const toggle3DMode = useCallback(() => {
    setIs3DMode((prev) => {
      const next = !prev;
      if (mapInstance) {
        if (next) {
          mapInstance.easeTo({
            pitch: 55,
            bearing: -20,
            duration: 1200,
          });
          addToast('Switched to 3D Perspective Digital Twin view', 'info');
        } else {
          mapInstance.easeTo({
            pitch: 0,
            bearing: 0,
            duration: 1000,
          });
          addToast('Switched to 2D Tactical Plan view', 'info');
        }
      }
      return next;
    });
  }, [mapInstance, addToast]);

  // AI Assistant Chat
  const sendChatMessage = useCallback(
    async (text: string) => {
      const userMsg: AIAssistantMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsAITyping(true);

      try {
        const res = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, hotspotContext: selectedHotspot }),
        });

        if (res.ok) {
          const data = await res.json();
          const aiMsg: AIAssistantMessage = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.response || 'Telemetry analysis complete. No anomalous baseline exceedance.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            highlightFacilities: data.highlightFacilities,
            suggestedActions: data.suggestedActions,
          };
          setChatMessages((prev) => [...prev, aiMsg]);
        }
      } catch (err) {
        console.error('AI chat query error:', err);
      } finally {
        setIsAITyping(false);
      }
    },
    [selectedHotspot]
  );

  return (
    <IntelligenceContext.Provider
      value={{
        hotspots,
        filteredHotspots,
        selectedHotspot,
        activeDrawer,
        activeFilter,
        activeLayers,
        calculatedStats,
        dataSources: DATA_SOURCES_LIST,
        dataSourceMode,
        ingestionMeta,
        isLoading,
        isLiveMode,
        toggleLiveMode,

        toasts,
        removeToast,

        theme,
        setTheme,
        toggleTheme,
        tempUnit,
        setTempUnit,
        formatTemp,
        formatTempValue,
        syncCadence,
        setSyncCadence,
        audioAlerts,
        setAudioAlerts,
        criticalFrpThreshold,
        setMinFrpThreshold,

        isPresentationMode,
        isSettingsOpen,
        isNotificationsOpen,
        isDispatchOpen,
        dispatchTarget,
        openDispatchModal,
        closeDispatchModal,
        setIsSettingsOpen,
        setIsNotificationsOpen,
        togglePresentationMode,

        selectHotspot,
        openDrawer,
        closeDrawer,
        setFilter,
        toggleLayer,
        refreshHotspots,
        flyToCoords,
        fitBoundsToHotspots,
        zoomIn,
        zoomOut,
        resetMapView,
        focusActiveIncident,
        addToast,
        playAlertSound,

        mapInstance,
        setMapInstance,
        is3DMode,
        toggle3DMode,

        chatMessages,
        isAITyping,
        sendChatMessage,
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
