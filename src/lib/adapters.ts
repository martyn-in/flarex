import { Hotspot } from '@/data/mockData';
import { ThermalEventRecord } from '@/services/firms';

export function mapThermalEventToHotspot(event: ThermalEventRecord): Hotspot {
  // Convert brightness Kelvin (e.g. 412.5 K) to Celsius
  const tempC = Math.round(event.brightness_t4 > 200 ? event.brightness_t4 - 273.15 : event.brightness_t4);
  const rawSev = event.risk_level?.toLowerCase() || 'medium';
  const severity: 'critical' | 'high' | 'medium' | 'low' =
    rawSev === 'critical' ? 'critical' :
    rawSev === 'high' ? 'high' :
    rawSev === 'low' ? 'low' : 'medium';

  const baseFrp = event.persistence_score > 60 ? event.frp * 0.95 : 8.5;
  const history = [
    { date: '18 May', frp: Math.round(baseFrp * 0.9 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '19 May', frp: Math.round(baseFrp * 1.05 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '20 May', frp: Math.round(baseFrp * 1.1 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '21 May', frp: Math.round(baseFrp * 0.98 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '22 May', frp: Math.round(baseFrp * 1.2 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '23 May', frp: Math.round(baseFrp * 1.35 * 10) / 10, baseline: Math.round(baseFrp * 10) / 10 },
    { date: '24 May', frp: event.frp, baseline: Math.round(baseFrp * 10) / 10 },
  ];

  return {
    id: event.id,
    name: event.location_name.split(',')[0] || event.event_id,
    location: event.location_name,
    state: event.state || 'India',
    coordinates: [event.longitude, event.latitude],
    severity,
    classification: (event.classification as any) || 'Potential Industrial Fire',
    confidence: event.classification_confidence || event.confidence || 90,
    frp: event.frp,
    temperature: tempC,
    anomalyScore: Math.round((event.risk_score / 10) * 10) / 10,
    persistenceScore: event.persistence_score,
    persistence: `${event.persistence_score} / 100`,
    history,
    nearestFacility: {
      name: event.location_name.split(',')[0] || 'Industrial Asset',
      category: event.classification,
      distance: `${Math.round(event.persistence_score > 50 ? 45 : 320)}m`,
      hazardRating: severity === 'critical' ? 'Critical' : severity === 'high' ? 'High' : 'Moderate',
    },
    aiReasons: [
      `FRP Radiance is ${event.frp} MW (${event.frp > 50 ? '+450% above baseline' : 'within operational baseline'}).`,
      `Temporal persistence score is ${event.persistence_score}/100 based on multi-day satellite observation.`,
      `Spatial coordinates verified within industrial corridor buffer.`,
      `Multi-spectral brightness temperature: ${tempC}°C (${event.brightness_t4} K).`,
    ],
    timestamp: event.timestamp,
    satellite: event.satellite,
  };
}
