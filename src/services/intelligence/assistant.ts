import { Hotspot, AIAssistantMessage } from '@/types';

export interface AIQueryContext {
  hotspots: Hotspot[];
  selectedHotspot?: Hotspot | null;
}

export function generateAssistantResponse(
  query: string,
  context: AIQueryContext
): AIAssistantMessage {
  const { hotspots, selectedHotspot } = context;
  const q = query.toLowerCase().trim();
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const id = `msg-${Date.now()}`;

  // 1. Query: Abnormal thermal activity & facilities
  if (
    q.includes('abnormal') ||
    q.includes('baseline') ||
    (q.includes('which') && q.includes('facilities')) ||
    q.includes('spike')
  ) {
    const abnormalList = hotspots.filter(
      (h) => h.status === 'ABNORMAL' || h.baselineRatio >= 1.8 || h.severity === 'critical'
    );

    if (abnormalList.length === 0) {
      return {
        id,
        sender: 'assistant',
        timestamp,
        text: `All monitored industrial facilities are currently operating within nominal historical baselines (baseline ratio ≤ 1.5×). No severe abnormal thermal spikes detected across the active constellation.`,
      };
    }

    const formattedFacilities = abnormalList.map((h) => {
      const icon = h.severity === 'critical' ? '🔴' : '🟠';
      return `• ${icon} **${h.nearestFacility.name}** (${h.location})\n  — Current FRP: **${h.frp} MW** vs **${h.baselineFrp} MW** baseline (**${h.baselineRatio}× baseline**)\n  — Classification: **${h.classification}** (${h.confidence}% conf.)`;
    });

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: `**${abnormalList.length} industrial facilities** currently exhibit abnormal thermal radiance relative to their 30-day baseline:\n\n${formattedFacilities.join('\n\n')}\n\n*FlameX recommends immediate alert protocol escalation for anomalies exceeding 2.5× baseline.*`,
      highlightFacilities: abnormalList.map((h) => h.nearestFacility.name),
      suggestedActions: [
        { label: 'Filter Critical Incidents', actionKey: 'FILTER_CRITICAL' },
        { label: 'View Dahej SEZ Anomaly', actionKey: 'SELECT_DAHEJ' },
      ],
    };
  }

  // 2. Query: Industrial Fires vs Flares / Class breakdown
  if (
    q.includes('industrial fire') ||
    q.includes('flare') ||
    q.includes('wildfire') ||
    q.includes('how many') ||
    q.includes('breakdown') ||
    q.includes('classify')
  ) {
    const industrialFires = hotspots.filter((h) => h.classification === 'Industrial Fire');
    const flares = hotspots.filter((h) => h.classification === 'Gas Flare');
    const mining = hotspots.filter((h) => h.classification === 'Mining / Furnace Activity');
    const wildfires = hotspots.filter((h) => h.classification === 'Wildfire');
    const agri = hotspots.filter((h) => h.classification === 'Agricultural Burning');

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: `### Real-Time FlameX Thermal Classification Summary\n\nOut of **${hotspots.length} total active thermal detections**:\n\n- 🔥 **Industrial Fires**: **${industrialFires.length} detected** (High radiance surge on industrial land)\n- 🟠 **Persistent Gas Flares**: **${flares.length} detected** (Routine refinery & chemical flares with >80% 30-day recurrence)\n- ⛏️ **Mining / Furnace Activity**: **${mining.length} detected** (Continuous blast furnace & open colliery thermal zones)\n- 🌲 **Wildfires**: **${wildfires.length} detected** (Vegetation / woodland spatial expansion)\n- 🌾 **Agricultural Burning**: **${agri.length} detected** (Seasonal crop residue burning)\n\n*Key Intelligence: Gas flares are persistent and baseline-stable, whereas Industrial Fires show high baseline multiples (3.0× - 5.0×).*`,
      suggestedActions: [
        { label: 'Show Industrial Fires', actionKey: 'FILTER_FIRES' },
        { label: 'Show Persistent Sources', actionKey: 'FILTER_PERSISTENT' },
      ],
    };
  }

  // 3. Query: Selected incident or specific location
  if (
    (q.includes('selected') || q.includes('this') || q.includes('dahej') || q.includes('incident')) &&
    selectedHotspot
  ) {
    const s = selectedHotspot;
    const reasonsList = s.aiReasons.map((r) => `✓ ${r.text}`).join('\n');

    return {
      id,
      sender: 'assistant',
      timestamp,
      text: `### Detailed Telemetry & AI Diagnosis: ${s.name}\n\n- **Event ID**: \`${s.eventId}\`\n- **Classification**: **${s.classification}** (${s.confidence}% AI Confidence)\n- **Spatial Proximity**: ${s.nearestFacility.distance} from **${s.nearestFacility.name}**\n- **Land Cover**: ${s.landCover}\n- **Current FRP**: **${s.frp} MW** | **Baseline**: **${s.baselineFrp} MW** (**${s.baselineRatio}× baseline**)\n- **30-Day Persistence**: **${s.persistenceDays}**\n- **Sensor**: ${s.satellite} (${s.instrument})\n\n**🧠 Explainability Evidence ("Why?"):**\n${reasonsList}`,
    };
  }

  // 4. Query: How does FlameX work / methodology
  if (q.includes('how') || q.includes('firms') || q.includes('pipeline') || q.includes('why')) {
    return {
      id,
      sender: 'assistant',
      timestamp,
      text: `### How FlameX Intelligence Works\n\n1. **Satellite Ingestion**: NASA FIRMS provides raw thermal anomalies (VIIRS & MODIS 375m/1km).\n2. **Geospatial Context**: Matches coordinates against OpenStreetMap industrial infrastructure (refineries, power plants, mines).\n3. **Land Cover**: Integrates ESA WorldCover 10m layers to distinguish industrial land from forests & agriculture.\n4. **30-Day Historical Baseline**: Tracks temporal recurrence ($D_{\\text{recurrent}}/30$) to distinguish normal operational flares from sudden abnormal fires.\n5. **AI Classification**: Ensemble classifier outputs 6-class probability vector and transparent explainability checkmarks.`,
    };
  }

  // Fallback response with live database grounding
  const topCritical = hotspots.find((h) => h.severity === 'critical') || hotspots[0];

  return {
    id,
    sender: 'assistant',
    timestamp,
    text: `FlameX is actively monitoring **${hotspots.length} thermal anomalies** across India. The highest priority event is **${topCritical?.name}** with **${topCritical?.frp} MW** radiative power (**${topCritical?.baselineRatio}× baseline**).\n\nYou can ask me:\n- *"Which industrial facilities have abnormal thermal activity?"*\n- *"Compare industrial fires vs persistent flares"*\n- *"Explain the Dahej SEZ anomaly"*`,
    suggestedActions: [
      { label: 'Check Abnormal Facilities', actionKey: 'QUERY_ABNORMAL' },
      { label: 'View Analytics', actionKey: 'OPEN_ANALYTICS' },
    ],
  };
}
